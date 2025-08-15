import io
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

def extract_pdf_text(file_obj):
    """Extract text from a PDF file object"""
    try:
        output = io.StringIO()
        extract_text_to_fp(file_obj, output, laparams=LAParams())
        return output.getvalue()
    except Exception as e:
        return f"Error extracting text: {str(e)}"