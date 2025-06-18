from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import projects, export
from .settings import settings

app = FastAPI(
    title="Technical Server",
    description="API for technical test - Cinema project management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins.split(","),
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods.split(","),
    allow_headers=settings.cors_allow_headers.split(","),
)

# Include routers
app.include_router(projects.router, prefix=settings.prefix)
app.include_router(export.router, prefix=settings.prefix)

@app.get("/")
async def root():
    return {
        "message": "Technical Server API", 
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "projects": f"{settings.prefix}/projects",
            "export": f"{settings.prefix}/export",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "technical-server"}
