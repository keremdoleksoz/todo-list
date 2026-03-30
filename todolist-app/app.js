document.addEventListener("DOMContentLoaded", () => {
    defaultCategory();
    categoryOperations();
    taskOperations();
    sorting();
    filterOperations();
    renderTasks();
});

// Global Filters
const filters = {
    categoryId: "all",
    categorySearchText: "",
    searchText: "",
    status: "all",
    startDate: "",
    endDate: ""
};

let editingTaskId = null;

// ****************************************** CATEGORIES ******************************************

function categoryOperations() {
    listCategories();

    const addCategoryButton = document.getElementById("addCategoryButton");
    const dialog = document.getElementById("categoryDialog");
    const submitButtonDialog = document.getElementById("submitDialog");
    const cancelDialogButton = document.getElementById("cancelDialog");
    const dialogCategoryName = document.getElementById("dialogCategoryName");
    const categorySearchBox = document.getElementById("categorySearchBox");

    addCategoryButton.addEventListener("click", () => dialog.showModal());

    submitButtonDialog.addEventListener("click", (event) => {
        event.preventDefault();
        addCategory(dialogCategoryName.value);
        dialogCategoryName.value = "";
        dialog.close();
    });

    cancelDialogButton.addEventListener("click", () => {
        dialogCategoryName.value = "";
        dialog.close();
    });

    categorySearchBox.addEventListener("input", () => {
        filters.categorySearchText = categorySearchBox.value.toLowerCase().trim();
        listCategories();
    })
}

function addCategory(categoryName) {
    const value = categoryName.trim();
    if (value === "") return;

    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");

    const alreadyExist = categories.some(category => category.name.trim().toLowerCase() === value.trim().toLowerCase());

    if(alreadyExist){
        alert("This category already exist.")
        return;
    }

    const newCategory = {
        id: crypto.randomUUID(),
        name: value
    };

    categories.unshift(newCategory);
    localStorage.setItem("Categories", JSON.stringify(categories));
    listCategories();
}

function editCategory(categoryId, newCategoryName) {
    const value = newCategoryName.trim();
    if (value === "") return;

    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");

    const alreadyExist = categories.some(category => category.name.trim().toLowerCase() === value.trim().toLowerCase());

    if(alreadyExist){
        alert("This category already exist.")
        return;
    }

    for (let i = 0; i < categories.length; i++) {
        if (categories[i].id === categoryId) {
            categories[i].name = value;
            break;
        }
    }

    localStorage.setItem("Categories", JSON.stringify(categories));
    listCategories();
    renderTasks();
}

function deleteCategory(categoryId) {
    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].category === categoryId) {
            tasks[i].category = "default";
        }
    }

    const updatedCategories = categories.filter(category => category.id !== categoryId);

    localStorage.setItem("Tasks", JSON.stringify(tasks));
    localStorage.setItem("Categories", JSON.stringify(updatedCategories));

    if (filters.categoryId === categoryId) {
        filters.categoryId = "all";
    }

    listCategories();
    renderTasks();
}

function listCategories() {
    const allCategories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const categories = allCategories.filter(category => {

        if(filters.categorySearchText === "") return true;
        return category.name.toLowerCase().includes(filters.categorySearchText);
    });

    const categoryList = document.getElementById("categoryList");

    categoryList.innerHTML = "";

    for (let i = 0; i < categories.length; i++) {
        const li = document.createElement("li");

        if (filters.categoryId === categories[i].id) {
            li.classList.add("active-category");
        }

        const mainDiv = document.createElement("div");
        mainDiv.classList.add("item-main");

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("item-actions");

        const span = document.createElement("span");
        span.textContent = categories[i].name;
        span.classList.add("clickable-category");

        mainDiv.appendChild(span);
        li.appendChild(mainDiv);
        li.appendChild(actionsDiv);

        span.addEventListener("click", () => {
            filters.categoryId = categories[i].id;
            listCategories();
            renderTasks();
        });

        if (categories[i].id !== "default") {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            editButton.addEventListener("click", () => {
                const input = document.createElement("input");
                input.type = "text";
                input.value = categories[i].name;

                mainDiv.replaceChild(input, span);

                input.focus();
                input.select();

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        editCategory(categories[i].id, input.value);
                    }

                    if (event.key === "Escape") {
                        listCategories();
                    }
                });
            });

            deleteButton.addEventListener("click", () => {
                deleteCategory(categories[i].id);
            });

            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
        }

        categoryList.appendChild(li);
    }

    const allLi = document.createElement("li");
    const allSpan = document.createElement("span");
    allSpan.textContent = "All tasks";
    allSpan.classList.add("clickable-category");

    if (filters.categoryId === "all") {
        allLi.classList.add("active-category");
    }

    allLi.appendChild(allSpan);

    allLi.addEventListener("click", () => {
        clearAllFilters();
        syncFilterInputs();
        listCategories();
        renderTasks();
    });

    categoryList.appendChild(allLi);
}

function defaultCategory() {
    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const hasDefault = categories.some(category => category.id === "default");

    if (!hasDefault) {
        categories.unshift({
            id: "default",
            name: "General"
        });

        localStorage.setItem("Categories", JSON.stringify(categories));
    }
}

// ****************************************** TASKS ******************************************

function taskOperations() {
    const addQuickTaskButton = document.getElementById("addQuickTask");
    const taskInput = document.getElementById("taskInput");
    const dialog = document.getElementById("taskDialog");
    const addDetailedTaskButton = document.getElementById("addDetailedTask");
    const submitTaskButton = document.getElementById("submitTaskDialog");
    const cancelTaskButton = document.getElementById("cancelTaskDialog");
    const dialogTaskName = document.getElementById("dialogTaskName");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    startDateInput.addEventListener("change", () => {
        const today = getTodayString();

        if (startDateInput.value && startDateInput.value < today) {
            startDateInput.value = today;
        }

        endDateInput.min = startDateInput.value || today;

        if (endDateInput.value && startDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
        }
    });

    endDateInput.addEventListener("change", () => {
        const today = getTodayString();

        if (endDateInput.value && endDateInput.value < today) {
            endDateInput.value = today;
        }

        if (startDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
        }
    });

    addQuickTaskButton.addEventListener("click", (event) => {
        event.preventDefault();
        addQuickTask();
    });

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addQuickTask();
        }
    });

    addDetailedTaskButton.addEventListener("click", () => {
        const quickTaskValue = taskInput.value.trim();
        openTaskDialogForCreate();

        if(quickTaskValue !== ""){
            dialogTaskName.value = quickTaskValue;
            taskInput.value = "";
        }

    });

    submitTaskButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (editingTaskId) {
            updateDetailedTask(editingTaskId);
        } else {
            addDetailedTask(dialogTaskName.value);
        }
    });

    cancelTaskButton.addEventListener("click", () => {
        resetTaskDialog();
        dialog.close();
    });
}

function populateCategoryOptions(selectedCategoryId = "default") {
    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const categoryOptions = document.getElementById("categoryOptions");

    categoryOptions.innerHTML = "";

    for (let i = 0; i < categories.length; i++) {
        const option = document.createElement("option");
        option.value = categories[i].id;
        option.textContent = categories[i].name;

        if (categories[i].id === selectedCategoryId) {
            option.selected = true;
        }

        categoryOptions.appendChild(option);
    }
}

function openTaskDialogForCreate() {
    resetTaskDialog();
    applyDateInputLimits();
    document.getElementById("taskDialog").showModal();
}



function resetTaskDialog() {
    editingTaskId = null;
    document.getElementById("taskForm").reset();
    populateCategoryOptions("default");
    document.querySelector("#taskDialog h3").textContent = "Add detailed task";
    document.getElementById("submitTaskDialog").textContent = "Submit";
    applyDateInputLimits();
}

function openTaskDialogForEdit(taskId) {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const foundTask = tasks.find(task => task.id === taskId);

    if (!foundTask) return;

    editingTaskId = taskId;

    populateCategoryOptions(foundTask.category || "default");

    document.getElementById("dialogTaskName").value = foundTask.name || "";
    document.getElementById("startDate").value = foundTask.startDate || "";
    document.getElementById("endDate").value = foundTask.endDate || "";
    document.getElementById("priorityOptions").value = foundTask.priority || "unassigned";
    document.getElementById("categoryOptions").value = foundTask.category || "default";

    applyDateInputLimits();

    document.querySelector("#taskDialog h3").textContent = "Edit task";
    document.getElementById("submitTaskDialog").textContent = "Update";

    document.getElementById("taskDialog").showModal();

}

function addQuickTask() {
    const taskInput = document.getElementById("taskInput");
    const value = taskInput.value.trim();

    if (value === "") return;

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const newTask = {
        id: crypto.randomUUID(),
        name: value,
        category: filters.categoryId !== "all" ? filters.categoryId : "default",
        startDate: null,
        endDate: null,
        createdAt: new Date().toISOString(),
        priority: "unassigned",
        completed: false
    };

    tasks.unshift(newTask);
    localStorage.setItem("Tasks", JSON.stringify(tasks));

    taskInput.value = "";
    renderTasks();
}

function addDetailedTask(taskName) {
    const value = taskName.trim();
    if (value === "") return;

    const startDate = document.getElementById("startDate").value || null;
    const endDate = document.getElementById("endDate").value || null;
    const priority = document.getElementById("priorityOptions").value;
    const category = document.getElementById("categoryOptions").value;

    if (!validateTaskDates(startDate, endDate)) {
        return;
    }

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const newTask = {
        id: crypto.randomUUID(),
        name: value,
        category: category,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date().toISOString(),
        priority: priority,
        completed: false
    };

    tasks.unshift(newTask);
    localStorage.setItem("Tasks", JSON.stringify(tasks));

    resetTaskDialog();
    document.getElementById("taskDialog").close();

    renderTasks();
}

function updateDetailedTask(taskId) {
    const value = document.getElementById("dialogTaskName").value.trim();
    if (value === "") return;

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const foundTask = tasks.find(task => task.id === taskId);

    if (!foundTask) return;

    foundTask.name = value;
    foundTask.startDate = document.getElementById("startDate").value || null;
    foundTask.endDate = document.getElementById("endDate").value || null;
    foundTask.priority = document.getElementById("priorityOptions").value;
    foundTask.category = document.getElementById("categoryOptions").value;

    if (!validateTaskDates(startDate, endDate)) {
        return;
    }

    foundTask.name = value;
    foundTask.startDate = startDate;
    foundTask.endDate = endDate;
    foundTask.priority = priority;
    foundTask.category = category;

    localStorage.setItem("Tasks", JSON.stringify(tasks));

    resetTaskDialog();
    document.getElementById("taskDialog").close();
    renderTasks();
}

function deleteTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const updatedTasks = tasks.filter(task => task.id !== taskId);

    localStorage.setItem("Tasks", JSON.stringify(updatedTasks));
    renderTasks();
}

function editTask(taskId, newTaskName) {
    const value = newTaskName.trim();
    if (value === "") return;

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].name = value;
            break;
        }
    }

    localStorage.setItem("Tasks", JSON.stringify(tasks));
    renderTasks();
}

// ****************************************** FILTER / SORT / RENDER ******************************************

function filterOperations() {
    const searchBoxInput = document.getElementById("searchBox");
    const statusFilter = document.getElementById("statusFilter");
    const filterStartDate = document.getElementById("filterStartDate");
    const filterEndDate = document.getElementById("filterEndDate");

    searchBoxInput.addEventListener("input", () => {
        filters.searchText = searchBoxInput.value.toLowerCase().trim();
        renderTasks();
    });

    statusFilter.addEventListener("change", () => {
        filters.status = statusFilter.value;
        renderTasks();
    });

    filterStartDate.addEventListener("change", () => {
        filters.startDate = filterStartDate.value;
        renderTasks();
    });

    filterEndDate.addEventListener("change", () => {
        filters.endDate = filterEndDate.value;
        renderTasks();
    });
}

function sorting() {
    const sortingOptions = document.getElementById("sortingOptions");

    sortingOptions.addEventListener("change", () => {
        renderTasks();
    });
}

function clearAllFilters() {
    filters.categoryId = "all";
    filters.categorySearchText = "";
    filters.searchText = "";
    filters.status = "all";
    filters.startDate = "";
    filters.endDate = "";
}

function syncFilterInputs() {
    document.getElementById("categorySearchBox").value = "";    
    document.getElementById("searchBox").value = "";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("filterStartDate").value = "";
    document.getElementById("filterEndDate").value = "";
}

function getFilteredAndSortedTasks() {
    let tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    tasks = tasks.filter(task => {
        if (filters.categoryId !== "all" && task.category !== filters.categoryId) {
            return false;
        }

        if (
            filters.searchText !== "" &&
            !task.name.toLowerCase().includes(filters.searchText)
        ) {
            return false;
        }

        if (filters.status === "active" && task.completed !== false) {
            return false;
        }

        if (filters.status === "completed" && task.completed !== true) {
            return false;
        }

        if (filters.startDate || filters.endDate) {
            if (!task.endDate) return false;

            const taskEndDate = new Date(task.endDate);
            taskEndDate.setHours(0, 0, 0, 0);

            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                startDate.setHours(0, 0, 0, 0);

                if (taskEndDate < startDate) {
                    return false;
                }
            }

            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(0, 0, 0, 0);

                if (taskEndDate > endDate) {
                    return false;
                }
            }
        }

        return true;
    });

    const sortingValue = document.getElementById("sortingOptions").value;

    switch (sortingValue) {
        case "newest":
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;

        case "oldest":
            tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;

        case "nameAsc":
            tasks.sort((a, b) => a.name.localeCompare(b.name));
            break;

        case "nameDsc":
            tasks.sort((a, b) => b.name.localeCompare(a.name));
            break;

        case "byPriority":
            const priorityOrder = {
                high: 1,
                medium: 2,
                low: 3,
                unassigned: 4
            };

            tasks.sort((a, b) => {
                const priorityA = a.priority || "unassigned";
                const priorityB = b.priority || "unassigned";
                return priorityOrder[priorityA] - priorityOrder[priorityB];
            });
            break;
    }

    tasks.sort((a, b) => a.completed - b.completed);

    return tasks;
}

function renderTasks() {
    const tasks = getFilteredAndSortedTasks();
    listTask(tasks);
}

// ****************************************** TASK LIST ******************************************

function listTask(tasksParam = null) {
    const tasks = tasksParam || JSON.parse(localStorage.getItem("Tasks") || "[]");
    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.textContent = "No tasks found.";
        taskList.appendChild(emptyLi);
        return;
    }

    for (let i = 0; i < tasks.length; i++) {
        const li = document.createElement("li");

        const mainDiv = document.createElement("div");
        mainDiv.classList.add("item-main");

        const titleRow = document.createElement("div");
        titleRow.style.display = "flex";
        titleRow.style.alignItems = "center";
        titleRow.style.gap = "10px";

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("item-actions");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tasks[i].completed || false;

        const span = document.createElement("span");
        span.textContent = tasks[i].name;

        titleRow.appendChild(checkbox);
        titleRow.appendChild(span);
        mainDiv.appendChild(titleRow);

        const foundCategory = categories.find(category => category.id === tasks[i].category);

        const details = document.createElement("small");
        details.textContent =
            ` Category: ${foundCategory ? foundCategory.name : "Unknown"} | ` +
            `Priority: ${tasks[i].priority || "unassigned"} | ` +
            `Start: ${tasks[i].startDate || "-"} | ` +
            `Deadline: ${tasks[i].endDate || "-"}`;

        const status = taskTimeControl(tasks[i]);

        if (status === "expired") {
            li.classList.add("expired-task");
        } else if (status === "approaching") {
            li.classList.add("approaching-task");
        }

        if (tasks[i].completed) {
            li.classList.add("completed-task");
        }

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(tasks[i].id);
        });

        editButton.addEventListener("click", () => {
            openTaskDialogForEdit(tasks[i].id);
        });

        span.addEventListener("dblclick", () => {
            openTaskDialogForEdit(tasks[i].id);
        });

        checkbox.addEventListener("change", (event) => {
            const allTasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
            const foundTask = allTasks.find(task => task.id === tasks[i].id);

            if (!foundTask) return;

            foundTask.completed = event.target.checked;

            localStorage.setItem("Tasks", JSON.stringify(allTasks));
            renderTasks();
        });

        mainDiv.appendChild(details);
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        li.appendChild(mainDiv);
        li.appendChild(actionsDiv);

        taskList.appendChild(li);
    }
}

// ****************************************** DATE STATUS ******************************************

function taskTimeControl(task) {
    if (!task.endDate) return "normal";

    const today = new Date();
    const endDate = new Date(task.endDate);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diff = endDate.getTime() - today.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < 0) {
        return "expired";
    }

    if (diff <= oneDay) {
        return "approaching";
    }

    return "normal";
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function applyDateInputLimits() {
    const today = getTodayString();

    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    startDateInput.min = today;
    endDateInput.min = today;

    if (startDateInput.value) {
        endDateInput.min = startDateInput.value;
    }
}

function validateTaskDates(startDate, endDate) {
    const today = getTodayString();

    if (startDate && startDate < today) {
        alert("Start date cannot be earlier than today.");
        return false;
    }

    if (endDate && endDate < today) {
        alert("Deadline cannot be earlier than today.");
        return false;
    }

    if (startDate && endDate && endDate < startDate) {
        alert("Deadline cannot be earlier than start date.");
        return false;
    }

    return true;
}