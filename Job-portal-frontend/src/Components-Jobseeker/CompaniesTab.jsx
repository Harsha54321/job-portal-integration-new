import React, { useState, useEffect } from 'react'
import './CompaniesTab.css'
import { useNavigate } from "react-router-dom";
import { Footer } from '../Components-LandingPage/Footer';
import starIcon from '../assets/Star_icon.png'
import { Header } from '../Components-LandingPage/Header';
import { SearchBar } from './SearchBar'
import api from "../api/axios";

export const CompaniesTab = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    api
      .get("companies/")
      .then((res) => {
        setCompanies(res.data);
      })
      .catch((err) => console.error("Error fetching companies:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleInitialSearch = () => {
    navigate('/Job-portal/jobseeker/searchresults', {
      state: {
        query: query,
        location: location,
        experience: experience
      }
    })
  }

  return (
    <>
      <Header />

      <div className='jobs-tab-search-bar'>
        <SearchBar
          searchQuery={query}
          setSearchQuery={setQuery}
          searchLocation={location}
          setSearchLocation={setLocation}
          searchExp={experience}
          setSearchExp={setExperience}
          onSearch={handleInitialSearch}
        />
      </div>

      <div className="companies-tab-container">
        <h2 className="carousel-title">Companies for you</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading companies...</p>
        ) : (
          <div className="companies-tab-grid">
            {companies.map((company) => {
              const logoUrl = company.logo_url || null;

              return (
                <div key={company.id} className="companies-tab-card">
                  <div className="companies-tab-logo-container">

                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={company.name}
                        className="companies-tab-logo"
                      />
                    ) : (
                      <div className="companies-tab-logo-placeholder">
                        {company.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                  </div>

                  <h3 className="companies-tab-name">{company.name}</h3>

                  <div className="companies-tab-rating-reviews">
                    <span className="star companies-tab-rating-star">
                      <img src={starIcon} alt="rating" />
                    </span>
                    <span className="companies-tab-rating">{company.rating ?? 0}</span>
                    <span className="companies-tab-separator">|</span>
                    <span className="companies-tab-reviews">{company.review_count ?? 0} reviews</span>
                  </div>

                  <p className="companies-tab-desc">
                    {company.slogan || "No description available"}
                  </p>

                  <button
                    className="companies-tab-view-jobs-btn"
                    onClick={() =>
                      navigate(`/Job-portal/jobseeker/companies/${company.id}`)
                    }
                  >
                    View Jobs
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}