import { gamesData } from "./games-data.js";
import { translations } from "./languages.js";

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("favGrid");
  const emptyMsg = document.getElementById("emptyMsg");
  const savedLogin = localStorage.getItem("gameHubUser");
  const lang = localStorage.getItem("gameHubLang") || "uk";

  if (!savedLogin) {
    if (grid) {
      // Використовуємо переклад для повідомлення
      grid.innerHTML = `<p id="emptyMsg" style="margin-top:10vh;">${translations[lang]["fav.login_req"]} <br> <a href="#" onclick="openModal('loginModal'); return false;" style="color:#ffb77f">${translations[lang]["nav.signin"]}</a></p>`;
    }
    return;
  }

  let userFavorites = [];
  try {
    const res = await fetch(
      `http://localhost:3000/api/favorites/${savedLogin}`
    );
    if (res.ok) {
      const data = await res.json();
      userFavorites = data.favorites;
    }
  } catch (e) {
    console.error(e);
  }

  if (!userFavorites || userFavorites.length === 0) {
    if (emptyMsg) {
      emptyMsg.style.display = "block";
      emptyMsg.innerHTML = `${translations[lang]["fav.empty"]} <br> <a href="main.html">${translations[lang]["fav.goto"]}</a>`;
    }
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";

  const favGames = gamesData.filter((game) =>
    userFavorites.includes(game.title)
  );

  favGames.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <button class="fav-btn active" title="Видалити">❤</button>
      <img src="${encodeURI(game.image)}" alt="${
      game.title
    }" class="game-card__img">
      <div class="game-card__title">${game.title}</div>
    `;
    const btn = card.querySelector(".fav-btn");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Delete ${game.title}?`)) return;
      try {
        await fetch(`http://localhost:3000/api/favorites/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: savedLogin, gameTitle: game.title }),
        });
        card.remove();
        if (grid.querySelectorAll(".game-card").length === 0) location.reload();
      } catch (e) {
        console.error(e);
      }
    });
    grid.appendChild(card);
  });
});
