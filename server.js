import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Шляхи до файлів даних
const usersFile = path.join(__dirname, "users.json");
const reviewsFile = path.join(__dirname, "reviews.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- Хелпери для роботи з файлами ---
function readJSON(file) {
  if (!fs.existsSync(file)) {
    // Створюємо файл, якщо його немає
    const defaultContent = file.includes("users") ? "[]" : "{}";
    fs.writeFileSync(file, defaultContent);
  }
  const data = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(data);
  } catch (e) {
    return file.includes("users") ? [] : {};
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// === АВТОРИЗАЦІЯ ===
app.post("/api/register", (req, res) => {
  const { login, password } = req.body;
  if (!login || !password)
    return res.status(400).json({ error: "Заповніть дані" });

  let users = readJSON(usersFile);
  if (users.find((u) => u.login === login))
    return res.status(400).json({ error: "Користувач вже існує" });

  users.push({ login, password, favorites: [] });
  writeJSON(usersFile, users);
  res.json({ message: "Реєстрація успішна" });
});

app.post("/api/login", (req, res) => {
  const { login, password } = req.body;
  let users = readJSON(usersFile);
  const user = users.find((u) => u.login === login && u.password === password);

  if (!user)
    return res.status(401).json({ error: "Невірний логін або пароль" });
  res.json({ user: { login, favorites: user.favorites || [] } });
});

// === ОБРАНЕ ===
app.post("/api/favorites/add", (req, res) => {
  const { login, gameTitle } = req.body;
  let users = readJSON(usersFile);
  const idx = users.findIndex((u) => u.login === login);

  if (idx === -1)
    return res.status(404).json({ error: "Користувача не знайдено" });

  if (!users[idx].favorites) users[idx].favorites = [];
  if (!users[idx].favorites.includes(gameTitle)) {
    users[idx].favorites.push(gameTitle);
    writeJSON(usersFile, users);
  }
  res.json({ favorites: users[idx].favorites });
});

app.post("/api/favorites/remove", (req, res) => {
  const { login, gameTitle } = req.body;
  let users = readJSON(usersFile);
  const idx = users.findIndex((u) => u.login === login);

  if (idx === -1)
    return res.status(404).json({ error: "Користувача не знайдено" });

  if (users[idx].favorites) {
    users[idx].favorites = users[idx].favorites.filter((t) => t !== gameTitle);
    writeJSON(usersFile, users);
  }
  res.json({ favorites: users[idx].favorites });
});

app.get("/api/favorites/:login", (req, res) => {
  const { login } = req.params;
  let users = readJSON(usersFile);
  const user = users.find((u) => u.login === login);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ favorites: user.favorites || [] });
});

// === ВІДГУКИ ===

// 1. Отримати всі відгуки для гри
app.get("/api/reviews/:gameTitle", (req, res) => {
  const { gameTitle } = req.params;
  const reviewsDB = readJSON(reviewsFile);
  const gameReviews = reviewsDB[gameTitle] || [];
  res.json({ reviews: gameReviews });
});

// 2. Додати новий відгук (Тільки один від користувача!)
app.post("/api/reviews/add", (req, res) => {
  const { gameTitle, user, text, rating } = req.body;

  if (!gameTitle || !user || !rating) {
    return res.status(400).json({ error: "Неповні дані" });
  }

  const reviewsDB = readJSON(reviewsFile);

  if (!reviewsDB[gameTitle]) {
    reviewsDB[gameTitle] = [];
  }

  // ПЕРЕВІРКА: Чи писав цей юзер вже відгук?
  const existingReview = reviewsDB[gameTitle].find((r) => r.user === user);
  if (existingReview) {
    return res
      .status(400)
      .json({ error: "Ви вже залишили відгук до цієї гри!" });
  }

  const newReview = {
    user,
    text: text || "",
    rating: Number(rating),
    date: new Date().toISOString(),
  };

  // Додаємо на початок масиву
  reviewsDB[gameTitle].unshift(newReview);
  writeJSON(reviewsFile, reviewsDB);

  res.json({ message: "Відгук додано", reviews: reviewsDB[gameTitle] });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
