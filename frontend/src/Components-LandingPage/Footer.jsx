import React from 'react'
import "./Footer.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
 
export const Footer = () => {
  const navigate = useNavigate()
  
  const accessToken = sessionStorage.getItem("access");
  const userRole = sessionStorage.getItem("userRole");
  const isJobseeker = accessToken && userRole === "jobseeker";
  const isEmployer = accessToken && userRole === "Employer";
  const isLoggedIn = !!accessToken;
 
  // Protected navigate function with targetTab support
  const protectedNavigate = (path, targetTab) => {
    if (isLoggedIn) {
      // Already logged in - navigate directly with tab info
      navigate(path, { state: { fromFooter: true, activeTab: targetTab } });
    } else {
      // Not logged in - store intended path and tab in sessionStorage
      sessionStorage.setItem("redirectAfterLogin", path);
      sessionStorage.setItem("redirectTab", targetTab);
      
      if (path.toLowerCase().includes('employer')) {
        navigate('/Job-portal/employer/login');
      } else {
        navigate('/Job-portal/jobseeker/login');
      }
    }
  };
 
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-link-section">
          <h2 className="footer-logo">Job portal</h2>
          <p className="tagline">Where Ambition Meets<br />Opportunity</p>
          <div>
            <i className="fab fa-linkedin-in social-icon"></i>
            <i className="fab fa-facebook-f social-icon"></i>
            <i className="fab fa-x-twitter social-icon"></i>
            <i className="fab fa-instagram social-icon"></i>
          </div>
        </div>
 
        <div className="footer-link-section">
          <h3>Quick Links</h3>
          <ul>
            <li><span onClick={() => navigate('/Job-portal/jobseeker/aboutus')}>About Us</span></li>
            <li><span onClick={() => navigate('/Job-portal/jobseeker/ContactUs')}>Contact Us</span></li>
            <li><span onClick={() => { navigate('/Job-portal/jobseeker/FAQ') }} >FAQs</span></li>
            <li><span onClick={() => { navigate('/Job-portal/jobseeker/Blogs') }}>Blog</span></li>
            <li><span onClick={() => { navigate('/Job-portal/jobseeker/help-center') }}>HelpCenter</span></li>
          </ul>
        </div>
 
 
        {(!isLoggedIn || isJobseeker) && (
          <div className="footer-link-section">
            <h3>Job Seekers</h3>
            <ul>
              <li><span onClick={() => protectedNavigate('/Job-portal/jobseeker/myprofile', 'Profile')}>Create Profile</span></li>
              <li><span onClick={() => protectedNavigate('/Job-portal/jobseeker/jobs')}>Browse Jobs</span></li>
              {/* Saved Jobs - "saved" tab */}
              <li>
                <span onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', 'saved')}>
                  Saved Jobs
                </span>
              </li>
              {/* Applied Jobs - "applied" tab */}
              <li>
                <span onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', 'applied')}>
                  Applied Jobs
                </span>
              </li>
            </ul>
          </div>
        )}
 
        {(!isLoggedIn || isEmployer) && (
          <div className="footer-link-section">
            <h3>Employers</h3>
            <ul>
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Post a Job' }
                  });
                } else {
                  sessionStorage.setItem("redirectAfterLogin", '/Job-portal/Employer/Dashboard');
                  sessionStorage.setItem("redirectTab", 'Post a Job');
                  navigate('/Job-portal/employer/login');
                }
              }}>Post a Job</span></li>
 
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Find Talent' }
                  });
                } else {
                  sessionStorage.setItem("redirectAfterLogin", '/Job-portal/Employer/Dashboard');
                  sessionStorage.setItem("redirectTab", 'Find Talent');
                  navigate('/Job-portal/employer/login');
                }
              }}>
                Find Talent
              </span></li>
 
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Dashboard' }
                  });
                } else {
                  sessionStorage.setItem("redirectAfterLogin", '/Job-portal/Employer/Dashboard');
                  sessionStorage.setItem("redirectTab", 'Dashboard');
                  navigate('/Job-portal/employer/login');
                }
              }}>Employer Dashboard</span></li>
            </ul>
          </div>
        )}
      </div>
 
      <div className="footer-bottom">
        <p>&#169; 2025 JobPortal. All rights reserved.</p>
      </div>
    </footer>
  )
}