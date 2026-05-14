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
                status TEXT NOT NULL DEFAULT 'todo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

def get_all_tasks():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]

def get_task(task_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None

def create_task(title: str):
    with get_conn() as conn:
        cursor = conn.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        return get_task(cursor.lastrowid)

def delete_task(task_id: int):
    with get_conn() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        return cursor.rowcount > 0

def update_task_status(task_id: int, status: str):
    with get_conn() as conn:
        cursor = conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
        return cursor.rowcount > 0
