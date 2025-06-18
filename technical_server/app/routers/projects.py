from datetime import datetime, time
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..internal.models import Project, ProjectDetail, ProjectIndicatorDetail, Indicator, IndicatorCategory, ProjectValuesResponse, TimeSlot, NumericValueResponse

router = APIRouter(prefix="/projects", tags=["projects"])

# Mocked data based on database dump
MOCK_PROJECTS = [
    Project(
        id=-1867723345,
        name="UGC-Nice",
        enabled=True,
        create_on=datetime(2025, 1, 12, 12, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=-98349789,
        name="UGC-Paris",
        enabled=True,
        create_on=datetime(2024, 10, 9, 9, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=-621102575,
        name="UGC-Bordeaux",
        enabled=False,
        create_on=datetime(2023, 11, 5, 7, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=1235778731,
        name="UGC-Nantes",
        enabled=True,
        create_on=datetime(2025, 4, 20, 10, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=-1657654414,
        name="UGC-Plaisir",
        enabled=True,
        create_on=datetime(2024, 6, 22, 12, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=1255500501,
        name="UGC-Marseille",
        enabled=False,
        create_on=datetime(2024, 3, 5, 6, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    ),
    Project(
        id=-226769007,
        name="UGC-Lyon",
        enabled=True,
        create_on=datetime(2025, 3, 17, 11, 30, 0),
        update_on=datetime(2025, 6, 15, 18, 34, 37)
    )
]

MOCK_INDICATORS = [
    Indicator(
        id=-63195716,
        identifier="frequenting_hourly",
        label="Fréquentation",
        label_short="Freq.",
        timeslots=24,
        position=0
    ),
    Indicator(
        id=-381880644,
        identifier="frequenting",
        label="Fréquentation",
        label_short="Freq.",
        timeslots=48,
        position=0
    ),
    Indicator(
        id=-1497634403,
        identifier="sales_hourly",
        label="Ventes",
        label_short="Ventes",
        timeslots=24,
        position=0
    ),
    Indicator(
        id=1912646392,
        identifier="sales",
        label="Ventes",
        label_short="Ventes",
        timeslots=48,
        position=0
    )
]

MOCK_CATEGORIES = [
    IndicatorCategory(
        id=-866466122,
        indicator=-63195716,
        category=0,
        identifier="freq_restaurant",
        label="restaurant",
        color="#fafa48",
        color_dark="#cfcf00"
    ),
    IndicatorCategory(
        id=-530806305,
        indicator=-63195716,
        category=1,
        identifier="freq_cinema",
        label="cinema",
        color="#ff9100",
        color_dark="#a66511"
    ),
    IndicatorCategory(
        id=-1767294604,
        indicator=-1497634403,
        category=0,
        identifier="sales_food",
        label="Food",
        color="#ff9100",
        color_dark="#a66511"
    ),
    IndicatorCategory(
        id=1131385352,
        indicator=-1497634403,
        category=1,
        identifier="sales_ticket",
        label="Ticket",
        color="#ff9100",
        color_dark="#a66511"
    )
]


@router.get("/", response_model=List[Project])
async def get_projects(
    sort_by: Optional[str] = Query("name", description="Sort by: name, create_on, update_on"),
    order: Optional[str] = Query("asc", description="Order: asc, desc"),
    enabled_only: Optional[bool] = Query(None, description="Filter by enabled status")
):
    """Get list of all projects with optional sorting and filtering"""
    projects = MOCK_PROJECTS.copy()
    
    # Filter by enabled status if specified
    if enabled_only is not None:
        projects = [p for p in projects if p.enabled == enabled_only]
    
    # === ENHANCED SORTING FUNCTIONALITY ===
    # Professional sorting with support for all date fields for better project management
    reverse = order.lower() == "desc"
    if sort_by == "name":
        projects.sort(key=lambda x: x.name.lower(), reverse=reverse)
    elif sort_by == "create_on":
        projects.sort(key=lambda x: x.create_on, reverse=reverse)
    elif sort_by == "update_on":
        projects.sort(key=lambda x: x.update_on, reverse=reverse)
    
    return projects


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: int):
    """Get project details with indicators"""
    project = next((p for p in MOCK_PROJECTS if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get project indicators (simplified mock)
    project_indicators = MOCK_INDICATORS[:2] if project.enabled else []
    
    return ProjectDetail(**project.dict(), indicators=project_indicators)


@router.put("/{project_id}/toggle")
async def toggle_project(project_id: int):
    """Toggle project enabled/disabled status"""
    project = next((p for p in MOCK_PROJECTS if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Toggle enabled status
    project.enabled = not project.enabled
    project.update_on = datetime.now()
    
    return {"message": f"Project {project.name} {'enabled' if project.enabled else 'disabled'}", "enabled": project.enabled}


@router.get("/{project_id}/indicators", response_model=List[ProjectIndicatorDetail])
async def get_project_indicators(project_id: int):
    """Get project indicators with their categories"""
    project = next((p for p in MOCK_PROJECTS if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    result = []
    for indicator in MOCK_INDICATORS:
        categories = [cat for cat in MOCK_CATEGORIES if cat.indicator == indicator.id]
        result.append(ProjectIndicatorDetail(indicator=indicator, categories=categories))
    
    return result


@router.get("/{project_id}/values")
async def get_project_values(
    project_id: int,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    min_value: Optional[float] = Query(None, description="Minimum value filter"),
    max_value: Optional[float] = Query(None, description="Maximum value filter"),
    sort_by: Optional[str] = Query("time", description="Sort by: time, value"),
    order: Optional[str] = Query("asc", description="Order: asc, desc")
):
    """Get project numeric values with filtering and sorting"""
    project = next((p for p in MOCK_PROJECTS if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.enabled:
        raise HTTPException(status_code=403, detail="Project is not active")
    
    # Mock time slots for 24h format
    mock_time_slots = [
        TimeSlot(id=i, begin=time(i, 0), end=time(i+1 if i < 23 else 0, 0), index=i, timeslots=24)
        for i in range(24)
    ]
    
    # Mock numeric values
    mock_values = []
    for i, slot in enumerate(mock_time_slots[:5]):  # Limited sample
        mock_values.append(NumericValueResponse(
            time_begin=slot.begin,
            time_end=slot.end,
            date=datetime(2025, 5, 17, slot.begin.hour, 0),
            values={0: 15 + i * 10, 1: 25 + i * 5}  # Mock category values
        ))
    
    return ProjectValuesResponse(
        project=project,
        indicators=MOCK_INDICATORS[:2],
        time_slots=mock_time_slots,
        values=mock_values
    ) 