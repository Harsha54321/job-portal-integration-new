import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Joblisting.css';
import place from '../assets/opportunity_location.png';
import { LocationDisplay } from '../Components-Jobseeker/LocationDisplay';
import { PublicOpportunityOverview } from './PublicOpportunityOverview';

export const JoblistingCard = ({ job }) => {
  const navigate = useNavigate();
  const [showPublicPopup, setShowPublicPopup] = useState(false);

  const title = job.job_title || job.title;
  const companyName = job.company?.company_name || job.company;
  const type = job.job_type || job.type;
  const tags = job.tags || [];

  const handleViewDetails = () => {
    const isLoggedIn =
      !!sessionStorage.getItem("access") &&
      sessionStorage.getItem("userRole") === "jobseeker";

    if (isLoggedIn) {
      navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`);
    } else {
      setShowPublicPopup(true);
    }
  };

  const handleClosePublicPopup = () => {
    setShowPublicPopup(false);
  };

  return (
    <>
      <div className="joblisting-card">
        <h3 className="joblisting-card-title" title={title}>{title}</h3>
        {job.company?.logo || job.company?.company_logo ? (
          <img
            src={job.company.logo || job.company.company_logo}
            alt={job.company?.company_name}
            className="Opportunities-job-logo"
          />
        ) : (
          <div className="Opportunities-job-logo-placeholder">
            {job.company?.company_name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="joblisting-card-company">
          <b>{companyName}</b>
          <div className='Opportunities-detail-line'>
            <img src={place} className='card-icons' alt="location" />
            <LocationDisplay locations={job.location} />
          </div>
        </div>

        <p className="joblisting-card-type">{type}</p>

        <div className="joblisting-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="joblisting-card-tag">
              {tag}
            </span>
          ))}
        </div>

        <button
          className="view-joblisting-button"
          onClick={handleViewDetails}
        >
          View details
        </button>
      </div>

      {showPublicPopup && (
        <PublicOpportunityOverview
          job={job}
          onClose={handleClosePublicPopup}
        />
      )}
    </>
  );
};
