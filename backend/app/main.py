from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.db import client

# Routers
from app.routers.user_router import router as user_router
from app.routers.resume_router import router as resume_router
from app.routers.organization_router import router as organization_router
from app.routers.job_router import router as job_router
from app.routers.application_router import router as application_router
from app.routers.jd_matching_router import router as jd_matching_router
from app.routers.interview_router import router as interview_router
from app.routers.monitoring_router import router as monitoring_router
from app.routers.ranking_router import router as ranking_router
from app.routers.analytics_router import router as analytics_router
from app.routers.auth_router import router as auth_router
from app.routers.recommendation_router import router as recommendation_router
from app.routers.cv_routes import router as cv_router
app = FastAPI(
    title="Recruit AI API",
    version="1.0.0"
)


# ==============================
# CORS Configuration
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# Startup Event
# ==============================

@app.on_event("startup")
async def startup():
    try:
        client.admin.command("ping")
        print("✅ MongoDB Connected Successfully!")
    except Exception as e:
        print("❌ MongoDB Connection Failed!")
        print(e)


# ==============================
# Include Routers
# ==============================

app.include_router(user_router, prefix="/api")

app.include_router(resume_router, prefix="/api")

app.include_router(organization_router, prefix="/api")

app.include_router(job_router, prefix="/api")

app.include_router(application_router, prefix="/api")

app.include_router(jd_matching_router, prefix="/api")

app.include_router(interview_router, prefix="/api")

app.include_router(monitoring_router, prefix="/api")

app.include_router(ranking_router, prefix="/api")

app.include_router(analytics_router, prefix="/api")
app.include_router(
    recommendation_router,
    prefix="/api"
)
app.include_router(auth_router, prefix="/api")
app.include_router(
    cv_router,
    prefix="/api"
)


# ==============================
# Root Endpoint
# ==============================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Recruit AI Backend Running Successfully!"
    }


# ==============================
# Health Check
# ==============================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }