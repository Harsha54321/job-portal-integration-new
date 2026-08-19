import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './EmployerDashboard.css'
import DashboardIC from '../assets/Employer/DashboardIC.png'
import PostJobs from '../assets/Employer/PostJob.png'
import Mypost from '../assets/Employer/JOBPOST.png'
import Analytics from '../assets/Employer/AnalyticsInA.png'
import Billing from '../assets/Employer/Billing.png'
import Logout from '../assets/Employer/Elogout.png'
import Profile from '../assets/Employer/Esettings.png'
import { EHeader } from './EHeader'
import { Footer } from '../Components-LandingPage/Footer'
import Shortlist from '../assets/Employer/EShortlist.png'
import InterviewS from '../assets/Employer/EinterviewS.png'
import ActiveJobs from '../assets/Employer/EActiveJobs.png'
import TotalAPP from '../assets/Employer/ETotalAPP.png'
import Close from '../assets/Employer/Close.png'
import ClockImage from '../assets/Employer/ClockImage.gif'
import jobpost from '../assets/Employer/JOBPOST.png'
import { PostedJobs } from './PostedJobs'
import { ViewApplicants } from './ViewApplicants'
import { useJobs } from '../JobContext'
import { FindTalent } from './FindTalent'
import { PostJobForm } from './PostJobForm'
import Dashboard from '../assets/Employer/Dashboard_Inactive.png'
import PostJobsAct from '../assets/Employer/JonPost_Active.png'
import MypostAct from '../assets/Employer/MyJobPost_Active.png'
import LogoutAct from '../assets/Employer/LogOut.png'
import BillingAct from '../assets/Employer/Billing_Alt.png'
import AnalyticsAct from '../assets/Employer/Analytics_Active.png'
import ProfileAct from '../assets/Employer/Eprofile.png'
import Findtalent from '../assets/Employer/FindTalent.png'
import FindTalentAct from '../assets/Employer/FindTalent_Active.png'
import { AboutYourCompany } from './AboutYourCompany'
import place from '../assets/opportunity_location.png'
import { LogoutModal } from '../Components-Jobseeker/LogoutModal'
import { AnalyticsPage } from './AnalyticsPage'
import { PlansBilling } from './PlansBilling'
import api from "../api/axios";
import AdminManager from '../assets/Employer/User.png'
import { AddManagerSupport } from './AddManagerSupport'
import { LocationDisplay } from '../Components-Jobseeker/LocationDisplay';
// import { MyTickets } from './MyTickets'
import RaisedTickets from '../Components-Jobseeker/RaisedTickets'
import TicketIcon from '../assets/AdminAssets/Tickets.png'

export const EmployerDashboard = () => {
    const { currentEmployer, getJobStats, refreshEmployerData } = useJobs();

    // ============ ALL HOOKS AT THE TOP ============
    const contentTopRef = useRef(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [editJobData, setEditJobData] = useState(null);
    const [allowEditAfterApproval, setAllowEditAfterApproval] = useState(true);
    const [pendingTargetApplicationId, setPendingTargetApplicationId] = useState(null);
    const [pendingTargetTicketId, setPendingTargetTicketId] = useState(null);

    const [verificationStatus, setVerificationStatus] = useState({
        isLoading: true,
        isVerified: false,
        status: 'pending'
    });

    const [activeMenu, setActiveMenu] = useState(null);
    const [activetab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('employerActiveTab') || 'Dashboard';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [pendingTargetManagerId, setPendingTargetManagerId] = useState(null);


    // --- NEW SCROLL EFFECT ---
    // This ensures EVERY time you change a tab, the dashboard content scrolls to the top
    useEffect(() => {
        setTimeout(() => {
            // 1. Keep the main window locked at the top so your header stays visible
            window.scrollTo(0, 0);

            // 2. Scroll ONLY the inside of the dashboard container
            if (contentTopRef.current) {
                contentTopRef.current.scrollTop = 0;
            }
        }, 10);
    }, [activetab, selectedJob]);

    useEffect(() => {
        if (
            activetab === "ViewApplicants" &&
            !selectedJob
        ) {
            setActiveTab("My job post");
        }
    }, [activetab, selectedJob]);

    useEffect(() => {
        const fetchEditPermission = async () => {
            try {
                const res = await api.get('/subscription/');
                setAllowEditAfterApproval(res.data?.allow_edit_after_approval ?? false);
            } catch (error) {
                console.error("Error fetching edit-after-approval permission:", error);
            }
        };
        fetchEditPermission();
    }, []);


    // const PostedJob = currentEmployer?.jobPosted || [];
    const PostedJob = useMemo(() => {
        return currentEmployer?.jobPosted || [];
    }, [currentEmployer]);

    const location = useLocation();
    const navigate = useNavigate();

    // Add this alongside your other useEffects
    useEffect(() => {
        if (activetab) {
            sessionStorage.setItem('employerActiveTab', activetab);
        }
    }, [activetab]);

    // ============ AUTO REFRESH ON MOUNT AND AFTER LOGIN ============
    useEffect(() => {
        const loadEmployerData = async () => {
            setIsDataLoading(true);
            try {
                const justLoggedIn = location.state?.justLoggedIn || false;
                const fromVerify = location.state?.fromVerify || false;
                const verificationSubmitted = location.state?.verificationSubmitted || false;

                console.log("📊 Loading employer data...");
                console.log("Just logged in:", justLoggedIn);
                console.log("From verify:", fromVerify);

                // Use refreshEmployerData from context
                if (refreshEmployerData) {
                    await refreshEmployerData();
                    console.log("✅ Employer data refreshed");
                }

                // Clear navigation state after processing
                if (justLoggedIn || fromVerify || verificationSubmitted) {
                    navigate(location.pathname, { replace: true, state: {} });
                }
            } catch (error) {
                console.error("Error loading employer data:", error);
            } finally {
                setIsDataLoading(false);
            }
        };

        loadEmployerData();
    }, [refreshEmployerData]); // Run when refreshEmployerData changes and on mount

    // ============ FETCH VERIFICATION STATUS ============
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            const token = sessionStorage.getItem("access");
            if (!token) return;
            try {
                const response = await api.get('/company/verification-status/');
                console.log("Verification status response:", response.data);

                setVerificationStatus({
                    isLoading: false,
                    isVerified: response.data.status === 'Verified',
                    status: response.data.status
                });

                if (response.data.status === 'Verified') {
                    sessionStorage.removeItem('verification_pending');
                }
            } catch (error) {
                console.error("Error fetching verification status:", error);
                const hasPendingVerification = sessionStorage.getItem('verification_pending') === 'true';
                const fromVerify = location.state?.fromVerify || false;

                setVerificationStatus({
                    isLoading: false,
                    isVerified: false,
                    status: hasPendingVerification || fromVerify ? 'pending' : 'unknown'
                });
            }
        };

        fetchVerificationStatus();

        const interval = setInterval(() => {
            const token = sessionStorage.getItem("access");
            if (token && verificationStatus.status !== 'Verified') {
                fetchVerificationStatus();
            } else {
                clearInterval(interval);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);
    // Fetch applications for accurate stats
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('jobs/applications/');
                console.log("Dashboard - Applications fetched:", response.data);
                setApplications(response.data || []);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchApplications();
    }, []);

    // Add this hook layout inside your Jobseeker Dashboard view file
    useEffect(() => {
        const targetTab = location.state?.targetTab;
        const targetJobId = location.state?.targetJobId;
        const targetApplicationId = location.state?.targetApplicationId;
        const targetManagerId = location.state?.targetManagerId;
        const targetTicketId = location.state?.targetTicketId;

        if (!targetTab) return;

        if (targetTab === 'ViewApplicants' && targetJobId) {
            const job = PostedJob.find(j => String(j.id) === String(targetJobId));
            if (job) {
                setSelectedJob(job);
                setActiveTab('ViewApplicants');
                setPendingTargetApplicationId(targetApplicationId ?? null);
            } else {
                // job not loaded yet, or doesn't exist -> fall back to the list
                setActiveTab('My job post');
            }
        } else {
            setActiveTab(targetTab);
            if (targetTab === 'AccountManager') {
                setPendingTargetManagerId(targetManagerId ?? null);   // ← add this
            }
            if (targetTab === 'MyTickets') {
                setPendingTargetTicketId(targetTicketId ?? null);
            }
        }

        navigate(location.pathname, { replace: true, state: {} });
    }, [location.state, PostedJob]);

    // ============ MEMOIZED STATS ============
    const jobStats = useMemo(() => {
        if (!PostedJob.length || !applications.length) {
            return { totalApps: 0, totalShortlisted: 0, totalInterview: 0 };
        }

        const employerJobIds = PostedJob.map(job => String(job.id));

        // Filter applications for employer's jobs
        const employerApplications = applications.filter(app =>
            employerJobIds.includes(String(app.job?.id))
        );

        const totalApps = employerApplications.length;
        const totalShortlisted = employerApplications.filter(app =>
            app.status?.toLowerCase() === 'shortlisted'
        ).length;
        const totalInterview = employerApplications.filter(app =>
            app.status?.toLowerCase() === 'interview_called'
        ).length;

        console.log("Dashboard Stats:", { totalApps, totalShortlisted, totalInterview });

        return { totalApps, totalShortlisted, totalInterview };
    }, [applications, PostedJob]);

    // ============ HELPER FUNCTIONS ============
    const getJobApplicationStats = (jobId) => {
        if (!applications.length) {
            return { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 };
        }

        const jobApplications = applications.filter(app =>
            String(app.job?.id) === String(jobId)
        );

        return {
            total: jobApplications.length,
            new: jobApplications.filter(app => app.status?.toLowerCase() === 'applied').length,
            shortlisted: jobApplications.filter(app =>
                app.status?.toLowerCase() === 'shortlisted'

            ).length,
            interview: jobApplications.filter(app => app.status?.toLowerCase() === 'interview_called').length,
            rejected: jobApplications.filter(app => app.status?.toLowerCase() === 'rejected').length
        };
    };

    const handleDeleteClick = async (jobId) => {
        setActiveMenu(null);
        const isConfirmed = window.confirm("Are you sure you want to delete this job post?");
        if (!isConfirmed) return;

        try {
            // CORRECTED ENDPOINT
            await api.delete(`/jobs/${jobId}/delete/`);
            alert("Job post deleted successfully!");
            if (refreshEmployerData) {
                await refreshEmployerData();
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete the job. Please try again.");
        }
    };

    const activeJobsCount = PostedJob.length;
    const initialLetter = currentEmployer?.hrName?.charAt(0).toUpperCase() || "U";

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);

        try {
            const refresh = sessionStorage.getItem("refresh");

            if (refresh) {
                await api.post("logout/", { refresh });
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {

            sessionStorage.clear();
            sessionStorage.clear();

            sessionStorage.removeItem("employerActiveTab");
            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");
            sessionStorage.removeItem("userRole");
            sessionStorage.removeItem("user_id");
            sessionStorage.removeItem("user_type");
            sessionStorage.removeItem("profile_id");

            navigate('/');
        }
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    // const location = useLocation();
    // const fromVerify = location.state?.fromVerify || false;
    // const [isVerifying, setIsVerifying] = useState(fromVerify);

    // useEffect(() => {
    //     if (fromVerify) {
    //         const timer = setTimeout(() => {
    //             setIsVerifying(false);
    //         }, 2500);
    //         return () => clearTimeout(timer);
    //     }
    // }, [fromVerify]);

    useEffect(() => {
        const token = sessionStorage.getItem("access");
        const isInsidePortal = location.pathname.includes("/Job-portal/employer") ||
            location.pathname.includes("/Job-portal/jobseeker");

        // If they are inside a protected area without a token, kick them out
        if (!token && isInsidePortal && !location.pathname.includes("login")) {
            window.location.replace("/");
        }
    }, [location.pathname]);

    const ToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        setActiveTab('ViewApplicants');
    };


    const handleEditJob = (job) => {
        setActiveMenu(null);
        if (job.approval_status === 'approved' && !allowEditAfterApproval) return;
        setEditJobData(job);
        setActiveTab('Post a Job');
    };

    const goToPostJobTab = () => {
        setEditJobData(null);
        setActiveTab('Post a Job');
    };

    // ============ LOADING SPINNER COMPONENT ============
    const LoadingSpinner = () => (
        <>
            <EHeader />
            <div className='container1' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px', color: '#666' }}>Loading your dashboard...</p>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <Footer />
        </>
    );

    // ============ CONDITIONAL RETURN (AFTER ALL HOOKS) ============
    if (isDataLoading && verificationStatus.isLoading) {
        return <LoadingSpinner />;
    }

    // ============ MAIN RETURN ============
    return (
        <>
            <EHeader />
            <div className='container1'>
                {isSidebarOpen ? (
                    <div className='EAside'>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", alignItems: "center", marginTop: "35px", marginBottom: "35px" }}>
                                <h3 style={{ color: "snow", margin: "25px", fontWeight: "900" }}>{currentEmployer?.hrName || "User"}</h3>
                                <img src={Close} width={10} style={{ backgroundColor: "white", padding: '5px', margin: "25px", borderRadius: "30px", cursor: "pointer" }} onClick={() => ToggleSidebar()} title='Close Sidebar' />
                            </div>
                            <h3 className='Aside-Title'>Overview</h3>
                            <div className='ENavbar'>
                                <div onClick={() => !verificationStatus.isLoading && !verificationStatus.isVerified ? null : setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active" : 'Navbox'} >
                                    {activetab === 'Dashboard' ? <img src={DashboardIC} height={15} width={15} alt="Dashboard" /> : <img src={Dashboard} height={20} width={20} alt="Dashboard" />}
                                    <div className='Enav-item'>Dashboard</div>
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Post a Job')} className={activetab === 'Post a Job' ? "Active" : 'Navbox'}>
                                    {activetab === 'Post a Job' ? <img src={PostJobsAct} height={25} width={25} alt="Post a Job" /> : <img src={PostJobs} height={20} width={20} alt="Post a Job" />}
                                    <div className='Enav-item'>Post a Job</div>
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('My job post')} className={activetab === 'My job post' ? "Active" : 'Navbox'} >
                                    {activetab === 'My job post' ? <img src={MypostAct} height={35} width={20} alt="My Job Post" /> : <img src={Mypost} height={15} width={20} alt="My Job Post" />}
                                    <div className='Enav-item'>My Job Post</div>
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Find Talent')} className={activetab === 'Find Talent' ? "Active" : 'Navbox'} >
                                    {activetab === 'Find Talent' ? <img src={FindTalentAct} height={20} width={20} alt="Find Talent" /> : <img src={Findtalent} height={20} width={20} alt="Find Talent" />}
                                    <div className='Enav-item'>Find Talent</div>
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active" : 'Navbox'} >
                                    {activetab === 'Analytics' ? <img src={AnalyticsAct} height={20} width={20} alt="Analytics" /> : <img src={Analytics} height={20} width={20} alt="Analytics" />}
                                    <div className='Enav-item'>Analytics</div>
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Billing')} className={activetab === 'Billing' ? "Active" : 'Navbox'} >
                                    {activetab === 'Billing' ? <img src={BillingAct} height={15} width={15} alt="Billing" /> : <img src={Billing} height={18} width={20} alt="Billing" />}
                                    <div className='Enav-item'>Billing</div>
                                </div>
                            </div>
                            <h3 className='Aside-Title'>Settings</h3>
                            <div className='ENavbar'>
                                <div onClick={() => setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active" : 'Navbox'}  >
                                    {activetab === 'My Profile' ? <img src={ProfileAct} height={15} width={15} alt="My Profile" /> : <img src={Profile} height={15} width={15} alt="My Profile" />}
                                    <div className='Enav-item'>My Profile</div>
                                </div>
                                <div onClick={() => setActiveTab('AccountManager')}
                                    className={activetab === 'AccountManager' ? "Active" : 'Navbox'}>
                                    {activetab === 'AccountManager' ? (
                                        <img src={AdminManager} height={15} width={15} alt="Account Manager" />
                                    ) : (
                                        <img src={AdminManager} height={15} width={15} alt="Account Manager" />
                                    )}
                                    <div className='Enav-item'>Account Manager</div>
                                </div>
                                <div onClick={() => setActiveTab('MyTickets')} className={activetab === 'MyTickets' ? "Active" : 'Navbox'}>
                                    <img src={TicketIcon} height={15} width={15} alt="My Tickets" />
                                    <div className='Enav-item'>My Tickets</div>
                                </div>

                                <div onClick={() => setShowLogoutModal(true)} className={activetab === 'Logout' ? "Active" : 'Navbox'} >
                                    {activetab === 'Logout' ? <img src={LogoutAct} height={15} width={15} alt="Logout" /> : <img src={Logout} height={15} width={15} alt="Logout" />}
                                    <div className='Enav-item'>Logout</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='EAside2'>
                        <div>
                            <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", alignItems: "center", textAlign: "center", marginTop: "15px", padding: "5px" }}>
                                <div className='EE-Name' title={currentEmployer?.hrName || "User"}><h3 style={{ margin: "15px", fontSize: "22px" }}>{initialLetter}</h3></div>
                                <img src={jobpost} width={30} style={{ padding: '5px' }} onClick={() => ToggleSidebar()} title='Switch Sidebar' />
                            </div>
                            <div className='ENavbar1' style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active1" : 'Navbox1'} title="Go to Dashboard Overview">
                                    {activetab === 'Dashboard' ? <img src={DashboardIC} height={20} width={20} alt="Dashboard" /> : <img src={Dashboard} height={18} width={18} alt="Dashboard" />}
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Post a Job')} className={activetab === 'Post a Job' ? "Active1" : 'Navbox1'} title="Post a new job opening">
                                    {activetab === 'Post a Job' ? <img src={PostJobsAct} height={20} width={20} alt="Post a Job" /> : <img src={PostJobs} height={15} width={15} alt="Post a Job" />}
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('My job post')} className={activetab === 'My job post' ? "Active1" : 'Navbox1'} title="View and manage your job posts">
                                    {activetab === 'My job post' ? <img src={MypostAct} height={20} width={20} alt="My Job Post" /> : <img src={Mypost} height={15} width={15} alt="My Job Post" />}
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Find Talent')} className={activetab === 'Find Talent' ? "Active1" : 'Navbox1'} title="Search and find talented candidates">
                                    {activetab === 'Find Talent' ? <img src={FindTalentAct} height={15} width={15} alt="Find Talent" /> : <img src={Findtalent} height={15} width={15} alt="Find Talent" />}
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active1" : 'Navbox1'} title="View recruitment analytics and insights">
                                    {activetab === 'Analytics' ? <img src={AnalyticsAct} height={15} width={15} alt="Analytics" /> : <img src={Analytics} height={15} width={15} alt="Analytics" />}
                                </div>
                                <div onClick={() => verificationStatus.isVerified && setActiveTab('Billing')} className={activetab === 'Billing' ? "Active1" : 'Navbox1'} title="Manage subscriptions and billing">
                                    {activetab === 'Billing' ? <img src={BillingAct} height={15} width={15} alt="Billing" /> : <img src={Billing} height={15} width={15} alt="Billing" />}
                                </div>
                                <div onClick={() => setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active1" : 'Navbox1'} title="View and edit your profile">
                                    {activetab === 'My Profile' ? <img src={ProfileAct} height={15} width={15} alt="My Profile" /> : <img src={Profile} height={15} width={15} alt="My Profile" />}
                                </div>
                                <div onClick={() => setActiveTab('AccountManager')}
                                    className={activetab === 'AccountManager' ? "Active1" : 'Navbox1'}
                                    title="Account Manager">
                                    {activetab === 'AccountManager' ? (
                                        <img src={AdminManager} height={15} width={15} alt="Account Manager" />
                                    ) : (
                                        <img src={AdminManager} height={15} width={15} alt="Account Manager" />
                                    )}
                                </div>
                                <div onClick={() => setActiveTab('MyTickets')} className={activetab === 'MyTickets' ? "Active1" : 'Navbox1'} title="My Tickets">
                                    <img src={TicketIcon} height={15} width={15} alt="My Tickets" />
                                </div>
                                <div onClick={() => setShowLogoutModal(true)} className={activetab === 'Logout' ? "Active1" : 'Navbox1'} style={{ cursor: 'pointer' }} title="Logout from your account">
                                    {activetab === 'Logout' ? <img src={LogoutAct} height={15} width={15} alt="Logout" /> : <img src={Logout} height={15} width={15} alt="Logout" />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={isSidebarOpen ? 'Emainsec' : 'Emainsec2'}>
                    {/* Anchor element to target the top of the content view */}
                    <div ref={contentTopRef}></div>

                    {activetab === 'Dashboard' && (
                        <>
                            <div className="employer-dashboard-relative-container">
                                {verificationStatus.isLoading ? (
                                    <div className="pending-main-section">
                                        <div className="pending-section">
                                            <div className="spinner"></div>
                                            <p>Loading account status...</p>
                                        </div>
                                    </div>
                                ) : !verificationStatus.isVerified ? (
                                    <div className="pending-main-section">
                                        <div className='Welcome-Note'>
                                            <div>
                                                <h2>Hi {currentEmployer?.hrName || "User"},</h2>
                                                <p style={{ fontWeight: "600" }}>Account Under Review</p>
                                            </div>
                                        </div>
                                        <div className="pending-verification-overlay">
                                            <div className="pending-section">
                                                <img src={ClockImage} alt="pending" className="pending-icon" />
                                                <h2>Pending Verification</h2>
                                                <p>Your account is currently under review by our admin team.</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    We'll notify you once your account is approved.
                                                </p>
                                                <button
                                                    className="refresh-status-btn mt-4"
                                                    onClick={() => window.location.reload()}
                                                    style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                                                >
                                                    Check Status
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                ) : (
                                    <>
                                        <div >
                                            <div className='Welcome-Note'>
                                                <div>
                                                    <h2>Hi {currentEmployer?.hrName || "User"},</h2>
                                                    <p style={{ fontWeight: "600" }}>Here's, What's Going on... </p>
                                                </div>
                                                <button
                                                    className='post-job-btn'
                                                    onClick={() => {
                                                        setActiveTab('Post a Job');
                                                        window.scrollTo(0, 0);
                                                    }}
                                                >
                                                    + Post a Job
                                                </button>
                                            </div>

                                            <div className='E-DashB-Over-View'>
                                                <h2 style={{ marginLeft: "40px" }}>Overview</h2>
                                                <div className='EDashB-Application-Counts'>
                                                    <div className='E-DashB-No-Counts'>
                                                        <div><img src={ActiveJobs} width={40} alt="" /></div>
                                                        <div><p>{activeJobsCount}</p><p className='E-job-status'>Active Jobs</p></div>
                                                    </div>
                                                    <div className='E-DashB-No-Counts'>
                                                        <div><img src={TotalAPP} width={40} alt="" /></div>
                                                        <div><p>{jobStats.totalApps}</p><p className='E-job-status'>Total Applicants</p></div>
                                                    </div>
                                                    <div className='E-DashB-No-Counts'>
                                                        <div><img src={Shortlist} width={40} alt="" /></div>
                                                        <div><p>{jobStats.totalShortlisted}</p><p className='E-job-status'>ShortListed</p></div>
                                                    </div>
                                                    <div className='E-DashB-No-Counts'>
                                                        <div><img src={InterviewS} width={40} alt="" /></div>
                                                        <div><p>{jobStats.totalInterview}</p><p className='E-job-status'>Interview Schedules</p></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recently posted jobs */}
                                            <div>
                                                <div className='ERecent-Post-Cont'>
                                                    <h3 style={{ marginleft: "40px" }}>Recently Posted Jobs</h3>
                                                    <div className='ERecent-Post-Table-Container'>

                                                        {PostedJob.length > 0 ? (
                                                            <>
                                                                <div className="postedjobs-grid-layout postedjobs-table-header">
                                                                    <div />
                                                                    <span className="postedjobs-label">Applicants</span>
                                                                    <span className="postedjobs-label" title="Candidates who applied but not yet reviewed">
                                                                        New ⓘ
                                                                    </span>
                                                                    <span className="postedjobs-label">Shortlisted</span>
                                                                    <span className="postedjobs-label">Interview</span>
                                                                    <span className="postedjobs-label">Rejected</span>
                                                                    <div />
                                                                </div>
                                                                <div className="postedjobs-list">
                                                                    {PostedJob.slice(0, 5).map((job) => {
                                                                        const stats = getJobApplicationStats(job.id);

                                                                        // ONLY highlighted jobs get styling
                                                                        const isHighlighted = job.is_highlighted === true;

                                                                        let rowClassName = "postedjobs-grid-layout postedjobs-card";
                                                                        if (isHighlighted) {
                                                                            rowClassName += " highlighted-job";
                                                                        }

                                                                        return (
                                                                            //   <div key={job.id} className={rowClassName} style={{ position: 'relative', overflow: 'visible' }}>
                                                                            // replace with
                                                                            <div key={job.id} className={rowClassName} style={{ position: 'relative', overflow: 'visible', zIndex: activeMenu === job.id ? 1000 : 1 }}>
                                                                                {/* Badge only for highlighted jobs */}
                                                                                {isHighlighted && <span className="job-badge premium-badge">⭐ Highlighted job</span>}

                                                                                <div className="postedjobs-info">
                                                                                    <h3>{job.job_title || job.title}</h3>
                                                                                    <p className="postedjobs-loc flex items-center gap-2">
                                                                                        <img src={place} alt="location" className="post-job-locationicon" />
                                                                                        <LocationDisplay locations={job.location} />
                                                                                    </p>
                                                                                    <small>Created on: {new Date(job.created_at || job.posted_date).toLocaleDateString()}</small>
                                                                                </div>
                                                                                <span className="postedjobs-badge">{stats.total}</span>
                                                                                <span className="postedjobs-badge">{stats.new}</span>
                                                                                <span className="postedjobs-badge">{stats.shortlisted}</span>
                                                                                <span className="postedjobs-badge">{stats.interview}</span>
                                                                                <span className="postedjobs-badge">{stats.rejected}</span>
                                                                                <div className="postedjobs-actions" style={{ position: 'relative' }}>
                                                                                    <button className="postedjobs-view-btn" onClick={() => handleViewApplicants(job)}>
                                                                                        View applicants
                                                                                    </button>
                                                                                    <div className="postedjobs-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setActiveMenu(activeMenu === job.id ? null : job.id);
                                                                                            }}
                                                                                            className="postedjobs-dots"
                                                                                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '5px 10px', color: '#94a3b8' }}
                                                                                        >
                                                                                            ⋮
                                                                                        </button>
                                                                                        {activeMenu === job.id && (
                                                                                            <div
                                                                                                className="postedjobs-dropdown"
                                                                                                style={{
                                                                                                    position: 'absolute',
                                                                                                    right: 0,
                                                                                                    top: '30px',
                                                                                                    background: 'white',
                                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                                                    borderRadius: '8px',
                                                                                                    zIndex: 99999,
                                                                                                    overflow: 'hidden',
                                                                                                    minWidth: '130px'
                                                                                                }}
                                                                                            >
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setActiveMenu(null);
                                                                                                        navigate('/Job-portal/Employer/EditJob', { state: job });
                                                                                                    }}
                                                                                                    style={{ display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                                                                                                >
                                                                                                    Edit Status
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleEditJob(job)}
                                                                                                    disabled={job.approval_status === 'approved' && !allowEditAfterApproval}
                                                                                                    title={job.approval_status === 'approved' && !allowEditAfterApproval ? 'Editing approved jobs is disabled' : undefined}
                                                                                                    style={{
                                                                                                        display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', fontSize: '14px',
                                                                                                        cursor: (job.approval_status === 'approved' && !allowEditAfterApproval) ? 'not-allowed' : 'pointer',
                                                                                                        color: (job.approval_status === 'approved' && !allowEditAfterApproval) ? '#a0aab5' : 'inherit'
                                                                                                    }}
                                                                                                >
                                                                                                    Edit Job
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteClick(job.id)}
                                                                                                    className="delete-opt"
                                                                                                    style={{ display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#d9534f', fontWeight: '600' }}
                                                                                                >
                                                                                                    Delete
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>
                                                                No Jobs posted by you
                                                            </h2>
                                                        )}
                                                        {PostedJob.length > 0 && (
                                                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                                                <button className="view-more-link" onClick={() => setActiveTab('My job post')}>
                                                                    View more...
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </>

                                )}
                            </div>

                        </>
                    )}

                    {activetab === 'Post a Job' && verificationStatus.isVerified && (
                        <PostJobForm
                            onCancel={() => { setEditJobData(null); setActiveTab('Dashboard'); }}
                            showHomeIcon={location.state?.fromFooter}
                            editJobData={editJobData}
                        />
                    )}

                    {activetab === 'My job post' && verificationStatus.isVerified && (
                        <PostedJobs onViewApplicants={(job) => { setSelectedJob(job); setActiveTab('ViewApplicants'); }} onEditJob={handleEditJob} allowEditAfterApproval={allowEditAfterApproval} />
                    )}

                    {activetab === 'ViewApplicants' &&
                        verificationStatus.isVerified &&
                        selectedJob && (
                            <ViewApplicants
                                job={selectedJob}
                                onBack={() => setActiveTab('My job post')}
                                targetApplicationId={pendingTargetApplicationId}
                            />
                        )}
                    {activetab === 'Find Talent' && verificationStatus.isVerified && (
                        <FindTalent showHomeIcon={location.state?.fromFooter} />
                    )}

                    {activetab === 'Analytics' && verificationStatus.isVerified && (
                        <AnalyticsPage />
                    )}

                    {activetab === 'Billing' && verificationStatus.isVerified && (
                        <PlansBilling />
                    )}

                    {activetab === 'My Profile' && (
                        <AboutYourCompany hideNavigation={true} setActiveTab={setActiveTab} />
                    )}
                    {activetab === 'AccountManager' && <AddManagerSupport targetManagerId={pendingTargetManagerId} />}
                    {activetab === 'MyTickets' && (
                        <RaisedTickets role="employer" onBack={() => setActiveTab('Dashboard')} targetTicketId={pendingTargetTicketId} />
                    )}
                </div>
            </div>
            <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
            <Footer />
        </>
    );
};