from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class JobCreate(BaseModel):
    title: str
    department: str
    location: str

    employment_type: str
    experience_required: str

    salary: str

    description: str

    skills: List[str]

    requirements: List[str]


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None

    employment_type: Optional[str] = None
    experience_required: Optional[str] = None

    salary: Optional[str] = None

    description: Optional[str] = None

    skills: Optional[List[str]] = None

    requirements: Optional[List[str]] = None

    status: Optional[str] = None


class JobResponse(BaseModel):
    id: str

    organization_id: str

    title: str
    department: str
    location: str

    employment_type: str
    experience_required: str

    salary: str

    description: str

    skills: List[str]

    requirements: List[str]

    status: str

    created_at: datetime
    updated_at: datetime