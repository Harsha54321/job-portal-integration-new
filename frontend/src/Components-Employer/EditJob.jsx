import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import './EditJob.css';
import { useJobs } from '../JobContext';
import starIcon from '../assets/Star_icon.png';

export const EditJob = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { editJob } = useJobs();

  // Get the job data from location state
  const jobData = location.state?.jobData || location.state || null;

  console.log('EditJob received data:', jobData);
  console.log('Job Status from backend:', jobData?.job_status);

  // State for location popup
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  // ============================================================
  // PREVENT BACKGROUND SCROLL WHEN POPUP IS OPEN
  // ============================================================
  useEffect(() => {
    if (isLocationPopupOpen) {
      // Disable scroll on body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isLocationPopupOpen]);

  // Helper function to safely extract company name
  const getCompanyName = (company) => {
    if (!company) return 'Company';
    if (typeof company === 'string') return company;
    if (typeof company === 'object' && company.name) return company.name;
    if (typeof company === 'object' && company.company_name) return company.company_name;
    return 'Company';
  };

  // ============================================================
  // LOCATION HELPER FUNCTIONS
  // ============================================================

  // Get location as array
  const getLocationArray = () => {
    const locData = jobData?.location;
    if (Array.isArray(locData)) {
      return locData.filter(l => l && l.trim() !== '');
    }
    if (typeof locData === 'string') {
      // Try to split by comma
      if (locData.includes(',')) {
        return locData.split(',').map(l => l.trim()).filter(l => l !== '');
      }
      // If it's camelCase like "HyderabadBengaluruMumbai"
      if (!locData.includes(' ') && !locData.includes(',') && /[A-Z]/.test(locData)) {
        return locData.split(/(?=[A-Z])/).filter(l => l.trim() !== '');
      }
      return [locData.trim()];
    }
    return [];
  };

  // Get location display with truncation
  const getLocationDisplay = (maxDisplay = 3) => {
    const locations = getLocationArray();
    if (locations.length === 0) return { display: 'Not specified', allLocations: [], hasMore: false };

    const displayLocations = locations.slice(0, maxDisplay);
    const remainingCount = locations.length - maxDisplay;
    const hasMore = remainingCount > 0;

    let display = displayLocations.join(", ");
    if (hasMore) {
      display += ` +${remainingCount} more`;
    }

    return { display, allLocations: locations, hasMore, remainingCount };
  };

  // Get location display data
  const locationData = getLocationDisplay();

  // Extract all dynamic data from the job with safe parsing
  const jobTitle = jobData?.job_title || jobData?.title || 'Untitled Job';
  const companyName = getCompanyName(jobData?.company_name || jobData?.company);
  const ratings = jobData?.ratings || 4.2;
  const reviewCount = jobData?.review_count || jobData?.reviewNo || 100;
  const duration = jobData?.work_duration || jobData?.duration || 'Not specified';
  const salary = jobData?.salary || 0;
  const experienceYears = jobData?.experience || 'Not specified';
  const workType = jobData?.work_type || jobData?.WorkType || 'Not specified';
  const jobCategory = jobData?.job_category || 'Full-time';
  const logo = jobData?.company?.company_logo || jobData?.company_logo || null;

  // ONLY highlighted jobs get styling
  const isHighlighted = jobData?.is_highlighted === true;

  let cardClassName = "Opportunities-job-card";
 

  // Tags for display
  const tags = jobData?.tags || [jobCategory];

  // Get current status from job data
  const currentJobStatus = jobData?.job_status || 'Hiring in Progress';

  // Map status to type for styling
  const getStatusType = (status) => {
    if (status === 'Hiring in Progress') return 'progress';
    if (status === 'Reviewing Application') return 'reviewing';
    if (status === 'Hiring Done') return 'done';
    return 'reviewing';
  };

  const statusOptions = [
    { text: 'Hiring in Progress', type: 'progress' },
    { text: 'Reviewing Application', type: 'reviewing' },
    { text: 'Hiring Done', type: 'done' }
  ];

  const [selectedStatus, setSelectedStatus] = useState(currentJobStatus);
  const [currentDisplayStatus, setCurrentDisplayStatus] = useState(currentJobStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSubmit = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      console.log('Updating job status to:', selectedStatus);
      console.log('Job ID:', jobData?.id);

      const updateData = {
        job_status: selectedStatus
      };

      console.log('Sending update data:', updateData);

      const result = await editJob(jobData.id, updateData);

      console.log('Update result:', result);

      if (result && (result.success === true || result.status === 'success')) {
        setCurrentDisplayStatus(selectedStatus);
        if (jobData) {
          jobData.job_status = selectedStatus;
        }
        alert(`Job status updated to: ${selectedStatus}`);
        setTimeout(() => {
          navigate('/Job-portal/Employer/Dashboard');
        }, 2000);
      } else {
        const errorMsg = result?.error?.job_status?.[0] ||
          result?.error ||
          result?.message ||
          'Failed to update status';
        alert(errorMsg);
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      let errorMessage = 'Error updating status';
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data?.error ||
          error.response.data?.message ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      setIsUpdating(false);
    }
  };

  if (!jobData) {
    return (
      <>
        <EHeader />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", flexDirection: "column" }}>
          <h2>No Job Data Found</h2>
          <button onClick={() => navigate('/Job-portal/Employer/Dashboard')} style={{ marginTop: "20px", padding: "10px 20px" }}>
            Go Back to Dashboard
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Safe logo rendering
  const logoContent = logo ?
    (<img src={logo} alt={companyName} className="Opportunities-job-logo" />) :
    (<div className="Opportunities-job-logo-placeholder">
      {companyName && typeof companyName === 'string' && companyName.charAt(0).toUpperCase() || 'C'}
    </div>);

  // Render location display
  const renderLocation = () => {
    if (locationData.hasMore) {
      return (
        <>
          {locationData.allLocations.slice(0, 3).join(", ")}
          <span
            className="opp-show-more-link"
            onClick={() => setIsLocationPopupOpen(true)}
          >
            {` +${locationData.remainingCount} more`}
          </span>
        </>
      );
    }
    return locationData.display;
  };

  return (
    <>
      <EHeader />

      <div className="edit-job-card-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px", minHeight: "80vh", padding: "20px" }}>
        {/* Master Content Column - Ensures everything shares the exact same width and alignment */}
        <div style={{ width: "60%", minWidth: "350px", maxWidth: "800px", display: "flex", flexDirection: "column" }}>

          {/* 1 & 2. Header Section (Back Button & Centered Title) */}
          <div style={{ position: "relative", width: "100%", marginBottom: "30px", display: "flex", justifyContent: "center" }}>

            {/* Styled Solid Blue Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="editjob-back-btn"
            >
              &larr; Back
            </button>

            {/* Centered Title */}
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#0f172a", margin: "0" }}>Update Job Status</h2>
              <p style={{ color: "#64748b", marginTop: "8px", marginBottom: "0" }}>Update the hiring status for: {jobTitle}</p>
            </div>

          </div>

          <div style={{ width: "100%", boxSizing: "border-box" }} className={cardClassName}>
            {/* Badge only for highlighted jobs */}
            {/* {isHighlighted && <span className="job-badge premium-badge">⭐ Featured</span>} */}

            <div className="Opportunities-job-header">
              <div>
                <h3 className="Opportunities-job-title">{jobTitle}</h3>
                <p className="Opportunities-job-company">
                  {companyName} <span className="Opportunities-divider">|</span>
                  <span className="star"><img src={starIcon} alt="star" /></span> {ratings}
                  <span className="Opportunities-divider">|</span>
                  <span className="opp-reviews"> {reviewCount} Reviews</span>
                </p>
              </div>
              {logoContent}
            </div>

            <div className="Opportunities-job-details">
              <p className='Opportunities-detail-line'>
                <img src={time} className='card-icons' alt="time" />
                {duration}<span className="Opportunities-divider">|</span>₹ {salary}
              </p>
              <p className='Opportunities-detail-line'>
                <img src={experience} className='card-icons' alt="exp" />
                {experienceYears}
              </p>
              <p className='Opportunities-detail-line'>
                <img src={place} className='card-icons' alt="loc" />
                <span style={{ wordBreak: 'break-word', flex: 1 }}>
                  {renderLocation()}
                </span>
              </p>
            </div>

            <div className='Opportunities-details-bottom'>
              <div className="Opportunities-job-tags">
                {tags && tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <span key={index} className={`Opportunities-job-tag ${tag?.toLowerCase().replace(/\s+/g, '-') || 'tag'}`}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="Opportunities-job-tag full-time">Full-time</span>
                )}
              </div>
              
              <div className="Opportunities-job-type">
                {workType}
              </div>
              {isHighlighted && (
                <span className="job-badge premium-badge inline-highlight-badge">
                  ⭐ Highlighted Job
                </span>
              )}
            </div>

            <hr className="Opportunities-separator" />

            <div className='applied-app-status-container' style={{ padding: "15px 0" }}>
              <span className={`applied-application-status status-${getStatusType(currentDisplayStatus)}`}>
                Current Status: {currentDisplayStatus}
              </span>
            </div>
          </div>

          {/* 4. Update Form Data (Centered Dropdown) */}
          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <label style={{ fontWeight: "bold", marginBottom: "12px", color: "#0f172a" }}>
              Update Job Status:
            </label>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="editjob-status-select"
            >
              {statusOptions.map((opt) => (
                <option key={opt.type} value={opt.text}>
                  {opt.text}
                </option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="editjob-submit-btn"
            >
              {isUpdating ? "Updating..." : "Submit Changes"}
            </button>
          </div>
        </div>
      </div>
      <Footer />

      {/* ============================================================
          LOCATION POPUP MODAL - NO BACKGROUND SCROLL
          ============================================================ */}
      {isLocationPopupOpen && (
        <div
          className="opp-loc-modal-overlay"
          onClick={() => setIsLocationPopupOpen(false)}
        >
          <div
            className="opp-loc-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="opp-loc-modal-header">
              <h3>All Locations</h3>
              <button
                className="opp-loc-modal-close"
                onClick={() => setIsLocationPopupOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="opp-loc-modal-body">
              {locationData.allLocations.map((loc, index) => (
                <span key={index} className="opp-loc-chip">
                  {loc}
                </span>
              ))}
              {locationData.allLocations.length === 0 && (
                <span style={{ color: '#6b7280', padding: '10px 0' }}>No locations available</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};