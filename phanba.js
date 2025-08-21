const addTaskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskStats = document.getElementById('taskStats');
const exportBtn = document.getElementById('exportBtn');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popupClose');
const popupStats = document.getElementById('popupStats');

const startTimerBtn = document.getElementById('startTimerBtn');
const timerDisplay = document.getElementById('timerDisplay');

let completed = 0;
let total = 0;
let timerDuration = 25 * 60; // 25 phút
let timer;
let isRunning = false;
let timeLeft = timerDuration;

function updateStats() {
  taskStats.textContent = `Đã hoàn thành: ${completed} / ${total}`;
}

addTaskBtn.addEventListener('click', () => {
  const task = taskInput.value.trim();
  if (task) {
    const li = document.createElement('li');
    li.innerHTML = `${task} <button>❌</button>`;
    li.querySelector('button').addEventListener('click', () => {
      li.remove();
      total--;
      updateStats();
    });
    li.addEventListener('dblclick', () => {
      li.style.textDecoration = 'line-through';
      completed++;
      updateStats();
    });
    taskList.appendChild(li);
    total++;
    updateStats();
    taskInput.value = '';
  }
});

exportBtn.addEventListener('click', () => {
  popupStats.textContent = `Bạn đã hoàn thành ${completed}/${total} công việc`;
  popup.classList.remove('hidden');
});

popupClose.addEventListener('click', () => {
  popup.classList.add('hidden');
});

toggleDarkMode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

function updateTimerDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timerDisplay.textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startPauseTimer() {
  if (!isRunning) {
    isRunning = true;
    startTimerBtn.textContent = "⏸ Tạm dừng";
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        alert("⏰ Hết giờ! Nghỉ ngơi chút nhé");
        timeLeft = timerDuration;
        updateTimerDisplay();
        startTimerBtn.textContent = "▶️ Bắt đầu";
      }
    }, 1000);
  } else {
    clearInterval(timer);
    isRunning = false;
    startTimerBtn.textContent = "▶️ Tiếp tục";
  }
}

startTimerBtn.addEventListener('click', startPauseTimer);

updateTimerDisplay();
