from sqlalchemy.orm import Session
from .models import Document

def create_document(db: Session, doc_id: str, loan_id: str = None, type: str = "generic", path: str = "", sha256: str = ""):
    """Create a new document record"""
    db_doc = Document(
        doc_id=doc_id,
        loan_id=loan_id,
        type=type,
        path=path,
        sha256=sha256
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc