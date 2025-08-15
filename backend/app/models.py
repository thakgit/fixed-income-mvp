
from sqlalchemy import Column, Integer, String, Date, Float, JSON, Text, ForeignKey, DateTime, Boolean, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Loan(Base):
    __tablename__ = "loans"
    loan_id = Column(String, primary_key=True, index=True)
    orig_date = Column(Date, nullable=True)
    balance = Column(Float, nullable=True)
    rate = Column(Float, nullable=True)
    term = Column(Integer, nullable=True)
    status = Column(String, index=True, default="current")
    delinquency_days = Column(Integer, default=0)
    servicer_id = Column(String, index=True, nullable=True)
    collateral_id = Column(String, nullable=True)
    geography = Column(String, nullable=True)
    features = Column(JSON, nullable=True)
    
    # Enhanced fields for AI analytics
    risk_score = Column(Float, nullable=True)
    default_probability = Column(Float, nullable=True)
    yield_impact = Column(Float, nullable=True)
    last_risk_assessment = Column(DateTime, nullable=True)
    
    # Compliance tracking
    compliance_status = Column(String, default="compliant")
    missing_documents = Column(JSON, nullable=True)
    compliance_score = Column(Float, nullable=True)
    
    # Portfolio management
    portfolio_id = Column(String, index=True, nullable=True)
    allocation_percentage = Column(Float, nullable=True)
    
    documents = relationship("Document", back_populates="loan")
    compliance_events = relationship("ComplianceEvent", back_populates="loan")
    risk_assessments = relationship("RiskAssessment", back_populates="loan")

class Document(Base):
    __tablename__ = "documents"
    doc_id = Column(String, primary_key=True, index=True)
    loan_id = Column(String, ForeignKey("loans.loan_id"), index=True, nullable=True)
    type = Column(String, index=True)
    path = Column(String, nullable=False)
    sha256 = Column(String, index=True)
    extracted_text = Column(Text, nullable=True)
    meta = Column(JSON, nullable=True)
    
    # Enhanced document processing
    processing_status = Column(String, default="pending")
    extracted_fields = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    ai_analysis = Column(JSON, nullable=True)
    
    loan = relationship("Loan", back_populates="documents")
    chunks = relationship("DocChunk", back_populates="document")

class Event(Base):
    __tablename__ = "events_ledger"
    event_id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    actor = Column(String, nullable=False)
    loan_id = Column(String, index=True, nullable=True)
    type = Column(String, index=True)
    payload = Column(JSON)
    prev_hash = Column(String, nullable=True)
    this_hash = Column(String, nullable=False)
    
    # Enhanced event tracking
    severity = Column(String, default="info")
    category = Column(String, index=True)
    related_events = Column(JSON, nullable=True)

class DocChunk(Base):
    __tablename__ = "doc_chunks"
    chunk_id = Column(String, primary_key=True, index=True)
    doc_id = Column(String, ForeignKey("documents.doc_id"), index=True, nullable=False)
    ord = Column(Integer, index=True, default=0)
    text = Column(Text, nullable=False)
    vec = Column(JSON, nullable=True)  # hashed embedding vector (list[float])
    
    # Enhanced chunk metadata
    chunk_type = Column(String, default="text")
    semantic_tags = Column(JSON, nullable=True)
    relevance_score = Column(Float, nullable=True)
    
    document = relationship("Document", back_populates="chunks")

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"
    rule_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    rule_type = Column(String, index=True)  # regulatory, investor, internal
    rule_logic = Column(JSON, nullable=False)
    severity = Column(String, default="medium")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComplianceEvent(Base):
    __tablename__ = "compliance_events"
    event_id = Column(String, primary_key=True, index=True)
    loan_id = Column(String, ForeignKey("loans.loan_id"), index=True, nullable=True)
    rule_id = Column(String, ForeignKey("compliance_rules.rule_id"), index=True, nullable=True)
    event_type = Column(String, index=True)  # violation, warning, info
    description = Column(Text, nullable=False)
    severity = Column(String, default="medium")
    status = Column(String, default="open")  # open, resolved, escalated
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    loan = relationship("Loan", back_populates="compliance_events")
    rule = relationship("ComplianceRule")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    assessment_id = Column(String, primary_key=True, index=True)
    loan_id = Column(String, ForeignKey("loans.loan_id"), index=True, nullable=False)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    risk_score = Column(Float, nullable=False)
    default_probability = Column(Float, nullable=True)
    yield_impact = Column(Float, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    model_version = Column(String, nullable=True)
    confidence_interval = Column(JSON, nullable=True)
    
    loan = relationship("Loan", back_populates="risk_assessments")

class Portfolio(Base):
    __tablename__ = "portfolios"
    portfolio_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    strategy = Column(String, index=True)
    target_yield = Column(Float, nullable=True)
    risk_tolerance = Column(String, default="moderate")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Portfolio analytics
    total_value = Column(Float, nullable=True)
    weighted_average_rate = Column(Float, nullable=True)
    average_delinquency = Column(Float, nullable=True)
    compliance_score = Column(Float, nullable=True)

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    analysis_id = Column(String, primary_key=True, index=True)
    loan_id = Column(String, ForeignKey("loans.loan_id"), index=True, nullable=True)
    doc_id = Column(String, ForeignKey("documents.doc_id"), index=True, nullable=True)
    analysis_type = Column(String, index=True)  # sentiment, risk, compliance, extraction
    model_used = Column(String, nullable=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Analysis metadata
    processing_time = Column(Float, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)