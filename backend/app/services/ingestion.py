import csv
import io
from typing import List
from ..schemas import IngestLoansResult

def ingest_loans_csv(db, csv_text: str) -> IngestLoansResult:
    """Ingest loans from CSV text"""
    try:
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_text))
        loans = list(csv_reader)
        
        # For MVP, just return basic info
        # In production, you'd save to database here
        return IngestLoansResult(
            loans_processed=len(loans),
            loans_created=len(loans),
            loans_updated=0,
            errors=[]
        )
    except Exception as e:
        raise ValueError(f"Failed to parse CSV: {str(e)}")