"""
database.py
-----------
PostgreSQL database connection and execution layer utilizing 100% Raw SQL queries.
No ORM is used.
"""

import os
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
DB_NAME = os.getenv("POSTGRES_DB", "fake_news_db")

def get_connection():
    """Return a new psycopg connection using dict_row factory."""
    if DATABASE_URL:
        return psycopg.connect(DATABASE_URL, row_factory=dict_row)
    else:
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
    # 1. Connect to root 'postgres' db to ensure 'fake_news_db' exists (if not using DATABASE_URL)
    if not DATABASE_URL:
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

        # Add subscription fields to users table (migration safe)
        cur.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
        """)

        # Create blog_posts table with Raw SQL
        cur.execute("""
            CREATE TABLE IF NOT EXISTS blog_posts (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(512) NOT NULL,
                excerpt TEXT NOT NULL,
                category VARCHAR(64) NOT NULL DEFAULT 'AI Research',
                author_name VARCHAR(128) NOT NULL DEFAULT 'Veritas Research Team',
                author_role VARCHAR(128) NOT NULL DEFAULT 'Lead Researcher',
                author_avatar TEXT NOT NULL DEFAULT '',
                date VARCHAR(64) NOT NULL DEFAULT '',
                read_time VARCHAR(64) NOT NULL DEFAULT '5 min read',
                tags TEXT NOT NULL DEFAULT '',
                featured BOOLEAN NOT NULL DEFAULT FALSE,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
            CREATE INDEX IF NOT EXISTS idx_blog_created ON blog_posts(created_at DESC);
        """)

        # Create payments table with Raw SQL
        cur.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                plan_id VARCHAR(50) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'usd',
                status VARCHAR(50) NOT NULL DEFAULT 'completed',
                payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
                stripe_session_id VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_payments_user_date ON payments(user_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
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
        RETURNING id, username, email, role, subscription_tier, created_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (username, email, password_hash, role))
            user = cur.fetchone()
            conn.commit()
            return user

def raw_get_user_by_username(username: str):
    query = """
        SELECT id, username, email, password_hash, role, subscription_tier, stripe_customer_id, created_at, last_login
        FROM users
        WHERE LOWER(username) = LOWER(%s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (username,))
            return cur.fetchone()

def raw_get_user_by_email(email: str):
    query = """
        SELECT id, username, email, password_hash, role, subscription_tier, stripe_customer_id, created_at, last_login
        FROM users
        WHERE LOWER(email) = LOWER(%s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (email,))
            return cur.fetchone()

def raw_get_user_by_id(user_id: int):
    query = """
        SELECT id, username, email, role, subscription_tier, stripe_customer_id, subscription_status, subscription_start_date, subscription_end_date, created_at, last_login
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

def raw_get_user_today_prediction_count(user_id: int) -> int:
    """Return count of predictions performed by the user today (since 00:00 UTC)."""
    query = """
        SELECT COUNT(*) AS today_count
        FROM prediction_history
        WHERE user_id = %s AND created_at >= CURRENT_DATE;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return int(row["today_count"]) if row and row["today_count"] else 0

def raw_update_user_subscription(
    user_id: int,
    tier: str,
    stripe_customer_id: str = None,
    stripe_subscription_id: str = None,
    billing_cycle: str = "monthly"
):
    """Upgrade or modify a user's subscription tier with cycle-accurate expiration."""
    is_annual = billing_cycle and billing_cycle.lower() in ["annual", "yearly"]
    interval_sql = "INTERVAL '365 days'" if is_annual else "INTERVAL '30 days'"

    query = f"""
        UPDATE users
        SET subscription_tier = %s,
            stripe_customer_id = COALESCE(%s, stripe_customer_id),
            stripe_subscription_id = COALESCE(%s, stripe_subscription_id),
            subscription_status = 'active',
            subscription_start_date = CURRENT_TIMESTAMP,
            subscription_end_date = CURRENT_TIMESTAMP + {interval_sql}
        WHERE id = %s
        RETURNING id, username, email, role, subscription_tier, subscription_start_date, subscription_end_date;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (tier, stripe_customer_id, stripe_subscription_id, user_id))
            updated = cur.fetchone()
            conn.commit()
            return updated

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

def raw_get_user_history(user_id: int, search: str = None, verdict: str = None, limit: int = 50, offset: int = 0):
    conditions = ["user_id = %s"]
    params = [user_id]

    if search and search.strip():
        conditions.append("(LOWER(headline) LIKE %s OR LOWER(content_preview) LIKE %s)")
        term = f"%{search.strip().lower()}%"
        params.extend([term, term])

    if verdict and verdict.strip() and verdict.lower() != "all":
        conditions.append("LOWER(prediction) = %s")
        params.append(verdict.strip().lower())

    where_clause = " AND ".join(conditions)
    query = f"""
        SELECT id, headline, content_preview, prediction, label, confidence, latency_ms, created_at
        FROM prediction_history
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    params.extend([limit, offset])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
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

            # Revenue & Tiers
            cur.execute("""
                SELECT 
                    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) AS pro_users,
                    COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) AS enterprise_users
                FROM users;
            """)
            tier_res = cur.fetchone()
            pro_users = tier_res["pro_users"]
            enterprise_users = tier_res["enterprise_users"]
            estimated_mrr = (pro_users * 9.99) + (enterprise_users * 49.99)

            # Actual payments total revenue
            cur.execute("""
                SELECT 
                    COUNT(*) AS total_payments,
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS total_revenue
                FROM payments;
            """)
            pay_res = cur.fetchone() or {"total_payments": 0, "total_revenue": 0}

            return {
                "total_users": users_res["total_users"],
                "total_predictions": pred_res["total_predictions"],
                "real_predictions": pred_res["real_predictions"],
                "fake_predictions": pred_res["fake_predictions"],
                "avg_confidence": float(pred_res["avg_confidence"]),
                "avg_latency": float(pred_res["avg_latency"]),
                "active_today": active_res["active_today"],
                "pro_users": pro_users,
                "enterprise_users": enterprise_users,
                "estimated_mrr": float(estimated_mrr),
                "total_revenue": float(pay_res["total_revenue"]),
                "total_payments": int(pay_res["total_payments"])
            }

def raw_get_admin_users(search: str = None, role: str = None, tier: str = None):
    conditions = []
    params = []

    if search and search.strip():
        conditions.append("(LOWER(u.username) LIKE %s OR LOWER(u.email) LIKE %s)")
        term = f"%{search.strip().lower()}%"
        params.extend([term, term])

    if role and role.strip() and role.lower() != "all":
        conditions.append("u.role = %s")
        params.append(role.strip().lower())

    if tier and tier.strip() and tier.lower() != "all":
        conditions.append("u.subscription_tier = %s")
        params.append(tier.strip().lower())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.role, 
            u.subscription_tier, 
            u.created_at, 
            u.last_login,
            COUNT(h.id) AS prediction_count
        FROM users u
        LEFT JOIN prediction_history h ON u.id = h.user_id
        {where_clause}
        GROUP BY u.id
        ORDER BY u.created_at DESC;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            return cur.fetchall()

def raw_get_admin_global_history(search: str = None, verdict: str = None, limit: int = 100, offset: int = 0):
    conditions = []
    params = []

    if search and search.strip():
        conditions.append("(LOWER(h.headline) LIKE %s OR LOWER(u.username) LIKE %s OR LOWER(u.email) LIKE %s)")
        term = f"%{search.strip().lower()}%"
        params.extend([term, term, term])

    if verdict and verdict.strip() and verdict.lower() != "all":
        conditions.append("LOWER(h.prediction) = %s")
        params.append(verdict.strip().lower())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
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
        {where_clause}
        ORDER BY h.created_at DESC
        LIMIT %s OFFSET %s;
    """
    params.extend([limit, offset])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            return cur.fetchall()

def raw_delete_user_by_admin(user_id: int):
    query = "DELETE FROM users WHERE id = %s AND role != 'admin' RETURNING id;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            res = cur.fetchone()
            conn.commit()
            return res is not None

# ==============================================================================
# PAYMENTS RAW SQL CRUD OPERATIONS
# ==============================================================================

def raw_record_payment(
    user_id: int | None,
    plan_id: str,
    amount: float,
    currency: str = "usd",
    status: str = "completed",
    payment_method: str = "card",
    stripe_session_id: str = None
):
    """Insert a new payment transaction record with Raw SQL."""
    query = """
        INSERT INTO payments (
            user_id, plan_id, amount, currency, status, payment_method, stripe_session_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, user_id, plan_id, amount, currency, status, payment_method, stripe_session_id, created_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id, plan_id, amount, currency, status, payment_method, stripe_session_id))
            rec = cur.fetchone()
            conn.commit()
            return rec

def raw_get_admin_payments(
    search: str = None,
    status_filter: str = None,
    plan_filter: str = None,
    limit: int = 100,
    offset: int = 0
):
    """Retrieve payments list with Raw SQL joined with users and filtered."""
    conditions = []
    params = []

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        conditions.append("(LOWER(COALESCE(u.username, '')) LIKE %s OR LOWER(COALESCE(u.email, '')) LIKE %s OR LOWER(COALESCE(p.stripe_session_id, '')) LIKE %s)")
        params.extend([term, term, term])

    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        conditions.append("LOWER(p.status) = %s")
        params.append(status_filter.strip().lower())

    if plan_filter and plan_filter.strip() and plan_filter.lower() != "all":
        conditions.append("LOWER(p.plan_id) = %s")
        params.append(plan_filter.strip().lower())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
        SELECT 
            p.id,
            p.user_id,
            u.username,
            u.email,
            p.plan_id,
            p.amount,
            p.currency,
            p.status,
            p.payment_method,
            p.stripe_session_id,
            p.created_at
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id
        {where_clause}
        ORDER BY p.created_at DESC
        LIMIT %s OFFSET %s;
    """
    params.extend([limit, offset])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            return cur.fetchall()

def raw_get_admin_payment_stats():
    """Aggregate total revenue, transaction counts, and averages via Raw SQL."""
    query = """
        SELECT
            COUNT(*) AS total_transactions,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS total_revenue,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS successful_count,
            COUNT(CASE WHEN status = 'refunded' THEN 1 END) AS refunded_count,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
            COALESCE(ROUND(AVG(CASE WHEN status = 'completed' THEN amount END), 2), 0) AS avg_transaction_value
        FROM payments;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            res = cur.fetchone() or {}
            return {
                "total_transactions": res.get("total_transactions", 0),
                "total_revenue": float(res.get("total_revenue", 0.0)),
                "successful_count": res.get("successful_count", 0),
                "refunded_count": res.get("refunded_count", 0),
                "pending_count": res.get("pending_count", 0),
                "avg_transaction_value": float(res.get("avg_transaction_value", 0.0))
            }

# ==============================================================================
# BLOG RAW SQL CRUD OPERATIONS
# ==============================================================================

def raw_get_all_blogs(search: str = None, category: str = None):
    where_clauses = []
    params = []
    if search:
        where_clauses.append("(title ILIKE %s OR excerpt ILIKE %s OR tags ILIKE %s)")
        like_term = f"%{search}%"
        params.extend([like_term, like_term, like_term])
    if category and category != "All":
        where_clauses.append("category = %s")
        params.append(category)

    where_str = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    query = f"""
        SELECT id, slug, title, excerpt, category, author_name, author_role, author_avatar,
               date, read_time, tags, featured, content, created_at, updated_at
        FROM blog_posts
        {where_str}
        ORDER BY featured DESC, created_at DESC;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            return cur.fetchall()

def raw_get_blog_by_slug(slug: str):
    query = """
        SELECT id, slug, title, excerpt, category, author_name, author_role, author_avatar,
               date, read_time, tags, featured, content, created_at, updated_at
        FROM blog_posts
        WHERE slug = %s;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (slug,))
            return cur.fetchone()

def raw_get_blog_by_id(blog_id: int):
    query = """
        SELECT id, slug, title, excerpt, category, author_name, author_role, author_avatar,
               date, read_time, tags, featured, content, created_at, updated_at
        FROM blog_posts
        WHERE id = %s;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (blog_id,))
            return cur.fetchone()

def raw_create_blog(
    slug: str,
    title: str,
    excerpt: str,
    content: str,
    category: str = "AI Research",
    author_name: str = "Veritas Research Team",
    author_role: str = "Lead Researcher",
    author_avatar: str = "",
    date: str = "",
    read_time: str = "5 min read",
    tags: str = "",
    featured: bool = False
):
    query = """
        INSERT INTO blog_posts (
            slug, title, excerpt, content, category, author_name, author_role,
            author_avatar, date, read_time, tags, featured
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, slug, title, excerpt, category, author_name, author_role, author_avatar,
                  date, read_time, tags, featured, content, created_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                slug, title, excerpt, content, category, author_name, author_role,
                author_avatar, date, read_time, tags, featured
            ))
            blog = cur.fetchone()
            conn.commit()
            return blog

def raw_update_blog(
    blog_id: int,
    slug: str,
    title: str,
    excerpt: str,
    content: str,
    category: str = "AI Research",
    author_name: str = "Veritas Research Team",
    author_role: str = "Lead Researcher",
    author_avatar: str = "",
    date: str = "",
    read_time: str = "5 min read",
    tags: str = "",
    featured: bool = False
):
    query = """
        UPDATE blog_posts
        SET slug = %s, title = %s, excerpt = %s, content = %s, category = %s,
            author_name = %s, author_role = %s, author_avatar = %s, date = %s,
            read_time = %s, tags = %s, featured = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id, slug, title, excerpt, category, author_name, author_role, author_avatar,
                  date, read_time, tags, featured, content, created_at, updated_at;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                slug, title, excerpt, content, category, author_name, author_role,
                author_avatar, date, read_time, tags, featured, blog_id
            ))
            blog = cur.fetchone()
            conn.commit()
            return blog

def raw_delete_blog(blog_id: int) -> bool:
    query = "DELETE FROM blog_posts WHERE id = %s RETURNING id;"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (blog_id,))
            res = cur.fetchone()
            conn.commit()
            return res is not None

def seed_default_blogs():
    """Seed initial authoritative blog posts if table is empty."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as cnt FROM blog_posts;")
            row = cur.fetchone()
            if row and row["cnt"] > 0:
                return

    print("[*] Seeding default research blog posts into PostgreSQL...")
    initial_posts = [
        {
            "slug": "reverse-engineering-clickbait-passive-aggressive-nlp",
            "title": "Reverse-Engineering Clickbait: How PassiveAggressive NLP Dissects Synthetic Headlines in 40ms",
            "excerpt": "An empirical deep dive into why classical margin-based classifiers combined with N-gram TF-IDF vectorizers outperform multi-billion parameter LLMs in high-throughput newsrooms.",
            "category": "AI Research",
            "author_name": "Dr. Elena Rostova",
            "author_role": "Lead NLP Research Scientist",
            "author_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "date": "September 22, 2026",
            "read_time": "7 min read",
            "tags": "NLP,Machine Learning,PassiveAggressive,TF-IDF",
            "featured": True,
            "content": "## The Latency Paradox in Real-Time Verification\n\nIn fast-paced editorial rooms and automated content moderation pipelines, decision latency is paramount. While Large Language Models (LLMs) such as GPT-4 and Claude offer remarkable reasoning depth, their inference latencies typically oscillate between 800ms and 3,500ms.\n\nOur research benchmark shows that PassiveAggressive Classifiers paired with lemmatized TF-IDF feature projections yield sub-50ms inference times while maintaining over 98.4% empirical classification accuracy on structured news corpora."
        },
        {
            "slug": "the-anatomy-of-election-disinformation-campaigns",
            "title": "The Anatomy of Synthetic Influence: Deconstructing 500,000 Coordinated Disinformation Vectors",
            "excerpt": "A comprehensive investigation into automated botnets, cross-platform narrative laundering, and how real-time semantic audits can prevent algorithmic panic.",
            "category": "OSINT",
            "author_name": "Marcus Vance",
            "author_role": "OSINT Director & Former Reuters Bureau Chief",
            "author_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            "date": "September 18, 2026",
            "read_time": "9 min read",
            "tags": "Disinformation,OSINT,Elections,Cybersecurity",
            "featured": False,
            "content": "## Narrative Laundering: From Dark Web to Mainstream Feeds\n\nModern disinformation operations rarely begin on front-page websites. Instead, state-aligned influence groups deploy narrative laundering cycles:\n\n1. Seed Phase: Obscure web forums publish fabricated claims.\n2. Amplification Phase: Coordinated autonomous bot swarms push trending hashtags.\n3. Legitimization Phase: Aggregator blogs cite the trending topics without verifying sources.\n4. Mainstream Infiltration: Major newsdesks report on the 'public debate' sparked by the fabrication."
        },
        {
            "slug": "raw-sql-vs-orm-scaling-audit-trails",
            "title": "Why Veritas Chose Pure Raw SQL Over Heavy ORMs for Production Audit Trails",
            "excerpt": "Engineering retrospective: achieving 10x query throughput and zero-overhead parameterized telemetry using native PostgreSQL drivers.",
            "category": "Methodology",
            "author_name": "Tariq Rahman",
            "author_role": "Principal Infrastructure Architect",
            "author_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            "date": "September 12, 2026",
            "read_time": "6 min read",
            "tags": "PostgreSQL,Database Architecture,Raw SQL,Performance",
            "featured": False,
            "content": "## The Cost of ORM Abstractions in High-Write Telemetry\n\nWhen designing the Veritas verification audit trail, our system requirements demanded sub-5ms insertion latency per analyzed article and complex parameterized filtering over millions of audit logs without hidden lazy-loading traps."
        }
    ]

    for p in initial_posts:
        raw_create_blog(
            slug=p["slug"],
            title=p["title"],
            excerpt=p["excerpt"],
            content=p["content"],
            category=p["category"],
            author_name=p["author_name"],
            author_role=p["author_role"],
            author_avatar=p["author_avatar"],
            date=p["date"],
            read_time=p["read_time"],
            tags=p["tags"],
            featured=p["featured"]
        )
    print("[+] Default research blog posts seeded successfully.")

