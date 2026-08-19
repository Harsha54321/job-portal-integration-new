import React from 'react'
import { useNavigate } from 'react-router-dom'
import './FHeader.css'
import backicon from "../assets/curved-go-back.png";

export function FHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  // Handle keyboard events for back button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBack();
    }
  };

  const handleLogoClick = () => {
    const accessToken = sessionStorage.getItem("access");
    const userRole = sessionStorage.getItem("userRole");
    const currentRole = userRole ? userRole.toLowerCase() : "";

    if (accessToken && currentRole === "jobseeker") {
      // Fixed: Routes to the exact path defined in your App.js for <Afterloginlanding />
      navigate('/Job-portal/jobseeker');
    } else if (accessToken && currentRole === "employer") {
      navigate('/Job-portal/Employer/Dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="header">
      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <span className="logo-text">Job portal</span>
      </div>

      {/* Changed from div to button for better accessibility */}
      <button
        className="Fheader-back-btn"
        onClick={handleBack}
        onKeyDown={handleKeyDown}
        aria-label="Go back to previous page"
        type="button"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}

      >
        <img
          src={backicon}
          alt="Go back"
          style={{ display: 'block' }}
          title="Go back to previous page"
        />
      </button>
    </div>
  );
}