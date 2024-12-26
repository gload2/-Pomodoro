// Загрузка задач из localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskIndex = null; // Индекс текущей задачи для Pomodoro
let totalPomodoros = JSON.parse(localStorage.getItem("totalPomodoros")) || 0;

// Таймер
let timer;
let timerDuration = 25 * 60; // 25 минут работы
let isWorkSession = true; // Переключение между работой и отдыхом

// ======== Управление задачами ========
function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // Очистка списка задач

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <strong>${task.title}</strong> - ${task.priority} priority
      <br>
      Deadline: ${task.deadline}
      <br>
      Status: ${task.completed ? "Completed" : "Pending"}
      <br>
      <button onclick="startPomodoro(${index})">Start Pomodoro</button>
      <button onclick="deleteTask(${index})">Delete</button>
    `;
    taskList.appendChild(li);
  });
}

function addTask(event) {
  event.preventDefault(); // Предотвращение перезагрузки страницы

  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const priority = document.getElementById("task-priority").value;
  const deadline = document.getElementById("task-deadline").value;

  if (!title || !deadline) {
    alert("Please fill in all required fields.");
    return;
  }

  tasks.push({
    title,
    description,
    priority,
    deadline,
    completed: false,
    pomodoros: 0,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.getElementById("task-form").reset();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1); // Удаление задачи
  localStorage.setItem("tasks", JSON.stringify(tasks)); // Обновление localStorage
  renderTasks(); // Ререндер списка задач
}

// ======== Помодоро таймер ========
function updateTimerDisplay() {
  const minutes = Math.floor(timerDuration / 60);
  const seconds = timerDuration % 60;
  const time = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  document.getElementById("timer-display").textContent = time;
}

function startPomodoro(index) {
  if (currentTaskIndex === null || currentTaskIndex !== index) {
    currentTaskIndex = index;
    timerDuration = 25 * 60; // Сброс времени на 25 минут
    isWorkSession = true;
    updateTimerDisplay();
    document.getElementById("current-task").textContent = tasks[index].title;
  }

  if (timer) clearInterval(timer); // Остановка предыдущего таймера

  timer = setInterval(() => {
    if (timerDuration > 0) {
      timerDuration--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      timer = null;

      if (isWorkSession) {
        alert("Work session completed! Take a break.");
        tasks[currentTaskIndex].pomodoros++;
        totalPomodoros++;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("totalPomodoros", JSON.stringify(totalPomodoros));
        renderTasks();
        timerDuration = 5 * 60; // Устанавливаем время отдыха (5 минут)
        isWorkSession = false;
      } else {
        alert("Break is over! Time to work.");
        timerDuration = 25 * 60; // Устанавливаем время работы (25 минут)
        isWorkSession = true;
      }
      updateTimerDisplay();
      startPomodoro(currentTaskIndex); // Перезапуск таймера
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  timerDuration = isWorkSession ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
}

// ======== Статистика ========
function renderChart() {
  const ctx = document.getElementById("tasks-chart").getContext("2d");
  const completedTasks = tasks.filter(task => task.completed).length;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Completed Tasks", "Pomodoro Sessions"],
      datasets: [
        {
          label: "Statistics",
          data: [completedTasks, totalPomodoros],

backgroundColor: ["#4CAF50", "#FFC107"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

// Функция для фильтрации задач
function filterTasks() {
  const priorityFilter = document.getElementById("priority-filter").value.toLowerCase(); // Приводим к нижнему регистру
  const statusFilter = document.getElementById("status-filter").value;

  const filteredTasks = tasks.filter((task) => {
    // Фильтрация по приоритету
    const priorityMatch = priorityFilter ? task.priority.toLowerCase() === priorityFilter : true;
    // Фильтрация по статусу
    const statusMatch = statusFilter ? (statusFilter === "Completed" ? task.completed : !task.completed) : true;

    return priorityMatch && statusMatch;
  });

  renderFilteredTasks(filteredTasks); // Отображаем отфильтрованные задачи
}

// Функция для рендеринга отфильтрованных задач
function renderFilteredTasks(filteredTasks) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // Очистка списка задач

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <strong>${task.title}</strong> - ${task.priority} priority
      <br>
      Deadline: ${task.deadline}
      <br>
      Status: ${task.completed ? "Completed" : "Pending"}
      <br>
      <button onclick="startPomodoro(${index})">Start Pomodoro</button>
      <button onclick="deleteTask(${index})">Delete</button>
    `;
    taskList.appendChild(li);
  });
}

// События на изменение фильтров
document.getElementById("priority-filter").addEventListener("change", filterTasks);
document.getElementById("status-filter").addEventListener("change", filterTasks);

// Событие на форму добавления задачи
document.getElementById("task-form").addEventListener("submit", addTask);
document.getElementById("start-timer").addEventListener("click", () => {
  if (currentTaskIndex !== null) startPomodoro(currentTaskIndex);
});
document.getElementById("reset-timer").addEventListener("click", resetTimer);

// Рендеринг всех задач при загрузке страницы
renderTasks();
updateTimerDisplay();
renderChart();
