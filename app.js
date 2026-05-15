let state = {
    categories: []
};

let modalCallback = null;
let confirmCallback = null;

function saveState() {
    localStorage.setItem("habit-state", JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem("habit-state");
    if (stored) state = JSON.parse(stored);
}

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
    openConfirm(() => {
        const categoryEl = document.querySelector(`.category[data-id="${id}"]`)
            state.categories = state.categories.filter(category => category.id !== id);
            render();
            saveState();
        });
}

function openConfirm(callback) {
    confirmCallback = callback;
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




function openModal(heading, color, callback) {
    modalCallback = callback;

    document.querySelector("#modal-heading").textContent = heading;
    document.querySelector("#modal-input").value = "";

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
        <h2 class="category-name">${category.name}</h2>
        <button class="delete-btn">✕</button>
        `;
        div.querySelector(".delete-btn").addEventListener("click", () => {
            deleteCategory(category.id);
        });

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
});