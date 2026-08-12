from datetime import datetime
from bson import ObjectId

from fastapi import HTTPException, status

from app.models.user_model import user_collection
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token


# -------------------- SIGNUP -------------------- #

def signup(user):

    # Check if email already exists
    existing_user = user_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists."
        )

    # Check password confirmation
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Create user document
    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "password": hash_password(user.password),
        "phone": user.phone,
        "college_name": user.college_name,
        "course": user.course,
        "branch": user.branch,
        "graduation_year": user.graduation_year,
        "profile_photo": "",
        "gender": "",
        "date_of_birth": "",
        "address": "",
        "skills": [],
        "experience": "",
        "linkedin": "",
        "github": "",
        "portfolio": "",
        "about": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }

    result = user_collection.insert_one(new_user)

    return {
        "success": True,
        "message": "User registered successfully.",
        "user_id": str(result.inserted_id)
    }


# -------------------- LOGIN -------------------- #

def login(user):

    # Find user
    existing_user = user_collection.find_one(
        {"email": user.email}
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Verify password
    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate JWT Token
    access_token = create_access_token(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"]
        }
    )

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "Bearer",

        # Return user details
        "user_id": str(existing_user["_id"]),
        "full_name": existing_user["full_name"],
        "email": existing_user["email"]
    }


# -------------------- LOGOUT -------------------- #

def logout():

    return {
        "success": True,
        "message": "Logout successful."
    }


# -------------------- GET PROFILE -------------------- #

def get_profile(user_id):

    # Validate ObjectId
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format."
        )

    # Find user
    user = user_collection.find_one(
        {"_id": ObjectId(user_id)}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Convert _id to string and remove password
    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return user


# -------------------- UPDATE PROFILE -------------------- #

def update_profile(user_id, user):

    # Validate ObjectId
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format."
        )

    # Check if user exists
    existing_user = user_collection.find_one(
        {"_id": ObjectId(user_id)}
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Get update data excluding unset fields
    update_data = user.model_dump(exclude_unset=True)

    # Remove fields that should never be updated
    update_data.pop("password", None)
    update_data.pop("email", None)
    update_data.pop("created_at", None)

    # Add updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()

    # Update user
    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    return {
        "success": True,
        "message": "Profile Updated Successfully."
    }