from pydantic import BaseModel, EmailStr
from typing import Optional


class AdminCreate(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class AdminLogin(BaseModel):

    email: EmailStr

    password: str


class AdminUpdate(BaseModel):

    full_name: Optional[str] = None

    email: Optional[EmailStr] = None

    password: Optional[str] = None