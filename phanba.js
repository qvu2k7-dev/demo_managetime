// DOM Elements
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskStats = document.getElementById("taskStats");
const exportBtn = document.getElementById("exportBtn");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimerBtn");
const body = document.body;

// 🌙 Dark Mode: Khôi phục trạng thái
if (localStorage.getItem("darkMode") === "true") {
  body.classList.add("dark-mode");
}

toggleDarkMode.onclick = () => {
  body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
};

// 💾 Khôi phục công việc từ LocalStorage
window.onload = () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => addTask(task.text, task.done));
  updateStats();
};

// ➕ Thêm công việc
document.getElementById("addTaskBtn").onclick = () => {
  const text = taskInput.value.trim();
  if (text) {
    addTask(text, false);
    taskInput.value = "";
    saveTasks();
    updateStats();
  }
};

// 🧠 Hàm thêm công việc
function addTask(text, done) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = text;
  if (done) span.style.textDecoration = "line-through";

  // Đánh dấu hoàn thành
  span.onclick = () => {
    span.style.textDecoration =
      span.style.textDecoration === "line-through" ? "none" : "line-through";
    saveTasks();
    updateStats();
  };

  // Xóa công việc
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => {
    li.remove();
    saveTasks();
    updateStats();
  };

  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);
}

// 📊 Cập nhật thống kê
function updateStats() {
  const tasks = taskList.querySelectorAll("li");
  const done = [...tasks].filter(li =>
    li.querySelector("span").style.textDecoration === "line-through"
  ).length;
  taskStats.textContent = `Đã hoàn thành: ${done} / ${tasks.length}`;
}

// 💾 Lưu công việc vào LocalStorage
function saveTasks() {
  const tasks = [...taskList.querySelectorAll("li")].map(li => ({
    text: li.querySelector("span").textContent,
    done: li.querySelector("span").style.textDecoration === "line-through"
  }));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 📥 Xuất danh sách công việc
exportBtn.onclick = () => {
  const tasks = [...taskList.querySelectorAll("li")].map(li =>
    li.querySelector("span").textContent
  );
  const blob = new Blob([tasks.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "danh_sach_cong_viec.txt";
  link.click();
};

// 🔔 Nhắc nhở sau 1 giờ không thêm việc
setTimeout(() => {
  if (taskList.children.length === 0) {
    alert("Bạn chưa thêm việc nào trong 1 giờ. Hãy bắt đầu nhé!");
  }
}, 3600000);

// ⏳ Pomodoro Timer
let timer;
startTimerBtn.onclick = () => {
  let time = 25 * 60;
  clearInterval(timer);
  timer = setInterval(() => {
    if (time <= 0) {
      clearInterval(timer);
      alert("Hết giờ! Nghỉ ngơi một chút nhé ☕");
      return;
    }
    time--;
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    timerDisplay.textContent = `${min}:${sec}`;
  }, 1000);
};
const ctx = document.getElementById('taskChart').getContext('2d');
const taskChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    datasets: [{
      label: 'Công việc hoàn thành',
      data: [3, 5, 2, 4, 6],
      backgroundColor: '#6cb4f3'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});
const category = document.getElementById("taskCategory").value;
addTask(taskInput.value.trim(), false, category);
const tag = document.createElement("span");
tag.textContent = `[${category}]`;
tag.classList.add("task-tag");
li.insertBefore(tag, span);
