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
    
    # Models (configurable, never hard-coded)
    GEMINI_FAST_MODEL: str = "gemini-2.5-flash"
    GEMINI_STRONG_MODEL: str = "gemini-1.5-pro"
    DEEPL_API_URL: str = "https://api-free.deepl.com/v2/translate"
    
    # Rate Limits & Circuit Breaker
    RATE_LIMIT_RPS_GEMINI: int = 15
    RATE_LIMIT_RPS_DEEPL: int = 10
    RATE_LIMIT_TPM_GEMINI: int = 1_000_000
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 3
    CIRCUIT_BREAKER_RESET_TIMEOUT_SEC: float = 30.0
    BATCH_SIZE_MIN: int = 20
    BATCH_SIZE_MAX: int = 60

settings = Settings()
