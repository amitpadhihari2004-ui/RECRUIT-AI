from fastapi import APIRouter

from app.schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserUpdate
)

from app.services.user_service import (
    signup,
    login,
    logout,
    get_profile,
    update_profile
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# ==============================
# Student Signup
# ==============================

@router.post("/signup")
def signup_user(user: UserCreate):
    return signup(user)


# ==============================
# Student Login
# ==============================

@router.post("/login")
def login_user(user: UserLogin):
    return login(user)


# ==============================
# Student Logout
# ==============================

@router.post("/logout")
def logout_user():
    return logout()


# ==============================
# Get Student Profile
# ==============================

@router.get("/profile/{user_id}")
def get_user_profile(user_id: str):
    return get_profile(user_id)


# ==============================
# Update Student Profile
# ==============================

@router.put("/profile/{user_id}")
def update_user_profile(
    user_id: str,
    user: UserUpdate
):
    return update_profile(
        user_id,
        user
    )