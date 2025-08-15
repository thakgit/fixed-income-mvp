from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

# Enums
class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    PENDING = "pending"

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class DocumentType(str, Enum):
    MORTGAGE_NOTE = "mortgage_note"
    DEED_OF_TRUST = "deed_of_trust"
    FORM_410A = "410A"
    BANKRUPTCY_FILING = "bankruptcy_filing"
    TITLE_INSURANCE = "title_insurance"
    PAYMENT_HISTORY = "payment_history"
    GENERIC = "generic"

# Base schemas
class IngestLoansResult(BaseModel):
    loans_processed: int
    loans_created: int
    loans_updated: int
    errors: List[str]

class UploadResult(BaseModel):
    doc_id: str
    loan_id: Optional[str]
    type: str
    path: str

# Loan schemas
class LoanBase(BaseModel):
    loan_id: str
    orig_date: Optional[date]
    balance: Optional[float]
    rate: Optional[float]
    term: Optional[int]
    status: str = "current"
    delinquency_days: int = 0
    servicer_id: Optional[str]
    collateral_id: Optional[str]
    geography: Optional[str]
    features: Optional[Dict[str, Any]]
    risk_score: Optional[float]
    default_probability: Optional[float]
    yield_impact: Optional[float]
    compliance_status: str = "compliant"
    portfolio_id: Optional[str]

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    balance: Optional[float]
    status: Optional[str]
    delinquency_days: Optional[int]
    risk_score: Optional[float]
    default_probability: Optional[float]
    compliance_status: Optional[str]

class LoanResponse(LoanBase):
    missing_410A: bool
    last_risk_assessment: Optional[datetime]
    compliance_score: Optional[float]

# Document schemas
class DocumentBase(BaseModel):
    doc_id: str
    loan_id: Optional[str]
    type: str
    path: str
    sha256: str
    extracted_text: Optional[str]
    meta: Optional[Dict[str, Any]]
    processing_status: str = "pending"
    extracted_fields: Optional[Dict[str, Any]]
    confidence_score: Optional[float]

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    has_text: bool
    preview: Optional[str]

# Compliance schemas
class ComplianceRuleBase(BaseModel):
    name: str
    description: Optional[str]
    rule_type: str
    rule_logic: Dict[str, Any]
    severity: str = "medium"
    is_active: bool = True

class ComplianceRuleCreate(ComplianceRuleBase):
    pass

class ComplianceRuleResponse(ComplianceRuleBase):
    rule_id: str
    created_at: datetime
    updated_at: datetime

class ComplianceEventBase(BaseModel):
    loan_id: Optional[str]
    rule_id: Optional[str]
    event_type: str
    description: str
    severity: str = "medium"
    status: str = "open"
    resolution_notes: Optional[str]

class ComplianceEventCreate(ComplianceEventBase):
    pass

class ComplianceEventResponse(ComplianceEventBase):
    event_id: str
    detected_at: datetime
    resolved_at: Optional[datetime]

# Risk Assessment schemas
class RiskAssessmentBase(BaseModel):
    loan_id: str
    risk_score: float
    default_probability: Optional[float]
    yield_impact: Optional[float]
    risk_factors: Optional[Dict[str, Any]]
    model_version: Optional[str]
    confidence_interval: Optional[Dict[str, float]]

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentResponse(RiskAssessmentBase):
    assessment_id: str
    assessment_date: datetime

# Portfolio schemas
class PortfolioBase(BaseModel):
    name: str
    description: Optional[str]
    strategy: str
    target_yield: Optional[float]
    risk_tolerance: str = "moderate"

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioResponse(PortfolioBase):
    portfolio_id: str
    total_value: Optional[float]
    weighted_average_rate: Optional[float]
    average_delinquency: Optional[float]
    compliance_score: Optional[float]
    created_at: datetime
    updated_at: datetime

# AI Analysis schemas
class AIAnalysisBase(BaseModel):
    loan_id: Optional[str]
    doc_id: Optional[str]
    analysis_type: str
    model_used: Optional[str]
    input_data: Optional[Dict[str, Any]]
    output_data: Dict[str, Any]
    confidence_score: Optional[float]

class AIAnalysisCreate(AIAnalysisBase):
    pass

class AIAnalysisResponse(AIAnalysisBase):
    analysis_id: str
    created_at: datetime
    processing_time: Optional[float]
    tokens_used: Optional[int]
    cost: Optional[float]

# RAG schemas
class RAGQuery(BaseModel):
    q: str = Field(..., description="Natural language query")
    loan_id: Optional[str] = Field(None, description="Filter by specific loan")
    doc_type: Optional[str] = Field(None, description="Filter by document type")
    limit: int = Field(5, description="Number of results to return")

class RAGResponse(BaseModel):
    answers: List[Dict[str, Any]]
    query: str
    total_results: int
    processing_time: float

# Compliance findings schemas
class ComplianceFinding(BaseModel):
    loan_id: str
    rule_name: str
    severity: str
    description: str
    detected_at: datetime
    status: str
    missing_documents: List[str]

# Portfolio analytics schemas
class PortfolioAnalytics(BaseModel):
    total_loans: int
    total_value: float
    weighted_average_rate: float
    average_delinquency: float
    compliance_score: float
    risk_distribution: Dict[str, int]
    delinquency_distribution: Dict[str, int]
    geography_distribution: Dict[str, int]

# 410A Draft schemas
class Form410ADraft(BaseModel):
    loan_id: str
    fields: Dict[str, Any]
    confidence: float
    pdf_url: Optional[str]
    missing_information: List[str]
    recommendations: List[str]