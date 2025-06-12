import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MovieCard = ({ movie, onUnlike }) => {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    setLiked(likedMovies.some((m) => m.id === movie.id));
  }, [movie.id]);

  const toggleLike = () => {
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    if (liked) {
      likedMovies = likedMovies.filter((m) => m.id !== movie.id);
      localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
      setLiked(false);
      if (onUnlike) onUnlike(movie.id); // 👈 call callback if provided
    } else {
      likedMovies.push(movie);
      localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
      setLiked(true);
    }
  };

  return (
    <div className="movie-card text-white block">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "no-poster.png"}
          alt={movie.title}
          className="w-full rounded-lg shadow-md hover:scale-105 transition-transform"
        />
      </Link>
      <div className="mt-4 movie-details">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{movie.original_language?.toUpperCase() || "N/A"}</p>
          <span>•</span>
          <p className="year">{movie.release_date?.split("-")[0] || "N/A"}</p>
        </div>
        <button
          onClick={toggleLike}
          className={`mt-2 text-sm px-2 py-1 border rounded transition cursor-pointer font-semibold ${
            liked ? "bg-white text-black" : "hover:bg-white hover:text-black"
          }`}
        >
          {liked ? "❤️ Liked" : "🤍 Like"}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
