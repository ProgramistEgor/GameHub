document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchMessage = document.getElementById("searchMessage");
  const gamesGrid = document.getElementById("gamesGrid");

  if (!searchInput || !searchButton || !gamesGrid || !searchMessage) {
    return;
  }

  const games = [
    { image: "Image/Among us.jpg", title: "Among Us" },
    { image: "Image/Dota_2.jpg", title: "Dota 2" },
    { image: "Image/Witcher 2.jpg", title: "The Witcher 2" },
    { image: "Image/PUBG.jpg", title: "PUBG" },
    { image: "Image/Witcher 3.jpg", title: "The Witcher 3" },
    { image: "Image/cyberpunk.jpg", title: "Cyberpunk 2077" },
    { image: "Image/apexlegends.jpg", title: "Apex Legends" },
    { image: "Image/reddeadredemption2.jpg", title: "Red Dead Redemption 2" },
    { image: "Image/Minecraft.png", title: "Minecraft" },
    { image: "Image/leagueoflegends.jpeg", title: "League of Legends" },
    { image: "Image/overwatch2.jpg", title: "Overwatch 2" },
    { image: "Image/valorant.jpg", title: "Valorant" },
    { image: "Image/genshinimpact.jpg", title: "Genshin Impact" },
    { image: "Image/fortnite.jpg", title: "Fortnite" },
    { image: "Image/callofdutywarzone.jpg", title: "Call of Duty: Warzone" },
    { image: "Image/destiny2.jpg", title: "Destiny 2" },
    { image: "Image/eldenring.jpg", title: "Elden Ring" },
    { image: "Image/stardewvalley.jpg", title: "Stardew Valley" },
    { image: "Image/forzahorizon5.jpg", title: "Forza Horizon 5" },
    { image: "Image/hollowknight.jpg", title: "Hollow Knight" },
    { image: "Image/celeste.jpg", title: "Celeste" },
    { image: "Image/hades.jpg", title: "Hades" },
    {
      image: "Image/assassinscreedvalhalla.jpg",
      title: "Assassin's Creed Valhalla"
    },
    { image: "Image/nomanssky.jpg", title: "No Man's Sky" }
  ];

  function createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    const img = document.createElement("img");
    img.src = encodeURI(game.image);
    img.alt = game.title;
    img.className = "game-card__img";
    card.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "game-card__title";
    caption.textContent = game.title;
    card.appendChild(caption);

    return card;
  }

  function renderGames() {
    gamesGrid.innerHTML = "";
    games.forEach((game) => {
      gamesGrid.appendChild(createGameCard(game));
    });
  }

  function performSearch() {
    const searchText = searchInput.value.toLowerCase().trim();
    const cards = gamesGrid.querySelectorAll(".game-card");

    if (searchText === "") {
      cards.forEach((card) => (card.style.display = ""));
      searchMessage.style.display = "none";
      return;
    }

    let foundCount = 0;

    cards.forEach((card) => {
      const titleText = card
        .querySelector(".game-card__title")
        .textContent.toLowerCase();

      if (titleText.startsWith(searchText)) {
        card.style.display = "";
        foundCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (foundCount === 0) {
      searchMessage.textContent = `Ми не знайшли ігор, що починаються з "${searchInput.value}".`;
      searchMessage.style.display = "block";
    } else {
      searchMessage.style.display = "none";
    }
  }

  renderGames();

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("input", performSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") performSearch();
  });
});
