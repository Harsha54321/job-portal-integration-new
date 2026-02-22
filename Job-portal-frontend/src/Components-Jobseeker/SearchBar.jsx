import React from 'react';
import search from '../assets/icon_search.png';
import location from '../assets/icon_location.png';
import tick from '../assets/icon_tick.png';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchLocation,
  setSearchLocation,
  searchExp,
  setSearchExp,
  onSearch
}) => {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <div className="search-field">
        <img src={search} className="icon-size" alt="search" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by skills, company or job title"
        />
      </div>

      <div className="separator"></div>

      <div className="search-field">
        <img src={location} className="icon-size" alt="location" />
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>

      <div className="separator"></div>

      <div className="search-field">
        <img src={tick} className="icon-size" alt="experience" />
        <select value={searchExp} onChange={(e) => setSearchExp(e.target.value)}>
          <option value="" disabled>Experience</option>
          <option value="fresher">Fresher</option>
          <option value="1-3">1–3 Years</option>
          <option value="3-5">3–5 Years</option>
          <option value="5+">5+ Years</option>
        </select>
      </div>

      <button
        type="submit"
        className="search-button"
        disabled={!searchQuery && !searchLocation && !searchExp}
      >
        Search
      </button>
    </form>
  );
};
