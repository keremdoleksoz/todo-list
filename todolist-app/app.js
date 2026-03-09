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

function taskOperations(){
    listTask();
    const addQuickTaskButton = document.getElementById("addQuickTask");

    addQuickTaskButton.addEventListener("click", (event) => {
        event.preventDefault();
        addQuickTask();
    })
}

function addQuickTask() {
    const taskInput = document.getElementById("taskInput");

        const value = taskInput.value.trim();
        if(value == "") return;

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


function listTask(){
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if(tasks.length > 0){
        for(let i=0; i<tasks.length; i++){
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            const span = document.createElement("span");
            span.textContent = tasks[i].name;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            taskList.appendChild(li);
           
        }
    }
}
