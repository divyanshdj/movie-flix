import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MovieCard = ({ movie, onUnlike }) => {
  const [liked, setLiked] = useState(false);
  const mediaType = movie.media_type || 'movie';

  useEffect(() => {
    const likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    setLiked(likedMovies.some((m) => m.id === movie.id));
  }, [movie.id]);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    if (liked) {
      likedMovies = likedMovies.filter((m) => m.id !== movie.id);
      localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
      setLiked(false);
      if (onUnlike) onUnlike(movie.id);
    } else {
      likedMovies.push({
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
        original_language: movie.original_language,
        media_type: mediaType
      });
      localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
      setLiked(true);
    }
  };

  return (
    <Link 
      to={`/${mediaType}/${movie.id}`}
      className="movie-card text-white block hover:scale-105 transition-transform"
    >
      <div className="relative">
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "no-poster.png"}
          alt={movie.title || movie.name}
          className="w-full rounded-lg shadow-md"
        />
        <div className="group">
          <button
  onClick={toggleLike}
  className={`absolute top-2 right-2 text-sm px-3 py-1 rounded font-semibold flex items-center gap-1 transition-all duration-200
    ${liked ? "bg-white text-black" : "bg-black/70 text-white hover:bg-white hover:text-black"}`}
>
  {liked ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-red-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-white transition-colors duration-200 group-hover:text-black"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )}
  {liked ? "Liked" : "Like"}
</button>

        </div>

      </div>
      <div className="mt-4 movie-details">
        <h3 className="movie-title truncate">{movie.title || movie.name}</h3>
        <div className="content flex items-center gap-2 text-sm">
          <div className="rating flex items-center gap-1">
            <svg
              className="w-3 h-3 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{movie.original_language?.toUpperCase() || "N/A"}</p>
          <span>•</span>
          <p className="year">
            {(movie.release_date || movie.first_air_date)?.split("-")[0] || "N/A"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;