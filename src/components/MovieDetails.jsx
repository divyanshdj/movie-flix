import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "./Loader";

function MovieDetails({ movies }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");

    // Find movie in movies prop
    const movieFromProps = movies.find((m) => m.id.toString() === id);

    console.log(movieFromProps);
    

    if (movieFromProps) {
      setMovie(movieFromProps);
    } else {
      setError("Movie not found in search results.");
    }

    setIsLoading(false);
  }, [id, movies]);

  if (isLoading) return <Loader />;
  if (error) return (
    <div className="wrapper min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-red-500 text-xl font-semibold">{error}</p>
    </div>
  );
  if (!movie) return (
    <div className="wrapper min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-gray-400 text-xl font-semibold">No movie found.</p>
    </div>
  );

  return (
    <main className="wrapper min-h-screen py-8 bg-gray-900 text-white">
      <Link
        to="/"
        className="relative text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-flex items-center gap-2"
        aria-label={`Back to home page from ${movie.title}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Home
      </Link>

      <div className="relative flex flex-col lg:flex-row gap-8 bg-gray-800 rounded-xl p-8 shadow-xl">
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "no-poster.png"}
          alt={movie.title}
          className="w-full lg:w-1/3 rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300"
        />
        <div className="flex-1">
          <h1 className="text-gradient">
            {movie.title}
            {movie.title !== movie.original_title && (
              <span className="text-xl font-normal block text-gray-400">
                {movie.original_title}
              </span>
            )}
          </h1>
          <p className="text-gray-300 text-xl my-6 leading-relaxed">
            {movie.overview || "No overview available."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
            <p className="text-xl">
              <strong className="text-blue-300">Release Date:</strong>{" "}
              {movie.release_date ? movie.release_date.split('-').join('-') : "N/A"}
            </p>
            <p className="text-xl">
              <strong className="text-blue-300">Rating:</strong>{" "}
              {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "N/A"}
              {movie.vote_count ? ` (${movie.vote_count} votes)` : ""}
            </p>
            <p className="text-xl">
              <strong className="text-blue-300">Language:</strong>{" "}
              {movie.original_language ? movie.original_language.toUpperCase() : "N/A"}
            </p>
            <p className="text-xl">
              <strong className="text-blue-300">Adult:</strong>{" "}
              {movie.adult ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MovieDetails;