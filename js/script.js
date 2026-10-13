/* =====================================================
   Personal Dashboard – script.js
   =====================================================
   Sections:
   1. Constants & LocalStorage Keys
   2. Utility Helpers
   3. Theme (Light / Dark Mode)
   4. Greeting & Live Clock
   5. Focus Timer (Pomodoro)
   6. To-Do List
   7. Quick Links
   8. Event Listeners (grouped at bottom)
   ===================================================== */

/* ─────────────────────────────────────────────────────
   1. CONSTANTS & LOCALSTORAGE KEYS
   ───────────────────────────────────────────────────── */
const LS_THEME     = 'dashboardTheme';
const LS_NAME      = 'dashboardUserName';
const LS_TASKS     = 'dashboardTasks';
const LS_LINKS     = 'dashboardLinks';
const LS_POMODORO  = 'pomodoroMinutes';

const DEFAULT_LINKS = [
  { id: uid(), name: 'Google',  url: 'https://www.google.com' },
  { id: uid(), name: 'YouTube', url: 'https://www.youtube.com' },
  { id: uid(), name: 'GitHub',  url: 'https://www.github.com' },
  { id: uid(), name: 'Gmail',   url: 'https://mail.google.com' },
  { id: uid(), name: 'ChatGPT', url: 'https://chat.openai.com' },
];

/* ─────────────────────────────────────────────────────
   2. UTILITY HELPERS
   ───────────────────────────────────────────────────── */

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Pad a number to 2 digits */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Load JSON from localStorage; return fallback on error/empty */
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Save a value as JSON to localStorage */
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ─────────────────────────────────────────────────────
   3. THEME – LIGHT / DARK MODE
   ───────────────────────────────────────────────────── */

/**
 * Apply the given theme ('light' | 'dark') to <html>
 * and save it in LocalStorage.
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  lsSet(LS_THEME, theme);
}

/** Toggle between light and dark */
function toggleTheme() {
  // Use lsGet so the value is properly JSON-parsed (no extra quotes)
  const current = lsGet(LS_THEME, 'light');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ─────────────────────────────────────────────────────
   4. GREETING & LIVE CLOCK
   ───────────────────────────────────────────────────── */

const elClock        = document.getElementById('clock');
const elDateDisplay  = document.getElementById('date-display');
const elGreetingText = document.getElementById('greeting-text');
const elEditNameBtn  = document.getElementById('edit-name-btn');
const elNameEditForm = document.getElementById('name-edit-form');
const elNameInput    = document.getElementById('name-input');
const elNameConfirm  = document.getElementById('name-confirm-btn');
const elNameCancel   = document.getElementById('name-cancel-btn');

/** Return a greeting phrase based on the current hour */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/** Update clock, date, and greeting every second */
function updateClock() {
  const now   = new Date();
  const hh    = pad2(now.getHours());
  const mm    = pad2(now.getMinutes());
  const ss    = pad2(now.getSeconds());
  elClock.textContent = `${hh}:${mm}:${ss}`;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  elDateDisplay.textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const name     = lsGet(LS_NAME, null) || 'Friend';
  const greeting = getGreeting(now.getHours());
  elGreetingText.textContent = `${greeting}, ${name}!`;
}

/** Show the inline name-edit form */
function showNameEditForm() {
  const currentName = lsGet(LS_NAME, null) || '';
  elNameInput.value = currentName === 'Friend' ? '' : currentName;
  elNameEditForm.classList.remove('hidden');
  elNameInput.focus();
}

/** Hide the inline name-edit form */
function hideNameEditForm() {
  elNameEditForm.classList.add('hidden');
}

/** Save the name from the input field */
function saveName() {
  const value = elNameInput.value.trim();
  if (value) {
    lsSet(LS_NAME, value);
  } else {
    localStorage.removeItem(LS_NAME);
  }
  hideNameEditForm();
  updateClock(); // refresh greeting immediately
}

/* ─────────────────────────────────────────────────────
   5. FOCUS TIMER (POMODORO)
   ───────────────────────────────────────────────────── */

const elTimerDisplay    = document.getElementById('timer-display');
const elPomodoroMinutes = document.getElementById('pomodoro-minutes');
const elTimerStart      = document.getElementById('timer-start');
const elTimerPause      = document.getElementById('timer-pause');
const elTimerReset      = document.getElementById('timer-reset');

let timerInterval  = null;   // holds setInterval reference
let timerSeconds   = 0;      // remaining seconds
let timerRunning   = false;

/** Load saved pomodoro minutes (or default 25) */
function initTimer() {
  const saved = lsGet(LS_POMODORO, 25);
  const mins  = Math.min(60, Math.max(1, parseInt(saved, 10) || 25));
  elPomodoroMinutes.value = mins;
  timerSeconds = mins * 60;
  renderTimer();
}

/** Render the current timerSeconds to MM:SS */
function renderTimer() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  elTimerDisplay.textContent = `${pad2(m)}:${pad2(s)}`;
}

/** Start the countdown */
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  elTimerStart.disabled  = true;
  elTimerPause.disabled  = false;
  timerInterval = setInterval(() => {
    timerSeconds--;
    renderTimer();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      elTimerStart.disabled = false;
      elTimerPause.disabled = true;
      alert('Focus session complete!');
      resetTimer();
    }
  }, 1000);
}

/** Pause the countdown */
function pauseTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  elTimerStart.disabled = false;
  elTimerPause.disabled = true;
}

/** Reset the timer to the currently selected duration */
function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  elTimerStart.disabled = false;
  elTimerPause.disabled = true;

  const mins   = Math.min(60, Math.max(1, parseInt(elPomodoroMinutes.value, 10) || 25));
  timerSeconds = mins * 60;
  renderTimer();
}

/** Called when the user changes the duration input */
function onDurationChange() {
  const mins = Math.min(60, Math.max(1, parseInt(elPomodoroMinutes.value, 10) || 25));
  elPomodoroMinutes.value = mins;
  lsSet(LS_POMODORO, mins); // save to LocalStorage
  pauseTimer();
  timerSeconds = mins * 60;
  renderTimer();
}

/* ─────────────────────────────────────────────────────
   6. TO-DO LIST
   ───────────────────────────────────────────────────── */

const elTodoInput   = document.getElementById('todo-input');
const elTodoAddBtn  = document.getElementById('todo-add-btn');
const elTodoList    = document.getElementById('todo-list');
const elTodoWarning = document.getElementById('todo-warning');

let warningTimeout = null; // for auto-hiding duplicate warning

/** Load tasks array from LocalStorage */
function loadTasks() {
  return lsGet(LS_TASKS, []);
}

/** Save tasks array to LocalStorage */
function saveTasks(tasks) {
  lsSet(LS_TASKS, tasks);
}

/** Render the full task list into the DOM */
function renderTasks() {
  const tasks = loadTasks();
  elTodoList.innerHTML = '';
  tasks.forEach(task => {
    elTodoList.appendChild(buildTaskElement(task));
  });
}

/** Build a single <li> element for a task */
function buildTaskElement(task) {
  const li = document.createElement('li');
  li.className = `todo-item${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);

  // Task text span
  const textSpan = document.createElement('span');
  textSpan.className   = 'task-text';
  textSpan.textContent = task.text;

  // Action buttons container
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.title     = 'Edit task';
  editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
  editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`;

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn';
  deleteBtn.title     = 'Delete task';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>`;

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(actions);

  // ── inline event handlers for this item ──

  checkbox.addEventListener('change', () => toggleTask(task.id));

  editBtn.addEventListener('click', () => startEditTask(li, task));

  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return li;
}

/** Add a new task (with duplicate check) */
function addTask() {
  const text = elTodoInput.value.trim();
  if (!text) return;

  const tasks = loadTasks();

  // Duplicate check (case-insensitive)
  const isDuplicate = tasks.some(t => t.text.trim().toLowerCase() === text.toLowerCase());
  if (isDuplicate) {
    showTodoWarning();
    return;
  }

  tasks.push({ id: uid(), text, done: false });
  saveTasks(tasks);
  elTodoInput.value = '';
  renderTasks();
}

/** Show the duplicate-task warning; auto-hide after 2s */
function showTodoWarning() {
  elTodoWarning.classList.remove('hidden');
  clearTimeout(warningTimeout);
  warningTimeout = setTimeout(() => {
    elTodoWarning.classList.add('hidden');
  }, 2000);
}

/** Toggle the done state of a task */
function toggleTask(id) {
  const tasks = loadTasks();
  const task  = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks(tasks);
    renderTasks();
  }
}

/** Switch a task row into edit mode */
function startEditTask(li, task) {
  const textSpan  = li.querySelector('.task-text');
  const actions   = li.querySelector('.item-actions');

  // Replace text span with an input
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = task.text;
  editInput.maxLength = 200;
  editInput.className = 'inline-input edit-task-input';
  editInput.setAttribute('aria-label', 'Edit task text');

  // Confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-sm';
  confirmBtn.textContent = 'Save';

  textSpan.replaceWith(editInput);
  actions.innerHTML = '';
  actions.appendChild(confirmBtn);

  editInput.focus();
  editInput.select();

  const doSave = () => {
    const newText = editInput.value.trim();
    if (!newText) return; // don't save empty
    const tasks = loadTasks();
    const t     = tasks.find(t => t.id === task.id);
    if (t) {
      t.text = newText;
      saveTasks(tasks);
    }
    renderTasks();
  };

  confirmBtn.addEventListener('click', doSave);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSave();
    if (e.key === 'Escape') renderTasks(); // cancel
  });
}

/** Delete a task by id */
function deleteTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

/* ─────────────────────────────────────────────────────
   7. QUICK LINKS
   ───────────────────────────────────────────────────── */

const elLinkNameInput = document.getElementById('link-name-input');
const elLinkUrlInput  = document.getElementById('link-url-input');
const elLinkAddBtn    = document.getElementById('link-add-btn');
const elLinksGrid     = document.getElementById('links-grid');

/** Load links from LocalStorage; seed defaults if empty */
function loadLinks() {
  const saved = lsGet(LS_LINKS, null);
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    lsSet(LS_LINKS, DEFAULT_LINKS);
    return DEFAULT_LINKS;
  }
  return saved;
}

/** Save links array to LocalStorage */
function saveLinks(links) {
  lsSet(LS_LINKS, links);
}

/** Render all link cards into the grid */
function renderLinks() {
  const links = loadLinks();
  elLinksGrid.innerHTML = '';
  links.forEach(link => {
    elLinksGrid.appendChild(buildLinkCard(link));
  });
}

/** Build a single link card element */
function buildLinkCard(link) {
  const a = document.createElement('a');
  a.href        = link.url;
  a.target      = '_blank';
  a.rel         = 'noopener noreferrer';
  a.className   = 'link-card';
  a.textContent = link.name;
  a.title       = link.url;

  // Delete button (×)
  const delBtn = document.createElement('button');
  delBtn.className = 'link-delete-btn';
  delBtn.title     = `Remove ${link.name}`;
  delBtn.setAttribute('aria-label', `Remove link: ${link.name}`);
  delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;

  delBtn.addEventListener('click', e => {
    e.preventDefault(); // don't follow the link
    deleteLink(link.id);
  });

  a.appendChild(delBtn);
  return a;
}

/** Add a new link */
function addLink() {
  const name = elLinkNameInput.value.trim();
  let   url  = elLinkUrlInput.value.trim();

  if (!name || !url) return;

  // Ensure URL has a protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  const links = loadLinks();
  links.push({ id: uid(), name, url });
  saveLinks(links);
  elLinkNameInput.value = '';
  elLinkUrlInput.value  = '';
  renderLinks();
}

/** Delete a link by id */
function deleteLink(id) {
  const links = loadLinks().filter(l => l.id !== id);
  saveLinks(links);
  renderLinks();
}

/* ─────────────────────────────────────────────────────
   8. EVENT LISTENERS (grouped)
   ───────────────────────────────────────────────────── */

// ── Theme toggle
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// ── Greeting / Name edit
elEditNameBtn.addEventListener('click', showNameEditForm);
elNameConfirm.addEventListener('click', saveName);
elNameCancel.addEventListener('click', hideNameEditForm);
elNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveName();
  if (e.key === 'Escape') hideNameEditForm();
});

// ── Timer controls
elTimerStart.addEventListener('click', startTimer);
elTimerPause.addEventListener('click', pauseTimer);
elTimerReset.addEventListener('click', resetTimer);
elPomodoroMinutes.addEventListener('change', onDurationChange);
elPomodoroMinutes.addEventListener('input',  onDurationChange);

// ── To-Do List
elTodoAddBtn.addEventListener('click', addTask);
elTodoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Quick Links
elLinkAddBtn.addEventListener('click', addLink);
elLinkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addLink();
});

/* ─────────────────────────────────────────────────────
   INITIALISE ON LOAD
   ───────────────────────────────────────────────────── */

// Start live clock (runs immediately, then every second)
updateClock();
setInterval(updateClock, 1000);

// Initialise timer with saved/default duration
initTimer();

// Render persisted tasks
renderTasks();

// Render persisted links (seeds defaults if none)
renderLinks();
