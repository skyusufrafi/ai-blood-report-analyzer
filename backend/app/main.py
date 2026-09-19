from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.analysis import router as analysis_router


app = FastAPI(
    title="BloodAI API",
    description="Backend API for AI Blood Report Analyzer",
    version="1.0.0",
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://bloodai-analyzer.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(
    upload_router,
    prefix="/api",
)

app.include_router(
    analysis_router,
    prefix="/api",
)


@app.get("/")
def root():
    return {
        "message": "BloodAI API is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BloodAI Backend",
    }