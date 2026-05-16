let state = {
    categories: []
};

let modalCallback = null;
let confirmCallback = null;

////////////////* STATE *////////////////////////////

function saveState() {
    localStorage.setItem("habit-state", JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem("habit-state");
    if (stored) state = JSON.parse(stored);
}

/////////////* CATEGORY FUNCTIONALITY *////////////////////////

function addCategory() {
    const colors = ["red", "green", "blue", "purple", "yellow"];
    const color = colors[state.categories.length % colors.length];

    openModal("Add Category", color, (name) => {
        state.categories.push({
            id: Date.now(),
            name: name,
            color: color,
            habits: []
        });
        console.log(state.categories);

        render();
        saveState();
    });
}

function deleteCategory(id) {
    openConfirm("Delete this category?", () => {
        const categoryEl = document.querySelector(`.category[data-id="${id}"]`)
            state.categories = state.categories.filter(category => category.id !== id);
            render();
            saveState();
        });
}

///////////* CONFIRM MODAL *//////////////////////////

function openConfirm(heading, callback) {
    confirmCallback = callback;
    document.querySelector("#confirm-heading").textContent = heading;
    const overlay = document.querySelector("#confirm-overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("open");
}

function closeConfirm() {
    const overlay = document.querySelector("#confirm-overlay");
    overlay.classList.remove("open");
    overlay.classList.add("hidden");
    confirmCallback = null;

} 

//////////////////////* HABIT */////////////////////////////
function addHabit(categoryId) {
    const category = state.categories.find(c => c.id === categoryId)

    openModal("Add Habit", category.color, (name) => {
        category.habits.push({
            id: Date.now(),
            name: name,
            completions: []
        });
        render();
        saveState();
    });
}

function deleteHabit(categoryId, habitId) {
    openConfirm("Delete this habit?", () => {
        const category = state.categories.find(c => c.id === categoryId);
        category.habits = category.habits.filter(h => h.id !== habitId);
        render();
        saveState();
    });
}

function toggleHabit(categoryId, habitId) {
    const today = new Date().toISOString().split("T")[0];
    const category = state.categories.find(c => c.id === categoryId);
    const habit = category.habits.find(h => h.id === habitId);


    if (habit.completions.includes(today)) {
        habit.completions = habit.completions.filter(d => d !== today);
    } else {
        habit.completions.push(today);
    }
    render();
    saveState();
}

//////////////////* MODAL *///////////////////////////

function openModal(heading, color, callback) {
    modalCallback = callback;

    document.querySelector("#modal-heading").textContent = heading;
    document.querySelector("#modal-input").value = "";
    document.querySelector("#modal-input").placeholder = `e.g. ${heading}`

    const overlay = document.querySelector("#modal-overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("open");
    document.querySelector("#modal-input").focus();
    const accentMap = {
        red: "#e84040",
        green: "#2ecc71",
        blue: "#4a90e2",
        purple: "#9b59b6",
        yellow: "#f5a623"
    };
    const hex = accentMap[color];
    document.querySelector("#modal-save").style.background = hex;
    document.querySelector("#modal-input").style.setProperty("--focus-color", hex);
}

function closeModal() {
    const overlay = document.querySelector("#modal-overlay");
    overlay.classList.remove("open");
    overlay.classList.add("hidden");
    modalCallback = null;
}

function render() {
    const board = document.querySelector("#board");
    board.innerHTML = ""
    state.categories.forEach(category => {
        const div = document.createElement("div");
        div.classList.add("category");
        div.setAttribute("data-color", category.color);
        div.dataset.id = category.id
        div.innerHTML = `
        <div class="category-header">
            <h2 class="category-name">${category.name}</h2>
            <button class="delete-btn">✕</button>
        </div>
        <div class="habits-list">
            ${category.habits.map(habit => `
                    <div class="habit-row">
                    <input type="checkbox" class="habit-checkbox">
                    <span class="habit-name">${habit.name}</span>
                    <button class="delete-habit-btn">✕</button>
                </div>
            `).join("")}
        </div>
        <button class="add-habit-btn">+ Add habit</button>
        `;
        div.querySelector(".delete-btn").addEventListener("click", () => {
            deleteCategory(category.id);
        });
        div.querySelector(".add-habit-btn").addEventListener("click", () =>{
            addHabit(category.id);
        });
        div.querySelectorAll(".delete-habit-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => {
                deleteHabit(category.id, category.habits[index].id);
            });
        });
        div.querySelectorAll(".habit-checkbox").forEach((chkbx, index) => {
            chkbx.addEventListener("click", () => {
                toggleHabit(category.id, category.habits[index].id);
            })
            const today = new Date().toISOString().split("T")[0];
            chkbx.checked = category.habits[index].completions.includes(today); 
        })

        board.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadState();
    render();

    document.querySelector("#header-category").addEventListener("click", addCategory);
    document.querySelector("#modal-cancel").addEventListener("click", closeModal);
    document.querySelector("#modal-save").addEventListener("click", () => {
        const input = document.querySelector("#modal-input").value.trim();
        if (!input) {
            document.querySelector("#modal-input").focus();
            return;
        }
        if (modalCallback) modalCallback(input);
        closeModal();
    });

    document.querySelector("#confirm-cancel").addEventListener("click", closeConfirm);
    document.querySelector("#confirm-delete").addEventListener("click", () => {
        if (confirmCallback) confirmCallback();
        closeConfirm();
    });
    document.querySelector("")
});