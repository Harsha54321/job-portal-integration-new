import React from 'react';
import api from "../api/axios";
import './OpportunitiesCard.css';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { useJobs } from "../JobContext";
import { useNavigate } from 'react-router-dom';

export function formatPostedDate(dateString) {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffInDays = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));


    if (diffInDays === 0) return "Posted today";
    if (diffInDays === 1) return "Posted 1 day ago";
    if (diffInDays <= 30) return `Posted ${diffInDays} days ago`;
    if (diffInDays <= 60) return "Posted 1+ month ago";
    if (diffInDays <= 90) return "Posted 2+ months ago";
    return "Posted long ago";
}

export const OpportunitiesCard = ({ job }) => {
    const navigate = useNavigate();
    const { isJobSaved, saveJob } = useJobs();

    const isSaved = isJobSaved(job.id);

    const handleSave = async (e) => {
        e.stopPropagation();

        if (isSaved) return;

        const result = await saveJob(job.id);

        if (result === "already") {
            alert("Job already saved");
        }
    };





    const handleApply = async (e) => {
        e.stopPropagation();
        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);

    };
    const handleClick = () => {
        const jobId = job?.id || job?.job?.id;

        if (!jobId) {
            console.error("Job ID missing:", job);
            return;
        }

        navigate(`/Job-portal/jobseeker/OpportunityOverview/${jobId}`);
    };

    console.log(job);


    return (
        <div onClick={handleClick} className="Opportunities-job-card">
            {/* HEADER */}
            <div className="Opportunities-job-header">
                <div>
                    <h3 className="Opportunities-job-title">{job.title}</h3>
                    <p className="Opportunities-job-company">
                        {job.company?.name}
                    </p>
                </div>

                {job.company?.logo_url ? (
                    <img
                        src={job.company.logo_url}
                        alt={job.company?.name}
                        className="Opportunities-job-logo"
                    />
                ) : (

                    <div className="Opportunities-job-logo-placeholder">
                        {job.company?.name?.charAt(0).toUpperCase()}

                    </div>

                )}
            </div>

            {/* DETAILS */}
            <div className="Opportunities-job-details">
                <p className="Opportunities-detail-line">
                    <img src={time} className="card-icons" />
                    {job.duration}<span className="Opportunities-divider">|</span>
                    ₹ {job.salary}

                </p>

                <p className="Opportunities-detail-line">
                    <img src={experience} className="card-icons" />
                    {job.experience_required}
                </p>

                <p className="Opportunities-detail-line">
                    <img src={place} className="card-icons" />
                    {job.location}
                </p>
            </div>

            {/* TAGS */}
            <div className="Opportunities-details-bottom">
                <div className="Opportunities-job-tags">
                    {job.tags.map((tag, index) => (
                        <span key={index} className={`Opportunities-job-tag ${tag.toLowerCase()}`}>
                            {tag}
                        </span>
                    ))}
                </div>


                <div className="Opportunities-job-type">
                    {job.work_type}
                </div>
            </div>

            <hr className="Opportunities-separator" />

            {/* FOOTER */}
            <div className="Opportunities-job-footer">
                <p>
                    {formatPostedDate(job.posted)} | Openings: {job.openings} | Applicants: {job.applicants}
                </p>

                <div className="Opportunities-job-actions">
                    <button className={`Opportunities-save-btn ${isSaved ? "saved" : ""}`}onClick={handleSave}>{isSaved ? "Saved" : "Save"}</button>

                    <button className="Opportunities-apply-btn" onClick={handleApply}> Apply</button>
                </div>
            </div>
        </div>
    );
};
