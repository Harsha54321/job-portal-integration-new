import React from 'react';
import api from '../api/axios';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import calender from '../assets/calender_card.png';
import './SavedJobsCard.css';
import { formatPostedDate } from './OpportunitiesCard';
import { useNavigate } from "react-router-dom";

export const SavedJobsCard = ({ job, onRemoved }) => {
    const navigate = useNavigate();
    if (!job) return null;

    const handleUnsave = async () => {
        try {
            await api.delete(`/jobs/save/${job.id}/`);
            alert("Job removed from saved list");
            onRemoved?.(job.id); // refresh parent list
        } catch (err) {
            alert("Failed to remove saved job");
        }
    };

    const handleApply = () => {
        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);

    };


    return (
        <div className="myjobs-job-card">
            <div className="myjobs-card-header">
                <h2 className="myjobs-job-title">{job.title}</h2>
                <span className="menu-dots">⋮</span>
            </div>

            <div className="myjobs-company-sub">
                <p className="myjobs-company-name">
                    {job.company?.name}
                    <span className="Opportunities-divider">|</span>
                    <span className="star">
                        <img src={starIcon} alt="rating" />
                    </span>
                    {job.company?.rating || 0}
                    <span className="Opportunities-divider">|</span>
                    {job.company?.review_count || 0}
                </p>
            </div>

            <div className="Opportunities-job-details">
                <p className="Opportunities-detail-line">
                    <img src={time} className="card-icons" alt="" />
                    {job.work_type} | {job.salary}
                </p>

                <p className="Opportunities-detail-line">
                    <img src={experience} className="card-icons" alt="" />
                    {job.experience_required}
                </p>

                <p className="Opportunities-detail-line">
                    <img src={place} className="card-icons" alt="" />
                    {job.location}
                </p>

                <p className="Opportunities-detail-line">
                    <img src={calender} className="card-icons" alt="" />
                    {formatPostedDate(job.posted_date)}
                    <span className="Opportunities-divider">|</span>
                    Openings: {job.openings}
                    <span className="Opportunities-divider">|</span>
                    Applicants: {job.applicants_count}
                </p>
            </div>

            <div className="Opportunities-job-tags">
                {job.tags?.map((tag, index) => (
                    <span key={`${job.id}-tag-${index}`} className="Opportunities-job-tag">
                        {tag}
                    </span>
                ))}

            </div>

            <hr className="Opportunities-separator" />

            <div className="Opportunities-job-footer">
                <div className="Opportunities-job-actions">
                    <button className="myjobs-btn" onClick={handleUnsave}>
                        Remove
                    </button>
                    <button className="myjobs-btn" onClick={handleApply}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
