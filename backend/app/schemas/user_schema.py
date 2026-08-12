from pydantic import BaseModel, EmailStr
from typing import Optional


# ==============================
# Student Signup
# ==============================

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str

    phone: str

    college_name: str
    course: str
    branch: str
    graduation_year: int


# ==============================
# Student Login
# ==============================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==============================
# Update Student Profile
# ==============================

class UserUpdate(BaseModel):

    full_name: Optional[str] = None
    phone: Optional[str] = None

    college_name: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None

    profile_photo: Optional[str] = None

    gender: Optional[str] = None

    date_of_birth: Optional[str] = None

    address: Optional[str] = None

    skills: Optional[list[str]] = None

    experience: Optional[str] = None

    linkedin: Optional[str] = None

    github: Optional[str] = None

    portfolio: Optional[str] = None

    about: Optional[str] = None


# ==============================
# User Response
# ==============================

class UserResponse(BaseModel):

    id: str

    full_name: str

    email: EmailStr

    phone: str

    college_name: str
    course: str
    branch: str
    graduation_year: int

    profile_photo: Optional[str] = None

    gender: Optional[str] = None

    date_of_birth: Optional[str] = None

    address: Optional[str] = None

    skills: Optional[list[str]] = None

    experience: Optional[str] = None

    linkedin: Optional[str] = None

    github: Optional[str] = None

    portfolio: Optional[str] = None

    about: Optional[str] = None