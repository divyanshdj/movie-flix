import React from "react";

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input
          type="text"
          placeholder="Search for movies, tv shows, actors, and more..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
