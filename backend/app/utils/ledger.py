import hashlib
import json
from sqlalchemy.orm import Session
from ..models import Event

def append_event(db: Session, actor: str, type: str, payload: dict, loan_id: str = None):
    """Append an event to the ledger"""
    # For MVP, just create a basic event
    # In production, you'd implement proper blockchain-style hashing
    event_id = f"evt_{hashlib.md5(f'{actor}{type}{json.dumps(payload)}'.encode()).hexdigest()[:16]}"
    
    event = Event(
        event_id=event_id,
        actor=actor,
        type=type,
        loan_id=loan_id,
        payload=payload,
        this_hash="placeholder_hash"  # Simplified for MVP
    )
    
    db.add(event)
    db.commit()
    return event