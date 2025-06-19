from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TechnicalServer"
    admin_email: str = "none@entropy.sc"

    debug: bool = True
    host: str = "localhost"
    port: int = 18080
    workers: int = 1
    prefix: str = "/api"
    public_address: str = "http://localhost:5173/"
    response_timeout: int = 300

    cors_allow_origins: str = "*"
    cors_allow_origin_regex: str = "*"
    cors_allow_methods: str = "*"
    cors_allow_headers: str = "*"
    cors_allow_credentials: bool = False

    db_user: str = "psql"
    db_password: str = "psql"
    db_host: str = "localhost"
    db_port: str = "5432"
    db_name: str = "entropydb"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
