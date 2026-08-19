import React, { useState, useEffect } from 'react';
import { Header } from "../Components-LandingPage/Header";
import { Footer } from '../Components-LandingPage/Footer';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import './OpportunityOverview.css';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import twitter from '../assets/socials-x.png';
import linkedin from '../assets/socials-linkedin.png';
import facebook from '../assets/socials-facebook.png';
import { formatPostedDate, isRecentlyPosted } from './OpportunitiesCard';
import { useJobs } from '../JobContext';
import { SearchBar } from './SearchBar';
import api from "../api/axios";

// Custom hook for scroll lock
const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
};

export const OpportunityOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [limitedSimilarJob, setLimitedSimilarJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchExperience, setSearchExperience] = useState("");
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [isIndustryPopupOpen, setIsIndustryPopupOpen] = useState(false);
  const [similarLocationPopup, setSimilarLocationPopup] = useState({
    open: false,
    jobId: null,
    locations: []
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { jobs, appliedJobs, toggleSaveJob, saveJob, isJobSaved } = useJobs();
  const saved = job ? isJobSaved(job.id) : false;
  const { isJobApplied } = useJobs();
  const isApplied = job ? isJobApplied(job.id) : false;

  // Check if job is highlighted or recent
  const isHighlighted = job?.is_highlighted === true;
  const isRecent = job ? isRecentlyPosted(job.posted_date || job.created_at) : false;
  const [isOpen, setIsOpen] = useState(false);

  // Authentication helper function
  const isAuthenticated = () => {
    return !!sessionStorage.getItem("access") && 
           sessionStorage.getItem("userRole") === "jobseeker";
  };

  // Apply scroll lock for all popups
  useScrollLock(isOpen);
  useScrollLock(isLocationPopupOpen);
  useScrollLock(isIndustryPopupOpen);
  useScrollLock(similarLocationPopup.open);
  useScrollLock(showLoginPopup);

  // Helper function for location display
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

  const handleSave = async () => {
    if (!isAuthenticated()) {
      setShowLoginPopup(true);
      return;
    }
    
    try {
      await saveJob(job.id);
      alert("Job saved successfully");
    } catch (err) {
      if (err.response?.status === 400) {
        alert("Job already saved");
      } else if (err.response?.status === 401) {
        setShowLoginPopup(true);
      } else {
        alert("Failed to save job");
      }
    }
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      setShowLoginPopup(true);
      return;
    }
    
    if (isApplied) return;
    navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
  };

  const handleReportClick = () => {
    if (!isAuthenticated()) {
      setShowLoginPopup(true);
      return;
    }
    
    navigate(`/Job-portal/jobseeker/ReportAJob/${job.id}`);
  };

  const handleSearch = () => {
    navigate("/Job-portal/jobseeker/searchresults", {
      state: {
        query: searchQuery,
        location: searchLocation,
        experience: searchExperience,
      },
    });
  };

  const handleLoginClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/login", {
      state: { redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${job?.id}` }
    });
  };

  const handleSignupClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/signup", {
      state: { redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${job?.id}` }
    });
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // First check if user is authenticated
        const isAuth = isAuthenticated();
        
        if (!isAuth) {
          // If not authenticated, redirect to login
          navigate("/Job-portal/jobseeker/login", {
            state: { 
              redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${id}` 
            }
          });
          return;
        }
        
        // Fetch job details with auth header
        const jobRes = await api.get(`/jobs/${id}/`);
        setJob(jobRes.data);

        // Fetch all jobs for similar jobs
        const allJobsRes = await api.get(`/jobs/all/`);
        const jobsArray = allJobsRes.data.jobs || allJobsRes.data.results || [];

        const similar = jobsArray
          .filter(j => Number(j.id) !== Number(jobRes.data.id))
          .filter(j => {
            if (jobRes.data.department && j.department) {
              const currentDept = Array.isArray(jobRes.data.department)
                ? jobRes.data.department
                : [jobRes.data.department];
              const jobDept = Array.isArray(j.department)
                ? j.department
                : [j.department];

              return currentDept.some(dept => jobDept.includes(dept));
            }
            return false;
          })
          .slice(0, 9);

        setLimitedSimilarJob(similar);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        
        // Handle specific error cases
        if (err.response?.status === 401) {
          // Unauthorized - token expired or invalid
          sessionStorage.clear();
          navigate("/Job-portal/jobseeker/login", {
            state: { 
              redirectTo: `/Job-portal/jobseeker/OpportunityOverview/${id}` 
            }
          });
        } else if (err.response?.status === 404) {
          setError("Job not found");
          setLoading(false);
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this job");
          setLoading(false);
        } else {
          setError("Failed to load job details. Please try again.");
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, navigate]);

  // Loading state
  if (loading) return (
    <>
      <Header />
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Loading...</h2>
      </div>
    </>
  );

  // Error state
  if (error) return (
    <>
      <Header />
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "red" }}>{error}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
      <Footer />
    </>
  );

  // Job not found state
  if (!job) {
    return (
      <>
        <Header />
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <h2>Job not found</h2>
          <p>This job may have been removed or you have already applied.</p>
          <button className="back-btn" onClick={() => navigate('/Job-portal/jobseeker/jobs')}>Back to Jobs</button>
        </div>
        <Footer />
      </>
    );
  }

  const formatLocation = (location) => {
    if (!location) return "Location not specified";
    if (Array.isArray(location)) {
      return location.join(", ");
    }
    return location;
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

  const industryDisplay = getIndustryDisplay(job.industry_type);
  const locationDisplay = locationsList.length > 0 ? locationsList.join(", ") : "Location not specified";

  let jobCardClassName = "opp-overview-job-card";
  let jobDetailsClassName = "opp-job-details-card";

  const getSimilarJobClass = (similarJob) => {
    const isSimHighlighted = similarJob.is_highlighted === true;
    const isSimRecent = isRecentlyPosted(similarJob.posted_date || similarJob.created_at);

    let className = "opp-similar-job";
    return className;
  };

  return (
    <>
      <Header />

      <div className='opp-overview-content'>
        <div className='search-backbtn-container'>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

          <SearchBar
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            searchLocation={searchLocation} setSearchLocation={setSearchLocation}
            searchExp={searchExperience} setSearchExp={setSearchExperience}
            onSearch={handleSearch}
          />
        </div>

        <div className='opp-overview-main'>
          <div className="opp-job-main">
            {/* Job Header */}
            <div className={jobCardClassName}>
              <div className="Opportunities-job-header">
                <div className="Opportunities-job-info">
                  <h2 className="opp-topcard-job-title">{job.job_title}</h2>

                  <h5 className="Opportunities-job-company">
                    {job.company?.company_name}
                    <span className="Opportunities-divider">|</span>
                    <span className="star">
                      <img src={starIcon} alt="star" />
                    </span>
                    {job.company?.rating || 0}
                    <span className="Opportunities-divider">|</span>
                    <span className="opp-reviews">
                      {job.company?.review_count || 0} Reviews
                    </span>
                  </h5>
                </div>

                {job.company.logo || job.company.company_logo ? (
                  <img
                    src={job.company.logo || job.company.company_logo}
                    alt={job.company?.company_name}
                    className="Opportunities-job-logo"
                  />
                ) : (
                  <div className="Opportunities-job-logo-placeholder">
                    {job.company?.company_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="Opportunities-job-details">
                <p className='Opportunities-detail-line'>
                  <img src={time} className='card-icons' alt="time" />
                  {job.work_duration}
                  <span className="Opportunities-divider">|</span>
                  {job.salary}
                </p>
                <p className='Opportunities-detail-line'>
                  <img src={experience} className='card-icons' alt="experience" />
                  {job.experience}
                </p>
                <p className='Opportunities-detail-line'>
                  <img src={place} className='card-icons' alt="location" />
                  <span className="location-text-wrap">
                    {locationsList.length > 3 ? (
                      <>
                        {locationsList.slice(0, 3).join(", ")}
                        <span
                          className="opp-show-more-link"
                          onClick={() => setIsLocationPopupOpen(true)}
                        >
                          {" +" + (locationsList.length - 3) + " more"}
                        </span>
                      </>
                    ) : (
                      locationDisplay
                    )}
                  </span>
                </p>
              </div>

              <div className="Opportunities-details-bottom">
                <div className="Opportunities-details-left">
                  {job.job_category && (
                    <span className={`Opportunities-job-tag ${job.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {job.job_category}
                    </span>
                  )}

                  <span className="Opportunities-job-type">
                    {job.work_type}
                  </span>
                </div>

                {job.is_highlighted && (
                  <span className="highlighted-job-label">
                    ⭐ Highlighted Job
                  </span>
                )}
              </div>
              <hr className="Opportunities-separator" />

              <div className="Opportunities-job-footer">
                <div className="Opportunities-job-meta">
                  <p>
                    {formatPostedDate(job.posted_date)}
                    <span className="Opportunities-divider">|</span>
                    Openings: {job.openings}
                    <span className="Opportunities-divider">|</span>
                    Applicants: {job.applicants_count}
                  </p>
                </div>

                <div className="Opportunities-job-actions">
                  <button
                    className={saved ? "Opportunities-apply-btn" : "Opportunities-save-btn"}
                    onClick={handleSave}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>

                  <button
                    className="Opportunities-apply-btn"
                    onClick={handleApply}
                    disabled={isApplied}
                    style={{
                      opacity: isApplied ? 0.6 : 1,
                      cursor: isApplied ? 'not-allowed' : 'pointer',
                      backgroundColor: isApplied ? '#6c757d' : ''
                    }}
                  >
                    {isApplied ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            </div>

            {/* Job Details Card */}
            <div className={jobDetailsClassName}>
              <div className="opp-job-highlights">
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
                <span className="location-text-wrap">
                  {industryDisplay.hasMore ? (
                    <>
                      {industryDisplay.allIndustries.slice(0, 3).join(", ")}
                      <span
                        className="opp-show-more-link"
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
              <p><strong>Location:</strong><span className="location-text-wrap">
                {locationsList.length > 3 ? (
                  <>
                    {locationsList.slice(0, 3).join(", ")}
                    <span
                      className="opp-show-more-link"
                      onClick={() => setIsLocationPopupOpen(true)}
                    >
                      {" +" + (locationsList.length - 3) + " more"}
                    </span>
                  </>
                ) : (
                  locationDisplay
                )}
              </span></p>
              <p><strong>Shift:</strong> {job.shift}</p>

              <h3>Key Skills</h3>
              <div className="opp-key-skills-container">
                {Array.isArray(job.key_skills) &&
                  job.key_skills.map((item, i) => (
                    <span key={i}>{item}</span>
                  ))}
              </div>

              <hr className="Opportunities-separator" />

              <div className="opp-share-job">
                <div>
                  <p>Share This job</p>
                  <div className='opp-socials'>
                    <div><img src={linkedin} className='opp-socials-icon' title='LinkedIn' alt="linkedin" /></div>
                    <div><img src={facebook} className='opp-socials-icon' title='Facebook' alt="facebook" /></div>
                    <div><img src={twitter} className='opp-socials-icon' title='Twitter' alt="twitter" /></div>
                  </div>
                </div>
                <button onClick={handleReportClick} className="opp-report-btn">
                  Report this job
                </button>
              </div>
            </div>
          </div>

          {/* Similar Jobs Section */}
          <div className="opp-job-sidebar">
            <h3>Similar Jobs</h3>
            {limitedSimilarJob.length > 0 ? (
              limitedSimilarJob.map((sim) => {
                const locationInfo = getLocationDisplay(sim.location);
                const simClassName = getSimilarJobClass(sim);
                const isSimHighlighted = sim.is_highlighted === true;
                const isSimRecent = isRecentlyPosted(sim.posted_date || sim.created_at);

                return (
                  <div
                    key={sim.id}
                    onClick={() => navigate(`/Job-portal/jobseeker/OpportunityOverview/${sim.id}`)}
                    className={simClassName}
                  >
                    <div className="Opportunities-job-header">
                      <div className="Opportunities-job-info">
                        <h2 className="similar-job-title">{sim.job_title}</h2>
                        <p className="similar-job-company">
                          {sim.company?.company_name}
                          <span className="Opportunities-divider">|</span>
                          <span className="star"><img src={starIcon} alt="star" /></span>
                          {sim.company?.rating || 0}
                          <span className="Opportunities-divider">|</span>
                          <span>{sim.company?.review_count || 0} Reviews</span>
                        </p>
                      </div>
                      {sim.company.logo || sim.company.company_logo ? (
                        <img
                          src={sim.company.logo || sim.company.company_logo}
                          alt={sim.company?.company_name}
                          className="Opportunities-job-logo"
                        />
                      ) : (
                        <div className="Opportunities-job-logo-placeholder">
                          {sim.company?.company_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="Opportunities-job-details">
                      <p className='Opportunities-detail-line'>
                        {Array.isArray(sim.tags) ? sim.tags.join(", ") : sim.tags}
                        {" "}<img src={experience} className='card-icons' alt="experience" /> {sim.experience}
                      </p>
                      <p className='Opportunities-detail-line'>
                        <img src={place} className='card-icons' alt="location" />
                        {locationInfo.hasMore ? (
                          <>
                            {locationInfo.allLocations.slice(0, 3).join(", ")}
                            <span
                              className="opp-show-more-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSimilarLocationPopup({
                                  open: true,
                                  jobId: sim.id,
                                  locations: locationInfo.allLocations
                                });
                              }}
                            >
                              {" +" + locationInfo.remainingCount + " more"}
                            </span>
                          </>
                        ) : (
                          locationInfo.display
                        )}
                      </p>
                    </div>

                    <div className="similar-job-footer">
                      <div className="Opportunities-job-type">
                        {sim.work_type}
                      </div>
                      {sim.is_highlighted && (
                        <span className="highlighted-job-label">
                          ⭐ Highlighted Job
                        </span>
                      )}
                      <p className='similar-job-footer-posted'>
                        {formatPostedDate(sim.posted_date)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>
                <p>Currently no similar jobs available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Main Location Popup Modal */}
      {isLocationPopupOpen && (
        <div className="opp-loc-modal-overlay" onClick={() => setIsLocationPopupOpen(false)}>
          <div className="opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="opp-loc-modal-header">
              <h3>All Locations</h3>
              <button className="opp-loc-modal-close" onClick={() => setIsLocationPopupOpen(false)}>&times;</button>
            </div>
            <div className="opp-loc-modal-body">
              {locationsList.map((loc, index) => (
                <span key={index} className="opp-loc-chip">{loc}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Industry Type Popup Modal */}
      {isIndustryPopupOpen && (
        <div className="opp-loc-modal-overlay" onClick={() => setIsIndustryPopupOpen(false)}>
          <div className="opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="opp-loc-modal-header">
              <h3>All Industries</h3>
              <button className="opp-loc-modal-close" onClick={() => setIsIndustryPopupOpen(false)}>&times;</button>
            </div>
            <div className="opp-loc-modal-body">
              {industryDisplay.allIndustries.map((industry, index) => (
                <span key={index} className="opp-loc-chip">{industry}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Similar Jobs Location Popup Modal */}
      {similarLocationPopup.open && (
        <div
          className="opp-loc-modal-overlay"
          onClick={() => setSimilarLocationPopup({ open: false, jobId: null, locations: [] })}
        >
          <div className="opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="opp-loc-modal-header">
              <h3>All Locations</h3>
              <button
                className="opp-loc-modal-close"
                onClick={() => setSimilarLocationPopup({ open: false, jobId: null, locations: [] })}
              >
                &times;
              </button>
            </div>
            <div className="opp-loc-modal-body">
              {similarLocationPopup.locations.map((loc, index) => (
                <span key={index} className="opp-loc-chip">{loc}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Popup Modal for unauthenticated actions */}
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={() => setShowLoginPopup(false)}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to continue</h3>
            
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