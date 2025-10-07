from dotenv import load_dotenv
from pydantic import BaseModel
import os

class Settings(BaseModel):
    load_dotenv()
    
    database_uri: str = os.getenv("DATABASE_URI")
    database_uri_sync: str = os.getenv("DATABASE_URI_SYNC")
    env: str = os.getenv("ENV", "local")

settings = Settings()