document.addEventListener(`DOMContentLoaded`, () => {
    defaultCategory();
    categoryOperations();
    taskOperations();
    sorting();
    taskTimeControl();
    search();

})


// ****************************************** CATEGORIES ******************************************
function categoryOperations() {
    listCategories();

    const addCategoryButton = document.getElementById("addCategoryButton")
    const dialog = document.getElementById("categoryDialog")
    const submitButtonDialog = document.getElementById("submitDialog")
    const cancelDialogButton = document.getElementById("cancelDialog")
    const dialogCategoryName = document.getElementById("dialogCategoryName")

    addCategoryButton.addEventListener("click", () => dialog.showModal());

    submitButtonDialog.addEventListener("click", (event) => {
        event.preventDefault();
        addCategory(dialogCategoryName.value);
        dialogCategoryName.value = ``;
        dialog.close();
    })

    cancelDialogButton.addEventListener(`click`, () => {
        dialogCategoryName.value = ``;
        dialog.close();
    })

}

function addCategory(categoryName) {

    const value = categoryName.trim();

    if (value === "") return;

    const categories = JSON.parse(localStorage.getItem(`Categories`) || `[]`);

    const newCategory = {
        id: crypto.randomUUID(),
        name: value
    };

    categories.unshift(newCategory);
    localStorage.setItem(`Categories`, JSON.stringify(categories));
    listCategories();

}

function editCategory(categoryId, newCategoryName) {
    const value = newCategoryName.trim();
    if (value === "") return;

    const categories = JSON.parse(localStorage.getItem(("Categories") || "[]"));

    for (let i = 0; i < categories.length; i++) {
        if (categories[i].id == categoryId) {
            categories[i].name = value;
        }
    }

    localStorage.setItem("Categories", JSON.stringify(categories));
    listCategories();
}

function deleteCategory(categoryId) {
    const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].category == categoryId) {
            tasks[i].category = "default"
        }
    }

    const updatedCategories = categories.filter(categories => categories.id !== categoryId);
    localStorage.setItem("Tasks", JSON.stringify(tasks));
    localStorage.setItem("Categories", JSON.stringify(updatedCategories));
    listCategories();
    listTask();

}

function listCategories() {
    const categories = JSON.parse(localStorage.getItem(`Categories`) || `[]`);
    const categoryList = document.getElementById("categoryList")

    categoryList.innerHTML = "";

    if (categories.length > 0) {
        for (let i = 0; i < categories.length; i++) {
            const li = document.createElement(`li`);

            const span = document.createElement(`span`);
            span.textContent = categories[i].name
            span.classList.add("clickable-category");

            li.appendChild(span);

            span.addEventListener("click", () => {
                filterTasksByCategory(categories[i].id);
            })

            if (categories[i].id !== "default") {
                const editButton = document.createElement(`button`);
                editButton.textContent = `Edit`;


                const deleteButton = document.createElement(`button`);
                deleteButton.textContent = `Delete`;

                editButton.addEventListener("click", () => {
                    const input = document.createElement("input")
                    input.type = "text";
                    input.value = categories[i].name;

                    li.replaceChild(input, span);

                    input.focus();
                    input.select();

                    input.addEventListener("keydown", (event) => {
                        if (event.key === "Enter") {
                            editCategory(categories[i].id, input.value);
                        }

                        if (event.key === "Escape") {
                            listCategories();
                        };

                    });

                });

                deleteButton.addEventListener('click', () => {
                    deleteCategory(categories[i].id);
                });



                li.appendChild(editButton);
                li.appendChild(deleteButton);
            }
            categoryList.appendChild(li)
        }
    }

    const allLi = document.createElement("li");
    const allSpan = document.createElement("span");
    allSpan.textContent = "All tasks";
    allLi.appendChild(allSpan);

    allLi.addEventListener("click", () => {
        listTask();
    });

    categoryList.appendChild(allLi);
}

function filterTasksByCategory(categoryId) {
    const tasks = JSON.parse(localStorage.getItem("Tasks"), "[]");
    const filteredTasks = tasks.filter(task => task.category === categoryId);
    listTask(filteredTasks);
}

function defaultCategory() {
    const categories = JSON.parse(localStorage.getItem(`Categories`) || `[]`);

    const hasDefault = categories.some(category => category.id === `default`);

    if (!hasDefault) {
        categories.unshift({
            id: `default`,
            name: `Quick`
        });

        localStorage.setItem(`Categories`, JSON.stringify(categories));
    }
}

// ****************************************** TASKS ******************************************

function taskOperations() {
    listTask();
    const addQuickTaskButton = document.getElementById("addQuickTask");
    const dialog = document.getElementById("taskDialog");
    const addDetailedTaskButton = document.getElementById("addDetailedTask");
    const submitTaskButton = document.getElementById("submitTaskDialog");
    const cancelTaskButton = document.getElementById("cancelTaskDialog");
    const dialogTaskName = document.getElementById("dialogTaskName");

    addQuickTaskButton.addEventListener("click", (event) => {
        event.preventDefault();
        addQuickTask();
    })

    addDetailedTaskButton.addEventListener("click", () => {
        const categories = JSON.parse(localStorage.getItem("Categories") || "[]");
        const categoryOptions = document.getElementById("categoryOptions");

        categoryOptions.innerHTML = "";

        for (let i = 0; i < categories.length; i++) {
            const option = document.createElement("option");
            option.value = categories[i].id;
            option.textContent = categories[i].name;
            categoryOptions.appendChild(option);
        }
        dialog.showModal();
    });

    submitTaskButton.addEventListener("click", (event) => {
        event.preventDefault();
        addDetailedTask(dialogTaskName.value);
        dialogTaskName.value = "";
        dialog.close();
    })


    cancelTaskButton.addEventListener("click", () => {
        dialogTaskName.value = "";
        dialog.close();
    })


}

function addQuickTask() {
    const taskInput = document.getElementById("taskInput");

    const value = taskInput.value.trim();
    if (value == "") return;

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const newTask = {
        id: crypto.randomUUID(),
        name: value,
        category: "default",
        startDate: null,
        endDate: null,
        createdAt: new Date().toISOString(),
        priority: null,
        completed: false,
    }

    tasks.unshift(newTask);
    localStorage.setItem("Tasks", JSON.stringify(tasks));
    listTask();

    taskInput.value = "";

}

function addDetailedTask(taskName) {

    const startDate = document.getElementById("startDate").value
    const endDate = document.getElementById("endDate").value
    const priority = document.getElementById("priorityOptions").value
    const category = document.getElementById("categoryOptions").value

    console.log("category", category)


    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const newTask = {
        id: crypto.randomUUID(),
        name: taskName,
        category: category,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date().toISOString(),
        priority: priority,
        completed: false,
    }

    tasks.unshift(newTask);
    localStorage.setItem("Tasks", JSON.stringify(tasks));
    listTask();

    document.getElementById("taskForm").reset();

}

function deleteTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const updatedTasks = tasks.filter(task => task.id !== taskId);

    localStorage.setItem("Tasks", JSON.stringify(updatedTasks));
    listTask();

}

function editTask(taskId, newTaskName) {
    const value = newTaskName.trim();
    if (value == "") return;

    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].name = value;
            break;
        }
    }

    localStorage.setItem("Tasks", JSON.stringify(tasks));
    listTask();
}


function listTask(tasksParam = null) {
    const tasks = tasksParam || JSON.parse(localStorage.getItem("Tasks") || "[]");
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = tasks[i].completed || false;

            const span = document.createElement("span");
            span.textContent = tasks[i].name;

            const status = taskTimeControl(tasks[i]);
            console.log(status);

            if (status == "expired") {
                li.classList.add("expired-task");
            }
            else if (status == "approaching") {
                li.classList.add("approaching-task");
            }

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener('click', () => {
                deleteTask(tasks[i].id);
            });

            editButton.addEventListener("click", () => {
                const input = document.createElement("input")
                input.type = "text";
                input.value = tasks[i].name;

                li.replaceChild(input, span);

                input.focus();
                input.select();

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        editTask(tasks[i].id, input.value);
                    }

                    if (event.key === "Escape") {
                        listTask();
                    };

                });

            });

            span.addEventListener("dblclick", () => {
                const input = document.createElement("input")
                input.type = "text";
                input.value = tasks[i].name;

                li.replaceChild(input, span);

                input.focus();
                input.select();

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        editTask(tasks[i].id, input.value);
                    }

                    if (event.key === "Escape") {
                        listTask();
                    }
                })
            });

            checkbox.addEventListener("change", (event) => {
                if (event.target.checked) {
                    tasks[i].completed = true;
                }

                else {
                    tasks[i].completed = false;
                }

                localStorage.setItem("Tasks", JSON.stringify(tasks));

            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            taskList.appendChild(li);

        }
    }
}

function sorting() {
    const sortingOptions = document.getElementById("sortingOptions");

    sortingOptions.addEventListener("change", () => {

        const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
        const categories = JSON.parse(localStorage.getItem("Categories") || "[]");

        switch (sortingOptions.value) {
            case "newest":
                tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                console.log(tasks);
                break;

            case "oldest":
                tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                console.log(tasks);
                break;

            case "nameAsc":
                tasks.sort((a, b) => a.name.localeCompare(b.name));
                break;

            case "nameDsc":
                tasks.sort((a, b) => b.name.localeCompare(a.name));
                break;

            case "byPriority":

                for (let i = 0; i < tasks.length; i++) {
                    if (tasks[i].priority === null) {
                        tasks[i].priority = "unassigned"
                    }
                }

                const priorityOrder = {
                    high: 1,
                    medium: 2,
                    low: 3,
                    unassigned: 4
                };

                tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;

            case "byCompletion":
                tasks.sort((a, b) => a.completed - b.completed)
                break;
        }

        localStorage.setItem("Tasks", JSON.stringify(tasks));
        listTask(tasks);
    })
}

function taskTimeControl(task) {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const now = Date.now();
    const oneDayLater = now + 24 * 60 * 60 * 1000;


    for (let i = 0; i < tasks.length; i++) {
        const endDate = new Date(tasks[i].endDate).getTime();
        if (endDate < now) {
            return "expired";
        }

        if (endDate >= now && oneDayLater <= endDate) {
            return "approaching";
        }
    }

    return "normal";
}

function search() {
    const searchBoxInput = document.getElementById("searchBox")

    searchBoxInput.addEventListener("input", () => {
        const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
        const value = searchBoxInput.value.toLowerCase().trim();

        if (value === "") {
            listTask();
            return;
        }

        const searchedTask = tasks.filter(item => item.name.toLowerCase().includes(value));

        console.log(search);

        listTask(searchedTask);

    })
}
