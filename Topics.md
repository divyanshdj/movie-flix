# 📘 Concepts Used in Movie Flix

This document covers the core concepts and tools used in the Movie Flix project.

---

## 🔌 API (Application Programming Interface)

- Allows different applications to communicate.
- Movie Flix uses the **TMDB API** to fetch live movie data.

---

## ⚙️ Conditional Rendering

- Renders UI elements based on certain conditions.
- Syntax: `if`, `? :`, `&&`
- Example: Show Login/Logout based on auth status.

---

## ⏳ Debouncing

- Delays function execution to limit frequent API calls.
- Used in the search input to improve performance.

---

## 🪝 React Hooks

### useState
- Stores local state in functional components.
- Used to manage movies, input text, etc.

### useEffect
- Runs side effects like fetching data.
- Runs on component mount or state change.

---

## 🌐 TMDB API Integration

- API used: `https://api.themoviedb.org/3`
- Endpoints used:
  - `/search/movie`
  - `/movie/popular`
- Authentication via Bearer Token in headers.

---

## 💾 Appwrite Backend

- Manages storage and serverless functions.
- Used to fetch and store trending movie data.

---

## 🖼 Lazy Loading

- Loads movie posters only when visible.
- Improves performance in movie grid display.

---

## 🎨 Dark Theme

- Implemented using Tailwind CSS.
- Improves viewing experience and accessibility.

---

## 🚀 Future Concepts

- Infinite Scroll / Pagination
- Add to Favorites
- Trailer Embeds
- Watch Later list
- Login/Auth with Appwrite

---