from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./career_compass.db"
    jwt_secret: str = "change-this-development-secret"
    access_token_expire_minutes: int = 1440   # 24 h
    refresh_token_expire_days: int = 7
    frontend_origins: str = (
        "http://localhost:4173,http://localhost:5173,http://localhost:8002"
    )

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
