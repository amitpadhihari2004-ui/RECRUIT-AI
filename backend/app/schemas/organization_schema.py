from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional
from datetime import datetime


class OrganizationSignup(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr

    password: str = Field(..., min_length=6)

    phone: str

    website: Optional[HttpUrl] = None

    industry: str

    address: str

    company_size: Optional[str] = None

    founded_year: Optional[int] = None


class OrganizationLogin(BaseModel):
    email: EmailStr

    password: str


class OrganizationUpdate(BaseModel):
    company_name: Optional[str] = None

    phone: Optional[str] = None

    website: Optional[HttpUrl] = None

    industry: Optional[str] = None

    address: Optional[str] = None

    company_logo: Optional[str] = None

    company_size: Optional[str] = None

    founded_year: Optional[int] = None


class OrganizationResponse(BaseModel):
    id: str

    company_name: str

    email: EmailStr

    phone: str

    website: Optional[str] = None

    industry: str

    address: str

    company_logo: Optional[str] = None

    company_size: Optional[str] = None

    founded_year: Optional[int] = None

    is_verified: bool

    is_active: bool

    created_at: datetime

    updated_at: datetime