import { genresDB } from "./genres-data.js";
import { translations } from "./languages.js";
import { showNotification } from "./notifications.js";

let currentReviewIndex = 0;

export async function openGameDetails(game) {
  const modalOverlay = document.getElementById("gameDetailsModal");
  if (!modalOverlay) return;

  const lang = localStorage.getItem("gameHubLang") || "uk";
  // ... (решта коду без змін до функції setupReviewForm) ...
  const imgEl = document.getElementById("gd-img");
  const titleEl = document.getElementById("gd-title");
  const genreVal = document.getElementById("gd-val-genre");
  const ratingVal = document.getElementById("gd-val-rating");
  const descEl = document.getElementById("gd-desc");
  const reviewsList = document.getElementById("gd-rev-list");
  const reviewForm = document.getElementById("gd-rev-form");

  imgEl.src = game.image;
  titleEl.textContent = game.title;

  if (game.genreIds && game.genreIds.length > 0) {
    const genreNames = game.genreIds
      .map((id) => (genresDB[id] ? genresDB[id][lang] : ""))
      .filter(Boolean)
      .join(", ");
    genreVal.textContent = genreNames;
  } else {
    genreVal.textContent = "-";
  }

  descEl.textContent =
    game.description && game.description[lang]
      ? game.description[lang]
      : translations[lang]["game.desc_empty"];

  document.getElementById("gd-lbl-genre").textContent =
    translations[lang]["game.genre"];
  document.getElementById("gd-lbl-rating").textContent =
    translations[lang]["game.rating"];
  document.getElementById("gd-rev-title").textContent =
    translations[lang]["game.reviews_title"];

  reviewsList.innerHTML =
    "<div style='color:#888; text-align:center'>Loading...</div>";
  currentReviewIndex = 0;

  let reviews = [];
  try {
    const res = await fetch(
      `http://localhost:3000/api/reviews/${encodeURIComponent(game.title)}`
    );
    if (res.ok) {
      const data = await res.json();
      reviews = data.reviews;
    }
  } catch (e) {
    console.error(e);
  }

  updateRatingDisplay(reviews, ratingVal, lang);
  renderReviewsCarousel(reviews, reviewsList, lang);
  setupReviewForm(
    game.title,
    reviewForm,
    reviewsList,
    ratingVal,
    lang,
    reviews
  );

  window.openModal("gameDetailsModal");
}

function renderReviewsCarousel(reviews, container, lang) {
  container.innerHTML = "";
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `<div class="no-reviews-text" style="text-align:center; color:#888; font-style:italic;">${translations[lang]["game.no_reviews"]}</div>`;
    return;
  }

  const carousel = document.createElement("div");
  carousel.className = "reviews-carousel";

  const prevBtn = document.createElement("button");
  prevBtn.className = "nav-arrow";
  prevBtn.innerHTML = "&#10094;";
  prevBtn.onclick = () => {
    if (currentReviewIndex > 0) {
      currentReviewIndex--;
      updateActiveReview();
    }
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "nav-arrow";
  nextBtn.innerHTML = "&#10095;";
  nextBtn.onclick = () => {
    if (currentReviewIndex < reviews.length - 1) {
      currentReviewIndex++;
      updateActiveReview();
    }
  };

  const reviewContent = document.createElement("div");
  reviewContent.className = "active-review";

  carousel.appendChild(prevBtn);
  carousel.appendChild(reviewContent);
  carousel.appendChild(nextBtn);
  container.appendChild(carousel);

  function updateActiveReview() {
    const rev = reviews[currentReviewIndex];
    const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
    const date = new Date(rev.date).toLocaleDateString();

    reviewContent.innerHTML = `
            <div class="review-stars">${stars}</div>
            <div class="review-text" style="font-style:italic; margin-bottom:10px;">"${
              rev.text
            }"</div>
            <div class="review-header" style="justify-content:center; font-size:0.9rem; color:#aaa;">
                <span class="review-user" style="color:#fff; font-weight:bold; margin-right:8px;">${
                  rev.user
                }</span>
                <span>(${date})</span>
            </div>
            <div style="font-size:0.8rem; color:#666; margin-top:5px;">
               ${currentReviewIndex + 1} / ${reviews.length}
            </div>
        `;
    prevBtn.disabled = currentReviewIndex === 0;
    prevBtn.style.opacity = currentReviewIndex === 0 ? "0.3" : "1";
    nextBtn.disabled = currentReviewIndex === reviews.length - 1;
    nextBtn.style.opacity =
      currentReviewIndex === reviews.length - 1 ? "0.3" : "1";
  }
  updateActiveReview();
}

function updateRatingDisplay(reviews, element, lang) {
  if (reviews && reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / reviews.length).toFixed(1);
    element.textContent = `★ ${avg} (${reviews.length})`;
    element.style.color = "#ffd700";
  } else {
    element.textContent = translations[lang]["game.rating.na"];
    element.style.color = "#888";
  }
}

function setupReviewForm(
  gameTitle,
  formContainer,
  listContainer,
  ratingLabelEl,
  lang,
  reviewsArray
) {
  const savedUser = localStorage.getItem("gameHubUser");
  formContainer.innerHTML = "";

  if (!savedUser) {
    formContainer.innerHTML = `
            <div class="login-req-box">
               <a href="#" onclick="openModal('loginModal'); return false;" class="login-req-msg">
                  ${translations[lang]["game.form.login_req"]}
               </a>
            </div>`;
    return;
  }

  const hasReviewed = reviewsArray.some((r) => r.user === savedUser);
  if (hasReviewed) {
    formContainer.innerHTML = `
            <div class="already-reviewed-text">
                ✅ ${translations[lang]["game.form.already"]}
            </div>`;
    return;
  }

  formContainer.innerHTML = `
        <div class="review-form">
            <label style="text-align:center">${translations[lang]["game.form.label"]}</label>
            <div class="star-rating-input">
                <input type="radio" id="star5" name="rating" value="5"><label for="star5">★</label>
                <input type="radio" id="star4" name="rating" value="4"><label for="star4">★</label>
                <input type="radio" id="star3" name="rating" value="3"><label for="star3">★</label>
                <input type="radio" id="star2" name="rating" value="2"><label for="star2">★</label>
                <input type="radio" id="star1" name="rating" value="1"><label for="star1">★</label>
            </div>
            <textarea id="reviewText" placeholder="${translations[lang]["game.form.placeholder"]}"></textarea>
            <button class="submit-review-btn" id="submitReview">${translations[lang]["game.form.btn"]}</button>
        </div>
    `;

  const btn = document.getElementById("submitReview");
  if (btn) {
    btn.addEventListener("click", async () => {
      const text = document.getElementById("reviewText").value;
      const ratingInputs = document.querySelectorAll('input[name="rating"]');
      let rating = 0;
      ratingInputs.forEach((inp) => {
        if (inp.checked) rating = Number(inp.value);
      });

      if (rating === 0) {
        showNotification(translations[lang]["notify.rating_req"], "error");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/reviews/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameTitle, user: savedUser, text, rating }),
        });

        const data = await res.json();

        if (res.ok) {
          const newReviews = data.reviews;
          currentReviewIndex = 0;
          renderReviewsCarousel(newReviews, listContainer, lang);
          updateRatingDisplay(newReviews, ratingLabelEl, lang);
          setupReviewForm(
            gameTitle,
            formContainer,
            listContainer,
            ratingLabelEl,
            lang,
            newReviews
          );

          showNotification(
            translations[lang]["notify.review_success"],
            "success"
          );
        } else {
          showNotification(
            data.error || translations[lang]["notify.error"],
            "error"
          );
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
}
