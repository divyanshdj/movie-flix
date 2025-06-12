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

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [errorMessageTrending, setErrorMessageTrending] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.response === "false" || data.results.length === 0) {
        setErrorMessage("No movies found. Please try a different search term.");
        setMovies([]);
        return;
      }

      setMovies(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage("Failed to fetch movies. Please try again later. (Maybe JIO Network)");
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
      setErrorMessageTrending("Failed to fetch trending movies. Please try again later.");
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <div className="pattern" />
              <div className="wrapper">
                <header>
                  <img src="./hero.png" alt="hero-banner" />
                  <h1>
                    Find <span className="text-gradient">Movie</span> You'll Enjoy
                    Without the Hassle
                  </h1>
                  <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <div className="flex justify-center mt-6">
                  <Link to="/liked" className="search text-white w-auto mt-1">
                    ❤️ View Liked Movies
                  </Link>
                </div>


                {isLoadingTrending ? (
                  <Loader />
                ) : errorMessageTrending ? (
                  <p className="text-red-500">{errorMessageTrending}</p>
                ) : (
                  <section className="trending">
                    <h2 className="mt-[10px]">Trending Movies</h2>
                    <ul>
                      {trendingMovies.map((mov, idx) => (
                        <li key={mov.$id}>
                          <p>{idx + 1}</p>
                          <Link to={`/movie/${mov.movie_id}`}>
                            <img
                              src={mov.poster_url ? mov.poster_url : "no-poster.png"}
                              alt={mov.searchTerm}
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="all-movies">
                  <h2 className="mt-[10px]">All Movies</h2>
                  {isLoading ? (
                    <Spinner />
                  ) : errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                  ) : (
                    <ul>
                      {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </main>
          }
        />
        <Route path="/movie/:id" element={<MovieDetails/>} />
        <Route path="/liked" element={<LikedList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;