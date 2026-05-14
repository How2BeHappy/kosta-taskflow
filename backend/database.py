import sqlite3

DB_PATH = "tasks.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                start_date TEXT DEFAULT NULL,
                due_date TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # 기존 DB 마이그레이션 (컬럼이 없으면 추가)
        for col, definition in [
            ("description", "TEXT DEFAULT ''"),
            ("priority", "TEXT NOT NULL DEFAULT 'medium'"),
            ("start_date", "TEXT DEFAULT NULL"),
            ("due_date", "TEXT DEFAULT NULL"),
        ]:
            try:
                conn.execute(f"ALTER TABLE tasks ADD COLUMN {col} {definition}")
            except Exception:
                pass

def get_all_tasks():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]

def get_task(task_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None

def create_task(title: str, description: str, priority: str, start_date, due_date):
    with get_conn() as conn:
        cursor = conn.execute(
            "INSERT INTO tasks (title, description, priority, start_date, due_date) VALUES (?, ?, ?, ?, ?)",
            (title, description, priority, start_date, due_date),
        )
        return get_task(cursor.lastrowid)

def delete_task(task_id: int):
    with get_conn() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        return cursor.rowcount > 0

def update_task_status(task_id: int, status: str):
    with get_conn() as conn:
        cursor = conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
        return cursor.rowcount > 0
