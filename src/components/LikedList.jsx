import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

const LikedList = () => {
  const [likedMovies, setLikedMovies] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedMovies")) || [];
    setLikedMovies(stored);
  }, []);

  const handleUnlike = (movieId) => {
    const updated = likedMovies.filter((m) => m.id !== movieId);
    setLikedMovies(updated);
    localStorage.setItem("likedMovies", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 relative">
      <div className="p-4 fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="text-white hover:bg-violet-900 px-4 py-2  transition text-sm font-semibold"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-white text-3xl font-bold mb-6 text-center">
          ❤️ Your Liked Movies
        </h2>

        {likedMovies.length === 0 ? (
          <p className="text-white text-center">No liked movies yet.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {likedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onUnlike={handleUnlike} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default LikedList;
