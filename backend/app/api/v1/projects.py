from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectOut)
async def create_project(payload: ProjectCreate, session: AsyncSession = Depends(get_session)):
    obj = Project(title=payload.title, description=payload.description)
    session.add(obj)
    await session.commit()
    await session.refresh(obj)
    return obj

@router.get("", response_model=list[ProjectOut])
async def list_projects(session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Project).order_by(Project.id.desc()))
    return [r for r, in res.all()]