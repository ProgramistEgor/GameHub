import { gamesData } from "./games-data.js";
import { translations } from "./languages.js";
import { openGameDetails } from "./game-details.js";
import { showNotification } from "./notifications.js"; // ІМПОРТ

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchMessage = document.getElementById("searchMessage");
  const gamesGrid = document.getElementById("gamesGrid");
  
  if (!gamesGrid) return;

  let userFavorites = [];
  const savedLogin = localStorage.getItem("gameHubUser");
  const currentLang = localStorage.getItem("gameHubLang") || "uk";

  if (savedLogin) {
    try {
      const res = await fetch(`http://localhost:3000/api/favorites/${savedLogin}`);
      if (res.ok) { const data = await res.json(); userFavorites = data.favorites; }
    } catch (e) { console.error(e); }
  }

  function createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";
    card.style.cursor = "pointer";

    const isFav = userFavorites.includes(game.title);
    const heartClass = isFav ? "fav-btn active" : "fav-btn";

    card.innerHTML = `
      <button class="${heartClass}" data-title="${game.title}">❤</button>
      <img src="${encodeURI(game.image)}" alt="${game.title}" class="game-card__img">
      <div class="game-card__title">${game.title}</div>
    `;

    card.addEventListener("click", () => { openGameDetails(game); });

    const btn = card.querySelector(".fav-btn");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const currentLogin = localStorage.getItem("gameHubUser");
      if (!currentLogin) {
        // ПОВІДОМЛЕННЯ ЗАМІСТЬ ALERT
        showNotification(translations[currentLang]["fav.login_req"], 'error');
        window.openModal("loginModal");
        return;
      }
      const isActive = btn.classList.contains("active");
      const endpoint = isActive ? "/api/favorites/remove" : "/api/favorites/add";
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: currentLogin, gameTitle: game.title })
        });
        if (res.ok) {
          const data = await res.json();
          userFavorites = data.favorites;
          btn.classList.toggle("active");
        }
      } catch (err) { console.error(err); }
    });

    return card;
  }

  function renderGames() {
    gamesGrid.innerHTML = "";
    gamesData.forEach((game) => gamesGrid.appendChild(createGameCard(game)));
  }
  
  function performSearch() {
    if (!searchInput) return;
    const searchText = searchInput.value.toLowerCase().trim();
    const cards = gamesGrid.querySelectorAll(".game-card");
    let foundCount = 0;
    cards.forEach((card) => {
      const title = card.querySelector(".game-card__title").textContent.toLowerCase();
      if (title.includes(searchText)) { card.style.display = ""; foundCount++; }
      else { card.style.display = "none"; }
    });
    if (searchMessage) {
        if (foundCount === 0) {
            searchMessage.style.display = "block";
            const notFoundText = translations[currentLang]["search.not_found"];
            searchMessage.textContent = `${notFoundText} "${searchText}"`;
        } else { searchMessage.style.display = "none"; }
    }
  }

  renderGames();
  if (searchButton) searchButton.addEventListener("click", performSearch);
  if (searchInput) {
    searchInput.addEventListener("input", performSearch);
    searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") performSearch(); });
  }
});