from fastapi import APIRouter, Depends

from app.schemas.user_schema import UserLogin
from app.schemas.organization_schema import OrganizationLogin
from app.schemas.admin_schema import AdminLogin

from app.services.auth_service import AuthService

from app.auth.auth_dependency import (
    get_current_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ===============================
# Student Login
# ===============================
@router.post("/student/login")
def student_login(data: UserLogin):
    return AuthService.student_login(data)


# ===============================
# Organization Login
# ===============================
@router.post("/organization/login")
def organization_login(data: OrganizationLogin):
    return AuthService.organization_login(data)


# ===============================
# Admin Login
# ===============================
@router.post("/admin/login")
def admin_login(data: AdminLogin):
    return AuthService.admin_login(data)


# ===============================
# Refresh Access Token
# ===============================
@router.post("/refresh")
def refresh_token(refresh_token: str):
    return AuthService.refresh_token(
        refresh_token
    )


# ===============================
# Logout
# ===============================
@router.post("/logout")
def logout():
    return AuthService.logout()


# ===============================
# Current Logged-in User
# ===============================
@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return AuthService.get_current_user(
        current_user
    )


# ===============================
# Change Password
# ===============================
@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user=Depends(get_current_user)
):
    return AuthService.change_password(
        current_user,
        old_password,
        new_password
    )


# ===============================
# Forgot Password
# ===============================
@router.post("/forgot-password")
def forgot_password(email: str):
    return AuthService.forgot_password(
        email
    )


# ===============================
# Reset Password
# ===============================
@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str
):
    return AuthService.reset_password(
        token,
        new_password
    )