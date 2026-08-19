import React from 'react';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { formatPostedDate, isRecentlyPosted } from './OpportunitiesCard';
import "./SearchResultsCard.css";
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/Star_icon.png';
import { useJobs } from '../JobContext';
import { LocationDisplay } from './LocationDisplay';

export function SearchResultsCard({ job }) {
    const navigate = useNavigate();
    const { isJobSaved, isJobApplied, saveJob } = useJobs();

    const isSaved = isJobSaved(job.id);
    const isApplied = isJobApplied(job.id);

    if (!job) return null;

    // Determine card styling based on job status
    const isHighlighted = job.is_highlighted === true;
    const isRecent = isRecentlyPosted(job.posted_date || job.created_at);

    // Priority: Highlighted > Recent > Normal
    let cardClassName = "SearchResults-job-card";
    // if (isHighlighted) {
    //     cardClassName += " highlighted-job";
    // } else if (isRecent) {
    //     cardClassName += " recent-job";
    // }

    /* ---------------- NAVIGATION ---------------- */
    const handleCardClick = () => {
        navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`);
    };

    const handleApply = (e) => {
        e.stopPropagation();
        if (isApplied) return;
        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (isSaved) return;
        try {
            await saveJob(job.id);
        } catch (err) {
            alert("Failed to save job");
        }
    };

    /* ---------------- LOGO ---------------- */
    const logoContent = job.company?.logo || job.company?.company_logo ? (
        <img
            src={job.company.logo || job.company.company_logo}
            alt={job.company.company_name}
            className="SearchResults-job-card-job-logo"
        />
    ) : (
        <div className="SearchResults-job-card-logo-placeholder">
            {job.company?.company_name?.charAt(0).toUpperCase() || "C"}
        </div>
    );

    return (
        <div className={cardClassName}>
            <div onClick={handleCardClick}>
                <div className="SearchResults-job-card-header">
                    <div className="SearchResults-job-card-info">
                        <h3 className="SearchResults-job-card-title">
                            {job.job_title}
                        </h3>

                        <p className="SearchResults-job-card-company">
                            {job.company?.company_name}
                        </p>
                    </div>

                    {logoContent}
                </div>

                <div className="SearchResults-job-card-details">
                    <p className='SearchResults-job-card-detail-line'>
                        <img src={time} className='SearchResults-job-card-icons' alt="duration" />
                        {job.work_duration}
                        <span className="SearchResults-job-card-divider">|</span>
                        ₹ {job.salary || "Not disclosed"}
                    </p>
                    <p className='SearchResults-job-card-detail-line'>
                        <img src={experience} className='SearchResults-job-card-icons' alt="experience" />
                        {job.experience || "Not specified"}
                    </p>
                    <div className='SearchResults-job-card-detail-line'>
                        <img src={place} className='SearchResults-job-card-icons' alt="location" />
                        <LocationDisplay locations={job.location} />
                    </div>
                </div>

                <div className='SearchResults-job-card-details-bottom'>
                    <div className="SearchResults-job-card-details-child">
                        {job.job_category && (
                            <span className={`SearchResults-job-card-tag ${job.job_category.toLowerCase()}`}>
                                {job.job_category}
                            </span>
                        )}
                        <div className="SearchResults-job-card-type">
                            {job.work_type || "Not specified"}
                        </div>
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

            <hr className="SearchResults-job-card-separator" />

            <div className="SearchResults-job-card-footer">
                <div className="SearchResults-job-card-meta">
                    <p>
                        {formatPostedDate(job.posted_date || job.created_at)}
                        <span className="SearchResults-job-card-divider">|</span>
                        Openings: {job.openings}
                        <span className="SearchResults-job-card-divider">|</span>
                        Applicants: {job.applicants_count}
                    </p>
                </div>

                <div className="SearchResults-job-card-actions">
                    <button
                        className={`SearchResults-save-btn ${isSaved ? "saved" : ""}`}
                        onClick={handleSave}
                    >
                        {isSaved ? "Saved" : "Save"}
                    </button>

                    <button
                        className="SearchResults-apply-btn"
                        onClick={handleApply}
                        disabled={isApplied}
                        style={{
                            opacity: isApplied ? 0.6 : 1,
                            cursor: isApplied ? "not-allowed" : "pointer"
                        }}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
}