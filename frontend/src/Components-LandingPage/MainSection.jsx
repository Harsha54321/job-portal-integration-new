import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainSection.css';
import search from '../assets/icon_search.png';
import location from '../assets/icon_location.png';
import tick from '../assets/icon_tick.png';
import time from '../assets/opportunity_time.png';
import experienceIcon from '../assets/opportunity_bag.png';
import placeIcon from '../assets/opportunity_location.png';
import api from '../api/axios';
import { LocationDisplay } from '../Components-Jobseeker/LocationDisplay';
import { formatPostedDate } from '../Components-Jobseeker/OpportunitiesCard';
import '../Components-Jobseeker/SearchResultsCard.css';

export const MainSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showLoginPopup ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLoginPopup]);

  const searchResultsPath = '/Job-portal/jobseeker/searchresults';

  const saveSearchData = () => {
    const searchData = {
      query: searchQuery,
      location: searchLocation,
      experience: searchExperience,
      timestamp: Date.now()
    };

    sessionStorage.setItem('pendingSearch', JSON.stringify(searchData));
    sessionStorage.setItem('savedSearch', JSON.stringify(searchData));

    return searchData;
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim() && !searchLocation.trim() && !searchExperience) {
      setSearchResults(null);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSearchLocation(value);
    if (!searchQuery.trim() && !value.trim() && !searchExperience) {
      setSearchResults(null);
    }
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setSearchExperience(value);
    if (!searchQuery.trim() && !searchLocation.trim() && !value) {
      setSearchResults(null);
    }
  };

  // Helper function to match experience values dynamically
  const matchesExperience = (jobExp, expFilter) => {
    if (!expFilter) return true;
    if (!jobExp) return false;

    const expStr = String(jobExp).toLowerCase();
    const filterStr = String(expFilter).toLowerCase();

    if (filterStr === 'fresher') {
      return expStr.includes('fresher') || expStr.includes('0') || expStr.includes('entry');
    }
    if (filterStr === '1-3') {
      return expStr.includes('1') || expStr.includes('2') || expStr.includes('3') || expStr.includes('1-3');
    }
    if (filterStr === '3-5') {
      return expStr.includes('3') || expStr.includes('4') || expStr.includes('5') || expStr.includes('3-5');
    }
    if (filterStr === '5+') {
      return expStr.includes('5') || expStr.includes('6') || expStr.includes('7') || expStr.includes('8') || expStr.includes('10') || expStr.includes('5+');
    }

    return expStr.includes(filterStr);
  };

  const handleSearch = async () => {
    const access = sessionStorage.getItem('access');
    const userRole = sessionStorage.getItem('userRole');
    const isLoggedIn = Boolean(access) && userRole === 'jobseeker';

    if (isLoggedIn) {
      navigate(searchResultsPath, {
        state: {
          query: searchQuery,
          location: searchLocation,
          experience: searchExperience,
        }
      });
      return;
    }

    setSearchLoading(true);
    try {
      const params = {};

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
        params.q = searchQuery.trim();
      }
      if (searchLocation.trim()) {
        params.location = searchLocation.trim();
      }
      if (searchExperience) {
        params.experience = searchExperience;
        params.exp = searchExperience;
      }

      const res = await api.get('/jobs/', { params });

      let rawJobs = Array.isArray(res.data)
        ? res.data
        : (res.data?.jobs || res.data?.results || []);

      // If backend returns empty array due to strict string mismatch on experience,
      // fallback to fetching general results and applying client-side experience matching
      if (rawJobs.length === 0 && searchExperience) {
        const fallbackParams = {};
        if (searchQuery.trim()) fallbackParams.search = searchQuery.trim();
        if (searchLocation.trim()) fallbackParams.location = searchLocation.trim();

        const fallbackRes = await api.get('/jobs/', { params: fallbackParams });
        const fallbackJobs = Array.isArray(fallbackRes.data)
          ? fallbackRes.data
          : (fallbackRes.data?.jobs || fallbackRes.data?.results || []);

        rawJobs = fallbackJobs.filter(job =>
          matchesExperience(job.experience || job.work_duration, searchExperience)
        );
      }

      setSearchResults(rawJobs);
    } catch (err) {
      console.error('Guest job search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGuestAction = (e) => {
    e.stopPropagation();
    setShowLoginPopup(true);
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  const handleLoginClick = () => {
    const searchData = saveSearchData();

    setShowLoginPopup(false);
    navigate('/Job-portal/jobseeker/login', {
      state: {
        fromSearch: true,
        searchQuery: searchData.query,
        searchLocation: searchData.location,
        searchExperience: searchData.experience,
        redirectTo: searchResultsPath
      }
    });
  };

  const handleSignupClick = () => {
    const searchData = saveSearchData();

    setShowLoginPopup(false);
    navigate('/Job-portal/jobseeker/signup', {
      state: {
        fromSearch: true,
        searchQuery: searchData.query,
        searchLocation: searchData.location,
        searchExperience: searchData.experience,
        redirectTo: searchResultsPath
      }
    });
  };

  return (
    <>
      <main className="main-section">
        <h1 className="headline">"Your Dream Job Is Just A Click Away"</h1>
        <p className="subheading">Explore 5 Lakh+ Openings Now</p>

        <div className="search-bar">
          <div className="search-field">
            <span>
              <img src={search} className="icon-size" alt="search_icon" />
            </span>
            <input
              type="text"
              placeholder="Search by Skills, company or job title"
              value={searchQuery}
              onChange={handleQueryChange}
            />
          </div>

          <div className="separator"></div>

          <div className="search-field">
            <span>
              <img src={location} className="icon-size" alt="location_icon" />
            </span>
            <input
              type="text"
              placeholder="Enter Location"
              value={searchLocation}
              onChange={handleLocationChange}
            />
          </div>

          <div className="separator"></div>

          <div className="search-field">
            <span>
              <img src={tick} className="icon-size" alt="search_tick" />
            </span>
            <select
              value={searchExperience}
              onChange={handleExperienceChange}
            >
              <option value="" disabled hidden>Enter Experience</option>
              <option value="fresher">Fresher</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>

          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {searchLoading && (
          <p className="mini-no-results">Searching jobs...</p>
        )}

        {!searchLoading && searchResults !== null && (
          <div className="mini-results-section">
            {searchResults.length === 0 ? (
              <p className="mini-no-results">No jobs found matching your search.</p>
            ) : (
              <div className="mini-results-list">
                {searchResults.map((job) => {
                  const logoContent = job.company?.logo || job.company?.company_logo || job.logo ? (
                    <img
                      src={job.company?.logo || job.company?.company_logo || job.logo}
                      alt={job.company?.company_name || job.company}
                      className="SearchResults-job-card-job-logo"
                    />
                  ) : (
                    <div className="SearchResults-job-card-logo-placeholder">
                      {(job.company?.company_name || job.company || "C").charAt(0).toUpperCase()}
                    </div>
                  );

                  return (
                    <div className="SearchResults-job-card" key={job.id}>
                      <div>
                        <div className="SearchResults-job-card-header">
                          <div className="SearchResults-job-card-info">
                            <h3 className="SearchResults-job-card-title">
                              {job.job_title || job.role || job.title}
                            </h3>
                            <p className="SearchResults-job-card-company">
                              {job.company?.company_name || job.company || "N/A"}
                            </p>
                          </div>
                          {logoContent}
                        </div>

                        <div className="SearchResults-job-card-details">
                          <p className="SearchResults-job-card-detail-line">
                            <img src={time} className="SearchResults-job-card-icons" alt="duration" />
                            {job.work_duration || "Full Time"}
                            <span className="SearchResults-job-card-divider">|</span>
                            ₹ {job.salary || "Not disclosed"}
                          </p>
                          <p className="SearchResults-job-card-detail-line">
                            <img src={experienceIcon} className="SearchResults-job-card-icons" alt="experience" />
                            {job.experience || "Not specified"}
                          </p>
                          <div className="SearchResults-job-card-detail-line">
                            <img src={placeIcon} className="SearchResults-job-card-icons" alt="location" />
                            <LocationDisplay locations={job.location} />
                          </div>
                        </div>

                        <div className="SearchResults-job-card-details-bottom">
                          <div className="SearchResults-job-card-details-child">
                            {job.job_category && (
                              <span className={`SearchResults-job-card-tag ${job.job_category.toLowerCase()}`}>
                                {job.job_category}
                              </span>
                            )}
                            <div className="SearchResults-job-card-type">
                              {job.work_type || job.type || "Not specified"}
                            </div>
                          </div>

                          <div className="Opportunities-job-highlighted">
                            {(job.is_highlighted || job.isHighlighted) && (
                              <span className="highlighted-job-label">
                                ⭐ Highlighted Job
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <hr className="SearchResults-job-card-separator" />

                      <div className="SearchResults-job-card-footer">
                        <div className="SearchResults-job-card-meta">
                          <p>
                            {formatPostedDate(job.posted_date || job.created_at || job.date)}
                            <span className="SearchResults-job-card-divider">|</span>
                            Openings: {job.openings || 1}
                            <span className="SearchResults-job-card-divider">|</span>
                            Applicants: {job.applicants_count || job.applicants || 0}
                          </p>
                        </div>

                        <div className="SearchResults-job-card-actions">
                          <button className="SearchResults-save-btn" onClick={handleGuestAction}>
                            Save
                          </button>

                          <button className="SearchResults-apply-btn" onClick={handleGuestAction}>
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to search jobs</h3>

            <div className="login-popup-actions">
              <button
                className="login-popup-login-btn"
                onClick={handleLoginClick}
              >
                Login
              </button>

              <button
                className="login-popup-signup-btn"
                onClick={handleSignupClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};