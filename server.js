import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Шлях до файла з користувачами
const usersFile = path.join(__dirname, "users.json");

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files (css, js, images, main.html)
app.use(express.static(path.join(__dirname)));

// Допоміжна функція для читання користувачів
function readUsers() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]");
  }
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
}

// Допоміжна функція для збереження користувачів
function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// === Маршрути ===

// Реєстрація
app.post("/api/register", (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: "Логин и пароль обязательны" });
  }

  let users = readUsers();

  if (users.find((u) => u.login === login)) {
    return res.status(400).json({ error: "Пользователь уже существует" });
  }

  users.push({ login, password });
  writeUsers(users);

  res.json({ message: "Регистрация успешна" });
});

// Вход
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  let users = readUsers();
  const user = users.find((u) => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }

  res.json({ user: { login } });
});

// Перевірка роботи сервера
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
