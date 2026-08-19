import React, { useState, useEffect } from 'react';
import { useJobs } from '../JobContext';
import api from '../api/axios';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import "./JobMonitorOverview.css"

export const JobMonitorOverview = ({ jobId, setSelectedJobId }) => {
    const { jobs, setJobs, deleteJob, fetchJobs } = useJobs();
    const [loadingStates, setLoadingStates] = useState({
        delete: false,
        flag: false,
        reject: false,
        approve: false
    });
    const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
    const [isIndustryPopupOpen, setIsIndustryPopupOpen] = useState(false);
    const [jobData, setJobData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentId = jobId;

    // Fetch job data directly if not available in context
    useEffect(() => {
        const loadJobData = async () => {
            setIsLoading(true);
            setError(null);

            // First check if job exists in context
            let job = jobs.find(job => String(job.id) === String(currentId));

            if (job) {
                setJobData(job);
                setIsLoading(false);
                return;
            }

            // If not in context, fetch directly from API
            try {
                console.log(`🔄 Fetching job ${currentId} directly from API...`);
                const response = await api.get(`/admin/jobs/${currentId}/detail/`);
                const fetchedJob = response.data;

                // Add to context if possible
                if (setJobs && fetchedJob) {
                    setJobs(prev => {
                        const exists = prev.some(j => String(j.id) === String(fetchedJob.id));
                        if (!exists) {
                            return [...prev, fetchedJob];
                        }
                        return prev;
                    });
                }

                setJobData(fetchedJob);
            } catch (err) {
                console.error("Failed to fetch job:", err);
                setError(err.response?.data?.error || "Failed to load job details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (currentId) {
            loadJobData();
        }

        // Refresh data when jobId changes
    }, [currentId, jobs]);

    // Also refresh if jobs context changes
    useEffect(() => {
        if (jobs.length > 0 && jobData) {
            const updatedJob = jobs.find(job => String(job.id) === String(currentId));
            if (updatedJob && JSON.stringify(updatedJob) !== JSON.stringify(jobData)) {
                setJobData(updatedJob);
            }
        }
    }, [jobs, currentId, jobData]);

    const handleDelete = async () => {
        // Show confirmation dialog
        const userConfirmed = window.confirm("⚠️ Are you sure you want to delete this job? This action cannot be undone.");

        if (!userConfirmed) {
            return; // Exit if user cancels
        }

        try {
            setLoadingStates(prev => ({ ...prev, delete: true }));
            await api.delete(`/admin/jobs/${currentId}/delete/`);
            deleteJob(currentId);
            if (typeof setSelectedJobId === 'function') {
                setSelectedJobId(null);
            }
            alert("✅ Job deleted successfully!");
        } catch (error) {
            console.error("Delete failed:", error);
            alert(error.response?.data?.message || "❌ Failed to delete job. Please try again.");
        } finally {
            setLoadingStates(prev => ({ ...prev, delete: false }));
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className='opp-overview-main'>
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #2b8bf9',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#64748b', margin: 0 }}>Loading job details...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className='opp-overview-main'>
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#dc3545'
                }}>
                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>{error}</p>
                    <button
                        onClick={() => {
                            setIsLoading(true);
                            setError(null);
                            // Trigger reload
                            const loadJobData = async () => {
                                try {
                                    const response = await api.get(`/admin/jobs/${currentId}/detail/`);
                                    setJobData(response.data);
                                    setIsLoading(false);
                                } catch (err) {
                                    setError(err.response?.data?.error || "Failed to load job details.");
                                    setIsLoading(false);
                                }
                            };
                            loadJobData();
                        }}
                        style={{
                            padding: '8px 24px',
                            background: '#2b8bf9',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className='opp-overview-main'>
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
                    Job not found or has been deleted.
                </p>
            </div>
        );
    }

    const selectedJob = jobData;

    const handleApprove = async () => {
        if (window.confirm("Do you want to approve this job?")) {
            try {
                setLoadingStates(prev => ({ ...prev, approve: true }));
                await api.patch(`/admin/jobs/${currentId}/approve/`);
                setJobs(prev => prev.map(j =>
                    j.id === currentId ? { ...j, approval_status: 'approved', is_published: true } : j
                ));
                // Update local jobData
                setJobData(prev => ({ ...prev, approval_status: 'approved', is_published: true }));
                alert("Job approved successfully!");
            } catch (error) {
                console.error("Approval failed:", error);
                alert(error.response?.data?.error || "Failed to approve job. Please try again.");
            } finally {
                setLoadingStates(prev => ({ ...prev, approve: false }));
            }
        }
    };

    const handleReject = async () => {
        if (window.confirm("Do you want to reject this job?")) {
            try {
                setLoadingStates(prev => ({ ...prev, reject: true }));
                await api.patch(`/admin/jobs/${currentId}/reject/`);
                setJobs(prev => prev.map(j =>
                    j.id === currentId ? { ...j, approval_status: 'rejected', is_published: false } : j
                ));
                // Update local jobData
                setJobData(prev => ({ ...prev, approval_status: 'rejected', is_published: false }));
                alert("Job rejected successfully!");
            } catch (error) {
                console.error("Rejection failed:", error);
                alert(error.response?.data?.error || "Failed to reject job. Please try again.");
            } finally {
                setLoadingStates(prev => ({ ...prev, reject: false }));
            }
        }
    };

    const handleToggleFlag = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, flag: true }));
            const newFlagStatus = !selectedJob.flagged;
            await api.patch(`/admin/jobs/${currentId}/flag/`);
            setJobs(prev => prev.map(j =>
                j.id === currentId ? { ...j, flagged: newFlagStatus } : j
            ));
            // Update local jobData
            setJobData(prev => ({ ...prev, flagged: newFlagStatus }));
            alert(newFlagStatus ? "Job flagged successfully!" : "Job unflagged successfully!");
        } catch (error) {
            console.error("Flag update failed:", error);
            alert(error.response?.data?.error || "Failed to update flag status. Please try again.");
        } finally {
            setLoadingStates(prev => ({ ...prev, flag: false }));
        }
    };

    const isHighlighted = selectedJob.is_highlighted === true;

    // Get company name from employer relationship
    const getCompanyName = () => {
        if (selectedJob.company?.company_name) return selectedJob.company.company_name;
        if (selectedJob.employer?.employer_profile?.company?.company_name) {
            return selectedJob.employer.employer_profile.company.company_name;
        }
        if (selectedJob.company_name) return selectedJob.company_name;
        return 'N/A';
    };

    // Get company logo
    const getCompanyLogo = () => {
        if (selectedJob.company?.company_logo) return selectedJob.company.company_logo;
        if (selectedJob.company_logo) return selectedJob.company_logo;
        if (selectedJob.logo) return selectedJob.logo;
        if (selectedJob.company?.logo) return selectedJob.company.logo;
        return null;
    };

    // Get ratings and reviews
    const getRatings = () => {
        if (selectedJob.company?.average_rating) return selectedJob.company.average_rating;
        if (selectedJob.employer?.employer_profile?.company?.average_rating) {
            return selectedJob.employer.employer_profile.company.average_rating;
        }
        if (selectedJob.ratings) return selectedJob.ratings;
        return 'N/A';
    };

    const getTotalReviews = () => {
        if (selectedJob.company?.total_reviews) return selectedJob.company.total_reviews;
        if (selectedJob.employer?.employer_profile?.company?.total_reviews) {
            return selectedJob.employer.employer_profile.company.total_reviews;
        }
        if (selectedJob.reviewNo) return selectedJob.reviewNo;
        return 0;
    };

    // Get location as array
    const getLocationArray = () => {
        if (Array.isArray(selectedJob.location)) {
            return selectedJob.location.filter(l => l && l.trim() !== '');
        }
        if (typeof selectedJob.location === 'string') {
            return selectedJob.location.split(',').map(l => l.trim()).filter(l => l !== '');
        }
        return [];
    };

    // Get location display with truncation
    const getLocationDisplay = (maxDisplay = 3) => {
        const locations = getLocationArray();
        if (locations.length === 0) return { display: 'N/A', allLocations: [], hasMore: false };

        const displayLocations = locations.slice(0, maxDisplay);
        const remainingCount = locations.length - maxDisplay;
        const hasMore = remainingCount > 0;

        let display = displayLocations.join(", ");
        if (hasMore) {
            display += ` +${remainingCount} more`;
        }

        return { display, allLocations: locations, hasMore, remainingCount };
    };

    // Get industry type array
    const getIndustryArray = () => {
        const industryData = selectedJob.industry_type || selectedJob.IndustryType || [];
        if (Array.isArray(industryData)) {
            return industryData.filter(i => i && i.trim() !== '');
        }
        if (typeof industryData === 'string') {
            return industryData.split(',').map(i => i.trim()).filter(i => i !== '');
        }
        return [];
    };

    // Get industry display with truncation
    const getIndustryDisplay = (maxDisplay = 3) => {
        const industries = getIndustryArray();
        if (industries.length === 0) return { display: 'N/A', allIndustries: [], hasMore: false };

        const displayIndustries = industries.slice(0, maxDisplay);
        const remainingCount = industries.length - maxDisplay;
        const hasMore = remainingCount > 0;

        let display = displayIndustries.join(", ");
        if (hasMore) {
            display += ` +${remainingCount} more`;
        }

        return { display, allIndustries: industries, hasMore, remainingCount };
    };

    // Get salary
    const getSalary = () => {
        const salaryValue = selectedJob.salary || 'Not Disclosed';
        return salaryValue.toString().replace('Lpa', '').trim();
    };

    // Safely get arrays with fallbacks
    const tags = selectedJob.industry_type || selectedJob.tags || [];
    const jobHighlights = selectedJob.job_highlights || selectedJob.JobHighlights || [];
    const responsibilities = selectedJob.responsibilities || selectedJob.Responsibilities || [];
    const department = selectedJob.department || selectedJob.Department || [];
    const keySkills = selectedJob.key_skills || selectedJob.KeySkills || [];

    // Get status display value
    const getStatusDisplay = () => {
        const status = selectedJob.approval_status || selectedJob.status;
        if (status === 'approved') return 'Approved';
        if (status === 'Approved') return 'Approved';
        if (status === 'rejected') return 'Rejected';
        if (status === 'Rejected') return 'Rejected';
        return 'Pending';
    };

    const currentStatus = getStatusDisplay();
    const isApproved = selectedJob.approval_status === 'approved' || selectedJob.status === 'Approved';
    const isRejected = selectedJob.approval_status === 'rejected' || selectedJob.status === 'Rejected';
    const isFlagged = selectedJob.flagged || selectedJob.isFlagged;

    // Get display data
    const locationData = getLocationDisplay();
    const industryData = getIndustryDisplay();
    let cardClassName = "opp-overview-job-card";


    return (
        <div className='opp-overview-main'>
            <div className="opp-job-main">
                <div className={cardClassName}>
                    <div className="Opportunities-job-header">
                        <div>
                            <h2 className="opp-topcard-job-title">{selectedJob.job_title || selectedJob.title || 'N/A'}</h2>
                            <h5 className="Opportunities-job-company">
                                {getCompanyName()} <span className="Opportunities-divider">|</span>
                                <span className="star"><img src={starIcon} alt="star" /></span> {getRatings()}
                                <span className="Opportunities-divider">|</span>
                                <span className="opp-reviews"> {getTotalReviews()} Reviews</span>
                            </h5>
                        </div>
                        {getCompanyLogo() ? (
                            <img src={getCompanyLogo()} alt={getCompanyName()} className="Opportunities-job-logo" />
                        ) : (
                            <div className="Opportunities-job-logo-placeholder">
                                {getCompanyName().charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="Opportunities-job-details">
                        <p className='Opportunities-detail-line'>
                            <img src={time} className='card-icons' alt="time" />
                            {selectedJob.work_duration || selectedJob.duration || 'N/A'}
                            <span className="Opportunities-divider">|</span>
                            ₹ {getSalary()}
                        </p>
                        <p className='Opportunities-detail-line'>
                            <img src={experience} className='card-icons' alt="exp" />
                            {selectedJob.experience || '0'}
                        </p>
                        <p className='Opportunities-detail-line'>
                            <img src={place} className='card-icons' alt="loc" />
                            <span className="location-text-wrap">
                                {locationData.hasMore ? (
                                    <>
                                        {locationData.allLocations.slice(0, 3).join(", ")}
                                        <span
                                            className="opp-show-more-link"
                                            onClick={() => setIsLocationPopupOpen(true)}
                                        >
                                            {" +" + locationData.remainingCount + " more"}
                                        </span>
                                    </>
                                ) : (
                                    locationData.display
                                )}
                            </span>
                        </p>
                    </div>

                    <div className='Opportunities-details-bottom'>
                        <div className="Opportunities-job-tags">
                            {selectedJob.job_category && (
                                <span className={`Opportunities-job-tag ${selectedJob.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {selectedJob.job_category}
                                </span>
                            )}
                        </div>

                        <div className="Opportunities-job-type">
                            {selectedJob.work_type || selectedJob.WorkType || 'N/A'}
                        </div>
                        {isHighlighted && (
                            <span className="job-badge premium-badge inline-highlight-badge">
                                ⭐ Highlighted Job
                            </span>
                        )}
                    </div>
                    <hr className="Opportunities-separator" />

                    <div className="opp-job-highlights">
                        <h3>Job Highlights</h3>
                        <ul>
                            {jobHighlights.length > 0 ?
                                jobHighlights.map((item, i) => <li key={i}>{item}</li>) :
                                <li>No highlights available</li>
                            }
                        </ul>
                    </div>

                    <h3>Company Overview</h3>
                    <p>{selectedJob.company?.about || selectedJob.companyOverview || selectedJob.about || 'No company overview available.'}</p>

                    <h3>Job Description</h3>
                    <p>{selectedJob.job_description || selectedJob.jobDescription || 'No job description available.'}</p>

                    <h3>Responsibilities</h3>
                    <ul>
                        {responsibilities.length > 0 ?
                            responsibilities.map((item, i) => <li key={i}>{item}</li>) :
                            <li>No responsibilities listed</li>
                        }
                    </ul>

                    <h3>Key Details:</h3>
                    <p><strong>Role:</strong> {selectedJob.job_title || selectedJob.title || 'N/A'}</p>

                    {/* Updated Industry Type with truncation */}
                    <p><strong>Industry Type:</strong>
                        <span className="location-text-wrap">
                            {industryData.hasMore ? (
                                <>
                                    {industryData.allIndustries.slice(0, 3).join(", ")}
                                    <span
                                        className="opp-show-more-link"
                                        onClick={() => setIsIndustryPopupOpen(true)}
                                    >
                                        {" +" + industryData.remainingCount + " more"}
                                    </span>
                                </>
                            ) : (
                                industryData.display
                            )}
                        </span>
                    </p>

                    <p><strong>Department:</strong> {department.length > 0 ? department.join(", ") : 'N/A'}</p>
                    <p><strong>Job Type:</strong> {selectedJob.work_type || selectedJob.WorkType || 'N/A'}</p>

                    {/* Updated Location with truncation */}
                    <p><strong>Location:</strong>
                        <span className="location-text-wrap">
                            {locationData.hasMore ? (
                                <>
                                    {locationData.allLocations.slice(0, 3).join(", ")}
                                    <span
                                        className="opp-show-more-link"
                                        onClick={() => setIsLocationPopupOpen(true)}
                                    >
                                        {" +" + locationData.remainingCount + " more"}
                                    </span>
                                </>
                            ) : (
                                locationData.display
                            )}
                        </span>
                    </p>

                    <p><strong>Shift:</strong> {selectedJob.shift || selectedJob.Shift || 'General'}</p>
                    <p><strong>Openings:</strong> {selectedJob.openings || 'N/A'}</p>
                    {/* <p><strong>Last Date to Apply:</strong> {selectedJob.last_date_to_apply || 'Not specified'}</p> */}

                    <h3>Key Skills</h3>
                    <div className="opp-key-skills-container">
                        {keySkills.length > 0 ?
                            keySkills.map((item, i) => (
                                <span key={i} className="opp-key-skill-tag">{item}</span>
                            )) :
                            <span>No skills listed</span>
                        }
                    </div>

                    {/* Action Buttons with improved styling */}
                    <div className="monitoring-action-buttons">
                        <button
                            className="monitoring-btn monitoring-btn-delete"
                            onClick={handleDelete}
                            disabled={loadingStates.delete}
                        >
                            {loadingStates.delete ? (
                                <span className="monitoring-btn-spinner"></span>
                            ) : (
                                "Delete"
                            )}
                        </button>

                        <button
                            className={`monitoring-btn monitoring-btn-flag ${isFlagged ? 'flagged' : ''}`}
                            onClick={handleToggleFlag}
                            disabled={loadingStates.flag}
                        >
                            {loadingStates.flag ? (
                                <span className="monitoring-btn-spinner"></span>
                            ) : (
                                isFlagged ? "Flagged" : "Flag"
                            )}
                        </button>

                        <button
                            className={`monitoring-btn monitoring-btn-reject ${isRejected ? 'rejected' : ''}`}
                            onClick={handleReject}
                            disabled={isRejected || loadingStates.reject}
                        >
                            {loadingStates.reject ? (
                                <span className="monitoring-btn-spinner"></span>
                            ) : (
                                isRejected ? "Rejected" : "Reject"
                            )}
                        </button>

                        <button
                            className={`monitoring-btn monitoring-btn-approve ${isApproved ? 'approved' : ''}`}
                            onClick={handleApprove}
                            disabled={isApproved || loadingStates.approve}
                        >
                            {loadingStates.approve ? (
                                <span className="monitoring-btn-spinner"></span>
                            ) : (
                                isApproved ? "Approved" : "Approve"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Location Popup Modal */}
            {isLocationPopupOpen && (
                <div className="opp-loc-modal-overlay" onClick={() => setIsLocationPopupOpen(false)}>
                    <div className="opp-loc-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="opp-loc-modal-header">
                            <h3>All Locations</h3>
                            <button className="opp-loc-modal-close" onClick={() => setIsLocationPopupOpen(false)}>&times;</button>
                        </div>
                        <div className="opp-loc-modal-body">
                            {locationData.allLocations.map((loc, index) => (
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
                            {industryData.allIndustries.map((industry, index) => (
                                <span key={index} className="opp-loc-chip">{industry}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};