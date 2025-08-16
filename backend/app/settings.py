from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Fixed Income MVP API"
    API_PREFIX: str = "/api"
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "https://fixed-income-mvp.netlify.app"]
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./fixed_income.db"
    
    class Config:
        env_file = ".env"

settings = Settings()