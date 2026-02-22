import React, { useState } from 'react';
import './Header.css';
import { Link, NavLink, useLocation } from 'react-router-dom';
import breifcase from '../assets/header_case.png';
import chat from '../assets/header_message.png';
import bell from '../assets/header_bell.png';
import bell_dot from '../assets/header_bell_dot.png';
import home_icon from '../assets/home_icon.png';
import { AvatarMenu } from '../Components-Jobseeker/AvatarMenu';
import { JNotification } from '../Components-Jobseeker/JNotification';



export const Header = () => {
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { image: breifcase, path: '/Job-portal/jobseeker/myjobs' },
    { image: chat, path: '' },
  ];


  const preventNav = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo">job portal</div>
        {!isLoggedIn && (
          <div
            className="hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </div>
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
              onClick={!isLoggedIn ? preventNav : undefined}
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
            <Link to="/Job-portal/jobseeker" className="mobile-home-icon">
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
                <Link key={index} to={IC.path}>
                  <img
                    src={IC.image}
                    alt="icon"
                    className={isActive ? 'jheader-icons-active' : 'jheader-icons'}
                  />
                </Link>
              );
            })}

            <div onClick={() => setShowNotification(!showNotification)}>
              <img
                src={bell}
                alt="Notifications"
                className="jheader-icons"
              />
            </div>

            <AvatarMenu />

            <JNotification
              showNotification={showNotification}
              setShowNotification={setShowNotification}
            />

          </>
        ) : (
          <>
            <Link to="/Job-portal/jobseeker/login" className="login-btn">Login</Link>
            <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Sign up</Link>
            <div className="separator"></div>
            <Link to="/Job-portal/employer/login" className="emp-log-link">For Employers</Link>
          </>
        )}
      </div>
      {!isLoggedIn && mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            <a href="#" onClick={preventNav} className="active">Home</a>
            <a href="#" onClick={preventNav}>Jobs</a>
            <a href="#" onClick={preventNav}>Companies</a>

            <Link to="/Job-portal/jobseeker/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/Job-portal/jobseeker/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
            <Link to="/Job-portal/employer/login" onClick={() => setMobileMenuOpen(false)}>For Employers</Link>
          </div>
        </div>
      )}

    </header>
  );
};