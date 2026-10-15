
const API_URL = "/api/tasks";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-title");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const completedCount = document.getElementById("completed-count");
const progressBar = document.getElementById("progress-bar");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
const addButton = document.getElementById("add-button");
const refreshButton = document.getElementById("refresh-button");

let tasks = [];

function showMessage(text) {
    message.textContent = text;
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error.detail || `Request failed (${response.status})`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function loadTasks() {
    refreshButton.disabled = true;
    showMessage("");

    try {
        tasks = await request(API_URL);
        renderTasks();
    } catch (error) {
        showMessage(`Could not load tasks: ${error.message}`);
    } finally {
        refreshButton.disabled = false;
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;

    taskCount.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
    completedCount.textContent = `${completed} completed`;

    progressBar.style.width = total
        ? `${(completed / total) * 100}%`
        : "0%";

    emptyState.hidden = total > 0;

    for (const task of tasks) {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} as completed`
        );

        checkbox.addEventListener("change", async () => {
            checkbox.disabled = true;

            try {
                await request(`${API_URL}/${task.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        completed: checkbox.checked
                    })
                });

                await loadTasks();
            } catch (error) {
                checkbox.checked = task.completed;
                showMessage(`Could not update task: ${error.message}`);
                checkbox.disabled = false;
            }
        });

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

        deleteButton.addEventListener("click", async () => {
            deleteButton.disabled = true;

            try {
                await request(`${API_URL}/${task.id}`, {
                    method: "DELETE"
                });

                await loadTasks();
            } catch (error) {
                showMessage(`Could not delete task: ${error.message}`);
                deleteButton.disabled = false;
            }
        });

        item.append(checkbox, title, deleteButton);
        taskList.appendChild(item);
    }
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        showMessage("Please enter a task.");
        return;
    }

    addButton.disabled = true;
    showMessage("");

    try {
        await request(API_URL, {
            method: "POST",
            body: JSON.stringify({ title })
        });

        taskInput.value = "";
        await loadTasks();
        taskInput.focus();
    } catch (error) {
        showMessage(`Could not add task: ${error.message}`);
    } finally {
        addButton.disabled = false;
    }
});

refreshButton.addEventListener("click", loadTasks);

loadTasks();
