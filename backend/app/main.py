from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncpg # PostgreSQL 연결용

# DB 연결 정보 (환경 변수 사용 권장)
DATABASE_URL = "postgresql://postgres:BraXcuxN1y8m2qzD@db.amhlzjkkwcuczowsgkoy.supabase.co:5432/postgres"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 DB 연결 풀 생성
    app.state.pool = await asyncpg.create_pool(DATABASE_URL)
    print("Database connection pool created.")
    yield
    # 서버 종료 시 DB 연결 풀 해제
    await app.state.pool.close()
    print("Database connection pool closed.")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "ScriptVault API is running"}

# TODO: 씬 비교, 버전 생성 등 API 라우터 연결
# from app.api import versions, scenes
# app.include_router(versions.router)
# app.include_router(scenes.router)