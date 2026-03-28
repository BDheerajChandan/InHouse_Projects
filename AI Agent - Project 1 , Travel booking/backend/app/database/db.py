# database/db.py
"""
database/db.py
==============
PostgreSQL connection manager + dynamic schema bootstrap.

PostgreSQL casing rule:
  Unquoted identifiers are ALWAYS lowercased by PostgreSQL.
  We store all names lowercase in settings (config.py) and pass
  them through psycopg2.sql.Identifier() which adds double-quotes,
  preserving the exact case we give it.

  Since config.py lowercases everything, the result is:
    settings.TABLE_NAME  = "travel_history"
    settings.DB_NAME     = "booking"
    SQL uses "travel_history" (quoted) → matches exactly

Startup sequence:
  1. Connect to postgres maintenance DB
  2. CREATE DATABASE settings.DB_NAME  (e.g. "booking")
  3. CREATE TABLE IF NOT EXISTS for each vehicle  (train/bus/flight/car/bike)
  4. CREATE TABLE IF NOT EXISTS for combined history (e.g. "travel_history")
"""
from __future__ import annotations

import psycopg2
import psycopg2.extras
from psycopg2 import sql as pgsql

from app.core.config import settings

# ── Shared column DDL ─────────────────────────────────────────────
_COLS = """
    id          SERIAL       PRIMARY KEY,
    vehicle     VARCHAR(20)  NOT NULL,
    from_loc    TEXT         NOT NULL,
    to_loc      TEXT         NOT NULL,
    travel_date DATE,
    booked_at   TIMESTAMP    DEFAULT NOW(),
    status      VARCHAR(20)  DEFAULT 'confirmed'
"""


# ─────────────────────────────────────────────────────────────────
#  Connection helpers
# ─────────────────────────────────────────────────────────────────

def _raw_connect(dbname: str) -> psycopg2.extensions.connection:
    """Open a plain psycopg2 connection (no RealDictCursor)."""
    print(f"[DB] 🔌 Connecting → {settings.DB_USER}@{settings.DB_HOST}:{settings.DB_PORT}/{dbname}")
    conn = psycopg2.connect(
        dbname=dbname,
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
    )
    print(f"[DB] ✅ Connected to '{dbname}'")
    return conn


def get_connection() -> psycopg2.extensions.connection:
    """
    Open a RealDictCursor connection to the application database.
    Uses settings.DB_NAME which is already lowercase from config.py.
    """
    print(f"[DB] 🔗 get_connection → db='{settings.DB_NAME}'")
    return psycopg2.connect(
        dbname=settings.DB_NAME,           # already lowercase
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        cursor_factory=psycopg2.extras.RealDictCursor,
    )


# ─────────────────────────────────────────────────────────────────
#  Bootstrap
# ─────────────────────────────────────────────────────────────────

def _ensure_database() -> None:
    """Create the database if it does not exist."""
    target = settings.DB_NAME   # already lowercase
    print(f"[DB] 🔍 Checking database '{target}' ...")

    conn = _raw_connect("postgres")
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target,))
            if cur.fetchone():
                print(f"[DB] ✔  Database '{target}' already exists")
            else:
                print(f"[DB] 🛠️  Creating database '{target}' ...")
                cur.execute(
                    pgsql.SQL("CREATE DATABASE {}").format(pgsql.Identifier(target))
                )
                print(f"[DB] ✅ Database '{target}' created!")
    finally:
        conn.close()


def _ensure_table(cur: psycopg2.extensions.cursor, table_name: str) -> None:
    """
    CREATE TABLE IF NOT EXISTS.
    table_name must already be lowercase (enforced by config.py).
    Uses pgsql.Identifier() which quotes the name → case-safe.
    """
    print(f"[DB] 🛠️  Ensuring table '{table_name}' ...")
    ddl = pgsql.SQL(
        "CREATE TABLE IF NOT EXISTS {} ({});"
    ).format(pgsql.Identifier(table_name), pgsql.SQL(_COLS))
    cur.execute(ddl)
    print(f"[DB] ✔  Table '{table_name}' ready")


def init_db() -> None:
    """Full startup: ensure DB exists, create all tables."""
    print(f"\n[DB] {'='*55}")
    print(f"[DB] 🚀 Initialising database ...")
    settings.print_summary()
    print(f"[DB] {'='*55}")

    _ensure_database()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            for tbl in settings.VEHICLE_TABLES:
                _ensure_table(cur, tbl)
            _ensure_table(cur, settings.TABLE_NAME)
        conn.commit()
        print(f"[DB] ✅ All tables ready in '{settings.DB_NAME}'")
    except Exception as exc:
        conn.rollback()
        print(f"[DB] ❌ Init error: {exc}")
        raise
    finally:
        conn.close()
    print(f"[DB] {'='*55}\n")


# ─────────────────────────────────────────────────────────────────
#  Query helpers
# ─────────────────────────────────────────────────────────────────

def execute_query(sql_str: str, params: tuple = ()) -> list[dict]:
    """
    Run a SELECT and return list[dict].
    Note: table names in sql_str must be lowercase (match DB).
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            print(f"[DB] 🔍 QUERY  | {sql_str.strip()[:120]} | {params}")
            cur.execute(sql_str, params)
            rows = [dict(r) for r in cur.fetchall()]
            print(f"[DB] ✅ QUERY  | {len(rows)} row(s) returned")
            return rows
    except Exception as exc:
        print(f"[DB] ❌ QUERY error: {exc}")
        raise
    finally:
        conn.close()


def execute_write(sql_str: str, params: tuple = ()) -> int:
    """
    Run INSERT / UPDATE / DELETE.
    Returns RETURNING id for INSERT, rowcount otherwise.
    Note: table names in sql_str must be lowercase (match DB).
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            op = sql_str.strip().split()[0].upper()
            print(f"[DB] ✍️  {op} | {sql_str.strip()[:120]} | {params}")
            cur.execute(sql_str, params)
            conn.commit()
            try:
                row = cur.fetchone()
                if row:
                    rid = row["id"]
                    print(f"[DB] ✅ {op} → id={rid}")
                    return rid
            except Exception:
                pass
            rc = cur.rowcount
            print(f"[DB] ✅ {op} → rowcount={rc}")
            return rc
    except Exception as exc:
        conn.rollback()
        print(f"[DB] ❌ WRITE error: {exc}")
        raise
    finally:
        conn.close()