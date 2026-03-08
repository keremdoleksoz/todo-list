document.addEventListener(`DOMContentLoaded`, () => {
    defaultCategory();
    categoryOperations();
})



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

}

function deleteCategory(categoryId) {

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
