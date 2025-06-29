import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

const LikedList = () => {
  const [likedContent, setLikedContent] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'movie', 'tv'

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedMovies")) || [];
    setLikedContent(stored);
  }, []);

  const handleUnlike = (contentId) => {
    const updated = likedContent.filter((item) => item.id !== contentId);
    setLikedContent(updated);
    localStorage.setItem("likedMovies", JSON.stringify(updated));
  };

  const filteredContent = likedContent.filter(item => {
    if (activeFilter === "all") return true;
    return item.media_type === activeFilter;
  });

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-8 relative">
      {/* Back Button */}
      <div className="p-4 fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="text-white hover:bg-violet-900 px-4 py-2 transition text-sm font-semibold rounded-lg flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Container */}
      <div className="max-w-7xl mx-auto mt-20">
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-6 text-center">
          ❤️ Your Favorites
        </h2>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === "all" 
                ? "bg-violet-700 text-white" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("movie")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === "movie" 
                ? "bg-violet-700 text-white" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveFilter("tv")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === "tv" 
                ? "bg-violet-700 text-white" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            TV Shows
          </button>
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-gray-400 text-lg mb-4">
              {likedContent.length === 0
                ? "You haven't liked anything yet."
                : activeFilter === "all"
                  ? "No favorites found"
                  : `No ${activeFilter === "movie" ? "movies" : "TV shows"} in your favorites`}
            </p>
            <Link
              to="/"
              className="inline-block bg-violet-700 hover:bg-violet-800 text-white px-6 py-2 rounded-full transition font-medium"
            >
              {likedContent.length === 0 ? "Explore Now →" : "Browse More"}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400 text-sm text-center">
              Showing {filteredContent.length} {filteredContent.length === 1 ? "item" : "items"}
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredContent.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  movie={item}
                  isTvShow={item.media_type === "tv"}
                  onUnlike={handleUnlike}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
};

export default LikedList;