from fastapi import APIRouter, HTTPException
from app.services.project_service import get_all_projects

router = APIRouter()


@router.get("/all", summary="Get all projects")
def list_projects():
    try:
        return get_all_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
