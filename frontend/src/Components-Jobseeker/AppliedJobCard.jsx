import React from 'react'
import starIcon from '../assets/Star_icon.png'
import time from '../assets/opportunity_time.png'
import experience from '../assets/opportunity_bag.png'
import place from '../assets/opportunity_location.png'
import calender from '../assets/calender_card.png'
import './AppliedJobCard.css'
import { useNavigate } from "react-router-dom";
import { formatPostedDate, isRecentlyPosted } from "./OpportunitiesCard";
import { LocationDisplay } from './LocationDisplay';

export const AppliedJobCard = ({ appliedJob }) => {
  const navigate = useNavigate();

  const job = appliedJob?.job;
  if (!job) return null;

  // Determine card styling based on job status
  const isHighlighted = job.is_highlighted === true;
  const isRecent = isRecentlyPosted(job.posted_date || job.created_at);

  // Priority: Highlighted > Recent > Normal
  let cardClassName = "myjobs-job-card";
  // if (isHighlighted) {
  //   cardClassName += " highlighted-job";
  // } else if (isRecent) {
  //   cardClassName += " recent-job";
  // }

  // Get badge text based on job status
  const getBadge = () => {
    // if (isHighlighted) {
    //   return <span className="job-badge premium-badge">⭐ Featured</span>;
    // }
    // if (isRecent) {
    //   return <span className="job-badge recent-badge">🆕 New</span>;
    // }
    return null;
  };

  // 🔹 Adapter: backend data → requirement shape
  const opp = {
    id: appliedJob.id,

    title: job.job_title,
    company: job.company?.company_name || "Company",

    ratings: job.company?.rating || 0,
    reviewNo: job.company?.review_count || 0,

    WorkType: job.work_type || "N/A",
    salary: job.salary || "N/A",
    experience: job.experience || "N/A",

    posted: formatPostedDate(job.posted_date),
    openings: job.openings || 0,
    applicants: job.applicants_count || 0,

    tags: job.job_category || [],

    appliedDate: appliedJob.appliedDate,

    status: {
      type: appliedJob.job.job_status?.toLowerCase() || "applied",
      text: appliedJob.job.job_status || "Applied",
    },
  };

  return (
    <div className={cardClassName}>
      {/* Badge for highlighted/recent jobs */}
      {getBadge()}

      <div className="myjobs-card-header">
        <div className="myjobs-job-info">
          <h2 className="myjobs-job-title">{opp.title}</h2>
        </div>
      </div>
      <div className="myjobs-company-sub">
        <p className="myjobs-company-name">
          {opp.company}
          <span className="Opportunities-divider">|</span>
          <span className="star">
            <img src={starIcon} alt="rating" />
          </span>
          {opp.ratings}
          <span className="Opportunities-divider">|</span>
          <span>{opp.reviewNo} reviews</span>
        </p>
      </div>

      <div className="Opportunities-job-details">
        <p className='Opportunities-detail-line'>
          <img src={time} className='card-icons' />
          {opp.WorkType}
          <span className="Opportunities-divider">|</span>
          {opp.salary}
        </p>
        <p className='Opportunities-detail-line'>
          <img src={experience} className='card-icons' />
          {opp.experience}
        </p>
        <div className='Opportunities-detail-line'>
          <img src={place} className='card-icons' alt="location" />
          <LocationDisplay locations={job.location} />
        </div>
        <p className='Opportunities-detail-line'>
          <img src={calender} className='card-icons' />
          {opp.posted}
          <span className="Opportunities-divider">|</span>
          Openings: {opp.openings}
          <span className="Opportunities-divider">|</span>
          Applicants: {opp.applicants}
        </p>
      </div>

      <div className="Opportunities-job-tags">
        {job.job_category && (
          <span className={`Opportunities-job-tag ${job.job_category.toLowerCase()}`}>
            {job.job_category}
          </span>
        )}
        <div className="Opportunities-job-highlighted">
          {job.is_highlighted && (
            <span className="highlighted-job-label">
              ⭐ Highlighted Job
            </span>
          )}
        </div>
      </div>

      <hr className="Opportunities-separator" />

      <div className="Opportunities-job-footer">
        <div className="applied-app-status-container">
          <p className="myjobs-saved-date">{opp.appliedDate}</p>
          <span className="Opportunities-divider">|</span>
          <span
            className={`applied-application-status status-${opp.status.type.replace(/\s+/g, "_")}`}
          >
            {opp.status.text}
          </span>
        </div>

        <div className="Opportunities-job-actions">
          <button
            className="myjobs-btn"
            onClick={() =>
              navigate(
                `/Job-portal/jobseeker/appliedjobsoverview/${opp.id}`
              )
            }
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
};