from pydantic import BaseModel
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    description: str | None = None

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime