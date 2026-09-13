"""SQLite storage for user progress.

The frontend and original site both address progress by string keys
(e.g. "b01-s1q1" for a quiz answer, "b01-s1" for a produce box,
"idiom:3" for a flashcard status). We mirror that with a single
key/value table so migrating the old localStorage data is trivial.
"""
import os
import sqlite3
import time
from pathlib import Path

# Default to backend/data/progress.db, but allow an override so a Railway
# volume (e.g. DATABASE_PATH=/data/progress.db) survives redeploys.
DB_PATH = Path(
    os.environ.get("DATABASE_PATH")
    or Path(__file__).resolve().parent.parent / "data" / "progress.db"
)


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS progress (
                key        TEXT PRIMARY KEY,
                value      TEXT NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )


def get_all() -> dict[str, str]:
    with get_conn() as conn:
        rows = conn.execute("SELECT key, value FROM progress").fetchall()
    return {r["key"]: r["value"] for r in rows}


def set_value(key: str, value: str) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO progress (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
            """,
            (key, value, time.time()),
        )


def set_many(items: dict[str, str]) -> int:
    now = time.time()
    with get_conn() as conn:
        conn.executemany(
            """
            INSERT INTO progress (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
            """,
            [(k, v, now) for k, v in items.items()],
        )
    return len(items)


def delete(key: str) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM progress WHERE key = ?", (key,))


def delete_prefix(prefix: str) -> int:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM progress WHERE key LIKE ?", (prefix + "%",))
        return cur.rowcount
