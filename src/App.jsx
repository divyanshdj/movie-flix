/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Search from "./components/Search";
import "./index.css";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import MovieDetails from "./components/MovieDetails";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import Loader from "./components/Loader";
import LikedList from "./components/LikedList";
import Navbar from "./components/Navbar";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

// Content type enum
const ContentType = {
  MOVIE: "movie",
  TV: "tv",
  BOTH: "both",
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [errorMessageTrending, setErrorMessageTrending] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [contentType, setContentType] = useState(ContentType.BOTH);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchContent = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      let endpoint;
      if (query) {
        if (contentType === ContentType.BOTH) {
          // Fetch both movies and TV shows
          const [moviesResponse, tvResponse] = await Promise.all([
            fetch(
              `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,
              API_OPTIONS
            ),
            fetch(
              `${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}`,
              API_OPTIONS
            ),
          ]);

          if (!moviesResponse.ok || !tvResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const moviesData = await moviesResponse.json();
          const tvData = await tvResponse.json();

          // Combine results with type indicator
          const combinedResults = [
            ...(moviesData.results?.map((item) => ({
              ...item,
              media_type: ContentType.MOVIE,
            })) || []),
            ...(tvData.results?.map((item) => ({
              ...item,
              media_type: ContentType.TV,
            })) || []),
          ].sort((a, b) => b.popularity - a.popularity); // Sort by popularity

          if (combinedResults.length === 0) {
            setErrorMessage(
              "No content found. Please try a different search term."
            );
            setContent([]);
            return;
          }
          setContent(combinedResults);
        } else {
          // Fetch either movies or TV shows based on selection
          endpoint = `${API_BASE_URL}/search/${contentType}?query=${encodeURIComponent(
            query
          )}`;
          const response = await fetch(endpoint, API_OPTIONS);

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          if (data.response === "false" || data.results.length === 0) {
            setErrorMessage(
              `No ${
                contentType === ContentType.MOVIE ? "movies" : "TV shows"
              } found. Please try a different search term.`
            );
            setContent([]);
            return;
          }

          // Add media_type to each item for consistency
          setContent(
            data.results.map((item) => ({ ...item, media_type: contentType }))
          );
        }
      } else {
        // Discover popular content when no query
        if (contentType === ContentType.BOTH) {
          const [moviesResponse, tvResponse] = await Promise.all([
            fetch(
              `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`,
              API_OPTIONS
            ),
            fetch(
              `${API_BASE_URL}/discover/tv?sort_by=popularity.desc`,
              API_OPTIONS
            ),
          ]);

          if (!moviesResponse.ok || !tvResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const moviesData = await moviesResponse.json();
          const tvData = await tvResponse.json();

          // Combine results with type indicator
          const combinedResults = [
            ...(moviesData.results?.map((item) => ({
              ...item,
              media_type: ContentType.MOVIE,
            })) || []),
            ...(tvData.results?.map((item) => ({
              ...item,
              media_type: ContentType.TV,
            })) || []),
          ].sort((a, b) => b.popularity - a.popularity); // Sort by popularity
          setContent(combinedResults);
        } else {
          endpoint = `${API_BASE_URL}/discover/${contentType}?sort_by=popularity.desc`;
          const response = await fetch(endpoint, API_OPTIONS);

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          setContent(
            data.results.map((item) => ({ ...item, media_type: contentType }))
          );
        }
      }

      if (query && content.length > 0) {
        await updateSearchCount(query, content[0]);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setErrorMessage(
        "Failed to fetch content. Please try again later. (Maybe JIO Network)"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setErrorMessageTrending(
        "Failed to fetch trending movies. Please try again later."
      );
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchContent(debouncedSearchTerm);
  }, [debouncedSearchTerm, contentType]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                contentType={contentType}
                setContentType={setContentType}
              />

              <main>
                <div className="pattern" />
                <div className="wrapper">
                  <header className="text-center space-y-6 animate-fade-in">
                    <img
                      src="./hero.png"
                      alt="hero-banner"
                      className="mx-auto max-w-xs sm:max-w-md"
                    />
                    <h1>
                      Find <span className="text-gradient">Movies & Shows</span>{" "}
                      You'll Enjoy Without the Hassle
                    </h1>

                    {/* Search */}
                    <div className="w-full max-w-xl mx-auto">
                      <Search
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                      />
                    </div>

                    {/* Content Type Selector */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                      {[
                        { type: ContentType.MOVIE, label: "🎬 Movies" },
                        { type: ContentType.TV, label: "📺 TV Shows" },
                        { type: ContentType.BOTH, label: "🎞️ Both" },
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => setContentType(item.type)}
                          className={`cursor-pointer min-w-[100px] px-5 py-2 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                            contentType === item.type
                              ? "bg-violet-700 text-white shadow-md"
                              : "bg-gray-800 text-gray-300 hover:bg-violet-600 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </header>

                  {/* View Liked */}
                  <div className="flex justify-center mt-6">
                    <Link to="/liked" className="search text-white w-auto mt-1">
                      ❤️ View Liked Movies
                    </Link>
                  </div>

                  {/* Trending */}
                  {isLoadingTrending ? (
                    <Loader />
                  ) : errorMessageTrending ? (
                    <p className="text-red-500">{errorMessageTrending}</p>
                  ) : (
                    <section className="trending">
                      <h2 className="mt-[10px]">Trending Now</h2>
                      <ul>
                        {trendingMovies.map((mov, idx) => (
                          <li key={mov.$id}>
                            <p>{idx + 1}</p>
                            <Link
                              to={`/${
                                mov.media_type == null
                                  ? "movie"
                                  : mov.media_type
                              }/${mov.movie_id}`}
                            >
                              <img
                                src={
                                  mov.poster_url
                                    ? mov.poster_url
                                    : "no-poster.png"
                                }
                                alt={mov.searchTerm}
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* All Movies */}
                  <section className="all-movies">
                    <h2 className="mt-[10px]">
                      {contentType === ContentType.MOVIE
                        ? "Popular Movies"
                        : contentType === ContentType.TV
                        ? "Popular TV Shows"
                        : "Popular Movies & TV Shows"}
                    </h2>

                    {isLoading ? (
                      <Spinner />
                    ) : errorMessage ? (
                      <p className="text-red-500">{errorMessage}</p>
                    ) : (
                      <ul>
                        {content.map((item) => (
                          <MovieCard
                            key={`${item.media_type}-${item.id}`}
                            movie={item}
                            isTvShow={item.media_type === ContentType.TV}
                          />
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </main>
            </>
          }
        />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails isTvShow={true} />} />
        <Route path="/liked" element={<LikedList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
