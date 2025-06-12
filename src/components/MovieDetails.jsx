import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "./Loader";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        if (!res.ok) throw new Error("Failed to load movie.");
        const data = await res.json();
        setMovie(data);
        // Check if liked
        const likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
        setLiked(likedMovies.some((m) => m.id === data.id));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const toggleLike = () => {
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    if (liked) {
      likedMovies = likedMovies.filter((m) => m.id !== movie.id);
    } else {
      likedMovies.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        original_language: movie.original_language
      });
    }
    localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
    setLiked(!liked);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col">
        <div className="text-center text-red-500 text-xl">{error}</div>
        <div className="p-4 z-50">
          <Link
            to="/"
            className="text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 transition font-semibold"
          >
            Home
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      {/* Back Button - Top Left */}
      <div className="p-4 fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="text-white hover:bg-violet-900 px-4 py-2 transition text-sm font-semibold"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="rounded-lg shadow-lg w-full"
        />

        {/* Movie Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-gradient">{movie.title}</h1>
          {movie.tagline && <p className="italic text-gray-400 text-lg">{movie.tagline}</p>}
          <p className="text-base">{movie.overview}</p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
            <div><strong>Release:</strong> {movie.release_date}</div>
            <div><strong>Runtime:</strong> {movie.runtime} min</div>
            <div><strong>Language:</strong> {movie.original_language.toUpperCase()}</div>
            <div><strong>Country:</strong> {movie.production_countries.map(c => c.name).join(", ")}</div>
            <div><strong>Budget:</strong> ${movie.budget.toLocaleString()}</div>
            <div><strong>Revenue:</strong> ${movie.revenue.toLocaleString()}</div>
            <div><strong>Status:</strong> {movie.status}</div>
            <div><strong>Rating:</strong> ⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)</div>
          </div>

          {/* Genres */}
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 bg-violet-800 text-white rounded-full text-sm"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Languages */}
          {movie.spoken_languages?.length > 0 && (
            <div className="text-sm mt-4">
              <strong>Spoken Languages:</strong>{" "}
              {movie.spoken_languages.map((lang) => lang.english_name).join(", ")}
            </div>
          )}

          {/* Production Companies */}
          {movie.production_companies?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Production Companies</h2>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {movie.production_companies.map((c) => (
                  <li key={c.id}>🎬 {c.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Homepage */}
          {movie.homepage && (
            <a
              href={movie.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-4 py-2 bg-violet-800 hover:bg-violet-700 text-white rounded-md font-medium"
            >
              Visit Official Website
            </a>
          )}

          {/* Like Button */}
          <button
            onClick={toggleLike}
            className={`cursor-pointer inline-block mt-6 mx-3 px-4 py-2 border rounded-sm rounded-md font-medium ${
              liked
                ? "bg-violet-800 text-white hover:bg-violet-700 border-none"
                : "text-white hover:bg-white hover:text-black"
            }`}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
