import { Link } from "react-router-dom";

const MovieCard = ({ movie: { id, title, release_date, original_language, poster_path, vote_average } }) => {
  return (
    <Link to={`/movie/${id}`} className="movie-card text-white block">
      <div>
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : 'no-poster.png'}
          alt={title}
          className="w-full rounded-lg shadow-md hover:scale-105 transition-transform"
        />
        <div className="mt-4 movie-details">
          <h3 className="movie-title">{title}</h3>
          <div className="content">
            <div className="rating">
              <img src="star.svg" alt="Star Icon" />
              <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <span>•</span>
            <p className="lang">{original_language ? original_language.toUpperCase() : 'N/A'}</p>
            <span>•</span>
            <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;