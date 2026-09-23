from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    
    ENV: str = "development"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/verifylingua"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Storage settings
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "verifylingua-documents"
    S3_REGION: str = "auto"
    
    # Limits (v1 Scope)
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    MAX_PAGES: int = 100
    MAX_IMAGE_MEGAPIXELS: int = 60
    
    # Provider keys
    GEMINI_API_KEY: Optional[str] = None
    DEEPL_API_KEY: Optional[str] = None

settings = Settings()
