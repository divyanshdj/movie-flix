import React from 'react'

const MovieCard = ({movie:{title, release_date, original_language, poster_path, vote_average}}) => {
  return (
    <div className="movie-card text-white">
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '../assets/no-poster.png'}
        alt={title}
      />
      <div className="mt-4 movie-details">
        <h3 className="movie-title">{title}</h3>
        <div className='content'>
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className='lang'>{original_language ? original_language : 'N/A'}</p>
          <span>•</span>
          <p className='year'>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

export default MovieCard