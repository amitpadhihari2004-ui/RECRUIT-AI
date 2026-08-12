from fastapi import APIRouter

from app.services.analytics_service import AnalyticsService


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/analytics",
    tags=["Student Analytics"]
)


# =========================================================
# GET STUDENT ANALYTICS
# =========================================================
#
# GET
# /analytics/student/{student_id}
#
# Returns analytics ONLY for the requested student.
#
# Example:
#
# Raja:
# /analytics/student/RAJA_ID
#
# Amit:
# /analytics/student/AMIT_ID
#
# Each student receives only their own analytics.
#
# =========================================================

@router.get(
    "/student/{student_id}"
)
def get_student_analytics(
    student_id: str
):
    return AnalyticsService.get_student_analytics(
        student_id
    )


# =========================================================
# GENERATE STUDENT DASHBOARD
# =========================================================
#
# POST
# /analytics/student/{student_id}/generate
#
# Generates and saves a fresh analytics snapshot
# for ONLY this student.
#
# =========================================================

@router.post(
    "/student/{student_id}/generate"
)
def generate_student_dashboard(
    student_id: str
):
    return AnalyticsService.generate_student_dashboard(
        student_id
    )


# =========================================================
# GET SAVED STUDENT DASHBOARD
# =========================================================
#
# GET
# /analytics/student/{student_id}/dashboard
#
# Returns the latest saved analytics for this student.
#
# If no saved analytics exists, the service automatically
# generates the current analytics.
#
# =========================================================

@router.get(
    "/student/{student_id}/dashboard"
)
def get_student_dashboard(
    student_id: str
):
    return AnalyticsService.get_student_dashboard(
        student_id
    )


# =========================================================
# REFRESH STUDENT ANALYTICS
# =========================================================
#
# POST
# /analytics/student/{student_id}/refresh
#
# Deletes the old snapshot and generates fresh analytics
# for ONLY this student.
#
# =========================================================

@router.post(
    "/student/{student_id}/refresh"
)
def refresh_student_dashboard(
    student_id: str
):
    return AnalyticsService.refresh_student_dashboard(
        student_id
    )


# =========================================================
# DELETE STUDENT ANALYTICS
# =========================================================
#
# DELETE
# /analytics/student/{student_id}
#
# Deletes analytics ONLY for this student.
#
# It does NOT delete:
#
# - Applications
# - Resumes
# - Interviews
# - Jobs
# - Student account
#
# It only deletes the analytics snapshot.
#
# =========================================================

@router.delete(
    "/student/{student_id}"
)
def delete_student_dashboard(
    student_id: str
):
    return AnalyticsService.delete_student_dashboard(
        student_id
    )