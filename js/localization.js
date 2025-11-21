import { translations } from "./languages.js";

const languages = ["uk", "en", "ru"];

document.addEventListener("DOMContentLoaded", () => {
 
  let currentLang = localStorage.getItem("gameHubLang") || "uk";

 
  applyLanguage(currentLang);

 
  const langBtn = document.querySelector(".language-block");

  if (langBtn) {
    langBtn.style.cursor = "pointer";

 
    langBtn.addEventListener("click", () => {
      const currentIndex = languages.indexOf(currentLang);
      const nextIndex = (currentIndex + 1) % languages.length;
      currentLang = languages[nextIndex];

     
      localStorage.setItem("gameHubLang", currentLang);

     
      applyLanguage(currentLang);
    });
  }
});


export function applyLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = translations[lang][key];

    if (text) {
      if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });


  if (lang === "en") {
    document.title = document.title
      .replace("Головна", "Home")
      .replace("Обране", "Favorites")
      .replace("Контакти", "Contacts")
      .replace("Про проєкт", "About");
  } else if (lang === "ru") {
    document.title = document.title
      .replace("Головна", "Главная")
      .replace("Обране", "Избранное")
      .replace("Контакти", "Контакты")
      .replace("Про проєкт", "О проекте");
  } else {
    // uk
    document.title = document.title
      .replace("Home", "Головна")
      .replace("Favorites", "Обране");
  }
}
