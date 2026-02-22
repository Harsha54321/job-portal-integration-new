import React, { useState } from 'react';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { formatPostedDate } from './OpportunitiesCard';
import "./SearchResultsCard.css";
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/Star_icon.png';
import api from '../api/axios';

export function SearchResultsCard({ job }) {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    if (!job) return null;

    /* ---------------- NAVIGATION ---------------- */
    const handleCardClick = () => {
        navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`);
    };

    const handleApply = (e) => {
        e.stopPropagation();
        navigate(`/Job-portal/jobseeker/apply/${job.id}`);
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (isSaving) return;

        setIsSaving(true);
        try {
            await api.post(`/jobs/save/`, { job_id: job.id });
            alert("Job saved successfully");
        } catch (err) {
            if (err.response?.status === 400) {
                alert("Job already saved");
            } else {
                alert("Failed to save job");
            }
        } finally {
            setIsSaving(false);
        }
    };


    /* ---------------- LOGO ---------------- */
    const logoContent = job.company?.logo_url ? (
        <img
            src={job.company.logo_url}
            alt={job.company.name}
            className="SearchResults-job-card-job-logo"
        />
    ) : (
        <div className="SearchResults-job-card-logo-placeholder">
            {job.company?.name?.[0] || "C"}
        </div>
    );

    return (
        <div className="SearchResults-job-card">
            {/* ---------- HEADER ---------- */}
            <div onClick={handleCardClick} className="SearchResults-job-card-header">
                <div>
                    <h3 className="SearchResults-job-card-title">
                        {job.title}
                    </h3>

                    <p className="SearchResults-job-card-company">
                        <span className="star">
                            <img src={starIcon} alt="rating" />
                        </span>
                        {job.company?.rating || 0}
                        <span className="SearchResults-job-card-divider">|</span>
                        {job.company?.review_count || 0} reviews
                    </p>
                </div>

                {logoContent}
            </div>

            {/* ---------- DETAILS ---------- */}
            <div className="SearchResults-job-card-details">
                <p className="SearchResults-job-card-detail-line">
                    <img src={time} className="SearchResults-job-card-icons" alt="type" />
                    <span className="SearchResults-job-card-divider">|</span>
                    {job.salary || "Salary not disclosed"}
                    <span className="SearchResults-job-card-divider">|</span>
                    <img src={experience} className="SearchResults-job-card-icons" alt="experience" />
                    {job.experience_required || "Experience not specified"}
                    <span className="SearchResults-job-card-divider">|</span>
                    <img src={place} className="SearchResults-job-card-icons" alt="location" />
                    {job.location || "Location not specified"}
                </p>

                <p className="SearchResults-job-card-detail-line">
                    Shift: {job.shift || "N/A"}
                    <span className="SearchResults-job-card-divider">|</span>
                    {job.work_type || "Not specified"}
                </p>
            </div>

            <hr className="SearchResults-job-card-separator" />

            {/* ---------- FOOTER ---------- */}
            <div className="SearchResults-job-card-job-footer">
                <p>
                    {formatPostedDate(job.posted_date)}
                    <span className="SearchResults-job-card-divider">|</span>
                    Openings: {job.openings}
                    <span className="SearchResults-job-card-divider">|</span>
                    Applicants: {job.applicants_count}
                </p>

                <div className="SearchResults-job-card-actions">
                    <button
                        className="SearchResults-job-card-save-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >

                        {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                        className="SearchResults-job-card-apply-btn"
                        onClick={handleApply}
                    >

                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
