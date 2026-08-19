import React from 'react';
import api from '../api/axios';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import calender from '../assets/calender_card.png';
import './SavedJobsCard.css';
import { useJobs } from '../JobContext';
import { formatPostedDate, isRecentlyPosted } from './OpportunitiesCard';
import { useNavigate } from "react-router-dom";
import { LocationDisplay } from './LocationDisplay';

export const SavedJobsCard = ({ job, onRemoved }) => {
    const { isJobApplied } = useJobs();
    const { unsaveJob } = useJobs();
    const isApplied = isJobApplied(job.id);

    const navigate = useNavigate();
    if (!job) return null;

    // Determine card styling based on job status
    const isHighlighted = job.is_highlighted === true;
    const isRecent = isRecentlyPosted(job.posted_date || job.created_at);

    // Priority: Highlighted > Recent > Normal
    let cardClassName = "myjobs-job-card";
    // if (isHighlighted) {
    //     cardClassName += " highlighted-job";
    // } else if (isRecent) {
    //     cardClassName += " recent-job";
    // }

    // Get badge text based on job status
    const getBadge = () => {
        // if (isHighlighted) {
        //     return <span className="job-badge premium-badge">⭐ Featured</span>;
        // }
        // if (isRecent) {
        //     return <span className="job-badge recent-badge">🆕 New</span>;
        // }
        return null;
    };

    const handleUnsave = async () => {
        try {
            await unsaveJob(job.id);
            onRemoved?.(job.id);
            alert("Job removed from saved list");
        } catch (err) {
            alert("Failed to remove saved job");
        }
    };

    const handleApply = () => {
        if (isApplied) return;

        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
    };

    const HandleClick = () => {
        navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`);
    };

    return (
        <div className={cardClassName}>
            {/* Badge for highlighted/recent jobs */}
            {getBadge()}

            <div onClick={() => HandleClick()}>
                <div className="myjobs-card-header">
                    <div>
                        <h2 className="myjobs-job-title">{job.job_title}</h2>
                    </div>
                </div>
                <div className="myjobs-company-sub">
                    <p className="myjobs-company-name">
                        {job.company?.company_name}
                        <span className="Opportunities-divider">|</span>
                        <span className="star">
                            <img src={starIcon} alt="rating" />
                        </span>
                        {job.company?.rating || 0}
                        <span className="Opportunities-divider">|</span>
                        {job.company?.review_count || 0} reviews
                    </p>
                </div>

                <div className="Opportunities-job-details">
                    <p className="Opportunities-detail-line">
                        <img src={time} className="card-icons" alt="" />
                        <span className={`Opportunities-job-type ${job.work_type?.toLowerCase().replace(/\s/g, '-')}`}>
                            {job.work_type}
                        </span>
                        <span className="Opportunities-divider">|</span>
                        ₹ {job.salary}
                    </p>

                    <p className="Opportunities-detail-line">
                        <img src={experience} className="card-icons" alt="" />
                        {job.experience}
                    </p>

                    <div className="Opportunities-detail-line">
                        <img src={place} className="card-icons" alt="" />
                        <LocationDisplay locations={job.location} />
                    </div>

                    <p className="Opportunities-detail-line">
                        <img src={calender} className="card-icons" alt="" />
                        {formatPostedDate(job?.posted_date)}
                        <span className="Opportunities-divider">|</span>
                        Openings: {job.openings}
                        <span className="Opportunities-divider">|</span>
                        Applicants: {job.applicants_count}
                    </p>
                </div>

                <div className="Opportunities-worktype-details">
                    <div className="Opportunities-job-tags">
                    {job.job_category && (
                        <span className={`Opportunities-job-tag ${job.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {job.job_category}
                        </span>
                    )}
                </div>
                <div className="Opportunities-job-highlighted">
                    {job.is_highlighted && (
                      <span className="highlighted-job-label">
                          ⭐ Highlighted Job
                      </span>
                  )}
                </div>
                </div>

            </div>
            <hr className="Opportunities-separator" />

            <div className="Opportunities-job-footer">
                <p className='myjobs-saved-date'>{job.savedDate || "Saved date not available"}</p>

                <div className="Opportunities-job-actions">
                    <button
                        className="myjobs-btn"
                        onClick={handleUnsave}
                    >
                        Remove
                    </button>

                    <button
                        className="myjobs-btn"
                        disabled={isApplied}
                        style={{
                            opacity: isApplied ? 0.6 : 1,
                            cursor: isApplied ? 'not-allowed' : 'pointer',
                            backgroundColor: isApplied ? '#ccc' : ''
                        }}
                        onClick={handleApply}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};