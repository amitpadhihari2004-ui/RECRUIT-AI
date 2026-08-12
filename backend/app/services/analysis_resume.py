from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
import hashlib

from app.config.cloudflare import r2_client, R2_BUCKET
from app.models.resume_model import resume_collection
from app.utils.pdf_parser import PDFParser
from app.services.groq_service import GroqService


class ResumeAnalysisService:

    @staticmethod
    def analyze_resume(resume_id: str):

        try:

            # =====================================================
            # 1. Validate Resume ID
            # =====================================================

            if not ObjectId.is_valid(resume_id):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid Resume ID."
                )

            # =====================================================
            # 2. Find Resume
            # =====================================================

            resume = resume_collection.find_one(
                {"_id": ObjectId(resume_id)}
            )

            if not resume:
                raise HTTPException(
                    status_code=404,
                    detail="Resume not found."
                )

            # =====================================================
            # 3. Same Resume ID Already Analyzed
            # =====================================================

            if (
                resume.get("analysis_status") == "Completed"
                and resume.get("analysis")
            ):

                print("Using cached analysis for current resume.")

                return {
                    "success": True,
                    "cached": True,
                    "message": "Analysis already exists.",
                    "analysis": resume["analysis"]
                }

            # =====================================================
            # 4. Download Resume From Cloudflare R2
            # =====================================================

            bucket_key = resume.get("bucket_key")

            if not bucket_key:
                raise HTTPException(
                    status_code=400,
                    detail="Resume storage information not found."
                )

            print("Downloading:", bucket_key)

            response = r2_client.get_object(
                Bucket=R2_BUCKET,
                Key=bucket_key
            )

            file_bytes = response["Body"].read()

            print("Downloaded Successfully.")

            # =====================================================
            # 5. Extract Resume Text
            # =====================================================

            resume_text = PDFParser.extract_text(
                file_bytes=file_bytes,
                filename=resume["file_name"]
            )

            print(
                "Resume Text Length:",
                len(resume_text)
            )

            if not resume_text or not resume_text.strip():

                raise HTTPException(
                    status_code=400,
                    detail="Unable to extract text from resume."
                )

            # =====================================================
            # 6. Normalize Resume Text
            # =====================================================

            normalized_text = " ".join(
                resume_text.split()
            ).strip()

            # =====================================================
            # 7. Generate Resume Content Hash
            # =====================================================

            content_hash = hashlib.sha256(
                normalized_text.encode("utf-8")
            ).hexdigest()

            print(
                "Resume Content Hash:",
                content_hash
            )

            # =====================================================
            # 8. Check If Same Resume Was Already Analyzed
            # =====================================================

            existing_analysis = resume_collection.find_one(
                {
                    "content_hash": content_hash,
                    "analysis_status": "Completed",
                    "analysis": {
                        "$exists": True
                    }
                }
            )

            # =====================================================
            # 9. Reuse Existing Analysis
            # =====================================================

            if existing_analysis:

                print(
                    "Identical resume found."
                )

                print(
                    "Reusing previous AI analysis."
                )

                resume_collection.update_one(
                    {
                        "_id": ObjectId(resume_id)
                    },
                    {
                        "$set": {
                            "content_hash": content_hash,
                            "analysis": existing_analysis["analysis"],
                            "analysis_status": "Completed",
                            "analyzed_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )

                return {
                    "success": True,
                    "cached": True,
                    "message": (
                        "Existing analysis reused "
                        "for identical resume."
                    ),
                    "analysis": existing_analysis["analysis"]
                }

            # =====================================================
            # 10. New Resume → AI Analysis
            # =====================================================

            print(
                "No previous analysis found."
            )

            print(
                "Sending resume to Groq AI..."
            )

            analysis = GroqService.analyze_resume(
                normalized_text
            )

            print(
                "Groq Analysis Completed."
            )

            # =====================================================
            # 11. Store Analysis
            # =====================================================

            resume_collection.update_one(
                {
                    "_id": ObjectId(resume_id)
                },
                {
                    "$set": {
                        "content_hash": content_hash,
                        "analysis": analysis,
                        "analysis_status": "Completed",
                        "analyzed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # =====================================================
            # 12. Return Result
            # =====================================================

            return {
                "success": True,
                "cached": False,
                "message": (
                    "Resume analyzed successfully."
                ),
                "analysis": analysis
            }

        # =========================================================
        # HTTP Errors
        # =========================================================

        except HTTPException:
            raise

        # =========================================================
        # Unexpected Errors
        # =========================================================

        except Exception as e:

            print(
                "Resume Analysis Error:",
                str(e)
            )

            # Safely mark analysis as failed
            if ObjectId.is_valid(resume_id):

                resume_collection.update_one(
                    {
                        "_id": ObjectId(resume_id)
                    },
                    {
                        "$set": {
                            "analysis_status": "Failed",
                            "updated_at": datetime.utcnow()
                        }
                    }
                )

            raise HTTPException(
                status_code=500,
                detail=str(e)
            )