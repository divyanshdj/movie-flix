import React from 'react'

const MovieCard = ({movie:{title, release_date}}) => {
  return (
    <div>
        <p className="text-white">{title}</p>
        <p className="text-yellow-100">{release_date}</p>
    </div>
  )
}

export default MovieCard