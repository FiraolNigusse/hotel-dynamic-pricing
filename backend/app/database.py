from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Please add DATABASE_URL to .env or your environment."
    )


def _create_postgres_database_if_missing(database_url: str) -> None:
    url = make_url(database_url)
    driver = url.drivername
    if not driver or not driver.startswith("postgres"):
        return

    database_name = url.database
    if not database_name:
        return

    connect_args = url.translate_connect_args()
    connect_args["database"] = "postgres"

    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    except ImportError:
        return

    conn = psycopg2.connect(
        **{
            k: v
            for k, v in connect_args.items()
            if v is not None
            and k in {"database", "user", "password", "host", "port"}
        }
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (database_name,)
        )
        exists = cursor.fetchone() is not None
        if not exists:
            cursor.execute(f"CREATE DATABASE \"{database_name}\"")

    conn.close()


# Database already exists, skipping auto-creation
# _create_postgres_database_if_missing(DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()