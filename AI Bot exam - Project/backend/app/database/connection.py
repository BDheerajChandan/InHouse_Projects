import psycopg2
import psycopg2.pool
import psycopg2.extras
import logging
from app.core.config import settings
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

logger = logging.getLogger(__name__)

# Connection pool
_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=20,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            dbname=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )
    return _pool

def get_conn():
    return get_pool().getconn()

def release_conn(conn):
    get_pool().putconn(conn)

def get_db():
    conn = get_conn()
    try:
        yield conn
    finally:
        release_conn(conn)

async def init_db():
    """Initialize database and create database/tables if not exist."""
    logger.info("Initializing database tables...")

    conn = None

    try:
        # STEP 1: Connect to default postgres database
        temp_conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            dbname="postgres",
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )

        temp_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        temp_cur = temp_conn.cursor()

        # STEP 2: Check if target DB exists
        temp_cur.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (settings.DB_NAME,)
        )

        exists = temp_cur.fetchone()

        # STEP 3: Create DB if missing
        if not exists:
            logger.info(f"Creating database: {settings.DB_NAME}")
            temp_cur.execute(f'CREATE DATABASE "{settings.DB_NAME}"')
            logger.info("Database created successfully")

        temp_cur.close()
        temp_conn.close()

        # STEP 4: Connect to actual application DB
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            dbname=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )

        cur = conn.cursor()

        # USERS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # RESUMES TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                raw_text TEXT,
                parsed_data JSONB,
                ats_score FLOAT DEFAULT 0,
                ai_readiness_score FLOAT DEFAULT 0,
                ml_readiness_score FLOAT DEFAULT 0,
                genai_readiness_score FLOAT DEFAULT 0,
                strong_areas JSONB DEFAULT '[]',
                weak_areas JSONB DEFAULT '[]',
                missing_skills JSONB DEFAULT '[]',
                extracted_skills JSONB DEFAULT '[]',
                projects JSONB DEFAULT '[]',
                certifications JSONB DEFAULT '[]',
                experience_years FLOAT DEFAULT 0,
                education JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # INTERVIEW CONFIGS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS interview_configs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                technologies JSONB DEFAULT '[]',
                primary_skills JSONB DEFAULT '[]',
                secondary_skills JSONB DEFAULT '[]',
                experience_level VARCHAR(50) DEFAULT 'Fresher',
                difficulty VARCHAR(50) DEFAULT 'Medium',
                num_questions INTEGER DEFAULT 10,
                total_time INTEGER DEFAULT 60,
                question_types JSONB DEFAULT '[]',
                self_validation_cutoff FLOAT DEFAULT 60,
                company_name VARCHAR(100),
                interview_mode VARCHAR(50) DEFAULT 'Hybrid',
                ai_personality VARCHAR(100) DEFAULT 'Friendly',
                webcam_monitoring BOOLEAN DEFAULT FALSE,
                voice_analytics BOOLEAN DEFAULT TRUE,
                selected_llm VARCHAR(50) DEFAULT 'openai',
                sarvam_language VARCHAR(50) DEFAULT 'en-IN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # INTERVIEW SESSIONS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                config_id INTEGER REFERENCES interview_configs(id),
                resume_id INTEGER REFERENCES resumes(id),
                session_token VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                total_duration INTEGER DEFAULT 0,
                current_question_index INTEGER DEFAULT 0,
                interview_strategy JSONB,
                overall_score FLOAT DEFAULT 0,
                technical_score FLOAT DEFAULT 0,
                communication_score FLOAT DEFAULT 0,
                confidence_score FLOAT DEFAULT 0,
                hiring_probability FLOAT DEFAULT 0,
                final_report JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # QUESTIONS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
                question_number INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                question_type VARCHAR(100),
                difficulty VARCHAR(50),
                expected_keywords JSONB DEFAULT '[]',
                expected_concepts JSONB DEFAULT '[]',
                ideal_answer_summary TEXT,
                followups JSONB DEFAULT '[]',
                evaluation_criteria JSONB DEFAULT '[]',
                company_style VARCHAR(100),
                audio_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # ANSWERS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS answers (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
                question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
                answer_text TEXT,
                audio_url VARCHAR(500),
                score FLOAT DEFAULT 0,
                passed BOOLEAN DEFAULT FALSE,
                confidence_score FLOAT DEFAULT 0,
                technical_depth FLOAT DEFAULT 0,
                communication_score FLOAT DEFAULT 0,
                missing_keywords JSONB DEFAULT '[]',
                good_points JSONB DEFAULT '[]',
                weak_points JSONB DEFAULT '[]',
                improvements JSONB DEFAULT '[]',
                hallucination_risk VARCHAR(50),
                next_difficulty VARCHAR(50),
                time_taken INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # VOICE METRICS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS voice_metrics (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
                answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
                clarity_score FLOAT DEFAULT 0,
                confidence_score FLOAT DEFAULT 0,
                filler_words JSONB DEFAULT '[]',
                filler_count INTEGER DEFAULT 0,
                professionalism_score FLOAT DEFAULT 0,
                communication_feedback JSONB DEFAULT '[]',
                speech_rate FLOAT DEFAULT 0,
                pause_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # ANALYTICS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                skill_scores JSONB DEFAULT '{}',
                topic_scores JSONB DEFAULT '{}',
                question_scores JSONB DEFAULT '[]',
                ai_ml_readiness FLOAT DEFAULT 0,
                genai_readiness FLOAT DEFAULT 0,
                coding_readiness FLOAT DEFAULT 0,
                resume_match_percent FLOAT DEFAULT 0,
                strong_skills JSONB DEFAULT '[]',
                weak_skills JSONB DEFAULT '[]',
                improvement_roadmap JSONB DEFAULT '[]',
                recommended_learning JSONB DEFAULT '[]',
                company_readiness JSONB DEFAULT '{}',
                final_verdict TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # REPORTS TABLE
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                report_data JSONB NOT NULL,
                pdf_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create indexes
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON interview_sessions(user_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON interview_sessions(session_token);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);")

        conn.commit()
        logger.info("All database tables created/verified successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()