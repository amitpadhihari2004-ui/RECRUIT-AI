from fastapi import APIRouter

from app.schemas.admin_schema import (
    AdminCreate,
    AdminLogin,
    AdminUpdate
)

from app.services.admin_service import (
    AdminService
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.post("/register")
def create_admin(data: AdminCreate):
    return AdminService.create_admin(data)


@router.post("/login")
def login(data: AdminLogin):
    return AdminService.login(data)


@router.get("/")
def get_all_admins():
    return AdminService.get_all_admins()


@router.get("/{admin_id}")
def get_admin(admin_id: str):
    return AdminService.get_admin(admin_id)


@router.put("/{admin_id}")
def update_admin(
    admin_id: str,
    data: AdminUpdate
):
    return AdminService.update_admin(
        admin_id,
        data
    )


@router.delete("/{admin_id}")
def delete_admin(admin_id: str):
    return AdminService.delete_admin(
        admin_id
    )