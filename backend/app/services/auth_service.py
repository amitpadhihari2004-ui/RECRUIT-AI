from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.models.user_model import user_collection
from app.models.organization_model import organization_collection
from app.models.admin_model import admin_collection
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_refresh_token
)


class AuthService:
    """Service class for handling authentication and authorization."""

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
    def _get_user_by_email(email: str, collection) -> Optional[Dict[str, Any]]:
        """
        Get user by email from a specific collection.

        Args:
            email: User email
            collection: MongoDB collection

        Returns:
            User document or None
        """
        return collection.find_one({"email": email.lower()})

    @staticmethod
    def _create_auth_response(
        user_id: str,
        user_name: str,
        email: str,
        role: str,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create standardized authentication response.

        Args:
            user_id: User ID
            user_name: User name
            email: User email
            role: User role
            additional_data: Additional data to include

        Returns:
            Authentication response dictionary
        """
        # Create payload for tokens
        payload = {
            "id": user_id,
            "email": email,
            "role": role
        }

        # Generate tokens
        access_token = create_access_token(payload)
        refresh_token = create_refresh_token(payload)

        response = {
            "success": True,
            "message": "Login successful.",
            "user_id": user_id,
            "user_name": user_name,
            "email": email,
            "role": role,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        }

        # Add additional data if provided
        if additional_data:
            response.update(additional_data)

        return response

    @staticmethod
    def student_login(email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a student user.

        Args:
            email: Student email
            password: Student password

        Returns:
            Authentication response with tokens

        Raises:
            HTTPException: If credentials are invalid
        """
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required."
            )

        # Find student by email
        student = AuthService._get_user_by_email(email, user_collection)

        if not student:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Verify password
        if not verify_password(password, student.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Check if account is active
        if not student.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support."
            )

        # Update last login
        user_collection.update_one(
            {"_id": student["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Prepare response
        student_id = str(student["_id"])
        student_name = student.get("name", "")

        return AuthService._create_auth_response(
            user_id=student_id,
            user_name=student_name,
            email=email,
            role="student"
        )

    @staticmethod
    def organization_login(email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate an organization user.

        Args:
            email: Organization email
            password: Organization password

        Returns:
            Authentication response with tokens

        Raises:
            HTTPException: If credentials are invalid
        """
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required."
            )

        # Find organization by email
        organization = AuthService._get_user_by_email(email, organization_collection)

        if not organization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Verify password
        if not verify_password(password, organization.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Check if account is active
        if not organization.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support."
            )

        # Check if organization is verified
        if not organization.get("is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization account is not verified. Please verify your email."
            )

        # Update last login
        organization_collection.update_one(
            {"_id": organization["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Prepare response
        org_id = str(organization["_id"])
        org_name = organization.get("company_name", "")
        org_email = organization.get("email", "")

        return AuthService._create_auth_response(
            user_id=org_id,
            user_name=org_name,
            email=org_email,
            role="organization",
            additional_data={
                "company_name": org_name,
                "organization_id": org_id
            }
        )

    @staticmethod
    def admin_login(email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate an admin user.

        Args:
            email: Admin email
            password: Admin password

        Returns:
            Authentication response with tokens

        Raises:
            HTTPException: If credentials are invalid
        """
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required."
            )

        # Find admin by email
        admin = AuthService._get_user_by_email(email, admin_collection)

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
                detail="Account is deactivated. Please contact support."
            )

        # Update last login
        admin_collection.update_one(
            {"_id": admin["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Prepare response
        admin_id = str(admin["_id"])
        admin_name = admin.get("name", "")
        admin_email = admin.get("email", "")

        return AuthService._create_auth_response(
            user_id=admin_id,
            user_name=admin_name,
            email=admin_email,
            role="admin",
            additional_data={
                "admin_id": admin_id,
                "admin_name": admin_name
            }
        )

    @staticmethod
    def refresh_token(refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token.

        Args:
            refresh_token: The refresh token

        Returns:
            New access token

        Raises:
            HTTPException: If refresh token is invalid
        """
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required."
            )

        # Verify refresh token
        try:
            payload = verify_refresh_token(refresh_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid refresh token: {str(e)}"
            )

        # Extract user data from payload
        user_id = payload.get("id")
        email = payload.get("email")
        role = payload.get("role")

        if not user_id or not email or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )

        # Create new access token
        new_payload = {
            "id": user_id,
            "email": email,
            "role": role
        }
        new_access_token = create_access_token(new_payload)

        return {
            "success": True,
            "message": "Token refreshed successfully.",
            "access_token": new_access_token,
            "token_type": "Bearer"
        }

    @staticmethod
    def logout() -> Dict[str, Any]:
        """
        Logout user (client-side token cleanup).

        Returns:
            Success message
        """
        # Since we're using stateless JWT, logout is handled client-side
        # by removing the tokens from storage.
        return {
            "success": True,
            "message": "Logged out successfully."
        }

    @staticmethod
    def get_current_user(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get current user from token payload.

        Args:
            payload: JWT payload

        Returns:
            User information

        Raises:
            HTTPException: If user not found or invalid
        """
        user_id = payload.get("id")
        email = payload.get("email")
        role = payload.get("role")

        if not user_id or not email or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )

        # Validate user exists in appropriate collection
        user = None
        collection = None

        if role == "student":
            collection = user_collection
        elif role == "organization":
            collection = organization_collection
        elif role == "admin":
            collection = admin_collection
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role."
            )

        try:
            user_obj_id = ObjectId(user_id)
            user = collection.find_one({"_id": user_obj_id})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID."
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        return {
            "id": str(user["_id"]),
            "email": user.get("email"),
            "role": role,
            "name": user.get("name") or user.get("company_name", ""),
            "user_data": user
        }

    @staticmethod
    def change_password(
        user_id: str,
        role: str,
        old_password: str,
        new_password: str
    ) -> Dict[str, Any]:
        """
        Change user password.

        Args:
            user_id: User ID
            role: User role
            old_password: Current password
            new_password: New password

        Returns:
            Success message

        Raises:
            HTTPException: If validation fails or passwords don't match
        """
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

        # Get appropriate collection
        collection = None
        if role == "student":
            collection = user_collection
        elif role == "organization":
            collection = organization_collection
        elif role == "admin":
            collection = admin_collection
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role."
            )

        try:
            user_obj_id = ObjectId(user_id)
            user = collection.find_one({"_id": user_obj_id})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID."
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        # Verify old password
        if not verify_password(old_password, user.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid old password."
            )

        # Hash new password
        hashed_password = hash_password(new_password)

        # Update password
        try:
            collection.update_one(
                {"_id": user_obj_id},
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
                detail=f"Failed to update password: {str(e)}"
            )

        return {
            "success": True,
            "message": "Password changed successfully."
        }

    @staticmethod
    def forgot_password(email: str, role: str) -> Dict[str, Any]:
        """
        Generate password reset token for a user.

        Args:
            email: User email
            role: User role

        Returns:
            Success message with reset token (in production, this would be emailed)

        Raises:
            HTTPException: If user not found
        """
        if not email or not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and role are required."
            )

        # Get appropriate collection
        collection = None
        if role == "student":
            collection = user_collection
        elif role == "organization":
            collection = organization_collection
        elif role == "admin":
            collection = admin_collection
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role."
            )

        # Find user by email
        user = collection.find_one({"email": email.lower()})

        if not user:
            # Don't reveal if user exists or not for security
            return {
                "success": True,
                "message": "If an account exists with this email, a password reset link will be sent."
            }

        # Generate reset token (valid for 1 hour)
        reset_payload = {
            "id": str(user["_id"]),
            "email": email,
            "role": role,
            "purpose": "password_reset"
        }
        reset_token = create_access_token(reset_payload, expires_delta=timedelta(hours=1))

        # Store reset token in database
        try:
            collection.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "reset_token": reset_token,
                        "reset_token_expires_at": datetime.utcnow() + timedelta(hours=1),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate reset token: {str(e)}"
            )

        # In production, send email with reset link
        # For now, return token (but this should be removed in production)
        return {
            "success": True,
            "message": "Password reset link sent to your email.",
            "reset_token": reset_token  # Remove in production
        }

    @staticmethod
    def reset_password(token: str, new_password: str) -> Dict[str, Any]:
        """
        Reset password using reset token.

        Args:
            token: Password reset token
            new_password: New password

        Returns:
            Success message

        Raises:
            HTTPException: If token is invalid or expired
        """
        if not token or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token and new password are required."
            )

        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long."
            )

        # Verify token
        try:
            payload = verify_access_token(token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired reset token: {str(e)}"
            )

        # Validate token purpose
        if payload.get("purpose") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token purpose."
            )

        user_id = payload.get("id")
        email = payload.get("email")
        role = payload.get("role")

        if not user_id or not email or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )

        # Get appropriate collection
        collection = None
        if role == "student":
            collection = user_collection
        elif role == "organization":
            collection = organization_collection
        elif role == "admin":
            collection = admin_collection
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role."
            )

        # Find user and verify token
        try:
            user_obj_id = ObjectId(user_id)
            user = collection.find_one({
                "_id": user_obj_id,
                "reset_token": token,
                "reset_token_expires_at": {"$gt": datetime.utcnow()}
            })
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID."
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token."
            )

        # Hash new password
        hashed_password = hash_password(new_password)

        # Update password and clear reset token
        try:
            collection.update_one(
                {"_id": user_obj_id},
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.utcnow()
                    },
                    "$unset": {
                        "reset_token": "",
                        "reset_token_expires_at": ""
                    }
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reset password: {str(e)}"
            )

        return {
            "success": True,
            "message": "Password reset successfully."
        }

    @staticmethod
    def validate_user_token(token: str) -> Dict[str, Any]:
        """
        Validate user token and return user info.

        Args:
            token: JWT token

        Returns:
            User information

        Raises:
            HTTPException: If token is invalid
        """
        try:
            payload = verify_access_token(token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )

        return AuthService.get_current_user(payload)

    @staticmethod
    def is_authenticated(token: str) -> bool:
        """
        Check if token is valid.

        Args:
            token: JWT token

        Returns:
            True if token is valid, False otherwise
        """
        try:
            payload = verify_access_token(token)
            return bool(payload)
        except Exception:
            return False

    @staticmethod
    def get_user_role(token: str) -> Optional[str]:
        """
        Get user role from token.

        Args:
            token: JWT token

        Returns:
            User role or None
        """
        try:
            payload = verify_access_token(token)
            return payload.get("role")
        except Exception:
            return None