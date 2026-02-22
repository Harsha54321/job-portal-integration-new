import React from "react";
import starIcon from "../assets/Star_icon.png";
import time from "../assets/opportunity_time.png";
import experience from "../assets/opportunity_bag.png";
import place from "../assets/opportunity_location.png";
import calender from "../assets/calender_card.png";
import "./AppliedJobCard.css";
import { useNavigate } from "react-router-dom";
import { formatPostedDate } from "./OpportunitiesCard";

export const AppliedJobCard = ({ appliedJob }) => {
  const navigate = useNavigate();

  const job = appliedJob?.job;
  if (!job) return null;

  // 🔹 Adapter: backend data → requirement shape
  const opp = {
    id: appliedJob.id,

    title: job.title,
    company: job.company?.name || "Company",

    ratings: job.company?.rating || 0,
    reviewNo: job.company?.review_count || 0,

    WorkType: job.work_type || "N/A",
    salary: job.salary || "N/A",
    experience: job.experience_required || "N/A",
    location: job.location || "N/A",

    posted: formatPostedDate(job.posted_date),
    openings: job.openings || 0,
    applicants: job.applicants_count || 0,

    tags: job.tags || [],

    appliedDate: appliedJob.applied_date
      ? new Date(appliedJob.applied_date).toLocaleDateString()
      : "N/A",

    status: {
      type: appliedJob.status?.toLowerCase() || "applied",
      text: appliedJob.status || "Applied",
    },
  };

  return (
    <div className="myjobs-job-card">
      {/* HEADER */}
      <div className="myjobs-card-header">
        <div>
          <h2 className="myjobs-job-title">{opp.title}</h2>
        </div>
      </div>

      {/* COMPANY */}
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

      {/* DETAILS */}
      <div className="Opportunities-job-details">
        <p className="Opportunities-detail-line">
          <img src={time} className="card-icons" alt="" />
          {opp.WorkType}
          <span className="Opportunities-divider">|</span>
          {opp.salary} Lpa
        </p>

        <p className="Opportunities-detail-line">
          <img src={experience} className="card-icons" alt="" />
          {opp.experience} years
        </p>

        <p className="Opportunities-detail-line">
          <img src={place} className="card-icons" alt="" />
          {opp.location}
        </p>

        <p className="Opportunities-detail-line">
          <img src={calender} className="card-icons" alt="" />
          {opp.posted}
          <span className="Opportunities-divider">|</span>
          Openings: {opp.openings}
          <span className="Opportunities-divider">|</span>
          Applicants: {opp.applicants}
        </p>
      </div>

      {/* TAGS */}
      <div className="Opportunities-job-tags">
        {opp.tags.map((tag, index) => (
          <span
            key={index}
            className={`Opportunities-job-tag ${tag.toLowerCase()}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <hr className="Opportunities-separator" />

      {/* FOOTER */}
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
