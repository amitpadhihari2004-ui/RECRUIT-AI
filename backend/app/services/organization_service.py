from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

from app.models.organization_model import organization_collection
from app.schemas.organization_schema import (
    OrganizationSignup,
    OrganizationLogin,
    OrganizationUpdate
)

from app.utils.password_handler import (
    hash_password,
    verify_password
)


class OrganizationService:

    @staticmethod
    def signup(data: OrganizationSignup):
        existing = organization_collection.find_one(
            {"email": data.email}
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Organization already exists."
            )

        organization = {
            "company_name": data.company_name,
            "email": data.email,
            "password": hash_password(data.password),
            "phone": data.phone,
            "website": str(data.website) if data.website else "",
            "industry": data.industry,
            "address": data.address,
            "company_logo": "",
            "company_size": data.company_size,
            "founded_year": data.founded_year,
            "is_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = organization_collection.insert_one(organization)

        return {
            "success": True,
            "message": "Organization Registered Successfully.",
            "organization_id": str(result.inserted_id)
        }

    @staticmethod
    def login(data: OrganizationLogin):
        organization = organization_collection.find_one(
            {"email": data.email}
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        valid = verify_password(
            data.password,
            organization["password"]
        )

        if not valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid Password."
            )

        return {
            "success": True,
            "message": "Login Successful.",
            "organization_id": str(organization["_id"]),
            "company_name": organization["company_name"]
        }

    @staticmethod
    def get_all_organizations():
        organizations = []

        for organization in organization_collection.find():
            organization["_id"] = str(organization["_id"])

            if "password" in organization:
                del organization["password"]

            organizations.append(organization)

        return organizations

    @staticmethod
    def get_profile(organization_id: str):
        organization = organization_collection.find_one(
            {
                "_id": ObjectId(organization_id)
            }
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        organization["_id"] = str(organization["_id"])

        if "password" in organization:
            del organization["password"]

        return organization

    @staticmethod
    def update_profile(organization_id: str, data: OrganizationUpdate):
        organization = organization_collection.find_one(
            {
                "_id": ObjectId(organization_id)
            }
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        # Convert HttpUrl objects to strings for MongoDB compatibility
        update_data = data.model_dump(
            exclude_unset=True,
            mode="json"
        )
        update_data["updated_at"] = datetime.utcnow()

        organization_collection.update_one(
            {
                "_id": ObjectId(organization_id)
            },
            {
                "$set": update_data
            }
        )

        return {
            "success": True,
            "message": "Profile Updated Successfully."
        }

    @staticmethod
    def delete_organization(organization_id: str):
        organization = organization_collection.find_one(
            {
                "_id": ObjectId(organization_id)
            }
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        organization_collection.delete_one(
            {
                "_id": ObjectId(organization_id)
            }
        )

        return {
            "success": True,
            "message": "Organization Deleted Successfully."
        }