from io import BytesIO

import fitz  # PyMuPDF
from docx import Document

from fastapi import HTTPException


class PDFParser:

    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:

        filename = filename.lower()

        text = ""

        # PDF
        if filename.endswith(".pdf"):

            try:

                pdf = fitz.open(
                    stream=file_bytes,
                    filetype="pdf"
                )

                for page in pdf:
                    text += page.get_text()

                pdf.close()

            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"PDF Parsing Error: {str(e)}"
                )

        # DOCX
        elif filename.endswith(".docx"):

            try:

                document = Document(
                    BytesIO(file_bytes)
                )

                for paragraph in document.paragraphs:
                    text += paragraph.text + "\n"

            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"DOCX Parsing Error: {str(e)}"
                )

        else:

            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Upload PDF or DOCX."
            )

        return text.strip()