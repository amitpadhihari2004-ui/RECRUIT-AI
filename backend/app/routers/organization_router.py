from fastapi import APIRouter

from app.schemas.organization_schema import (
    OrganizationSignup,
    OrganizationLogin,
    OrganizationUpdate
)

from app.services.organization_service import (
    OrganizationService
)

router = APIRouter(
    prefix="/organization",
    tags=["Organization"]
)


# Register Organization
@router.post("/signup")
def signup(data: OrganizationSignup):
    return OrganizationService.signup(data)


# Organization Login
@router.post("/login")
def login(data: OrganizationLogin):
    return OrganizationService.login(data)


# Get All Organizations
@router.get("/")
def get_all_organizations():
    return OrganizationService.get_all_organizations()


# Get Organization Profile
@router.get("/{organization_id}")
def get_profile(organization_id: str):
    return OrganizationService.get_profile(
        organization_id
    )


# Update Organization Profile
@router.put("/{organization_id}")
def update_profile(
    organization_id: str,
    data: OrganizationUpdate
):
    return OrganizationService.update_profile(
        organization_id,
        data
    )


# Delete Organization
@router.delete("/{organization_id}")
def delete_organization(
    organization_id: str
):
    return OrganizationService.delete_organization(
        organization_id
    )