// Стан користувача
let currentUser = null;
const API_URL = "http://localhost:3000/api";

// =======================
// Керування модалками
// =======================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function switchToRegister() {
  closeModal("loginModal");
  setTimeout(() => openModal("registerModal"), 300);
}

function switchToLogin() {
  closeModal("registerModal");
  setTimeout(() => openModal("loginModal"), 300);
}

// =======================
// Авторизація та реєстрація
// =======================
async function handleModalLogin() {
  const login = document.getElementById("modalLoginInput").value.trim();
  const password = document.getElementById("modalPasswordInput").value.trim();

  if (!login || !password) {
    alert("Заповніть, будь ласка, логін і пароль.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const result = await response.json();

    if (response.ok) {
      currentUser = result.user;
      showUserInfo();
      closeModal("loginModal");
      alert(`Ласкаво просимо, ${login}!`);
    } else {
      alert(result.error || "Сталася помилка під час авторизації.");
    }
  } catch (error) {
    alert("Не вдалося виконати запит. Спробуйте пізніше.");
  }
}

async function handleModalRegister() {
  const login = document.getElementById("modalRegisterLogin").value.trim();
  const password = document.getElementById("modalRegisterPassword").value.trim();
  const passwordConfirm = document
    .getElementById("modalRegisterPasswordConfirm")
    .value.trim();

  if (!login || !password) {
    alert("Заповніть, будь ласка, усі поля.");
    return;
  }

  if (password !== passwordConfirm) {
    alert("Паролі не збігаються.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Sing Up успішна! Тепер увійдіть до акаунта.");
      closeModal("registerModal");
      setTimeout(() => openModal("loginModal"), 300);
    } else {
      alert(result.error || "Сталася помилка під час реєстрації.");
    }
  } catch (error) {
    alert("Не вдалося виконати запит. Спробуйте пізніше.");
  }
}

// =======================
// Відображення стану у навігації
// =======================
function showUserInfo() {
  const authBlock = document.querySelector(".auth-block");
  if (!authBlock) return;

  authBlock.innerHTML = `
    <div class="user-info">
      <span>Вітаємо, ${currentUser.login}</span>
      <button class="logout-btn" onclick="handleLogout()">Вийти</button>
    </div>
  `;
  authBlock.style.cursor = "default";
  authBlock.removeAttribute("tabindex");
  authBlock.onclick = null;
  authBlock.onkeydown = null;
}

function handleLogout() {
  currentUser = null;
  showAuthButtons();
  alert("Ви вийшли з акаунта.");
}

function showAuthButtons() {
  const authBlock = document.querySelector(".auth-block");
  if (!authBlock) return;

  authBlock.innerHTML = `
    <div class="auth-text">Керування акаунтом</div>
    <div class="auth-actions">
      <button class="auth-actions__btn auth-actions__btn--primary" type="button" onclick="openModal('loginModal')">
        Sing In
      </button>
      <button class="auth-actions__btn" type="button" onclick="openModal('registerModal')">
        Sing Up
      </button>
    </div>
  `;

  authBlock.style.cursor = "default";
  authBlock.removeAttribute("tabindex");
  authBlock.onclick = null;
  authBlock.onkeydown = null;
}

// =======================
// Ініціалізація
// =======================
document.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    showUserInfo();
  } else {
    showAuthButtons();
  }
});

// =======================
// Глобальні експорти
// =======================
window.openModal = openModal;
window.closeModal = closeModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.handleModalLogin = handleModalLogin;
window.handleModalRegister = handleModalRegister;
window.handleLogout = handleLogout;
window.openRegisterModal = function (event) {
  if (event) {
    event.preventDefault();
  }
  openModal("registerModal");
};
