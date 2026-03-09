document.addEventListener(`DOMContentLoaded`, () => {
    defaultCategory();
    categoryOperations();
    taskOperations();
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

    categories.push(newCategory);
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

function deleteCategory(categoryId) { // UNFINISHED
    const categories = JSON.parse(localStorage.getItem(("Categories") || "[]"));

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

            const editButton = document.createElement(`button`);
            editButton.textContent = `Edit`;

            const deleteButton = document.createElement(`button`);
            deleteButton.textContent = `Delete`;

            editButton.addEventListener(`click`, () => {
                const newName = prompt("Add new category name", categories[i].name);
                if (newName != null) {
                    editCategory(categories[i].id, newName);
                }

            });

            deleteButton.addEventListener('click', () => {
                deleteCategory(categories[i].id);
            });


            li.appendChild(span);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            categoryList.appendChild(li)
        }
    }
}

function defaultCategory() {
    const categories = JSON.parse(localStorage.getItem(`Categories`) || `[]`);

    const hasDefault = categories.some(category => category.id === `default`);

    if (!hasDefault) {
        categories.unshift({
            id: `default`,
            name: `Default`
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

    tasks.push(newTask);
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

    tasks.push(newTask);
    localStorage.setItem("Tasks", JSON.stringify(tasks));
    listTask();

    document.getElementById("taskForm").reset();

}

function deleteTask(taskId){
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const updatedTasks = tasks.filter(task => task.id !== taskId);

    localStorage.setItem("Tasks", JSON.stringify(updatedTasks));
    listTask();

}

function listTask() {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            const span = document.createElement("span");
            span.textContent = tasks[i].name;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

             deleteButton.addEventListener('click', () => {
                deleteTask(tasks[i].id);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            taskList.appendChild(li);

        }
    }
}
