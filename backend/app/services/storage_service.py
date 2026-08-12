import os
import uuid

from fastapi import UploadFile, HTTPException

from app.config.cloudflare import (
    r2_client,
    R2_BUCKET,
)


class StorageService:

    @staticmethod
    def upload_resume(file: UploadFile):

        try:

            # Validate file type
            allowed_extensions = ["pdf", "doc", "docx"]

            extension = file.filename.split(".")[-1].lower()

            if extension not in allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail="Only PDF, DOC and DOCX files are allowed."
                )

            # Generate unique file name
            unique_filename = (
                f"resumes/{uuid.uuid4()}.{extension}"
            )

            # Upload to Cloudflare R2
            r2_client.upload_fileobj(
                Fileobj=file.file,
                Bucket=R2_BUCKET,
                Key=unique_filename,
                ExtraArgs={
                    "ContentType": file.content_type
                }
            )

            return {
                "file_name": file.filename,
                "bucket_key": unique_filename,
                "content_type": file.content_type,
                "file_size": file.size if hasattr(file, "size") else 0,
                "storage": "Cloudflare R2"
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload Failed : {str(e)}"
            )

    @staticmethod
    def delete_resume(bucket_key: str):

        try:

            r2_client.delete_object(
                Bucket=R2_BUCKET,
                Key=bucket_key
            )

            return {
                "message": "Resume deleted successfully."
            }

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=str(e)
            )

    @staticmethod
    def generate_file_url(bucket_key: str):

        return (
            f"{os.getenv('R2_ENDPOINT')}/"
            f"{R2_BUCKET}/{bucket_key}"
        )