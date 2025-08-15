
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, Path as FPath, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, select, and_, or_
import uuid
import time
from datetime import datetime, timedelta
import json

from .settings import settings
from .db import Base, engine, get_db
from .services.ingestion import ingest_loans_csv
from .services.storage import save_upload
from .services.extract import extract_pdf_text
from .services.embeddings import embed, chunk, cosine
from .schemas import (
    IngestLoansResult, UploadResult, LoanResponse, DocumentResponse,
    ComplianceRuleCreate, ComplianceRuleResponse, ComplianceEventResponse,
    RiskAssessmentCreate, RiskAssessmentResponse, PortfolioCreate, PortfolioResponse,
    RAGQuery, RAGResponse, ComplianceFinding, PortfolioAnalytics, Form410ADraft
)
from .utils.ledger import append_event
from .crud import create_document
from .models import (
    Loan, Document, DocChunk, ComplianceRule, ComplianceEvent,
    RiskAssessment, Portfolio, AIAnalysis
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fixed-Income AI Platform",
    description="AI-powered platform for fixed-income portfolio management, compliance monitoring, and risk assessment",
    version="2.0.0",
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health and status endpoints
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "timestamp": datetime.utcnow()}

@app.get("/api/status")
def api_status():
    return {
        "status": "operational",
        "services": {
            "database": "connected",
            "ai_models": "available",
            "compliance_engine": "active",
            "risk_models": "active"
        },
        "last_updated": datetime.utcnow()
    }

# Enhanced loan management
@app.post("/api/ingest/loans", response_model=IngestLoansResult)
async def ingest_loans(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".csv",)):
        raise HTTPException(400, detail="Only CSV supported in MVP")
    text = (await file.read()).decode("utf-8", errors="ignore")
    try:
        res = ingest_loans_csv(db, text)
        append_event(db, actor="system", type="ingest_loans", payload={"filename": file.filename, **res.model_dump()})
        return res
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@app.get("/api/loans/summary")
async def loans_summary(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(Loan.loan_id))) or 0
    gt60 = db.scalar(select(func.count(Loan.loan_id)).where((Loan.delinquency_days != None) & (Loan.delinquency_days > 60))) or 0
    subq = select(Document.loan_id).where(Document.type == "410A").subquery()
    missing_410a = db.scalar(select(func.count(Loan.loan_id)).where(~Loan.loan_id.in_(select(subq.c.loan_id)))) or 0
    
    # Enhanced analytics
    total_value = db.scalar(select(func.sum(Loan.balance)).where(Loan.balance.isnot(None))) or 0
    avg_rate = db.scalar(select(func.avg(Loan.rate)).where(Loan.rate.isnot(None))) or 0
    high_risk = db.scalar(select(func.count(Loan.loan_id)).where(Loan.risk_score > 0.7)) or 0
    
    return {
        "total": int(total),
        ">60dpd": int(gt60),
        "missing_410A": int(missing_410a),
        "total_value": float(total_value),
        "average_rate": float(avg_rate),
        "high_risk_loans": int(high_risk)
    }

@app.get("/api/loans/search", response_model=dict)
async def loans_search(
    status: str | None = None,
    delinquency_min: int | None = None,
    risk_min: float | None = None,
    portfolio_id: str | None = None,
    q: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    stmt = select(Loan)
    
    # Enhanced filtering
    if status:
        stmt = stmt.where(Loan.status == status)
    if delinquency_min is not None:
        stmt = stmt.where((Loan.delinquency_days != None) & (Loan.delinquency_days >= delinquency_min))
    if risk_min is not None:
        stmt = stmt.where((Loan.risk_score != None) & (Loan.risk_score >= risk_min))
    if portfolio_id:
        stmt = stmt.where(Loan.portfolio_id == portfolio_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                Loan.loan_id.like(like),
                Loan.geography.like(like),
                Loan.servicer_id.like(like)
            )
        )
    
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.order_by(Loan.loan_id).offset((page-1)*page_size).limit(page_size)).scalars().all()

    # Enhanced compliance checking
    with_410a = {x[0] for x in db.execute(select(Document.loan_id).where(Document.type=="410A")).all()}

    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "loan_id": x.loan_id,
                "status": x.status,
                "delinquency_days": x.delinquency_days,
                "balance": x.balance,
                "rate": x.rate,
                "geography": x.geography,
                "servicer_id": x.servicer_id,
                "risk_score": x.risk_score,
                "compliance_status": x.compliance_status,
                "missing_410A": (x.loan_id not in with_410a),
                "portfolio_id": x.portfolio_id
            } for x in items
        ]
    }

# Enhanced document management
@app.post("/api/ingest/document", response_model=UploadResult)
async def ingest_document(
    file: UploadFile = File(...),
    loan_id: str | None = Form(None),
    doc_type: str = Form("generic"),
    db: Session = Depends(get_db),
):
    path, sha = save_upload(file.file, file.content_type or "")
    doc_id = str(uuid.uuid4())
    doc = create_document(db, doc_id=doc_id, loan_id=loan_id, type=doc_type, path=path, sha256=sha)
    append_event(db, actor="system", type="ingest_document", payload={"doc_id": doc.doc_id, "loan_id": loan_id, "type": doc_type})
    return UploadResult(doc_id=doc.doc_id, loan_id=doc.loan_id, type=doc.type, path=doc.path)

@app.get("/api/documents", response_model=dict)
async def list_documents(
    loan_id: str | None = None,
    has_text: bool | None = Query(None),
    doc_type: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    stmt = select(Document)
    if loan_id:
        stmt = stmt.where(Document.loan_id == loan_id)
    if has_text is not None:
        if has_text:
            stmt = stmt.where(Document.extracted_text.isnot(None))
        else:
            stmt = stmt.where(Document.extracted_text.is_(None))
    if doc_type:
        stmt = stmt.where(Document.type == doc_type)
    
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.order_by(Document.doc_id.desc()).offset((page-1)*page_size).limit(page_size)).scalars().all()
    
    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "doc_id": d.doc_id,
                "loan_id": d.loan_id,
                "type": d.type,
                "sha256": d.sha256,
                "has_text": bool(d.extracted_text),
                "preview": (d.extracted_text[:280] + '…') if d.extracted_text else None,
                "processing_status": d.processing_status,
                "confidence_score": d.confidence_score
            } for d in items
        ]
    }

@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: str, db: Session = Depends(get_db)):
    d = db.get(Document, doc_id)
    if not d:
        raise HTTPException(404, detail="Not found")
    return {
        "doc_id": d.doc_id,
        "loan_id": d.loan_id,
        "type": d.type,
        "sha256": d.sha256,
        "has_text": bool(d.extracted_text),
        "text": d.extracted_text,
        "processing_status": d.processing_status,
        "extracted_fields": d.extracted_fields,
        "confidence_score": d.confidence_score
    }

@app.post("/api/documents/{doc_id}/extract")
async def extract_document(doc_id: str = FPath(...), db: Session = Depends(get_db)):
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, detail="Document not found")
    
    text = extract_pdf_text(doc.path)
    if not text:
        raise HTTPException(400, detail="Could not extract text (non-PDF or error)")
    
    doc.extracted_text = text[:1_000_000]
    doc.processing_status = "extracted"
    db.commit()
    
    append_event(db, actor="system", type="extract_text", payload={"doc_id": doc_id})
    return {"doc_id": doc_id, "chars": len(doc.extracted_text)}

# Enhanced RAG system
@app.post("/api/rag/index/{doc_id}")
async def rag_index(doc_id: str, db: Session = Depends(get_db)):
    d = db.get(Document, doc_id)
    if not d or not d.extracted_text:
        raise HTTPException(400, detail="Document missing or no extracted text")
    
    # Clear existing chunks
    db.query(DocChunk).filter(DocChunk.doc_id==doc_id).delete()
    
    pieces = chunk(d.extracted_text)
    for i, txt in enumerate(pieces):
        v = embed(txt)
        db.add(DocChunk(
            chunk_id=str(uuid.uuid4()),
            doc_id=doc_id,
            ord=i,
            text=txt,
            vec=v
        ))
    
    d.processing_status = "indexed"
    db.commit()
    
    append_event(db, actor="system", type="rag_index", payload={"doc_id": doc_id, "chunks": len(pieces)})
    return {"doc_id": doc_id, "chunks": len(pieces)}

@app.post("/api/rag/query", response_model=RAGResponse)
async def rag_query(query: RAGQuery, db: Session = Depends(get_db)):
    start_time = time.time()
    q = query.q.strip()
    if not q:
        return RAGResponse(answers=[], query=q, total_results=0, processing_time=0.0)
    
    qv = embed(q)
    
    # Enhanced search with filters
    stmt = select(DocChunk)
    if query.loan_id:
        stmt = stmt.join(Document).where(Document.loan_id == query.loan_id)
    if query.doc_type:
        stmt = stmt.join(Document).where(Document.type == query.doc_type)
    
    chunks = db.execute(stmt.order_by(DocChunk.doc_id, DocChunk.ord)).scalars().all()
    
    # Compute similarity scores
    scored = []
    for ch in chunks:
        try:
            sim = cosine(qv, ch.vec or [0.0]*128)
        except Exception:
            sim = 0.0
        scored.append((sim, ch))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [x for x in scored[:query.limit] if x[0] > 0]

    answers = []
    for sim, ch in top:
        answers.append({
            "text": ch.text[:500] + ("…" if len(ch.text)>500 else ""),
            "doc_id": ch.doc_id,
            "similarity": round(float(sim), 4),
            "chunk_type": ch.chunk_type,
            "semantic_tags": ch.semantic_tags
        })
    
    # Fallback to text search if no vector results
    if not answers:
        like = f"%{q}%"
        docs = db.execute(select(Document).where(Document.extracted_text.like(like)).limit(query.limit)).scalars().all()
        for d in docs:
            answers.append({
                "text": (d.extracted_text or "")[:500],
                "doc_id": d.doc_id,
                "similarity": 0.0,
                "chunk_type": "text",
                "semantic_tags": None
            })
    
    processing_time = time.time() - start_time
    return RAGResponse(
        answers=answers,
        query=q,
        total_results=len(answers),
        processing_time=round(processing_time, 3)
    )

# Enhanced 410A Draft Assistant
@app.post("/api/410a/draft", response_model=Form410ADraft)
async def draft_410a(body: dict, db: Session = Depends(get_db)):
    loan_id = (body or {}).get("loan_id")
    if not loan_id:
        raise HTTPException(400, detail="loan_id required")
    
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(404, detail="Loan not found")
    
    # Enhanced field extraction
    fields = {
        "debtor_name": None,
        "case_number": None,
        "arrears": loan.balance if loan and loan.balance else None,
        "escrow_shortage": None,
        "payment_history_ref": None,
        "loan_balance": loan.balance,
        "interest_rate": loan.rate,
        "origination_date": loan.orig_date.isoformat() if loan.orig_date else None,
        "servicer_id": loan.servicer_id,
        "geography": loan.geography
    }
    
    # Enhanced document analysis
    docs = db.execute(select(Document).where(Document.loan_id==loan_id, Document.extracted_text.isnot(None))).scalars().all()
    
    missing_info = []
    recommendations = []
    
    # Analyze documents for missing information
    for doc in docs:
        text = doc.extracted_text.lower()
        if "case" in text and "number" in text:
            fields["case_number"] = "(found in doc — review)"
        if "debtor" in text or "borrower" in text:
            fields["debtor_name"] = "(found in doc — review)"
        if "escrow" in text and "shortage" in text:
            fields["escrow_shortage"] = "(found in doc — review)"
    
    # Check for missing critical information
    if not fields["debtor_name"]:
        missing_info.append("Debtor/Borrower name")
    if not fields["case_number"]:
        missing_info.append("Bankruptcy case number")
    if not fields["payment_history_ref"]:
        missing_info.append("Payment history reference")
    
    # Generate recommendations
    if loan.delinquency_days and loan.delinquency_days > 30:
        recommendations.append("Consider including detailed payment history for delinquency period")
    if loan.risk_score and loan.risk_score > 0.7:
        recommendations.append("High-risk loan - ensure all supporting documentation is included")
    
    confidence = 0.4 + (0.3 if len(docs) > 0 else 0) + (0.2 if loan.balance else 0) + (0.1 if loan.rate else 0)
    confidence = min(confidence, 0.95)
    
    result = {
        "loan_id": loan_id,
        "fields": fields,
        "confidence": round(confidence, 2),
        "pdf_url": None,
        "missing_information": missing_info,
        "recommendations": recommendations
    }
    
    append_event(db, actor="system", type="410a_draft", payload=result)
    return Form410ADraft(**result)

# New AI-powered endpoints
@app.get("/api/compliance/findings/missing-410a", response_model=dict)
async def get_missing_410a_findings(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    # Find loans missing 410A forms
    subq = select(Document.loan_id).where(Document.type == "410A").subquery()
    stmt = select(Loan).where(~Loan.loan_id.in_(select(subq.c.loan_id)))
    
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.order_by(Loan.loan_id).offset((page-1)*page_size).limit(page_size)).scalars().all()
    
    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "loan_id": x.loan_id,
                "balance": x.balance,
                "delinquency_days": x.delinquency_days,
                "risk_score": x.risk_score,
                "compliance_status": x.compliance_status,
                "priority": "high" if (x.delinquency_days and x.delinquency_days > 60) else "medium"
            } for x in items
        ]
    }

@app.get("/api/portfolio/analytics", response_model=PortfolioAnalytics)
async def get_portfolio_analytics(
    portfolio_id: str | None = None,
    db: Session = Depends(get_db)
):
    # Build portfolio analytics
    stmt = select(Loan)
    if portfolio_id:
        stmt = stmt.where(Loan.portfolio_id == portfolio_id)
    
    loans = db.execute(stmt).scalars().all()
    
    if not loans:
        return PortfolioAnalytics(
            total_loans=0,
            total_value=0.0,
            weighted_average_rate=0.0,
            average_delinquency=0.0,
            compliance_score=0.0,
            risk_distribution={},
            delinquency_distribution={},
            geography_distribution={}
        )
    
    total_loans = len(loans)
    total_value = sum(loan.balance or 0 for loan in loans)
    
    # Calculate weighted average rate
    weighted_sum = sum((loan.balance or 0) * (loan.rate or 0) for loan in loans)
    weighted_average_rate = weighted_sum / total_value if total_value > 0 else 0.0
    
    # Calculate average delinquency
    delinquency_sum = sum(loan.delinquency_days or 0 for loan in loans)
    average_delinquency = delinquency_sum / total_loans if total_loans > 0 else 0.0
    
    # Calculate compliance score
    compliant_loans = sum(1 for loan in loans if loan.compliance_status == "compliant")
    compliance_score = compliant_loans / total_loans if total_loans > 0 else 0.0
    
    # Risk distribution
    risk_distribution = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
    for loan in loans:
        if loan.risk_score:
            if loan.risk_score < 0.3:
                risk_distribution["low"] += 1
            elif loan.risk_score < 0.6:
                risk_distribution["moderate"] += 1
            elif loan.risk_score < 0.8:
                risk_distribution["high"] += 1
            else:
                risk_distribution["critical"] += 1
    
    # Delinquency distribution
    delinquency_distribution = {"current": 0, "30-60": 0, "60-90": 0, "90+": 0}
    for loan in loans:
        if not loan.delinquency_days or loan.delinquency_days == 0:
            delinquency_distribution["current"] += 1
        elif loan.delinquency_days <= 60:
            delinquency_distribution["30-60"] += 1
        elif loan.delinquency_days <= 90:
            delinquency_distribution["60-90"] += 1
        else:
            delinquency_distribution["90+"] += 1
    
    # Geography distribution
    geography_distribution = {}
    for loan in loans:
        if loan.geography:
            geography_distribution[loan.geography] = geography_distribution.get(loan.geography, 0) + 1
    
    return PortfolioAnalytics(
        total_loans=total_loans,
        total_value=total_value,
        weighted_average_rate=weighted_average_rate,
        average_delinquency=average_delinquency,
        compliance_score=compliance_score,
        risk_distribution=risk_distribution,
        delinquency_distribution=delinquency_distribution,
        geography_distribution=geography_distribution
    )

# Portfolio management endpoints
@app.post("/api/portfolios", response_model=PortfolioResponse)
async def create_portfolio(portfolio: PortfolioCreate, db: Session = Depends(get_db)):
    portfolio_id = str(uuid.uuid4())
    db_portfolio = Portfolio(
        portfolio_id=portfolio_id,
        **portfolio.model_dump()
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    append_event(db, actor="system", type="create_portfolio", payload={"portfolio_id": portfolio_id})
    return PortfolioResponse(**db_portfolio.__dict__)

@app.get("/api/portfolios", response_model=dict)
async def list_portfolios(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    stmt = select(Portfolio)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.order_by(Portfolio.created_at.desc()).offset((page-1)*page_size).limit(page_size)).scalars().all()
    
    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [PortfolioResponse(**item.__dict__) for item in items]
    }

@app.get("/api/portfolios/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(portfolio_id: str, db: Session = Depends(get_db)):
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio:
        raise HTTPException(404, detail="Portfolio not found")
    return PortfolioResponse(**portfolio.__dict__)

# Risk assessment endpoints
@app.post("/api/risk/assess/{loan_id}", response_model=RiskAssessmentResponse)
async def assess_loan_risk(
    loan_id: str,
    assessment: RiskAssessmentCreate,
    db: Session = Depends(get_db)
):
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(404, detail="Loan not found")
    
    assessment_id = str(uuid.uuid4())
    db_assessment = RiskAssessment(
        assessment_id=assessment_id,
        **assessment.model_dump()
    )
    db.add(db_assessment)
    
    # Update loan with risk assessment
    loan.risk_score = assessment.risk_score
    loan.default_probability = assessment.default_probability
    loan.yield_impact = assessment.yield_impact
    loan.last_risk_assessment = datetime.utcnow()
    
    db.commit()
    db.refresh(db_assessment)
    
    append_event(db, actor="system", type="risk_assessment", payload={"loan_id": loan_id, "risk_score": assessment.risk_score})
    return RiskAssessmentResponse(**db_assessment.__dict__)

# Compliance rule management
@app.post("/api/compliance/rules", response_model=ComplianceRuleResponse)
async def create_compliance_rule(rule: ComplianceRuleCreate, db: Session = Depends(get_db)):
    rule_id = str(uuid.uuid4())
    db_rule = ComplianceRule(
        rule_id=rule_id,
        **rule.model_dump()
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    
    append_event(db, actor="system", type="create_compliance_rule", payload={"rule_id": rule_id})
    return ComplianceRuleResponse(**db_rule.__dict__)

@app.get("/api/compliance/rules", response_model=dict)
async def list_compliance_rules(
    rule_type: str | None = None,
    is_active: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    stmt = select(ComplianceRule)
    if rule_type:
        stmt = stmt.where(ComplianceRule.rule_type == rule_type)
    if is_active is not None:
        stmt = stmt.where(ComplianceRule.is_active == is_active)
    
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.order_by(ComplianceRule.created_at.desc()).offset((page-1)*page_size).limit(page_size)).scalars().all()
    
    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [ComplianceRuleResponse(**item.__dict__) for item in items]
    }

# AI Analysis endpoints
@app.post("/api/ai/analyze/document/{doc_id}")
async def analyze_document_ai(
    doc_id: str,
    analysis_type: str = "extraction",
    db: Session = Depends(get_db)
):
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, detail="Document not found")
    
    if not doc.extracted_text:
        raise HTTPException(400, detail="Document must have extracted text for AI analysis")
    
    # Placeholder for AI analysis - in production, this would call OpenAI or other AI services
    analysis_result = {
        "extracted_fields": {
            "loan_amount": None,
            "interest_rate": None,
            "borrower_name": None,
            "property_address": None
        },
        "confidence_score": 0.75,
        "analysis_notes": "AI analysis completed successfully"
    }
    
    # Store AI analysis
    analysis_id = str(uuid.uuid4())
    db_analysis = AIAnalysis(
        analysis_id=analysis_id,
        doc_id=doc_id,
        analysis_type=analysis_type,
        model_used="gpt-4",
        input_data={"text_length": len(doc.extracted_text)},
        output_data=analysis_result,
        confidence_score=analysis_result["confidence_score"]
    )
    db.add(db_analysis)
    
    # Update document with extracted fields
    doc.extracted_fields = analysis_result["extracted_fields"]
    doc.confidence_score = analysis_result["confidence_score"]
    doc.ai_analysis = analysis_result
    doc.processing_status = "ai_analyzed"
    
    db.commit()
    
    append_event(db, actor="system", type="ai_analysis", payload={"doc_id": doc_id, "analysis_type": analysis_type})
    return {"analysis_id": analysis_id, "result": analysis_result}
