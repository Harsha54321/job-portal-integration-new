import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import breifcase from '../assets/header_case.png';
import chat from '../assets/header_message.png';
import bell from '../assets/header_bell.png';
import bell_dot from '../assets/header_bell_dot.png';
import home_icon from '../assets/home_icon.png';
import { AvatarMenu } from '../Components-Jobseeker/AvatarMenu';
import { JNotification } from '../Components-Jobseeker/JNotification';
import { useJobs } from '../JobContext';
 
export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notificationsData, showNotification, setShowNotification, fetchNotifications, chats, currentUserId } = useJobs();
 
  const newNotificationsCount = Array.isArray(notificationsData)
    ? notificationsData.filter(n => !n.isRead).length
    : 0;
 
  const unreadMessagesCount = chats.filter(
    chat => (chat.unread_count || 0) > 0
  ).length;
 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);
 
  const isLoggedIn =
    location.pathname.includes('/jobseeker') &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/signup');
 
  const navLinks = [
    { name: 'Home', path: '/Job-portal/jobseeker' },
    { name: 'Jobs', path: '/Job-portal/jobseeker/jobs' },
    { name: 'Companies', path: '/Job-portal/jobseeker/companies' },
  ];
 
  const navIcons = [
    { image: breifcase, path: '/Job-portal/jobseeker/myjobs', label: 'My Jobs' },
    { image: chat, path: '/Job-portal/jobseeker/chat', label: 'Chat' },
  ];
 
  const refreshNotifications = async () => {
    if (fetchNotifications) {
      await fetchNotifications();
    }
  };
 
  useEffect(() => {
    if (isLoggedIn && fetchNotifications) {
      fetchNotifications();
    }
  }, [isLoggedIn]);
 
  const handleLandingPageNav = (e, sectionName) => {
    e.preventDefault();
    setMobileMenuOpen(false);
 
    if (sectionName === 'Jobs') {
      const jobsSection = document.getElementById('job-listings-section');
      if (jobsSection) {
        jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (sectionName === 'Companies') {
      const companiesSection = document.getElementById('companies-section');
      if (companiesSection) {
        companiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (sectionName === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
 
  // Handle keyboard events for notification toggle
  const handleNotificationKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowNotification(!showNotification);
    }
  };
 
  // Handle keyboard events for mobile menu toggle
  const handleMenuKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMobileMenuOpen(prev => !prev);
    }
  };
 
  const handleLogoClick = () => {
    const accessToken = sessionStorage.getItem("access");
    const userRole = sessionStorage.getItem("userRole");
    const currentRole = userRole ? userRole.toLowerCase() : "";
 
    if (accessToken && currentRole === "jobseeker") {
      navigate('/Job-portal/jobseeker');
    } else if (accessToken && currentRole === "employer") {
      navigate('/Job-portal/Employer/Dashboard');
    } else {
      navigate('/');
    }
  };
 
  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
          <span className="logo-text">Job portal</span>
        </div>
        {!isLoggedIn && (
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            onKeyDown={handleMenuKeyDown}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>
      <nav className="nav-links">
        {navLinks.map(n => {
          let isActive = location.pathname === n.path;
          if (n.name === 'Home' && !isActive) {
            isActive = location.pathname === n.path + '/';
          }
 
          return (
            <NavLink
              key={n.name}
              to={isLoggedIn ? n.path : '#'}
              onClick={!isLoggedIn ? (e) => handleLandingPageNav(e, n.name) : undefined}
              className={isActive ? 'nav-item nav-active' : 'nav-item'}
            >
              {n.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="auth-links">
        {isLoggedIn ? (
          <>
            <Link to="/Job-portal/jobseeker" className="mobile-home-icon" aria-label="Home">
              <img
                src={home_icon}
                alt="Home"
                className={
                  location.pathname === '/Job-portal/jobseeker'
                    ? 'jheader-icons-active'
                    : 'jheader-icons'
                }
              />
            </Link>
 
            {navIcons.map((IC, index) => {
              const isActive = location.pathname === IC.path;
              return (
                <Link
                  key={index}
                  to={IC.path}
                  style={{ position: "relative" }}
                  aria-label={IC.label}
                >
                  <img
                    src={IC.image}
                    alt={IC.label}
                    title={IC.label}
                    className={isActive ? 'jheader-icons-active' : 'jheader-icons'}
                  />
                  {/* Message Count Badge */}
                  {IC.label === "Chat" && unreadMessagesCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#007bff",
                        color: "white",
                        borderRadius: "50%",
                        minWidth: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "0 5px"
                      }}
                      aria-label={`${unreadMessagesCount} unread messages`}
                    >
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  )}
                </Link>
              );
            })}
 
            {/* Changed from div to button for better accessibility */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              onKeyDown={handleNotificationKeyDown}
              aria-label={`Notifications ${newNotificationsCount > 0 ? `(${newNotificationsCount} unread)` : ''}`}
              aria-expanded={showNotification}
              aria-haspopup="true"
              className="notification-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
              type="button"
            >
              <img
                src={newNotificationsCount > 0 ? bell_dot : bell}
                alt="Notifications"
                className="jheader-icons"
              />
              {/* {newNotificationsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#007bff",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "0 5px"
                  }}
                  aria-label={`${newNotificationsCount} unread notifications`}
                >
                  {newNotificationsCount > 99 ? "99+" : newNotificationsCount}
                </span>
              )} */}
            </button>
 
            <AvatarMenu />
 
            {/* <JNotification
              notificationsData={notificationsData.map(n => ({
                id: n.id,
                text: n.message,
                time: new Date(n.created_at).toLocaleString(),
                isRead: n.is_read,
              }))}
              showNotification={showNotification}
              setShowNotification={setShowNotification}
              refreshNotifications={refreshNotifications}
            /> */}
 
            <JNotification />
          </>
        ) : (
          <>
            <div className="auth-action-links">
              <Link to="/Job-portal/role-selection" className="login-btn">Login</Link>
              <Link to="/Job-portal/signup-selection" className="signup-btn">Sign up</Link>
            </div>
          </>
        )}
      </div>
      {!isLoggedIn && mobileMenuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
          <div className="mobile-menu-links">
            <a href="#" onClick={(e) => handleLandingPageNav(e, 'Home')} className="active">Home</a>
            <a href="#" onClick={(e) => handleLandingPageNav(e, 'Jobs')}>Jobs</a>
            <a href="#" onClick={(e) => handleLandingPageNav(e, 'Companies')}>Companies</a>
            <Link to="/Job-portal/role-selection" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/Job-portal/signup-selection" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
            <Link to="/Job-portal/role-selection" onClick={() => setMobileMenuOpen(false)}>Choose Role</Link>
          </div>
        </div>
      )}
    </header>
  );
};
 
 