let state = {
    colorIndex: 0,
    categories: []
};

let modalCallback = null;
let confirmCallback = null;
let isFirstRender = true;

//////////////// STATE ////////////////////////////

function saveState() {
    localStorage.setItem("habit-state", JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem("habit-state");
    if (stored) state = JSON.parse(stored);
}

///////////// CATEGORY FUNCTIONALITY ////////////////////////

function addCategory() {
    const colors = ["red", "green", "blue", "purple", "yellow"];
    const color = colors[state.colorIndex % colors.length];

    openModal("Add Category", color, (name) => {
        const newId = Date.now();
        state.categories.push({
            id: newId,
            name: name,
            color: color,
            habits: []
        });
        state.colorIndex++;
        render();
        saveState();

        const newCategoryEl = document.querySelector(`.category[data-id="${newId}"]`)
        if (newCategoryEl) {
            newCategoryEl.classList.add("pop-in");
            newCategoryEl.addEventListener("animationend", () => {
                newCategoryEl.classList.remove("pop-in");
            }, {once: true});
        }
    });
}

function deleteCategory(id) {
    openConfirm("Delete this category?", () => {
        const categoryEl = document.querySelector(`.category[data-id="${id}"]`)
        if (categoryEl) {
            categoryEl.classList.add("pop-out");
            setTimeout(() => {
                state.categories = state.categories.filter(category => category.id !== id);
                render();
                saveState();
            }, 250);
        }
    });
}

/////////// CONFIRM MODAL //////////////////////////

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
    overlay.classList.add("closing");

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("closing");
        confirmCallback = null;
    }, 300);

} 

////////////////////// HABIT /////////////////////////////
function addHabit(categoryId) {
    const category = state.categories.find(c => c.id === categoryId)
    if (!category) return;

    openModal("Add Habit", category.color, (name) => {
        const newId = Date.now();

        category.habits.push({
            id: newId,
            name: name,
            completions: []
        });

        render();
        saveState();

        const newHabitEl = document.querySelector(`.category[data-id="${categoryId}"] .habit-row[data-id="${newId}"]`
        );
        if (newHabitEl) {
            newHabitEl.classList.add("pop-in");
            newHabitEl.addEventListener("animationend", () => {
                newHabitEl.classList.remove("pop-in");
            }, {once: true});
        }
    });
}

function deleteHabit(categoryId, habitId) {
    openConfirm("Delete this habit?", () => {
        const category = state.categories.find(c => c.id === categoryId);
        if (!category) return;

        const habitEl = document.querySelector(
            `.category[data-id="${categoryId}"] .habit-row[data-id="${habitId}"]`
        );

        const removeHabit = () => {
            category.habits = category.habits.filter(h => h.id !== habitId);
            render();
            saveState();
        };

        if (habitEl) {
            habitEl.classList.add("pop-out");
            habitEl.addEventListener("animationend", removeHabit, { once: true });
        } else {
            removeHabit();
        }
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

    const completed = category.habits.filter(h => h.completions.includes(today)).length;
    const total = category.habits.length;
    const percentage = total === 0 ? 0 : (completed/total) * 100;
    const fill = document.querySelector(`.category[data-id="${categoryId}"] .progress-bar-fill`);
    fill.style.width = `${percentage}%`;
    console.log(fill);
    saveState();

    let streak = 0;
    if (habit.completions.includes(today)) streak ++;

    let date = new Date();
    date.setDate(date.getDate() - 1);
    while (true) {
        const dateStr = date.toISOString().split('T')[0];
        if (habit.completions.includes(dateStr)) {
            streak ++;
            date.setDate(date.getDate() - 1);
        } else { break; }
    }
    const habitEl = document.querySelector(`.category[data-id="${categoryId}"] .habit-row[data-id="${habitId}"] .habit-streak`);
    habitEl.textContent = `🔥 ${streak}`;
}

////////////////// MODAL ///////////////////////////

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
    overlay.classList.add("closing");
    modalCallback = null;

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("closing");
        modalCallback = null;
    }, 300);
}

//////////////// DARK MODE ////////////////////////////////
function darkMode() {
    const toggle = document.querySelector("#theme-toggle");
    if (toggle.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        document. documentElement.removeAttribute("data-theme");
        localStorage.removeItem("theme");
    }
}

document.querySelector("#theme-toggle").addEventListener("change", darkMode);



function render() {
    const board = document.querySelector("#board");
    board.innerHTML = "";
    if (state.categories.length === 0) {
        board.innerHTML = `
        <div class="empty-state">
            <p>No categories yet...</p>
            <p> How about adding one below?</p>
        </div>
        `;
        return;
    }

    state.categories.forEach((category, index) => {
        const div = document.createElement("div");

        div.classList.add("category");
        div.setAttribute("data-color", category.color);
        div.dataset.id = category.id;

        div.innerHTML = `
            <div class="category-header">
                <h2 class="category-name">${category.name}</h2>
                <button class="delete-btn"><i data-lucide="trash-2"></i></button>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill"></div>
            </div>
            <div class="habits-list">
                ${category.habits.length === 0
                    ? `<p class="empty-habits">No habits yet..</p>`
                    : category.habits.map(habit => {
                        // calculate streak before building HTML
                        let streak = 0;
                        const today = new Date().toISOString().split("T")[0];
                        if (habit.completions.includes(today)) streak++;

                        let date = new Date();
                        date.setDate(date.getDate() - 1);
                        while (true) {
                            const dateStr = date.toISOString().split("T")[0];
                            if (habit.completions.includes(dateStr)) {
                                streak++;
                                date.setDate(date.getDate() - 1);
                            } else { break; }
                        }

                        return `
                            <div class="habit-row" data-id="${habit.id}">
                                <input type="checkbox" class="habit-checkbox">
                                <span class="habit-name">${habit.name}</span>
                                <span class="habit-streak">🔥 ${streak}</span>
                                <button class="delete-habit-btn">✕</button>
                            </div>
                        `;
                    }).join("")}
            </div>
            <button class="add-habit-btn">+ Add habit</button>
        `;

        // progress bar
        const today = new Date().toISOString().split("T")[0];
        const completed = category.habits.filter(h => h.completions.includes(today)).length;
        const total = category.habits.length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        const fill = div.querySelector(".progress-bar-fill");
        if (isFirstRender) {
            fill.style.width = "0%";
            setTimeout(() => {
                fill.style.width = `${percentage}%`;
            }, 50);
        } else {
            fill.style.width = `${percentage}%`;
        }

        // event listeners
        div.querySelector(".delete-btn").addEventListener("click", () => {
            deleteCategory(category.id);
        });

        div.querySelector(".add-habit-btn").addEventListener("click", () => {
            addHabit(category.id);
        });

        div.querySelectorAll(".habit-checkbox").forEach((chkbx, index) => {
            chkbx.checked = category.habits[index].completions.includes(today);
            chkbx.addEventListener("click", () => {
                toggleHabit(category.id, category.habits[index].id);
            });
        });

        div.querySelectorAll(".delete-habit-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => {
                deleteHabit(category.id, category.habits[index].id);
            });
        });

        if (isFirstRender) {
            div.style.animationName = "fadeInDown";
            div.style.animationDuration = "0.8s";
            div.style.animationTimingFunction = "ease";
            div.style.animationFillMode = "both";
            div.style.animationDelay = `${index * 0.2}s`;
        }
        board.appendChild(div);
    });
    isFirstRender = false;
    lucide.createIcons();
}
//////////// DOM CONTENT RELOAD /////////////////////////
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