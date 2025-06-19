import subprocess
from pathlib import Path
from fastapi import FastAPI, Depends
from .dependencies import get_query_token
from .routers import projects
from .settings import settings
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(dependencies=[Depends(get_query_token)])

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "entropydb",
    "user": "psql",
    "password": "psql"
}

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DUMP_PATH = Path(__file__).parent / "database" / "db.dump"

app.include_router(projects.router, prefix="/projects", tags=["Projects"])


@app.on_event("startup")
async def init_database():
    try:
        import psycopg
        conn_url = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"

        with psycopg.connect(conn_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) FROM information_schema.tables
                    WHERE table_schema = 'public';
                """)
                count = cur.fetchone()[0]

        if count == 0:
            print("📦 Database is empty. Importing from db.dump using psql...")

            result = subprocess.run(
                [
                    "psql",
                    "-h", DB_CONFIG['host'],
                    "-U", DB_CONFIG['user'],
                    "-d", DB_CONFIG['dbname'],
                    "-f", str(DUMP_PATH)
                ],
                check=True,
                env={**os.environ, "PGPASSWORD": DB_CONFIG["password"]},
                capture_output=True,
                text=True
            )

            print("✅ Dump imported successfully")
        else:
            print("✅ Database already initialized.")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
