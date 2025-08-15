import os
import hashlib
import uuid
from pathlib import Path

def save_upload(file_obj, content_type):
    """Save uploaded file and return path and SHA256 hash"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.pdf"  # Assuming PDF for now
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as f:
        content = file_obj.read()
        f.write(content)
    
    # Calculate SHA256 hash
    sha256 = hashlib.sha256(content).hexdigest()
    
    return str(file_path), sha256