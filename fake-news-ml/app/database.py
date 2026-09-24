"""
database.py
-----------
PostgreSQL database connection and execution layer utilizing 100% Raw SQL queries.
No ORM is used.
"""

import os
import psycopg
from psycopg.rows import dict_row

DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
DB_NAME = os.getenv("POSTGRES_DB", "fake_news_db")

def get_connection():
    """Return a new psycopg connection using dict_row factory."""
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME,
        row_factory=dict_row
    )

def init_db():
    """
    Ensure the target database exists, then initialize required tables
    with pure Raw SQL schema DDL.
    """
    # 1. Connect to root 'postgres' db to ensure 'fake_news_db' exists
    try:
        root_conn = psycopg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname="postgres",
            autocommit=True
        )
        with root_conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
            if not cur.fetchone():
                print(f"[*] Database '{DB_NAME}' does not exist. Creating database with Raw SQL...")
                cur.execute(f'CREATE DATABASE "{DB_NAME}";')
                print(f"[+] Database '{DB_NAME}' created successfully!")
        root_conn.close()
    except Exception as e:
        print(f"[!] Root connection notice: {e}")

    # 2. Connect to the application database and create tables with Raw SQL
    conn = get_connection()
    with conn.cursor() as cur:
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(64) UNIQUE NOT NULL,
                email VARCHAR(128) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMPTZ
            );
        """)

        # Create prediction search history table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS prediction_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                headline TEXT,
                content_preview TEXT,
                prediction VARCHAR(20) NOT NULL,
                label INTEGER NOT NULL,
                confidence NUMERIC(5, 2) NOT NULL,
                latency_ms INTEGER,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create indexes
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_history_user_date 
            ON prediction_history(user_id, created_at DESC);
        """)

        conn.commit()

    conn.close()
    print("[+] PostgreSQL Schema initialized successfully with Raw SQL.")

# ==============================================================================
# RAW SQL QUERY OPERATIONS
# ==============================================================================

# --- User & Auth Raw SQL ---

def raw_create_user(username: str, email: str, password_hash: str, role: str = "user"):
    query = """
        INSERT INTO users (username, email, password_hash, role)
        VALUES (%s, %s, %s, %s)
        RETURNING id, username, email, role, created_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (username, email, password_hash, role))
            user = cur.fetchone()
            conn.commit()
            return user

def raw_get_user_by_username(username: str):
    query = """
        SELECT id, username, email, password_hash, role, created_at, last_login
        FROM users
        WHERE LOWER(username) = LOWER(%s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (username,))
            return cur.fetchone()

def raw_get_user_by_email(email: str):
    query = """
        SELECT id, username, email, password_hash, role, created_at, last_login
        FROM users
        WHERE LOWER(email) = LOWER(%s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (email,))
            return cur.fetchone()

def raw_get_user_by_id(user_id: int):
    query = """
        SELECT id, username, email, role, created_at, last_login
        FROM users
        WHERE id = %s;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()

def raw_update_last_login(user_id: int):
    query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            conn.commit()

# --- Prediction Search History Raw SQL ---

def raw_save_history(user_id: int | None, headline: str, content_preview: str,
                     prediction: str, label: int, confidence: float, latency_ms: int):
    query = """
        INSERT INTO prediction_history (
            user_id, headline, content_preview, prediction, label, confidence, latency_ms
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id, headline, content_preview, prediction, label, confidence, latency_ms))
            record = cur.fetchone()
            conn.commit()
            return record

def raw_get_user_history(user_id: int, limit: int = 50, offset: int = 0):
    query = """
        SELECT id, headline, content_preview, prediction, label, confidence, latency_ms, created_at
        FROM prediction_history
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id, limit, offset))
            return cur.fetchall()

def raw_delete_history_item(history_id: int, user_id: int):
    query = "DELETE FROM prediction_history WHERE id = %s AND user_id = %s RETURNING id;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (history_id, user_id))
            deleted = cur.fetchone()
            conn.commit()
            return deleted is not None

def raw_clear_user_history(user_id: int):
    query = "DELETE FROM prediction_history WHERE user_id = %s;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            conn.commit()

# --- Admin Panel Raw SQL Operations ---

def raw_get_admin_stats():
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Total registered users
            cur.execute("SELECT COUNT(*) AS total_users FROM users;")
            users_res = cur.fetchone()

            # Prediction aggregates
            cur.execute("""
                SELECT 
                    COUNT(*) AS total_predictions,
                    COUNT(CASE WHEN label = 0 THEN 1 END) AS real_predictions,
                    COUNT(CASE WHEN label = 1 THEN 1 END) AS fake_predictions,
                    COALESCE(ROUND(AVG(confidence), 2), 0) AS avg_confidence,
                    COALESCE(ROUND(AVG(latency_ms), 1), 0) AS avg_latency
                FROM prediction_history;
            """)
            pred_res = cur.fetchone()

            # Active users today
            cur.execute("""
                SELECT COUNT(DISTINCT user_id) AS active_today 
                FROM prediction_history 
                WHERE created_at >= CURRENT_DATE;
            """)
            active_res = cur.fetchone()

            return {
                "total_users": users_res["total_users"],
                "total_predictions": pred_res["total_predictions"],
                "real_predictions": pred_res["real_predictions"],
                "fake_predictions": pred_res["fake_predictions"],
                "avg_confidence": float(pred_res["avg_confidence"]),
                "avg_latency": float(pred_res["avg_latency"]),
                "active_today": active_res["active_today"]
            }

def raw_get_admin_users():
    query = """
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.role, 
            u.created_at, 
            u.last_login,
            COUNT(h.id) AS prediction_count
        FROM users u
        LEFT JOIN prediction_history h ON u.id = h.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

def raw_get_admin_global_history(limit: int = 100):
    query = """
        SELECT 
            h.id, 
            h.headline, 
            h.content_preview, 
            h.prediction, 
            h.label, 
            h.confidence, 
            h.latency_ms, 
            h.created_at,
            u.username,
            u.email
        FROM prediction_history h
        LEFT JOIN users u ON h.user_id = u.id
        ORDER BY h.created_at DESC
        LIMIT %s;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (limit,))
            return cur.fetchall()

def raw_delete_user_by_admin(user_id: int):
    query = "DELETE FROM users WHERE id = %s AND role != 'admin' RETURNING id;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            res = cur.fetchone()
            conn.commit()
            return res is not None
