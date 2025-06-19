import psycopg
from app.settings import settings


def get_all_projects():
    conn_url = (
        f"postgresql://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )

    with psycopg.connect(conn_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM projects;")
            rows = cur.fetchall()
            return [{"id": row[0], "name": row[1]} for row in rows]
