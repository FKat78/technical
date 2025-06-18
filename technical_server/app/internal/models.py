from datetime import datetime, time
from typing import Optional, List
from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    enabled: bool


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    create_on: datetime
    update_on: datetime

    class Config:
        from_attributes = True


class IndicatorBase(BaseModel):
    identifier: str
    label: str
    label_short: str
    timeslots: int
    position: int = 0
    asset: Optional[str] = None


class Indicator(IndicatorBase):
    id: int

    class Config:
        from_attributes = True


class IndicatorCategoryBase(BaseModel):
    indicator: int
    category: int
    identifier: str
    label: str
    asset_type: Optional[str] = None
    asset_value: Optional[str] = None
    color: str
    color_dark: str


class IndicatorCategory(IndicatorCategoryBase):
    id: int

    class Config:
        from_attributes = True


class TimeSlotBase(BaseModel):
    begin: time
    end: time
    index: int
    timeslots: int


class TimeSlot(TimeSlotBase):
    id: int

    class Config:
        from_attributes = True


class NumericValueBase(BaseModel):
    variable: int
    category: int
    time: int
    date: datetime
    value: float


class NumericValue(NumericValueBase):
    class Config:
        from_attributes = True


class VariableBase(BaseModel):
    project: int
    indicator: int


class Variable(VariableBase):
    id: int

    class Config:
        from_attributes = True


# Response models
class ProjectDetail(Project):
    indicators: List[Indicator] = []


class ProjectIndicatorDetail(BaseModel):
    indicator: Indicator
    categories: List[IndicatorCategory]


class NumericValueResponse(BaseModel):
    time_begin: time
    time_end: time
    date: datetime
    values: dict  # category_id -> value


class ProjectValuesResponse(BaseModel):
    project: Project
    indicators: List[Indicator]
    time_slots: List[TimeSlot]
    values: List[NumericValueResponse] 