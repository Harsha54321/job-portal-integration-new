// PublicOpportunityOverview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicOpportunityOverview.css';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { formatPostedDate } from '../Components-Jobseeker/OpportunitiesCard';

export const PublicOpportunityOverview = ({ job, onClose }) => {
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [isIndustryPopupOpen, setIsIndustryPopupOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!job) return null;

  const getLocationDisplay = (location, maxDisplay = 3) => {
    if (!location) return { display: "Location not specified", allLocations: [], hasMore: false };

    let locationsArray = [];
    if (Array.isArray(location)) {
      locationsArray = location;
    } else if (typeof location === 'string') {
      locationsArray = location.split(',').map(l => l.trim()).filter(l => l !== "");
    } else {
      return { display: "Location not specified", allLocations: [], hasMore: false };
    }

    if (locationsArray.length === 0) {
      return { display: "Location not specified", allLocations: [], hasMore: false };
    }

    const displayLocations = locationsArray.slice(0, maxDisplay);
    const remainingCount = locationsArray.length - maxDisplay;
    const hasMore = remainingCount > 0;

    let display = displayLocations.join(", ");
    if (hasMore) {
      display += ` +${remainingCount} more`;
    }

    return {
      display,
      allLocations: locationsArray,
      hasMore,
      remainingCount
    };
  };

  const getIndustryDisplay = (industry, maxDisplay = 3) => {
    if (!industry) return { display: "Not specified", allIndustries: [], hasMore: false };

    let industryArray = [];
    if (Array.isArray(industry)) {
      industryArray = industry;
    } else if (typeof industry === 'string') {
      industryArray = industry.split(',').map(i => i.trim()).filter(i => i !== "");
    } else {
      return { display: "Not specified", allIndustries: [], hasMore: false };
    }

    if (industryArray.length === 0) {
      return { display: "Not specified", allIndustries: [], hasMore: false };
    }

    const displayIndustries = industryArray.slice(0, maxDisplay);
    const remainingCount = industryArray.length - maxDisplay;
    const hasMore = remainingCount > 0;

    let display = displayIndustries.join(", ");
    if (hasMore) {
      display += ` +${remainingCount} more`;
    }

    return {
      display,
      allIndustries: industryArray,
      hasMore,
      remainingCount
    };
  };

  let locationsList = [];
  if (job?.location) {
    const rawLocationStr = Array.isArray(job.location) ? job.location.join(', ') : job.location;
    if (typeof rawLocationStr === 'string') {
      locationsList = rawLocationStr
        .split(',')
        .map(l => l.trim())
        .filter(l => l !== "");
    }
  }

  const locationDisplay = getLocationDisplay(job.location);
  const industryDisplay = getIndustryDisplay(job.industry_type);

  const handleGuestAction = () => {
    setShowLoginPopup(true);
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  const handleLoginClick = () => {
    setShowLoginPopup(false);
    onClose();
    navigate("/Job-portal/jobseeker/login", {
      state: { redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${job.id}` }
    });
  };

  const handleSignupClick = () => {
    setShowLoginPopup(false);
    onClose();
    navigate("/Job-portal/jobseeker/signup", {
      state: { redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${job.id}` }
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="pub-opp-popup-overlay" onClick={handleBackdropClick}>
        <div className="pub-opp-popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="pub-opp-popup-close" onClick={onClose}>×</button>

          <div className="pub-opp-popup-scroll">
            {/* JOB CARD */}
            <div className="pub-opp-overview-job-card">
              <div className="pub-Opportunities-job-header">
                <div className="pub-Opportunities-job-info">
                  <h2 className="pub-opp-topcard-job-title">{job.job_title}</h2>
                  <h5 className="pub-Opportunities-job-company">
                    {job.company?.company_name}
                    <span className="pub-Opportunities-divider">|</span>
                    <span className="pub-star">
                      <img src={starIcon} alt="star" />
                    </span>
                    {job.company?.rating || 0}
                    <span className="pub-Opportunities-divider">|</span>
                    <span className="pub-opp-reviews">
                      {job.company?.review_count || 0} Reviews
                    </span>
                  </h5>
                </div>
                {job.company?.logo || job.company?.company_logo ? (
                  <img
                    src={job.company.logo || job.company.company_logo}
                    alt={job.company?.company_name}
                    className="pub-Opportunities-job-logo"
                  />
                ) : (
                  <div className="pub-Opportunities-job-logo-placeholder">
                    {job.company?.company_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="pub-Opportunities-job-details">
                <p className="pub-Opportunities-detail-line">
                  <img src={time} className="pub-card-icons" alt="time" />
                  {job.work_duration}
                  <span className="pub-Opportunities-divider">|</span>
                  {job.salary}
                </p>
                <p className="pub-Opportunities-detail-line">
                  <img src={experience} className="pub-card-icons" alt="experience" />
                  {job.experience}
                </p>
                <p className="pub-Opportunities-detail-line">
                  <img src={place} className="pub-card-icons" alt="location" />
                  <span className="pub-location-text-wrap">
                    {locationsList.length > 3 ? (
                      <>
                        {locationsList.slice(0, 3).join(", ")}
                        <span
                          className="pub-opp-show-more-link"
                          onClick={() => setIsLocationPopupOpen(true)}
                        >
                          {" +" + (locationsList.length - 3) + " more"}
                        </span>
                      </>
                    ) : (
                      locationDisplay.display
                    )}
                  </span>
                </p>
              </div>

              <div className="pub-Opportunities-details-bottom">
                <div className="pub-Opportunities-details-left">
                  {job.job_category && (
                    <span className={`pub-Opportunities-job-tag ${job.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {job.job_category}
                    </span>
                  )}
                  <span className="pub-Opportunities-job-type">
                    {job.work_type}
                  </span>
                </div>
                {job.is_highlighted && (
                  <span className="pub-highlighted-job-label">
                    ⭐ Highlighted Job
                  </span>
                )}
              </div>

              <hr className="pub-Opportunities-separator" />

              <div className="pub-Opportunities-job-footer">
                <div className="pub-Opportunities-job-meta">
                  <p>
                    {formatPostedDate(job.posted_date)}
                    <span className="pub-Opportunities-divider">|</span>
                    Openings: {job.openings}
                    <span className="pub-Opportunities-divider">|</span>
                    Applicants: {job.applicants_count}
                  </p>
                </div>

                <div className="pub-Opportunities-job-actions">
                  <button
                    className="pub-Opportunities-save-btn"
                    onClick={handleGuestAction}
                  >
                    Save
                  </button>
                  <button
                    className="pub-Opportunities-apply-btn"
                    onClick={handleGuestAction}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* JOB DETAILS CARD */}
            <div className="pub-opp-job-details-card">
              <div className="pub-opp-job-highlights">
                <h3>Job Highlights</h3>
                <ul>
                  {Array.isArray(job.job_highlights) &&
                    job.job_highlights.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                </ul>
              </div>

              <h3>Company Overview</h3>
              <p>{job.company?.about || ""}</p>

              <h3>Job Description</h3>
              <p>{job.job_description}</p>

              <h3>Responsibilities</h3>
              <ul>
                {Array.isArray(job.responsibilities) &&
                  job.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
              </ul>

              <p><strong>Role:</strong> {job.job_title}</p>

              <p><strong>Industry Type:</strong>
                <span className="pub-location-text-wrap">
                  {industryDisplay.hasMore ? (
                    <>
                      {industryDisplay.allIndustries.slice(0, 3).join(", ")}
                      <span
                        className="pub-opp-show-more-link"
                        onClick={() => setIsIndustryPopupOpen(true)}
                      >
                        {" +" + industryDisplay.remainingCount + " more"}
                      </span>
                    </>
                  ) : (
                    industryDisplay.display
                  )}
                </span>
              </p>

              <p><strong>Department:</strong> {Array.isArray(job.department) ? job.department.join(", ") : job.department}</p>
              <p><strong>Job Type:</strong> {job.work_type}</p>
              <p><strong>Location:</strong>
                <span className="pub-location-text-wrap">
                  {locationsList.length > 3 ? (
                    <>
                      {locationsList.slice(0, 3).join(", ")}
                      <span
                        className="pub-opp-show-more-link"
                        onClick={() => setIsLocationPopupOpen(true)}
                      >
                        {" +" + (locationsList.length - 3) + " more"}
                      </span>
                    </>
                  ) : (
                    locationDisplay.display
                  )}
                </span>
              </p>
              <p><strong>Shift:</strong> {job.shift}</p>

              <h3>Key Skills</h3>
              <div className="pub-opp-key-skills-container">
                {Array.isArray(job.key_skills) &&
                  job.key_skills.map((item, i) => (
                    <span key={i}>{item}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Popup Modal */}
      {isLocationPopupOpen && (
        <div className="pub-opp-loc-modal-overlay" onClick={() => setIsLocationPopupOpen(false)}>
          <div className="pub-opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pub-opp-loc-modal-header">
              <h3>All Locations</h3>
              <button className="pub-opp-loc-modal-close" onClick={() => setIsLocationPopupOpen(false)}>&times;</button>
            </div>
            <div className="pub-opp-loc-modal-body">
              {locationsList.map((loc, index) => (
                <span key={index} className="pub-opp-loc-chip">{loc}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Industry Type Popup Modal */}
      {isIndustryPopupOpen && (
        <div className="pub-opp-loc-modal-overlay" onClick={() => setIsIndustryPopupOpen(false)}>
          <div className="pub-opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pub-opp-loc-modal-header">
              <h3>All Industries</h3>
              <button className="pub-opp-loc-modal-close" onClick={() => setIsIndustryPopupOpen(false)}>&times;</button>
            </div>
            <div className="pub-opp-loc-modal-body">
              {industryDisplay.allIndustries.map((industry, index) => (
                <span key={index} className="pub-opp-loc-chip">{industry}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login/Signup Popup */}
      {showLoginPopup && (
        <div className="pub-login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="pub-login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to apply for jobs</h3>
            <h5>Access more opportunities by logging in or signing up.</h5>

            <div className="pub-login-popup-actions">
              <button
                className="pub-login-popup-login-btn"
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button
                className="pub-login-popup-signup-btn"
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