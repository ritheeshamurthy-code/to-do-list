
import os
import sqlite3
from pathlib import Path

DATABASE_PATH = os.getenv(
    "TODO_DB_PATH",
    str(Path(__file__).resolve().parent.parent / "todos.db")
)


def get_connection():
    """Create a connection to the SQLite database."""
    db_path = Path(DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the task table if it does not exist."""
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS task (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0
            )
        """)
        connection.commit()
