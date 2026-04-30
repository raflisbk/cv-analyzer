from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable configuration"""

    # App config
    CV_ANALYZER_APP_NAME: str = "CV Analyzer API"
    CV_ANALYZER_VERSION: str = "0.1.0"
    CV_ANALYZER_ENV: str = "development"  # development | production

    # Database
    CV_ANALYZER_DB_HOST: str = "localhost"
    CV_ANALYZER_DB_PORT: int = 5432
    CV_ANALYZER_DB_NAME: str = "cv_analyzer"
    CV_ANALYZER_DB_USER: str = "postgres"
    CV_ANALYZER_DB_PASSWORD: str = ""

    # Redis
    CV_ANALYZER_REDIS_URL: str = "redis://localhost:6379/0"

    # Cloudflare R2 (placeholder, configured in later plan)
    CV_ANALYZER_R2_ENDPOINT: str = ""
    CV_ANALYZER_R2_ACCESS_KEY: str = ""
    CV_ANALYZER_R2_SECRET_KEY: str = ""
    CV_ANALYZER_R2_BUCKET: str = "cv-uploads"

    # Security
    CV_ANALYZER_MAX_FILE_SIZE: int = 5 * 1024 * 1024
    CV_ANALYZER_UPLOAD_RATE_LIMIT: str = "5/hour"

    # Hugging Face Inference API (primary provider for LLM + embeddings)
    CV_ANALYZER_HF_API_KEY: str = ""

    # Analysis pipeline rate limit
    CV_ANALYZER_ANALYSIS_RATE_LIMIT: str = "5/hour"

    # LLM + RAG settings
    CV_ANALYZER_LLM_MODEL: str = "Qwen/Qwen2-7B-Instruct"
    CV_ANALYZER_LLM_MAX_TOKENS: int = 1500
    CV_ANALYZER_LLM_CACHE_TTL: int = 86400  # 24h in seconds (D-14)
    CV_ANALYZER_RAG_TOP_K: int = 5  # Top-K retrieval (D-13)
    CV_ANALYZER_RAG_EMBEDDING_MODEL: str = "BAAI/bge-m3"  # HF embeddings

    # CORS
    CV_ANALYZER_CORS_ORIGINS: str = "*"  # CSV string, "*" for dev (D-50)

    # Sentry
    CV_ANALYZER_SENTRY_DSN: str = ""

    # Logging
    CV_ANALYZER_LOG_LEVEL: str = "INFO"  # DEBUG | INFO | WARNING | ERROR | CRITICAL

    @property
    def database_url(self) -> str:
        """Construct async PostgreSQL database URL"""
        return f"postgresql+psycopg://{self.CV_ANALYZER_DB_USER}:{self.CV_ANALYZER_DB_PASSWORD}@{self.CV_ANALYZER_DB_HOST}:{self.CV_ANALYZER_DB_PORT}/{self.CV_ANALYZER_DB_NAME}"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
