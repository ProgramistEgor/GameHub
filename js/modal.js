import { translations } from "./languages.js";
import { applyLanguage } from "./localization.js";
import { showNotification } from "./notifications.js";

let currentUser = null;
const API_URL = "http://localhost:3000/api";
const STORAGE_KEY = "gameHubUser";

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

// --- LOGIN ---
async function handleModalLogin(event) {
  event.preventDefault();
  const loginInput = document.getElementById("modalLoginInput");
  const passwordInput = document.getElementById("modalPasswordInput");
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const lang = localStorage.getItem("gameHubLang") || "uk"; // Отримуємо мову
  
  if (!login || !password) return;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });
    const result = await response.json();
    
    if (response.ok) {
      currentUser = result.user;
      localStorage.setItem(STORAGE_KEY, currentUser.login);
      
      showUserInfo();
      closeModal("loginModal");
      
      loginInput.value = "";
      passwordInput.value = "";
      
      if (window.location.pathname.includes("favorites.html")) {
          location.reload();
      } else {
          const welcomeText = translations[lang]["modal.welcome"];
          showNotification(`${welcomeText} ${login}!`, 'success');
      }
    } else {
      // Використовуємо переклад помилки або дефолтну з сервера
      const errText = translations[lang]["notify.login_error"];
      showNotification(result.error || errText, 'error');
    }
  } catch (error) { 
      const errText = translations[lang]["notify.server_error"];
      showNotification(errText, 'error'); 
  }
}

// --- REGISTER ---
async function handleModalRegister(event) {
  event.preventDefault();
  const loginInput = document.getElementById("modalRegisterLogin");
  const passwordInput = document.getElementById("modalRegisterPassword");
  const passwordConfirmInput = document.getElementById("modalRegisterPasswordConfirm");
  const lang = localStorage.getItem("gameHubLang") || "uk";
  
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const passwordConfirm = passwordConfirmInput.value.trim();

  if (password !== passwordConfirm) {
      showNotification(translations[lang]["notify.pass_mismatch"], 'error');
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
      showNotification(translations[lang]["modal.success_reg"], 'success');
      closeModal("registerModal");
      loginInput.value = "";
      passwordInput.value = "";
      passwordConfirmInput.value = "";
      setTimeout(() => openModal("loginModal"), 300);
    } else {
      const errText = translations[lang]["notify.reg_error"];
      showNotification(result.error || errText, 'error');
    }
  } catch (error) { 
      const errText = translations[lang]["notify.server_error"];
      showNotification(errText, 'error'); 
  }
}

function showUserInfo() {
  const authBlock = document.querySelector(".auth-block");
  if (!authBlock || !currentUser) return;
  authBlock.innerHTML = `<div class="user-info"><span data-i18n="nav.welcome">Вітаємо,</span> <b>${currentUser.login}</b><button class="logout-btn" onclick="handleLogout()" data-i18n="nav.logout">Вийти</button></div>`;
  authBlock.onclick = null;
  const lang = localStorage.getItem("gameHubLang") || "uk";
  applyLanguage(lang);
}

function showAuthButtons() {
  const authBlock = document.querySelector(".auth-block");
  if (!authBlock) return;
  authBlock.innerHTML = `<div class="auth-text" data-i18n="nav.auth_manage">Керування акаунтом</div><div class="auth-actions"><button class="auth-actions__btn auth-actions__btn--primary" type="button" onclick="openModal('loginModal')" data-i18n="nav.signin">Sign In</button><button class="auth-actions__btn" type="button" onclick="openModal('registerModal')" data-i18n="nav.signup">Sign Up</button></div>`;
  const lang = localStorage.getItem("gameHubLang") || "uk";
  applyLanguage(lang);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEY);
  showAuthButtons();
  
  if (window.location.pathname.includes("favorites.html")) {
      location.reload();
  } else {
      const lang = localStorage.getItem("gameHubLang") || "uk";
      showNotification(translations[lang]["notify.logout"], 'info');
  }
}

function initFormValidation() {
  const loginAllowedPattern = /^[a-zA-Z0-9_]*$/;
  const cyrillicPattern = /[а-яА-ЯёЁіІїЇєЄґҐ]/;

  const loginInputs = [document.getElementById("modalLoginInput"), document.getElementById("modalRegisterLogin")];
  loginInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (!loginAllowedPattern.test(input.value)) input.setCustomValidity("Only English letters & numbers");
      else input.setCustomValidity("");
    });
  });

  const regPass = document.getElementById("modalRegisterPassword");
  const regConfirm = document.getElementById("modalRegisterPasswordConfirm");
  if (regPass && regConfirm) {
      const val = () => {
          if (cyrillicPattern.test(regPass.value)) regPass.setCustomValidity("No Cyrillic");
          else regPass.setCustomValidity("");
          
          if (regPass.value !== regConfirm.value) regConfirm.setCustomValidity("Passwords mismatch");
          else regConfirm.setCustomValidity("");
      };
      regPass.addEventListener("input", val);
      regConfirm.addEventListener("input", val);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { currentUser = { login: saved }; showUserInfo(); } 
  else { showAuthButtons(); }
  initFormValidation();
});

window.openModal = openModal;
window.closeModal = closeModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.handleModalLogin = handleModalLogin;
window.handleModalRegister = handleModalRegister;
window.handleLogout = handleLogout;
window.openRegisterModal = (e) => { if(e) e.preventDefault(); openModal("registerModal"); };