import csv
import json
from datetime import datetime, time
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from io import StringIO, BytesIO
from .projects import MOCK_PROJECTS

router = APIRouter(prefix="/export", tags=["export"])


def generate_mock_data(project_id: int, aggregate_hours: int = 1):
    """Generate mock aggregated data for export"""
    project = next((p for p in MOCK_PROJECTS if p.id == project_id), None)
    if not project or not project.enabled:
        return None
    
    # Generate time slots based on aggregation
    hours_in_day = 24
    num_slots = hours_in_day // aggregate_hours
    
    data = []
    for i in range(num_slots):
        start_hour = i * aggregate_hours
        end_hour = (i + 1) * aggregate_hours if (i + 1) * aggregate_hours < 24 else 0
        
        # Mock aggregated values
        restaurant_value = sum([15 + j * 2 for j in range(aggregate_hours)])
        cinema_value = sum([25 + j * 3 for j in range(aggregate_hours)])
        food_value = sum([50 + j * 5 for j in range(aggregate_hours)])
        ticket_value = sum([100 + j * 10 for j in range(aggregate_hours)])
        
        data.append({
            "temps_debut": f"{start_hour:02d}:00:00",
            "temps_fin": f"{end_hour:02d}:00:00" if end_hour != 0 else "00:00:00",
            "frequentation_restaurant": restaurant_value,
            "frequentation_cinema": cinema_value,
            "ventes_food": food_value,
            "ventes_ticket": ticket_value
        })
    
    return data


@router.get("/{project_id}/csv")
async def export_csv(
    project_id: int,
    aggregate_hours: Optional[int] = Query(1, description="Aggregation period in hours (1, 3, 6, 12)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Export project data as CSV with optional time aggregation"""
    
    # Validate aggregation period
    if aggregate_hours not in [1, 3, 6, 12]:
        raise HTTPException(status_code=400, detail="Aggregation period must be 1, 3, 6, or 12 hours")
    
    if 24 % aggregate_hours != 0:
        raise HTTPException(status_code=400, detail="Aggregation period must be a divisor of 24")
    
    # Generate data
    data = generate_mock_data(project_id, aggregate_hours)
    if data is None:
        raise HTTPException(status_code=404, detail="Project not found or inactive")
    
    # Create CSV
    output = StringIO()
    if data:
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    
    # Create response
    csv_content = output.getvalue()
    output.close()
    
    project = next(p for p in MOCK_PROJECTS if p.id == project_id)
    filename = f"{project.name.replace('-', '_')}_data_{aggregate_hours}h_aggregation.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{project_id}/json")
async def export_json(
    project_id: int,
    aggregate_hours: Optional[int] = Query(1, description="Aggregation period in hours (1, 3, 6, 12)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Export project data as JSON with optional time aggregation"""
    
    # Validate aggregation period
    if aggregate_hours not in [1, 3, 6, 12]:
        raise HTTPException(status_code=400, detail="Aggregation period must be 1, 3, 6, or 12 hours")
    
    if 24 % aggregate_hours != 0:
        raise HTTPException(status_code=400, detail="Aggregation period must be a divisor of 24")
    
    # Generate data
    data = generate_mock_data(project_id, aggregate_hours)
    if data is None:
        raise HTTPException(status_code=404, detail="Project not found or inactive")
    
    project = next(p for p in MOCK_PROJECTS if p.id == project_id)
    
    export_data = {
        "project": {
            "id": project.id,
            "name": project.name,
            "export_date": datetime.now().isoformat(),
            "aggregation_hours": aggregate_hours,
            "period_filters": {
                "start_date": start_date,
                "end_date": end_date
            }
        },
        "data": data,
        "metadata": {
            "total_records": len(data),
            "time_slots": len(data),
            "indicators": ["frequentation_restaurant", "frequentation_cinema", "ventes_food", "ventes_ticket"]
        }
    }
    
    filename = f"{project.name.replace('-', '_')}_data_{aggregate_hours}h_aggregation.json"
    
    return Response(
        content=json.dumps(export_data, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    ) 