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

function MovieDetails({ isTvShow = false }) {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setIsLoading(true);
      setError("");
      try {
        const mediaType = isTvShow ? "tv" : "movie";
        const [detailsRes, creditsRes, similarRes] = await Promise.all([
          fetch(`${API_BASE_URL}/${mediaType}/${id}`, API_OPTIONS),
          fetch(`${API_BASE_URL}/${mediaType}/${id}/credits`, API_OPTIONS),
          fetch(`${API_BASE_URL}/${mediaType}/${id}/similar`, API_OPTIONS),
        ]);

        if (!detailsRes.ok) throw new Error("Failed to load media details.");
        if (!creditsRes.ok) throw new Error("Failed to load credits.");
        if (!similarRes.ok) throw new Error("Failed to load similar content.");

        const detailsData = await detailsRes.json();
        setMedia(detailsData);
        setCredits(await creditsRes.json());
        setSimilar((await similarRes.json()).results.slice(0, 6));

        // Set default season to the first one
        if (isTvShow && detailsData.seasons?.length > 0) {
          setActiveSeason(detailsData.seasons[0].season_number || 1);
        }

        // Check if liked
        const likedMovies =
          JSON.parse(localStorage.getItem("likedMovies")) || [];
        setLiked(likedMovies.some((m) => m.id === detailsData.id));
      } catch (err) {
        setError(err.message || "Something went wrong.");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader />
          <p className="mt-4 text-gray-400">Loading {isTvShow ? "TV show" : "movie"} details...</p>
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
          <p className="text-xl text-white mb-6">The {isTvShow ? "TV show" : "movie"} you're looking for couldn't be found.</p>
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

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      {/* Back Button */}
      <div className="p-4 fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="text-white hover:bg-violet-900 px-4 py-2 transition text-sm font-semibold rounded-lg"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Backdrop Image */}
      {media.backdrop_path && (
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster and Basic Info */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col">
            <img
              src={
                media.poster_path
                  ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
                  : "/no-poster.png"
              }
              alt={media.title || media.name}
              className="w-full rounded-lg shadow-xl -mt-20 relative z-10 border-4 border-gray-800"
            />

            {/* Rating and Like Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center bg-gray-800/80 rounded-full px-4 py-2">
                <svg
                  className="w-5 h-5 text-yellow-400 mr-1"
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
                className={`cursor-pointer border rounded-full px-4 py-2 font-medium ${
                  liked
                    ? "bg-violet-800 text-white hover:bg-violet-700 border-none"
                    : "text-white hover:bg-white hover:text-black"
                }`}
              >
                {liked ? "❤️ Liked" : "🤍 Like"}
              </button>
            </div>

            {media.homepage && (
              <a
                href={media.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer mt-4 bg-gray-800/80 hover:bg-gray-700/70 rounded-full px-4 py-2"
              >
                🌐 Visit Official Website
              </a>
            )}

            {/* Quick Facts */}
            <div className="mt-6 space-y-3">
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
                    <p className="font-medium">
                      {formatDate(media.first_air_date)}
                    </p>
                  </div>
                  {media.last_air_date && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Last Air Date</h4>
                      <p className="font-medium">
                        {formatDate(media.last_air_date)}
                      </p>
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
                    <p className="font-medium">
                      {formatDate(media.release_date)}
                    </p>
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

            {/* Production Companies */}
            {media.production_companies?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-gray-400 text-sm mb-2">
                  Production Companies
                </h4>
                <div className="space-y-3">
                  {media.production_companies.map((company) => (
                    <div key={company.id} className="flex items-center">
                      {company.logo_path ? (
                        <div className="w-10 h-10 mr-3 bg-white rounded p-1 flex items-center justify-center">
                          <img
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                            alt={company.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg mr-3">
                          🎬
                        </div>
                      )}
                      <span className="text-sm">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Details */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-gradient">{media.title || media.name}</h1>
            {media.tagline && (
              <p className="text-xl italic text-gray-400 mb-4">
                "{media.tagline}"
              </p>
            )}

            {/* Genres */}
            {media.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {media.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-violet-800 text-white rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">Overview</h2>
              <p className="text-lg leading-relaxed">
                {media.overview || "No overview available."}
              </p>
            </div>

            {/* TV Show Specific Sections */}
            {isTvShow && (
              <>
                {/* Created By */}
                {media.created_by?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3">Created By</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {media.created_by.map((creator) => (
                        <div key={creator.id} className="text-center">
                          <img
                            src={
                              creator.profile_path
                                ? `https://image.tmdb.org/t/p/w200${creator.profile_path}`
                                : "/no-avatar.png"
                            }
                            alt={creator.name}
                            className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                          />
                          <p className="font-medium">{creator.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seasons */}
                {media.seasons?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3">Seasons</h2>
                    <div className="flex overflow-x-auto pb-4 gap-2">
                      {media.seasons
                        .filter((season) => season.season_number !== 0) // Exclude season 0 (specials)
                        .map((season) => (
                          <button
                            key={season.id}
                            onClick={() =>
                              setActiveSeason(season.season_number)
                            }
                            className={`flex-shrink-0 px-4 py-2 rounded-full ${
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
                      <div className="mt-4 bg-gray-800/50 p-4 rounded-lg">
                        {media.seasons.find(
                          (season) => season.season_number === activeSeason
                        )?.overview || "No overview available for this season."}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Cast */}
            {credits?.cast?.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {credits.cast.slice(0, 12).map((person) => (
                    <div key={person.id} className="text-center">
                      <div className="w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden shadow-md border-2 border-gray-700">
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
                      <p className="text-sm font-medium text-white truncate">
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
          </div>
        </div>

        {/* Similar Content */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Similar {isTvShow ? "TV Shows" : "Movies"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((item) => (
                <Link
                  key={item.id}
                  to={`/${isTvShow ? "tv" : "movie"}/${item.id}`}
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                        : "/no-poster.png"
                    }
                    alt={item.title || item.name}
                    className="w-full rounded-lg shadow-md mb-2 aspect-[2/3] object-cover"
                  />
                  <h3 className="font-medium text-center truncate">
                    {item.title || item.name}
                  </h3>
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
