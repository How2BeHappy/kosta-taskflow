from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import database
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    status: str

@app.on_event("startup")
def startup():
    database.init_db()

@app.get("/api/tasks")
def get_tasks():
    return database.get_all_tasks()

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    return database.create_task(task.title)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    if not database.delete_task(task_id):
        raise HTTPException(status_code=404, detail="업무를 찾을 수 없습니다")
    return {"message": "삭제 완료"}

@app.patch("/api/tasks/{task_id}")
def update_task_status(task_id: int, task: TaskUpdate):
    if task.status not in ("todo", "in_progress", "done"):
        raise HTTPException(status_code=400, detail="유효하지 않은 상태값입니다")
    if not database.update_task_status(task_id, task.status):
        raise HTTPException(status_code=404, detail="업무를 찾을 수 없습니다")
    return database.get_task(task_id)

# 프론트엔드 정적 파일 서빙
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
