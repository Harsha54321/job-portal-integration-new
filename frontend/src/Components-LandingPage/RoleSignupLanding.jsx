import React from "react";
import { Link } from "react-router-dom";
import "./RoleLanding.css"; // Keeping your original CSS exactly as it is

const JobSeekerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
    <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6v1H4v-1Z" />
  </svg>
);

const EmployerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2h3c1.1 0 2 .9 2 2v3.5c0 .83-.5 1.55-1.22 1.84L14 15.25V14h-4v1.25l-4.78-1.91A1.98 1.98 0 0 1 4 11.5V8c0-1.1.9-2 2-2h3Zm2 0h2V4h-2v2Z" />
    <path d="M4 15.2 10 17.6V18h4v-.4l6-2.4V20c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-4.8Z" />
  </svg>
);

const roles = [
  {
    title: "Job Seeker",
    description: "Create an account, find jobs, and build your career profiles.",
    path: "/Job-portal/jobseeker/signup",
    Icon: JobSeekerIcon,
    className: "jobseeker-card",
  },
  {
    title: "Employer",
    description: "Register your company and start hiring top industry talent.",
    path: "/Job-portal/employer/signup",
    Icon: EmployerIcon,
    className: "employer-card",
  },
];

const RoleSignupLanding = () => {
  return (
    <div className="role-landing-page">
      <header className="role-header">
        <Link to="/" className="role-logo">
          Job portal
        </Link>
        <Link to="/" className="role-back-btn">
          ← Back to Home
        </Link>
      </header>

      {/* 1. Added flex and justify-content center to the main container */}
      <main className="role-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="role-content">
          <span className="role-badge">Join our Community</span>
          <h1>Select account to Register</h1>
          <p>Choose your specific path to get started with signup.</p>
        </div>

        {/* 2. Added inline flex styles to center the card items and override the grid default */}
        <div 
          className="role-card-grid" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            width: '100%',
            maxWidth: '800px' // Keeps the two cards properly sized together
          }}
        >
          {roles.map(({ title, description, path, Icon, className }) => (
            <Link 
              to={path} 
              className={`role-card ${className}`} 
              key={title}
              style={{ flex: '1', minWidth: '280px', maxWidth: '360px' }} // Ensures cards retain beautiful proportions
            >
              <div className="role-icon">
                <Icon />
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="role-card-action">Continue Signup</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RoleSignupLanding;