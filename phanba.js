// ====== DOM ======
const addTaskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskStats = document.getElementById('taskStats');
const taskProgressBar = document.getElementById('taskProgressBar');
const exportBtn = document.getElementById('exportBtn');

const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const timerTitle = document.getElementById('timerTitle');
const phaseLabel = document.getElementById('phaseLabel');
const progressRing = document.getElementById('progressRing');

const toggleDarkMode = document.getElementById('toggleDarkMode');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalClose2 = document.getElementById('modalClose2');
const exportContent = document.getElementById('exportContent');
const copyExportBtn = document.getElementById('copyExportBtn');

const metricRate = document.getElementById('metricRate');
const metricTotal = document.getElementById('metricTotal');
const metricDone = document.getElementById('metricDone');

// ====== State ======
const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

let onBreak = false;
let isRunning = false;
let timeLeft = WORK_DURATION;
let timerId = null;

const R = 80;
const CIRC = 2 * Math.PI * R;

// Chart
let chart;

// Storage key
const STORE_KEY = 'pomodoroTasks_v2';

// Sound
const dingSound = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');

// ====== Utils ======
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function notify(message) {
  try { dingSound.currentTime = 0; dingSound.play(); } catch {}
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => { if (p === 'granted') new Notification(message); });
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
}

function saveState() {
  const tasks = [...taskList.querySelectorAll('.task')].map(li => ({
    text: li.querySelector('.text').textContent,
    done: li.classList.contains('done')
  }));
  const data = {
    tasks,
    onBreak,
    timeLeft,
    darkMode: document.body.classList.contains('dark-mode')
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function loadState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data.tasks)) {
      data.tasks.forEach(t => addTask(t.text, t.done));
    }
    onBreak = !!data.onBreak;
    timeLeft = Number.isFinite(data.timeLeft) ? data.timeLeft : WORK_DURATION;
    if (data.darkMode) document.body.classList.add('dark-mode');
    if (onBreak) document.body.classList.add('break-mode');
    updateTimerUI();
  } catch {}
}

// ====== Tasks ======
function addTask(text, done = false) {
  const li = document.createElement('li');
  li.className = 'task' + (done ? ' done' : '');
  li.innerHTML = `
    <div class="check">${done ? '<i class="fa-solid fa-check"></i>' : ''}</div>
    <div class="text">${text}</div>
    <div class="actions">
      <button class="btn btn-del icon" title="Xóa"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;

  // Toggle done on double click or on checkbox click
  li.addEventListener('dblclick', () => toggleTask(li));
  li.querySelector('.check').addEventListener('click', () => toggleTask(li));

  // Delete with animation
  li.querySelector('.btn-del').addEventListener('click', () => {
    li.classList.add('removing');
    setTimeout(() => { li.remove(); updateStats(); saveState(); updateChart(); }, 160);
  });

  taskList.appendChild(li);
  updateStats();
  saveState();
  updateChart();
}

function toggleTask(li){
  const isDone = li.classList.toggle('done');
  const check = li.querySelector('.check');
  check.innerHTML = isDone ? '<i class="fa-solid fa-check"></i>' : '';
  li.style.animation = 'tick .18s ease';
  setTimeout(() => li.style.animation = '', 200);
  updateStats();
  saveState();
  updateChart();
}

function updateStats(){
  const items = taskList.querySelectorAll('.task');
  const total = items.length;
  const done = taskList.querySelectorAll('.task.done').length;

  taskStats.textContent = `Đã hoàn thành: ${done} / ${total}`;

  // Progress bar
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  taskProgressBar.style.width = `${pct}%`;

  // Metrics
  metricRate.textContent = `${pct}%`;
  metricTotal.textContent = total;
  metricDone.textContent = done;
}

// ====== Timer ======
function updateRing(){
  const total = onBreak ? BREAK_DURATION : WORK_DURATION;
  const progress = 1 - timeLeft / total; // 0 -> 1
  progressRing.setAttribute('stroke-dasharray', CIRC.toString());
  progressRing.setAttribute('stroke-dashoffset', (CIRC * (1 - progress)).toString());
}

function updateTimerUI(){
  timerDisplay.textContent = formatTime(timeLeft);
  phaseLabel.textContent = onBreak ? 'Nghỉ' : 'Làm việc';
  timerTitle.textContent = onBreak ? '☕ Nghỉ ngơi' : '⏳ Pomodoro';
  document.body.classList.toggle('break-mode', onBreak);
  updateRing();
}

function tick(){
  timeLeft -= 1;
  if (timeLeft < 0) timeLeft = 0;
  updateTimerUI();

  if (timeLeft === 0){
    clearInterval(timerId);
    isRunning = false;
    startTimerBtn.innerHTML = `<i class="fa-solid fa-play"></i> Bắt đầu`;

    if (!onBreak){
      notify('⏰ Hết giờ làm việc! Nghỉ 5 phút nhé');
      onBreak = true;
      timeLeft = BREAK_DURATION;
      startPause(); // tự động chuyển
    } else {
      notify('✅ Nghỉ xong! Quay lại làm việc nào');
      onBreak = false;
      timeLeft = WORK_DURATION;
      startPause(); // tự động chuyển
    }
    saveState();
  } else {
    saveState();
  }
}

function startPause(){
  if (!isRunning){
    isRunning = true;
    startTimerBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Tạm dừng`;
    timerId = setInterval(tick, 1000);
  } else {
    isRunning = false;
    startTimerBtn.innerHTML = `<i class="fa-solid fa-play"></i> Tiếp tục`;
    clearInterval(timerId);
  }
}

function resetTimer(){
  clearInterval(timerId);
  isRunning = false;
  onBreak = false;
  timeLeft = WORK_DURATION;
  startTimerBtn.innerHTML = `<i class="fa-solid fa-play"></i> Bắt đầu`;
  updateTimerUI();
  saveState();
}

// ====== Chart ======
function initChart(){
  const ctx = document.getElementById('miniChart');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Đã xong', 'Chưa xong'],
      datasets: [{
        data: [0, 1],
        backgroundColor: ['#2dd4bf', '#3a3f67'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      cutout: '68%'
    }
  });
}

function updateChart(){
  if (!chart) return;
  const total = taskList.querySelectorAll('.task').length;
  const done = taskList.querySelectorAll('.task.done').length;
  chart.data.datasets[0].data = [done, Math.max(0, total - done)];
  chart.update();
}

// ====== Export ======
function openExportModal(){
  const now = new Date();
  const items = [...taskList.querySelectorAll('.task')].map((li, idx) => {
    const txt = li.querySelector('.text').textContent;
    const done = li.classList.contains('done') ? '[x]' : '[ ]';
    return `${String(idx+1).padStart(2,'0')}. ${done} ${txt}`;
  }).join('\n');

  const header = `BẢNG CÔNG VIỆC — ${now.toLocaleString()}\n--------------------------------\n`;
  const body = items || '(Danh sách trống)';
  const footer = `\n--------------------------------\nTổng: ${taskList.children.length} | Hoàn thành: ${taskList.querySelectorAll('.task.done').length}`;

  exportContent.textContent = header + body + footer;
  modal.classList.remove('hidden');
}

function copyExport(){
  const range = document.createRange();
  range.selectNodeContents(exportContent);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand('copy');
    sel.removeAllRanges();
    // small visual feedback
    copyExportBtn.innerHTML = `<i class="fa-solid fa-check"></i> Đã sao chép`;
    setTimeout(() => copyExportBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Sao chép`, 1200);
  } catch {
    // ignore
  }
}

function closeModal(){
  modal.classList.add('hidden');
}

// ====== Events ======
addTaskBtn.addEventListener('click', () => {
  const val = taskInput.value.trim();
  if (!val) return;
  addTask(val);
  taskInput.value = '';
  taskInput.focus();
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter'){
    addTaskBtn.click();
  }
});

exportBtn.addEventListener('click', openExportModal);
modalClose.addEventListener('click', closeModal);
modalClose2.addEventListener('click', closeModal);
copyExportBtn.addEventListener('click', copyExport);

startTimerBtn.addEventListener('click', startPause);
resetTimerBtn.addEventListener('click', resetTimer);

toggleDarkMode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  saveState();
});

// ====== Init ======
(function init(){
  // Prep ring
  progressRing.setAttribute('stroke-dasharray', CIRC.toString());
  progressRing.setAttribute('stroke-dashoffset', CIRC.toString());

  // Try ask notification permission early (non-blocking UX)
  if ('Notification' in window && Notification.permission === 'default'){
    Notification.requestPermission().catch(()=>{});
  }

  initChart();
  loadState();
  updateStats();
  updateChart();
  updateTimerUI();
})();
