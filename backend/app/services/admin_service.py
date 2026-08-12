from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.models.admin_model import admin_collection
from app.utils.password_handler import hash_password, verify_password


class AdminService:
    """Service class for managing admin users."""

    @staticmethod
    def _validate_object_id(id_string: str, field_name: str) -> ObjectId:
        """
        Validate and convert string to ObjectId.

        Args:
            id_string: The ID string to validate
            field_name: Name of the field for error message

        Returns:
            ObjectId instance

        Raises:
            HTTPException: If ID format is invalid
        """
        try:
            return ObjectId(id_string)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {field_name} ID format."
            )

    @staticmethod
    def _convert_object_ids(document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert all ObjectId fields to strings in a document.

        Args:
            document: The document to convert

        Returns:
            Document with all ObjectIds converted to strings
        """
        if not document:
            return document

        converted = {}
        for key, value in document.items():
            if isinstance(value, ObjectId):
                converted[key] = str(value)
            elif isinstance(value, list):
                converted[key] = [
                    str(item) if isinstance(item, ObjectId) else item
                    for item in value
                ]
            elif isinstance(value, dict):
                converted[key] = AdminService._convert_object_ids(value)
            else:
                converted[key] = value
        return converted

    @staticmethod
    def _get_admin_or_404(admin_id: ObjectId) -> Dict[str, Any]:
        """
        Get admin document or raise 404 if not found.

        Args:
            admin_id: Admin ObjectId

        Returns:
            Admin document

        Raises:
            HTTPException: If admin not found
        """
        admin = admin_collection.find_one({"_id": admin_id})
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found."
            )
        return admin

    @staticmethod
    def _get_admin_by_email(email: str) -> Optional[Dict[str, Any]]:
        """
        Get admin by email.

        Args:
            email: Admin email

        Returns:
            Admin document or None
        """
        return admin_collection.find_one({"email": email.lower()})

    @staticmethod
    def create_admin(
        name: str,
        email: str,
        password: str,
        role: str = "admin",
        permissions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a new admin user.

        Args:
            name: Admin name
            email: Admin email
            password: Admin password
            role: Admin role (admin, super_admin, etc.)
            permissions: List of permissions

        Returns:
            Created admin document

        Raises:
            HTTPException: If validation fails or admin already exists
        """
        # Validate input
        if not name or not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name, email, and password are required."
            )

        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )

        # Check if admin already exists
        existing_admin = AdminService._get_admin_by_email(email)
        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin with this email already exists."
            )

        # Hash password
        hashed_password = hash_password(password)

        # Prepare admin document
        current_time = datetime.utcnow()
        admin_data = {
            "name": name.strip(),
            "email": email.lower().strip(),
            "password": hashed_password,
            "role": role,
            "permissions": permissions or [],
            "is_active": True,
            "last_login": None,
            "created_at": current_time,
            "updated_at": current_time
        }

        # Insert into database
        try:
            result = admin_collection.insert_one(admin_data)
            admin = admin_collection.find_one({"_id": result.inserted_id})
            return AdminService._convert_object_ids(admin)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create admin: {str(e)}"
            )

    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate an admin user.

        Args:
            email: Admin email
            password: Admin password

        Returns:
            Admin information

        Raises:
            HTTPException: If credentials are invalid
        """
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required."
            )

        # Find admin by email
        admin = AdminService._get_admin_by_email(email)

        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Verify password
        if not verify_password(password, admin.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Check if account is active
        if not admin.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is deactivated."
            )

        # Update last login
        admin_collection.update_one(
            {"_id": admin["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Return admin info (excluding password)
        admin_info = AdminService._convert_object_ids(admin)
        admin_info.pop("password", None)

        return {
            "success": True,
            "message": "Login successful.",
            "admin": admin_info
        }

    @staticmethod
    def get_admin(admin_id: str) -> Dict[str, Any]:
        """
        Get admin by ID.

        Args:
            admin_id: Admin ID

        Returns:
            Admin document

        Raises:
            HTTPException: If admin not found
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")
        admin = AdminService._get_admin_or_404(admin_object_id)

        # Remove password before returning
        admin.pop("password", None)
        return AdminService._convert_object_ids(admin)

    @staticmethod
    def get_all_admins(
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all admins with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status

        Returns:
            List of admin documents
        """
        # Build query filter
        query = {}
        if is_active is not None:
            query["is_active"] = is_active

        admins = []
        try:
            cursor = admin_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            for admin in cursor:
                admin.pop("password", None)
                admins.append(AdminService._convert_object_ids(admin))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve admins: {str(e)}"
            )

        return admins

    @staticmethod
    def update_admin(
        admin_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        role: Optional[str] = None,
        permissions: Optional[List[str]] = None,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Update admin information.

        Args:
            admin_id: Admin ID
            name: New name
            email: New email
            role: New role
            permissions: New permissions list
            is_active: New active status

        Returns:
            Updated admin document

        Raises:
            HTTPException: If admin not found or validation fails
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Check if admin exists
        AdminService._get_admin_or_404(admin_object_id)

        # Prepare update data
        update_data = {"updated_at": datetime.utcnow()}

        if name is not None:
            update_data["name"] = name.strip()

        if email is not None:
            email = email.lower().strip()
            # Check if email is taken by another admin
            existing_admin = AdminService._get_admin_by_email(email)
            if existing_admin and existing_admin["_id"] != admin_object_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use by another admin."
                )
            update_data["email"] = email

        if role is not None:
            update_data["role"] = role

        if permissions is not None:
            update_data["permissions"] = permissions

        if is_active is not None:
            update_data["is_active"] = is_active

        # Update in database
        try:
            admin_collection.update_one(
                {"_id": admin_object_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update admin: {str(e)}"
            )

        # Return updated admin
        updated_admin = admin_collection.find_one({"_id": admin_object_id})
        updated_admin.pop("password", None)
        return AdminService._convert_object_ids(updated_admin)

    @staticmethod
    def change_password(admin_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """
        Change admin password.

        Args:
            admin_id: Admin ID
            old_password: Current password
            new_password: New password

        Returns:
            Success message

        Raises:
            HTTPException: If validation fails
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Get admin
        admin = AdminService._get_admin_or_404(admin_object_id)

        if not old_password or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password and new password are required."
            )

        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long."
            )

        # Verify old password
        if not verify_password(old_password, admin.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid old password."
            )

        # Hash new password
        hashed_password = hash_password(new_password)

        # Update password
        try:
            admin_collection.update_one(
                {"_id": admin_object_id},
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to change password: {str(e)}"
            )

        return {
            "success": True,
            "message": "Password changed successfully."
        }

    @staticmethod
    def delete_admin(admin_id: str) -> Dict[str, Any]:
        """
        Delete an admin.

        Args:
            admin_id: Admin ID

        Returns:
            Success message

        Raises:
            HTTPException: If admin not found
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Check if admin exists
        AdminService._get_admin_or_404(admin_object_id)

        try:
            admin_collection.delete_one({"_id": admin_object_id})
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete admin: {str(e)}"
            )

        return {
            "success": True,
            "message": "Admin deleted successfully."
        }

    @staticmethod
    def get_admin_count(is_active: Optional[bool] = None) -> int:
        """
        Get total number of admins.

        Args:
            is_active: Filter by active status

        Returns:
            Number of admins
        """
        query = {}
        if is_active is not None:
            query["is_active"] = is_active

        try:
            return admin_collection.count_documents(query)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to count admins: {str(e)}"
            )

    @staticmethod
    def get_admin_by_email(email: str) -> Optional[Dict[str, Any]]:
        """
        Get admin by email.

        Args:
            email: Admin email

        Returns:
            Admin document or None
        """
        admin = AdminService._get_admin_by_email(email)
        if admin:
            admin.pop("password", None)
            return AdminService._convert_object_ids(admin)
        return None

    @staticmethod
    def toggle_admin_status(admin_id: str) -> Dict[str, Any]:
        """
        Toggle admin active status.

        Args:
            admin_id: Admin ID

        Returns:
            Updated admin document

        Raises:
            HTTPException: If admin not found
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Get admin
        admin = AdminService._get_admin_or_404(admin_object_id)

        # Toggle status
        new_status = not admin.get("is_active", True)

        try:
            admin_collection.update_one(
                {"_id": admin_object_id},
                {
                    "$set": {
                        "is_active": new_status,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to toggle admin status: {str(e)}"
            )

        # Return updated admin
        updated_admin = admin_collection.find_one({"_id": admin_object_id})
        updated_admin.pop("password", None)
        return AdminService._convert_object_ids(updated_admin)

    @staticmethod
    def update_admin_permissions(
        admin_id: str,
        permissions: List[str]
    ) -> Dict[str, Any]:
        """
        Update admin permissions.

        Args:
            admin_id: Admin ID
            permissions: New permissions list

        Returns:
            Updated admin document

        Raises:
            HTTPException: If admin not found
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Check if admin exists
        AdminService._get_admin_or_404(admin_object_id)

        # Update permissions
        try:
            admin_collection.update_one(
                {"_id": admin_object_id},
                {
                    "$set": {
                        "permissions": permissions,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update admin permissions: {str(e)}"
            )

        # Return updated admin
        updated_admin = admin_collection.find_one({"_id": admin_object_id})
        updated_admin.pop("password", None)
        return AdminService._convert_object_ids(updated_admin)

    @staticmethod
    def check_permission(admin_id: str, permission: str) -> bool:
        """
        Check if admin has a specific permission.

        Args:
            admin_id: Admin ID
            permission: Permission to check

        Returns:
            True if admin has permission, False otherwise

        Raises:
            HTTPException: If admin not found
        """
        admin_object_id = AdminService._validate_object_id(admin_id, "admin")

        # Get admin
        admin = AdminService._get_admin_or_404(admin_object_id)

        # Super admins have all permissions
        if admin.get("role") == "super_admin":
            return True

        # Check permissions
        permissions = admin.get("permissions", [])
        return permission in permissions