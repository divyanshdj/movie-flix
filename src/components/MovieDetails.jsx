import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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

function MovieDetails({ isTvShow = false }) {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const trailerRef = useRef(null);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setIsLoading(true);
      setError("");
      try {
        const mediaType = isTvShow ? "tv" : "movie";
        const [detailsRes, creditsRes, similarRes, videosRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/${mediaType}/${id}`, API_OPTIONS),
            fetch(`${API_BASE_URL}/${mediaType}/${id}/credits`, API_OPTIONS),
            fetch(`${API_BASE_URL}/${mediaType}/${id}/similar`, API_OPTIONS),
            fetch(`${API_BASE_URL}/${mediaType}/${id}/videos`, API_OPTIONS),
          ]);

        if (!detailsRes.ok) throw new Error("Failed to load media details.");
        if (!creditsRes.ok) throw new Error("Failed to load credits.");
        if (!similarRes.ok) throw new Error("Failed to load similar content.");
        if (!videosRes.ok) throw new Error("Failed to load videos.");

        const detailsData = await detailsRes.json();
        setMedia(detailsData);
        setCredits(await creditsRes.json());
        setSimilar((await similarRes.json()).results.slice(0, 12));
        setVideos((await videosRes.json()).results);

        if (isTvShow && detailsData.seasons?.length > 0) {
          setActiveSeason(detailsData.seasons[0].season_number || 1);
        }

        const likedMovies =
          JSON.parse(localStorage.getItem("likedMovies")) || [];
        setLiked(likedMovies.some((m) => m.id === detailsData.id));
      } catch (err) {
        setError({
          message: err.message || "Something went wrong.",
          isCritical: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaDetails();
  }, [id, isTvShow]);

  const toggleLike = () => {
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];
    if (liked) {
      likedMovies = likedMovies.filter((m) => m.id !== media.id);
    } else {
      likedMovies.push({
        id: media.id,
        title: media.title || media.name,
        poster_path: media.poster_path,
        vote_average: media.vote_average,
        release_date: media.release_date || media.first_air_date,
        original_language: media.original_language,
        media_type: isTvShow ? "tv" : "movie",
      });
    }
    localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
    setLiked(!liked);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getTrailer = () => {
    // Prefer YouTube Trailer
    const trailer = videos.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // Fallback to YouTube Teaser
    const teaser = videos.find(
      (video) => video.type === "Teaser" && video.site === "YouTube"
    );

    return trailer || teaser || null;
  };

  const playTrailer = () => {
    setIsTrailerPlaying(true);
    activeTab === "trailer" || setActiveTab("trailer");
    setTimeout(() => {
      trailerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader />
          <p className="mt-4 text-gray-400">
            Loading {isTvShow ? "TV show" : "movie"} details...
          </p>
        </div>
      </div>
    );
  }

  if (error?.isCritical) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️ Error</div>
          <p className="text-xl mb-6">{error.message}</p>
          <Link
            to="/"
            className="inline-block bg-violet-800 hover:bg-violet-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-gray-400 text-2xl mb-4">No Details Found</div>
          <p className="text-xl text-white mb-6">
            The {isTvShow ? "TV show" : "movie"} you're looking for couldn't be
            found.
          </p>
          <Link
            to="/"
            className="inline-block bg-violet-800 hover:bg-violet-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Browse More Content
          </Link>
        </div>
      </div>
    );
  }

  const trailer = getTrailer();

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
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

      {/* Backdrop Image */}
      {media.backdrop_path && (
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
            alt={media.title || media.name}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster and Basic Info */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col">
            <div className="flex justify-center md:block">
              <img
                src={
                  media.poster_path
                    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
                    : "/no-poster.png"
                }
                alt={media.title || media.name}
                className="w-48 sm:w-56 md:w-full rounded-lg shadow-xl -mt-16 sm:-mt-20 md:-mt-24 relative z-10 border-4 border-gray-800 hover:border-violet-600 transition-all duration-300"
              />
            </div>

            {/* Rating and Like Button */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center bg-gray-800/80 rounded-full px-3 py-2 text-sm sm:text-base">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">
                  {media.vote_average?.toFixed(1)}
                </span>
                <span className="text-gray-400 ml-1">
                  ({media.vote_count?.toLocaleString()})
                </span>
              </div>
              <button
                onClick={toggleLike}
                className={`cursor-pointer border rounded-full px-4 py-2 font-medium transition-all duration-300 text-sm sm:text-base ${
                  liked
                    ? "bg-violet-800 text-white hover:bg-violet-700 border-none"
                    : "text-white hover:bg-white hover:text-black border-gray-600"
                }`}
              >
                {liked ? (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Liked
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Like
                  </span>
                )}
              </button>
            </div>

            {media.homepage && (
              <a
                href={media.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer mt-4 bg-gray-800/80 hover:bg-gray-700/70 rounded-full px-3 py-2 flex items-center justify-center gap-2 transition-colors text-md font-normal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Official Website
              </a>
            )}

            {/* Quick Facts (hidden on small screens) */}
            <div className="mt-6 space-y-3 hidden md:block">
              {media.status && (
                <div>
                  <h4 className="text-gray-400 text-sm">Status</h4>
                  <p className="font-medium">{media.status}</p>
                </div>
              )}

              {isTvShow ? (
                <>
                  <div>
                    <h4 className="text-gray-400 text-sm">First Air Date</h4>
                    <p className="font-medium">{formatDate(media.first_air_date)}</p>
                  </div>
                  {media.last_air_date && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Last Air Date</h4>
                      <p className="font-medium">{formatDate(media.last_air_date)}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-gray-400 text-sm">Seasons</h4>
                    <p className="font-medium">{media.number_of_seasons}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm">Episodes</h4>
                    <p className="font-medium">{media.number_of_episodes}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-gray-400 text-sm">Release Date</h4>
                    <p className="font-medium">{formatDate(media.release_date)}</p>
                  </div>
                  {media.runtime && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Runtime</h4>
                      <p className="font-medium">
                        {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                      </p>
                    </div>
                  )}
                </>
              )}

              {media.original_language && (
                <div>
                  <h4 className="text-gray-400 text-sm">Original Language</h4>
                  <p className="font-medium">
                    {media.original_language.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Details */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-gradient">
              {media.title || media.name}
            </h1>
            {media.tagline && (
              <p className="text-center text-lg sm:text-xl italic text-gray-400 mb-4 sm:mb-6">
                "{media.tagline}"
              </p>
            )}

            {/* Genres */}
            {media.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {media.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 sm:px-3 sm:py-1 bg-violet-800 text-white rounded-full text-xs sm:text-sm hover:bg-violet-700 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Trailer Button */}
            {trailer && (
              <button
                onClick={playTrailer}
                className="mb-6 sm:mb-8 bg-red-600 hover:bg-red-700 cursor-pointer mt-4 rounded-full px-3 py-2 flex items-center justify-center gap-2 transition-colors text-md font-normal w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Play Trailer
              </button>
            )}

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                    activeTab === "overview"
                      ? "text-violet-400 border-b-2 border-violet-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`md:hidden px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                    activeTab === "details"
                      ? "text-violet-400 border-b-2 border-violet-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("cast")}
                  className={`px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                    activeTab === "cast"
                      ? "text-violet-400 border-b-2 border-violet-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Cast
                </button>
                {isTvShow && (
                  <button
                    onClick={() => setActiveTab("seasons")}
                    className={`px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                      activeTab === "seasons"
                        ? "text-violet-400 border-b-2 border-violet-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Seasons
                  </button>
                )}
                {trailer && (
                  <button
                    onClick={() => {
                      setActiveTab("trailer");
                      playTrailer();
                    }}
                    className={`px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                      activeTab === "trailer"
                        ? "text-violet-400 border-b-2 border-violet-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Trailer
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "overview" && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3">Overview</h2>
                  <p className="text-base sm:text-lg leading-relaxed">
                    {media.overview || "No overview available."}
                  </p>
                  {/* Production Companies */}
                  {media.production_companies?.length > 0 && (
                    <div className="mt-4 sm:mt-6">
                      <h4 className="text-xl sm:text-2xl font-semibold mb-3">
                        Production Companies
                      </h4>
                      <div className="space-y-3">
                        {media.production_companies.map((company) => (
                          <div key={company.id} className="flex items-center">
                            {company.logo_path ? (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 bg-white rounded p-1 flex items-center justify-center">
                                <img
                                  src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                  alt={company.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm sm:text-lg mr-3">
                                🎬
                              </div>
                            )}
                            <span className="text-xs sm:text-sm">{company.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Quick Facts Tab */}
              {activeTab === "details" && (
                <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Rating */}
                  <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Rating</h3>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-sm sm:text-base">
                        {media.vote_average?.toFixed(1)}
                      </span>
                      <span className="text-gray-400 ml-1 text-xs sm:text-sm">
                        ({media.vote_count?.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {media.status && (
                    <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Status</h3>
                      <p className="font-medium text-sm sm:text-base">{media.status}</p>
                    </div>
                  )}

                  {/* Release Date */}
                  <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-gray-400 text-xs sm:text-sm mb-1">
                      {isTvShow ? "First Air Date" : "Release Date"}
                    </h3>
                    <p className="font-medium text-sm sm:text-base">
                      {formatDate(
                        isTvShow ? media.first_air_date : media.release_date
                      )}
                    </p>
                  </div>

                  {/* Runtime/Episodes */}
                  {isTvShow ? (
                    <>
                      <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Seasons</h3>
                        <p className="font-medium text-sm sm:text-base">{media.number_of_seasons}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Episodes</h3>
                        <p className="font-medium text-sm sm:text-base">
                          {media.number_of_episodes}
                        </p>
                      </div>
                    </>
                  ) : (
                    media.runtime && (
                      <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Runtime</h3>
                        <p className="font-medium text-sm sm:text-base">
                          {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                        </p>
                      </div>
                    )
                  )}

                  {/* Language */}
                  {media.original_language && (
                    <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-gray-400 text-xs sm:text-sm mb-1">
                        Original Language
                      </h3>
                      <p className="font-medium text-sm sm:text-base">
                        {media.original_language.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cast" && credits?.cast?.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Top Cast</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                    {credits.cast.slice(0, 12).map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-1 sm:mb-2 rounded-full overflow-hidden shadow-md border-2 border-gray-700 hover:border-violet-500 transition-colors">
                          <img
                            src={
                              person.profile_path
                                ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                                : "/no-avatar.png"
                            }
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {person.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "seasons" &&
                isTvShow &&
                media.seasons?.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3">Seasons</h2>
                    <div className="flex overflow-x-auto pb-2 gap-1 sm:gap-2 scrollbar-hide">
                      {media.seasons
                        .filter((season) => season.season_number !== 0)
                        .map((season) => (
                          <button
                            key={season.id}
                            onClick={() =>
                              setActiveSeason(season.season_number)
                            }
                            className={`flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-full transition-colors text-xs sm:text-sm ${
                              activeSeason === season.season_number
                                ? "bg-violet-600 text-white"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                          >
                            {season.name}
                          </button>
                        ))}
                    </div>
                    {activeSeason && (
                      <div className="mt-3 sm:mt-4 bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                        {media.seasons.find(
                          (season) => season.season_number === activeSeason
                        )?.overview || "No overview available for this season."}
                      </div>
                    )}
                  </div>
                )}

              {activeTab === "trailer" && trailer && (
                <div className="mb-6 sm:mb-8 w-full" ref={trailerRef}>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Trailer</h2>
                  <div className="relative pt-[56.25%] w-full rounded-xl overflow-hidden shadow-xl bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        trailer.key
                      }?autoplay=${
                        isTrailerPlaying ? 1 : 0
                      }&modestbranding=1&rel=0&controls=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TV Show Specific Sections */}
            {isTvShow && activeTab === "overview" && (
              <>
                {/* Created By */}
                {media.created_by?.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3">Created By</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2">
                      {media.created_by.map((creator) => (
                        <div key={creator.id} className="text-left">
                          <img
                            src={
                              creator.profile_path
                                ? `https://image.tmdb.org/t/p/w200${creator.profile_path}`
                                : "/no-avatar.png"
                            }
                            alt={creator.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 object-cover"
                          />
                          <p className="text-xs sm:text-sm font-medium">{creator.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Similar Content */}
        {similar.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Similar {isTvShow ? "TV Shows" : "Movies"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {similar.map((item) => (
                <Link
                  key={item.id}
                  to={`/${isTvShow ? "tv" : "movie"}/${item.id}`}
                  className="group"
                >
                  <div className="flex flex-col items-center text-center hover:scale-105 transition-transform">
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                          : "/no-poster.png"
                      }
                      alt={item.title || item.name}
                      className="w-full rounded-lg shadow-md mb-1 sm:mb-2 aspect-[2/3] object-cover"
                    />
                    <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2">
                      {item.title || item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;