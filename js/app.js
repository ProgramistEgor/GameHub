// Функция сортировки карточек
function sortGameCards() {
  const gamesGrid = document.querySelector(".games-grid");
  const cards = Array.from(gamesGrid.querySelectorAll(".game-card"));

  cards.sort((a, b) => {
    const nameA = a.querySelector(".game-card__img").alt.toLowerCase();
    const nameB = b.querySelector(".game-card__img").alt.toLowerCase();
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });

  gamesGrid.innerHTML = "";
  cards.forEach((card) => gamesGrid.appendChild(card));
}

// Функция поиска
function performSearch() {
  const searchText = searchInput.value.toLowerCase().trim();
  const cards = gamesGrid.querySelectorAll(".game-card");

  if (searchText === "") {
    // Если поиск пустой - показываем все карточки
    cards.forEach((card) => (card.style.display = "block"));
    searchMessage.style.display = "none";
    return;
  }

  let foundCount = 0;

  cards.forEach((card) => {
    const altText = card.querySelector(".game-card__img").alt.toLowerCase();

    
    if (altText.startsWith(searchText)) {
      card.style.display = "block";
      foundCount++;
    } else {
      card.style.display = "none";
    }
  });

  if (foundCount === 0) {
    searchMessage.textContent = `Игр с названием "${searchInput.value}" не найдено`;
    searchMessage.style.display = "block";
  } else {
    searchMessage.style.display = "none";
  }
}


sortGameCards(); 

searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("input", performSearch);
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") performSearch();
});
