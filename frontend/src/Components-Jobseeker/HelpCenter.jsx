import React, { useState, useRef, useEffect } from 'react';
import { Footer } from '../Components-LandingPage/Footer';
import "./HelpCenter.css";
import Helpcenterimg from "../assets/Helpcenter.png";
import search from '../assets/icon_search.png';
import { Link, useNavigate } from 'react-router-dom';
import { FHeader } from './FHeader';
import { Helmet } from 'react-helmet-async'; // Install: npm install react-helmet-async

export const HelpCenter = () => {
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [searchError, setSearchError] = useState("");
    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        const token = sessionStorage.getItem('access');
        setIsAuthenticated(!!token);
    }, []);

    const inputRef = useRef(null);

    const helpLinks = [
        {
            title: "Profile creation",
            path: "/Job-portal/jobseeker/help-center/profile-creation-help",
            requiresAuth: false
        },
        {
            title: "Resume upload",
            path: "/Job-portal/jobseeker/help-center/resume-upload-help",
            requiresAuth: true
        },
        {
            title: "Job apply issues",
            path: "/Job-portal/jobseeker/help-center/job-apply-help",
            requiresAuth: true
        },
        {
            title: "Interview scheduling",
            path: "/Job-portal/jobseeker/help-center/interview-scheduling-help",
            requiresAuth: true
        },
        {
            title: "Job posting",
            path: "/Job-portal/jobseeker/help-center/job-posting-help",
            requiresAuth: true
        },
        {
            title: "Candidate search",
            path: "/Job-portal/jobseeker/help-center/candidate-search-help",
            requiresAuth: true
        },
        {
            title: "Subscription issues",
            path: "/Job-portal/jobseeker/help-center/subscription-issue-help",
            requiresAuth: true
        },
        {
            title: "Invoice & payment",
            path: "/Job-portal/jobseeker/help-center/invoice-payment-help",
            requiresAuth: true
        },
        {
            title: "Login issues",
            path: "/Job-portal/jobseeker/help-center/login-issue-help",
            requiresAuth: false
        },
        {
            title: "Page errors",
            path: "/Job-portal/jobseeker/help-center/page-error-help",
            requiresAuth: false
        },
        {
            title: "File upload problems",
            path: "/Job-portal/jobseeker/help-center/file-upload-help",
            requiresAuth: true
        }
    ];

    const FAQ_DATA = [
        { question: "Who can use your platform?" },
        { question: "How do I create an account?" },
        { question: "What if I forget my password?" },
        { question: "Can I update my profile?" },
        { question: "How do I search for jobs?" },
        { question: "How do I know if my application was received?" },
        { question: "Can I upload multiple versions of my resume?" }
    ];

    const faqSearchLinks = FAQ_DATA.map((faq, index) => ({
        title: faq.question,
        path: "/Job-portal/jobseeker/help-center/help-FAQs",
        state: { faqId: index },
        requiresAuth: false
    }));

    const supportLinks = [
        {
            title: "Raise a Ticket",
            path: "/Job-portal/jobseeker/help-center/raise-a-ticket",
            requiresAuth: true
        },
        {
            title: "Live Chat",
            path: "/Job-portal/jobseeker/help-center/live-chat",
            requiresAuth: false
        }
    ];

    const allSearchLinks = [
        ...helpLinks,
        ...faqSearchLinks,
        ...supportLinks
    ];

    const filteredLinks = allSearchLinks.filter(link =>
        link.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const [activeIndex, setActiveIndex] = useState(-1);
    const [openIndex, setOpenIndex] = useState(null);

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Handle navigation with authentication check
    const handleNavigate = (path, state = null, requiresAuth = false) => {
        if (requiresAuth && !isAuthenticated) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 60000);
            return;
        }

        navigate(path, { state });
        setSearchText("");
        setShowResults(false);
        setActiveIndex(-1);
        setSearchError("");
    };

    // Handle "Raise a Ticket" click
    const handleRaiseTicket = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 60000);
            return;
        }
        navigate('/Job-portal/jobseeker/help-center/raise-a-ticket');
    };

    // Handle "Live Chat" click
    const handleLiveChat = (e) => {
        e.preventDefault();
        navigate('/Job-portal/jobseeker/help-center/live-chat');
    };

    const handleSearch = () => {
        if (searchText.trim() === "") {
            setSearchError("Please enter any issue to search");
            setShowResults(false);
            inputRef.current?.focus();
            return;
        }

        setSearchError("");

        if (filteredLinks.length > 0) {
            const first = filteredLinks[0];
            if (first.requiresAuth && !isAuthenticated) {
                setShowLoginPrompt(true);
                setTimeout(() => setShowLoginPrompt(false), 30000);
                return;
            }
            navigate(first.path, { state: first.state });
            setShowResults(false);
            setSearchText("");
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        setShowResults(true);
        if (value.trim() !== "") {
            setSearchError("");
        }
    };

    return (
        <>
            <Helmet>
                <link rel="preload" as="image" href={Helpcenterimg} />
            </Helmet>
            <FHeader />
            <div className='Helpcenter-page'>
                <div className="helpcenter-container">
                    <img
                        src={Helpcenterimg}
                        alt="helpcenter"
                        className="Helpcenter-Img"
                        loading="eager"
                        fetchPriority="high"
                        width="1920"
                        height="450"
                    />

                    <div className="Helpcenter-Img-content">
                        <h2>Hello, how can we support you?</h2>
                        <p>
                            Welcome to our help center! Here, you'll find answers to frequently asked
                            questions, helpful guides, and useful tips to assist you in getting the
                            most out of our platform.
                        </p>
                        <div className="helpcenter-search-wrapper">
                            <div className={`Helpcenter-search-box ${searchError ? "error" : ""}`}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={searchError ? "Please enter any issue to search" : "Enter a keyword search"}
                                    value={searchText}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (searchError) setSearchError("");

                                        if (!filteredLinks.length) return;

                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActiveIndex((prev) =>
                                                prev < filteredLinks.length - 1 ? prev + 1 : 0
                                            );
                                        }

                                        if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setActiveIndex((prev) =>
                                                prev > 0 ? prev - 1 : filteredLinks.length - 1
                                            );
                                        }

                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                    style={{
                                        color: searchError ? "#dc3545" : undefined,
                                        borderColor: searchError ? "#dc3545" : undefined
                                    }}
                                />
                                <button onClick={handleSearch}>
                                    <img src={search} alt="search" />
                                </button>
                            </div>

                            {showResults && searchText && !searchError && (
                                <div className="helpcenter-search-dropdown">
                                    {filteredLinks.length > 0 ? (
                                        filteredLinks.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`helpcenter-search-item ${index === activeIndex ? "active" : ""
                                                    } ${item.requiresAuth && !isAuthenticated ? "requires-auth" : ""}`}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onClick={() => handleNavigate(item.path, item.state, item.requiresAuth)}
                                                style={{
                                                    cursor: item.requiresAuth && !isAuthenticated ? 'pointer' : 'pointer'
                                                }}
                                            >
                                                {item.title}
                                                {item.requiresAuth && !isAuthenticated && (
                                                    <span className="auth-badge">🔒</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="helpcenter-search-no-result">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="Helpcenter-section">
                    <h2 className="Helpcenter-section-title">Categories</h2>

                    <div className="Helpcenter-layout">
                        <div className="Helpcenter-sidebar">
                            {/* JOB SEEKERS */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 0 ? "active-main open" : ""}`}
                                onClick={() => toggleItem(0)}
                            >
                                <span>For Job Seekers</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 0 && (
                                <div className="helpcenter-submenu">
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/profile-creation-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Profile creation</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/resume-upload-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Resume upload</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/job-apply-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Job apply issues</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/interview-scheduling-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Interview scheduling</div>
                                    </Link>
                                </div>
                            )}

                            {/* EMPLOYERS */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 1 ? "active-main open" : ""}`}
                                onClick={() => toggleItem(1)}
                            >
                                <span>For Employers</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 1 && (
                                <div className="helpcenter-submenu">
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/job-posting-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Job posting</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/candidate-search-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Candidate search</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/subscription-issue-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Subscription issues</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/invoice-payment-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Invoice & payment</div>
                                    </Link>
                                </div>
                            )}

                            {/* TECHNICAL */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 2 ? "active-main open" : ""}`}
                                onClick={() => toggleItem(2)}
                            >
                                <span>Technical issue</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 2 && (
                                <div className="helpcenter-submenu">
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/login-issue-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Login issues</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/page-error-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">Page errors</div>
                                    </Link>
                                    <Link
                                        to='/Job-portal/jobseeker/help-center/file-upload-help'
                                        className="helpcenter-submenu-link"
                                    >
                                        <div className="helpcenter-submenu-item">File upload problems</div>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {showLoginPrompt && (
                            <div className="toast-container">
                                <div className="toast-notification">
                                    <div className="toast-icon">⚠️</div>
                                    <div className="toast-content">
                                        <strong>Login Required</strong>
                                        <span>Please login to access this feature</span>
                                    </div>
                                    <Link to="/Job-portal/role-selection" className="toast-link">
                                        Login
                                    </Link>
                                    <button className="toast-close" onClick={() => setShowLoginPrompt(false)}>×</button>
                                </div>
                            </div>
                        )}

                        <div className="helpcenter-support-options">
                            {/* FAQ Link */}
                            <Link
                                to='/Job-portal/jobseeker/help-center/help-FAQs'
                                className="helpcenter-support-item"
                            >
                                Popular Articles / FAQs
                            </Link>

                            {/* Raise a Ticket */}
                            <div
                                className="helpcenter-support-item"
                                onClick={handleRaiseTicket}
                            >
                                Raise a Ticket
                                {!isAuthenticated && (
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 400, marginLeft: '6px' }}>
                                        &nbsp;(Login required)
                                    </span>
                                )}
                            </div>

                            {/* Live Chat */}
                            <Link
                                to='/Job-portal/jobseeker/help-center/live-chat'
                                className="helpcenter-support-item"
                                onClick={handleLiveChat}
                            >
                                Live Chat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="login-prompt-overlay">
                    <div className="login-prompt-modal">
                        <div className="login-prompt-icon">🔒</div>
                        <h3>Login Required</h3>
                        <p>Please login to access this feature. Only registered users can raise tickets.</p>
                        <div className="login-prompt-actions">
                            <Link to="/Job-portal/jobseeker/login" className="login-prompt-btn primary">
                                Login Now
                            </Link>
                            <button
                                className="login-prompt-btn secondary"
                                onClick={() => setShowLoginPrompt(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};