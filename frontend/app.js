const API = "/api/tasks";

const statusLabel = {
  todo: "할 일",
  in_progress: "진행 중",
  done: "완료",
};

const statusNext = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const statusColor = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-600",
  done: "bg-green-100 text-green-600",
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
    item.className =
      "flex items-center justify-between bg-white rounded-xl shadow-sm px-5 py-4 gap-4";

    item.innerHTML = `
      <span class="flex-1 text-gray-800 font-medium">${escapeHtml(task.title)}</span>
      <button
        onclick="changeStatus(${task.id}, '${statusNext[task.status]}')"
        class="text-sm px-3 py-1 rounded-full font-semibold ${statusColor[task.status]} hover:opacity-80 transition"
      >${statusLabel[task.status]}</button>
      <button
        onclick="deleteTask(${task.id})"
        class="text-gray-300 hover:text-red-400 transition text-xl leading-none"
        title="삭제"
      >&times;</button>
    `;

    list.appendChild(item);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const title = input.value.trim();
  if (!title) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  input.value = "";
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

document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

loadTasks();
