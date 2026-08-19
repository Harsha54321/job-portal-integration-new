import React, { useState, useEffect } from 'react'
import starIcon from '../assets/Star_icon.png'
import time from '../assets/opportunity_time.png'
import experience from '../assets/opportunity_bag.png'
import place from '../assets/opportunity_location.png'
import breifcase from '../assets/header_case.png';
import { Header } from '../Components-LandingPage/Header'
import twitter from '../assets/socials-x.png'
import linkedin from '../assets/socials-linkedin.png'
import facebook from '../assets/socials-facebook.png'
import './AppliedJobsOverview.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useJobs } from '../JobContext'
import { Stepper, Step, StepLabel, StepConnector, Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles';
import api from "../api/axios";
import { isRecentlyPosted } from './OpportunitiesCard';

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

const AnimatedConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: '#eaeaf0',
    borderLeftWidth: 3,
    minHeight: 40,
    transition: 'border-color 1.50s ease-in',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#1976d2',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#1976d2',
  },
}));

export const AppliedJobsOverview = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { setAppliedJobs, refreshAppliedJobs } = useJobs();

  const [appliedJob, setAppliedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(-1);

  // Location popup state
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  // Apply scroll lock for location popup
  useScrollLock(isLocationPopupOpen);

  // Fetch application by ID
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/jobs/applications/${id}/`);
        setAppliedJob(res.data);
      } catch (err) {
        console.error("Error fetching application:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Withdraw
  const withdrawApplication = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );
    if (!confirmed) return;

    try {
      await api.patch(`/jobs/applications/${appliedJob.id}/withdraw/`);
      setAppliedJob(prev => ({
        ...prev,
        status: "withdrawn"
      }));
      await refreshAppliedJobs();
      alert("Application withdrawn successfully");
      navigate("/Job-portal/jobseeker");
    } catch (err) {
      console.error(err);
      alert("Failed to withdraw application");
    }
  };

  // Stepper logic
  const statusOrder = [
    "applied",
    "resume_screening",
    "recruiter_review",
    "shortlisted",
    "interview_called",
    "offered",
    "hired",
  ];

  useEffect(() => {
    if (!appliedJob?.status) return;

    const status = appliedJob.status.toLowerCase();
    const storageKey = `last_stage_${appliedJob.id}`;

    if (status === "rejected") {
      const savedStage = localStorage.getItem(storageKey);
      const index = statusOrder.indexOf(savedStage);
      setActiveStep(index === -1 ? 0 : index);
    } else {
      localStorage.setItem(storageKey, status);
      const index = statusOrder.indexOf(status);
      setActiveStep(index === -1 ? 0 : index);
    }
  }, [appliedJob]);

  // Loading guards
  if (loading) return <p>Loading...</p>;
  if (!appliedJob) return <p>Application not found</p>;

  const job = appliedJob.job;

  // Check if job is highlighted
  const isHighlighted = job.is_highlighted === true;
  const isRecent = isRecentlyPosted(job.posted_date || job.created_at);

  // Helper function to get location display with + more
  const getLocationDisplay = (location, maxDisplay = 2) => {
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

  // Get location info
  const locationInfo = getLocationDisplay(job.location, 2);

  const viewJob = {
    title: job.job_title,
    company: job.company?.company_name || "Company",
    ratings: job.company?.rating || 0,
    reviewNo: job.company?.review_count || 0,
    WorkType: job.work_type,
    experience: job.experience,
    salary: job.salary,
    location: locationInfo.display,
    logo: job.company?.logo || job.company?.company_logo,
    tags: job.job_category || "",
    JobHighlights: job.job_highlights || [],
    is_highlighted: job.is_highlighted || false,
    Responsibilities: job.responsibilities || [],
    KeySkills: job.key_skills || [],
    jobDescription: job.job_description,
    companyOverview: job.company?.about || "",
    status: {
      type: appliedJob.job.job_status?.toLowerCase() || "reviewing application",
      text: appliedJob.job.job_status
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, c => c.toUpperCase()) || "Reviewing Application",
    },
  };

  const applicationStatus = [
    {
      label: 'Application Submitted',
      sub: "Your profile, resume, and cover letter have successfully entered the company's database."
    },
    {
      label: 'Resume Screening',
      sub: "Your resume is currently being reviewed."
    },
    {
      label: 'Recruiter Review',
      sub: "A hiring manager reviews your experience."
    },
    {
      label: 'Shortlisted',
      sub: "You have passed the initial review stages."
    },
    {
      label: 'Interview Called',
      sub: "The hiring team has reached out to you."
    },
    {
      label: 'Offered',
      sub: "Congratulations! You have received a job offer."
    },
    {
      label: 'Hired',
      sub: "You have been successfully hired. Welcome aboard!"
    },
  ];

  // Determine card class for top card
  let topCardClassName = "appliedjobsO-job-card";
  // if (isHighlighted) {
  //   topCardClassName += " highlighted-job";
  // } else if (isRecent) {
  //   topCardClassName += " recent-job";
  // }

  // Determine card class for details card
  let detailsCardClassName = "opp-job-details-card";
  // if (isHighlighted) {
  //   detailsCardClassName += " highlighted-job";
  // } else if (isRecent) {
  //   detailsCardClassName += " recent-job";
  // }

  return (
    <div>
      <Header />
      <div style={{ margin: "120px 60px 20px 60px", display: "flex", justifyContent: "flex-start" }}>
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{ padding: "10px 25px", border: "1px solid #ddd", borderRadius: "8px", background: "#5D98F1", fontWeight: "600", color: "#FFFF", cursor: "pointer" }}
        >
          Back
        </button>
      </div>
      <div className={topCardClassName}>
        <div className="applied-jobs-top-card-grid">
          <div>
            {/* <div className="myjobs-card-header">
              <div><h2 className="myjobs-job-title">{viewJob.title}</h2></div>
            </div> */}
            <div className="myjobs-card-header">
              <div className="myjobs-job-info">
                <h2 className="myjobs-job-title">
                  {viewJob.title}
                </h2>
              </div>
            </div>
            <div style={{ marginTop: "20px" }} className="myjobs-company-sub">
              <p className="myjobs-company-name">
                {viewJob.company}
                <span className="Opportunities-divider">|</span>
                <span className="star"><img src={starIcon} alt="star" /></span>
                {viewJob.ratings}
                <span className="Opportunities-divider">|</span>
                <span>{viewJob.reviewNo}</span>
              </p>
            </div>
            <div style={{ marginTop: "20px" }} className="Opportunities-job-details">
              <p className='Opportunities-detail-line'>
                <img src={time} className='card-icons' alt="time" />
                {viewJob.WorkType}
                <span className="Opportunities-divider">|</span>
                <span>{viewJob.salary}</span>
                <span className="Opportunities-divider">|</span>
                <img src={experience} className='card-icons' alt="experience" />
                {viewJob.experience}
                <span className="Opportunities-divider">|</span>
                <img src={place} className='card-icons' alt="location" />

                {/* Location with + more functionality */}
                {locationInfo.hasMore ? (
                  <>
                    {locationInfo.allLocations.slice(0, 2).join(", ")}
                    <span
                      className="opp-show-more-link"
                      onClick={() => setIsLocationPopupOpen(true)}
                    >
                      +{locationInfo.remainingCount} more
                    </span>
                  </>
                ) : (
                  viewJob.location
                )}
              </p>
            </div>
            <div style={{ marginTop: "20px", alignItems: "center", display: "flex", justifyContent: "space-between" }} className="Applied-job-tags">
              {viewJob.tags && (
                <div>
                  <span className={`Opportunities-job-tag ${viewJob.tags?.toLowerCase()}`}>
                    {viewJob.tags}
                  </span>
                </div>
              )}

              {viewJob.is_highlighted && (
                <span className="highlighted-job-label">
                  ⭐ Highlighted Job
                </span>
              )}
              <span className={`applied-application-status status-${viewJob.status.type.replace(/\s+/g, "_")}`}>
                {viewJob.status.text}
              </span>
            </div>
            <hr className="Opportunities-separator" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "end", paddingRight: "50px" }}>
            {viewJob.logo ? (
              <img
                width={150}
                style={{ marginTop: "50px" }}
                src={viewJob.logo}
                alt={viewJob.company}
              />
            ) : (
              <div className="Opportunities-job-logo-placeholder">
                {viewJob.company.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='AppliedJobs-overview-main'>
        <div className='opp-job-main'>
          <div className={detailsCardClassName}>
            {/* Job Highlights */}
            <div className="opp-job-highlights">
              <h3>Job Highlights</h3>
              <ul>
                {viewJob.JobHighlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <h3>Company Overview</h3>
            <p>{viewJob.companyOverview}</p>

            <h3>Job Description</h3>
            <p>{viewJob.jobDescription}</p>

            <h3>Responsibilities</h3>
            <ul>
              {viewJob.Responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p><strong>Role:</strong> {viewJob.title}</p>
            <p><strong>Job Type:</strong> {viewJob.WorkType}</p>
            <p>
              <strong>Location:</strong>
              {/* Location with + more in details section */}
              {locationInfo.hasMore ? (
                <>
                  {locationInfo.allLocations.slice(0, 2).join(", ")}
                  <span
                    className="opp-show-more-link"
                    onClick={() => setIsLocationPopupOpen(true)}
                  >
                    +{locationInfo.remainingCount} more
                  </span>
                </>
              ) : (
                viewJob.location
              )}
            </p>
            <p><strong>Experience:</strong> {viewJob.experience}</p>
            <p><strong>Salary:</strong> {viewJob.salary}</p>

            <h3>Key Skills</h3>
            <div className="opp-key-skills-container">
              {viewJob.KeySkills.map((item, i) => (
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
              <button onClick={() => navigate(`/Job-portal/jobseeker/ReportAJob/${job.id}`)} className="opp-report-btn">Report this job</button>
            </div>
          </div>
        </div>
        <div className="status-container">
          <div className="status-header">
            <img src={breifcase} className='card-icons' alt="briefcase" />
            <h3>Application status</h3>
          </div>

          <Box sx={{ width: '100%' }}>
            <Stepper
              orientation="vertical"
              activeStep={activeStep}
              connector={<AnimatedConnector />}
            >
              {applicationStatus.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {step.sub}
                      </Typography>
                    }
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: index <= activeStep ? 700 : 400,
                        color: index <= activeStep ? '#1976d2' : 'inherit',
                        transition: 'color 1.50s ease'
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Rejected banner */}
            {appliedJob.status?.toLowerCase() === "rejected" && (
              <Box sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: '#ffebee',
                borderLeft: '4px solid #d32f2f',
              }}>
                <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>
                  ✗ Rejected
                </Typography>
                <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                  Unfortunately, your application was not selected.
                </Typography>
              </Box>
            )}
          </Box>
          {appliedJob.status?.toLowerCase() === "applied" && (
            <button
              style={{
                border: "none",
                outline: "none",
                marginTop: "50px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: "#d32f2f",
                color: "white",
                cursor: "pointer",
              }}
              onClick={withdrawApplication}
            >
              Withdraw
            </button>
          )}
        </div>
        {appliedJob.status?.toLowerCase() !== "applied" && (
          <p style={{ color: "gray", fontSize: "12px" }}>
            Withdrawal not allowed after screening
          </p>
        )}
      </div>

      {/* Location Popup Modal */}
      {isLocationPopupOpen && (
        <div className="opp-loc-modal-overlay" onClick={() => setIsLocationPopupOpen(false)}>
          <div className="opp-loc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="opp-loc-modal-header">
              <h3>All Locations</h3>
              <button className="opp-loc-modal-close" onClick={() => setIsLocationPopupOpen(false)}>
                &times;
              </button>
            </div>
            <div className="opp-loc-modal-body">
              {locationInfo.allLocations.map((loc, index) => (
                <span key={index} className="opp-loc-chip">{loc}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};