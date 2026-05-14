const API = "/api/tasks";

const statusLabel = { todo: "할 일", in_progress: "진행 중", done: "완료" };
const statusNext  = { todo: "in_progress", in_progress: "done", done: "todo" };
const statusColor = {
  todo:        "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-600",
  done:        "bg-green-100 text-green-600",
};

const priorityLabel = { high: "높음", medium: "중간", low: "낮음" };
const priorityColor = {
  high:   "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-600",
  low:    "bg-blue-100 text-blue-500",
};

async function loadTasks() {
  const res = await fetch(API);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<p class="text-center text-gray-400 py-8">등록된 업무가 없습니다.</p>`;
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "bg-white rounded-xl shadow-sm px-5 py-4";

    const dates = [];
    if (task.start_date) dates.push(`시작 ${task.start_date}`);
    if (task.due_date)   dates.push(`완료 ${task.due_date}`);

    item.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="font-semibold text-gray-800">${escapeHtml(task.title)}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority] || priorityColor.medium}">
              ${priorityLabel[task.priority] || "중간"}
            </span>
          </div>
          ${task.description ? `<p class="text-sm text-gray-500 mb-1">${escapeHtml(task.description)}</p>` : ""}
          ${dates.length ? `<p class="text-xs text-gray-400">${dates.join(" · ")}</p>` : ""}
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            onclick="changeStatus(${task.id}, '${statusNext[task.status]}')"
            class="text-xs px-3 py-1 rounded-full font-semibold ${statusColor[task.status]} hover:opacity-80 transition whitespace-nowrap"
          >${statusLabel[task.status]}</button>
          <button
            onclick="deleteTask(${task.id})"
            class="text-gray-300 hover:text-red-400 transition text-xl leading-none"
            title="삭제"
          >&times;</button>
        </div>
      </div>
    `;

    list.appendChild(item);
  });
}

async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) {
    document.getElementById("taskTitle").focus();
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description: document.getElementById("taskDesc").value.trim(),
      priority:    document.getElementById("taskPriority").value,
      start_date:  document.getElementById("taskStartDate").value || null,
      due_date:    document.getElementById("taskDueDate").value || null,
    }),
  });

  // 입력 초기화
  ["taskTitle", "taskDesc", "taskStartDate", "taskDueDate"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("taskPriority").value = "medium";

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTasks();
}

async function changeStatus(id, status) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  loadTasks();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

document.getElementById("taskTitle").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

loadTasks();
