import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import "./AdminDashboard.css"
import Dashboard from '../assets/Employer/DashboardIC.png'
import DashboardInact from '../assets/Employer/Dashboard_Inactive.png'
import UserManagements from '../assets/AdminAssets/UserManage.png'
import UserManagementACT from '../assets/AdminAssets/UserManageActive.png'
import RoleManagementIC from '../assets/AdminAssets/RoleManage.png'
import RoleManagementICACT from '../assets/AdminAssets/RoleManageAct.png'
import JobMonitor from '../assets/AdminAssets/JobMon.png'
import JobMonitorACT from '../assets/AdminAssets/JobMonActive.png'
import Report from '../assets/AdminAssets/AdminReport.png'
import ReportAct from '../assets/AdminAssets/ReportsActive.png'
import ActivityMon from '../assets/AdminAssets/ActivityMon.png'
import ActivityMonAct from '../assets/AdminAssets/ActivityMonAct.png'
import Tickets from '../assets/AdminAssets/Tickets.png'
import TicketsACT from '../assets/AdminAssets/TicketsActive.png'
import Settings from '../assets/AdminAssets/Settings.png'
import SettingsAct from '../assets/AdminAssets/SettingsActive.png'
import Memberships from '../assets/AdminAssets/Membership.png'
import MembershipsAct from '../assets/AdminAssets/MembershipActive.png'
import { EHeader } from '../Components-Employer/EHeader'
import TotalJobs from '../assets/AdminAssets/TotalJobs.png'
import TotalEmployers from '../assets/AdminAssets/TotalEmployers.png'
import TotalJobseekers from '../assets/AdminAssets/TotalJobseeker.png'
import TotalCompanies from '../assets/AdminAssets/TotalCompanies.png'
import ViewMore from '../assets/AdminAssets/ViewMore.png'
import { TotalOverview } from './TotalOverview'
import { AdminExperience } from './AdminExperience'
import { useJobs } from '../JobContext'
import { UserManagement } from './UserManagement'
import { ActivityMonitor } from './ActivityMonitor'
import { AdminReports } from './AdminReports'
import { JobMonitoring } from './JobMonitoring'
import { Membership } from './Membership'
import api from '../api/axios'

export const AdminDashboard = () => {
    const { jobs, Alluser, currentEmployer } = useJobs();
    const [activetab, setActiveTab] = useState('Dashboard');
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [totalEmployers, setTotalEmployers] = useState(0);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate()

    const [totalStats, setTotalStats] = useState({
        total_jobs: 0,
        total_companies: 0,
        total_employers: 0,
        total_jobseekers: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    const [jobAds, setJobAds] = useState([]);
    const [jobAdsLoading, setJobAdsLoading] = useState(true);
    const [jobAdsError, setJobAdsError] = useState(null);

    const [experienceData, setExperienceData] = useState(null);
    const [totalOverviewData, setTotalOverviewData] = useState(null);
    const [overviewError, setOverviewError] = useState(null);

useEffect(() => {
    const checkAuthorization = async () => {
        try {
            const token = localStorage.getItem('token');
            const accessToken = localStorage.getItem('access_token');
            const userData = localStorage.getItem('user');
            const userType = localStorage.getItem('user_type');
            
            const authToken = token || accessToken;
            
            console.log("Checking authorization...");
            console.log("Token exists:", !!authToken);
            console.log("User type from storage:", userType);
            
            if (!authToken) {
                setIsAuthorized(false);
                setAuthError("No authentication token found. Please login.");
                setLoading(false);
                return;
            }

            // Check if user is admin from stored data
            let isAdmin = false;
            
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    console.log("User data from storage:", parsedUser);
                    
                    // Check for admin status
                    if (parsedUser.user_type === 'admin' || 
                        parsedUser.role === 'admin' || 
                        parsedUser.is_admin === true ||
                        parsedUser.isAdmin === true) {
                        isAdmin = true;
                    }
                } catch (e) {
                    console.error("Error parsing user data:", e);
                }
            }
            
            // Also check user_type directly
            if (userType === 'admin') {
                isAdmin = true;
            }
            
            if (isAdmin) {
                setIsAuthorized(true);
                setLoading(false);
                return;
            }

            setIsAuthorized(false);
            setAuthError("You are not authorized to access the Admin Dashboard. Admin privileges required.");
            setLoading(false);
            
        } catch (error) {
            console.error("Authorization check failed:", error);
            setIsAuthorized(false);
            setAuthError("Unable to verify authorization. Please contact support.");
            setLoading(false);
        }
    };

    checkAuthorization();
}, []);

    useEffect(() => {
        const fetchOverview = async () => {
            if (!isAuthorized) return;
            
            setOverviewLoading(true);
            setOverviewError(null);
            try {
                const response = await api.get('admin/dashboard/overview/');
                setExperienceData(response.data.experience_levels);
                setTotalOverviewData(response.data.total_overview);
                console.log("dashboard overview:", response.data)
            } catch (error) {
                console.log("Failed to fetch overview data:", error);
                setOverviewError("Could not load overview data");
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setIsAuthorized(false);
                    setAuthError("Session expired. Please login again.");
                }
            } finally {
                setOverviewLoading(false);
            }
        };
        
        if (isAuthorized) {
            fetchOverview();
        }
    }, [isAuthorized]);

    useEffect(() => {
        const fetchJobAds = async () => {
            if (!isAuthorized) return;
            
            setJobAdsLoading(true);
            setJobAdsError(null);
            try {
                const response = await api.get('admin/jobs/ajoblist/');
                setJobAds(response.data);
                console.log("admin jobs", response.data)
            } catch (error) {
                console.error("Failed to fetch job ads:", error);
                setJobAdsError("Could not load job ads");
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setIsAuthorized(false);
                    setAuthError("Session expired. Please login again.");
                }
            } finally {
                setJobAdsLoading(false);
            }
        };
        
        if (isAuthorized) {
            fetchJobAds();
        }
    }, [isAuthorized]);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!isAuthorized) return;
            
            setLoading(true); 
            try {
                const res = await api.get('admin/dashboard/');
                setDashboardData(res.data);
                console.log("Dashboard data:", res.data)
                
                if (res.data) {
                    setTotalStats({
                        total_jobs: res.data.total_jobs || 0,
                        total_companies: res.data.total_companies || 0,
                        total_employers: res.data.total_employers || 0,
                        total_jobseekers: res.data.total_jobseekers || 0,
                    });
                    setTotalEmployers(res.data.total_employers || 0);
                    setTotalCompanies(res.data.total_companies || 0);
                }
            } catch (error) {
                console.error("Dashboard data error", error);
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setIsAuthorized(false);
                    setAuthError("Session expired. Please login again.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        if (isAuthorized) {
            fetchDashboard();
        }
    }, [isAuthorized]);

    if (loading || isAuthorized === null) {
        return (
            <>
                <EHeader />
                <div className='loading-container'>
                    <div className='loading-card'>
                        <div className='spinner'></div>
                        <p className='loading-text'>Verifying credentials...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!isAuthorized) {
        return (
            <>
                <EHeader />
                <div className='unauthorized-container'>
                    <div className='unauthorized-card unauthorized-card-premium'>
                        <div className='unauthorized-icon'>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 12V16" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h2 className='unauthorized-title'>Access Denied</h2>
                        <p className='unauthorized-message'>
                            {authError || "You are not authorized to access the Admin Dashboard. Admin privileges required."}
                        </p>
                        <div className='unauthorized-actions'>
                    
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('access_token');
                                    localStorage.removeItem('refresh');
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('userData');
                                    navigate('/Job-portal/Admin/login')
                                }} 
                                className='unauthorized-btn unauthorized-btn-primary'
                            >
                                Login Again
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <EHeader />
            <div className='AdminContainer'>
                <div className='Admin-Sidebar'>
                    <h2 style={{ textAlign: "center", marginTop: "35px" }}>Administrator</h2>
                    <div className='Admin-Sidebar-list'>
                        <div onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === 'Dashboard' ? <img src={Dashboard} width={15} height={15} alt="dashboard" />
                                    : <img src={DashboardInact} width={20} height={20} alt="dashboard" />}
                                <div className='Enav-item'>Dashboard</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab("Job Monitoring")} className={activetab === "Job Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Job Monitoring" ? <img src={JobMonitorACT} width={15} height={15} alt="dashboard" />
                                    : <img src={JobMonitor} width={15} height={15} alt="Job Monitoring" />}
                                <div className='Enav-item'>Job Monitoring</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Activity Monitoring')} className={activetab === "Activity Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Activity Monitoring" ? <img src={ActivityMonAct} width={15} height={15} alt="dashboard" />
                                    : <img src={ActivityMon} width={15} height={15} alt="Activity Monitoring" />}
                                <div className='Enav-item'>Activity Monitoring</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('User Management')} className={activetab === "User Management" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "User Management" ? <img src={UserManagementACT} width={15} height={15} alt="dashboard" />
                                    : <img src={UserManagements} width={15} height={15} alt="User Management" />}
                                <div className='Enav-item'>User Management</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Role Management')} className={activetab === "Role Management" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Role Management" ? <img src={RoleManagementICACT} width={15} height={15} alt="dashboard" />
                                    : <img src={RoleManagementIC} width={15} height={15} alt="Role Management" />}
                                <div className='Enav-item'>Role Management</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Membership')} className={activetab === "Membership" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Membership" ? <img src={MembershipsAct} width={15} height={15} alt="dashboard" />
                                    : <img src={Memberships} width={15} height={15} alt="Membership" />}
                                <div className='Enav-item'>Membership</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Tickets')} className={activetab === "Tickets" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Tickets" ? <img src={TicketsACT} width={15} height={15} alt="dashboard" />
                                    : <img src={Tickets} width={15} height={15} alt="Tickets" />}
                                <div className='Enav-item'>Tickets</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Reports')} className={activetab === "Reports" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Reports" ? <img src={ReportAct} width={15} height={15} alt="dashboard" />
                                    : <img src={Report} width={15} height={15} alt="Reports" />}
                                <div className='Enav-item'>Reports</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('settings')} className={activetab === "settings" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "settings" ? <img src={SettingsAct} width={15} height={15} alt="dashboard" />
                                    : <img src={Settings} width={15} height={15} alt="settings" />}
                                <div className='Enav-item'>settings</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='Admin-MainSec'>
                    {activetab === 'Dashboard' && (
                        <div>
                            <div className='Admin-Welcome-Container'>
                                <p className='Admin-Welcome-Note'>Welcome Back, Admin</p>
                                <p className='Admin-Welcome-para'>Your team's success start here. lets make progress together!</p>
                            </div>

                            <div className='Admin-Overview'>
                                <div className='Admin-Overview-Container'>
                                    <div className='Admin-Overview-Data'>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                                            <img src={TotalJobs} width={25} height={25} alt="Jobs" />
                                            <p style={{ fontSize: "24px", fontWeight: "700", color: "#484848" }}>
                                                {dashboardData?.total_jobs || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "bold", color: "#484848" }}>All Jobs</p>
                                        </div>
                                    </div>
                                    <div className='Admin-Viewmore'>
                                        <p style={{ fontSize: "14px", fontWeight: "500" }}>View more</p>
                                        <img src={ViewMore} width={30} height={30} alt="Viewmore" />
                                    </div>
                                </div>
                                <div className='Admin-Overview-Container'>
                                    <div className='Admin-Overview-Data'>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img src={TotalCompanies} width={25} height={25} alt="Jobs" />
                                            <p style={{ fontSize: "24px", fontWeight: "700", color: "#484848" }}>
                                                {dashboardData?.total_companies || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "bold", color: "#484848" }}>Total Companies</p>
                                        </div>
                                    </div>
                                    <div className='Admin-Viewmore'>
                                        <p style={{ fontSize: "14px", fontWeight: "500" }}>View more</p>
                                        <img src={ViewMore} width={30} height={30} alt="Viewmore" />
                                    </div>
                                </div>
                                <div className='Admin-Overview-Container'>
                                    <div className='Admin-Overview-Data'>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img src={TotalEmployers} width={25} height={25} alt="Jobs" />
                                            <p style={{ fontSize: "24px", fontWeight: "700", color: "#484848" }}>
                                                {dashboardData?.total_employers || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "bold", color: "#484848" }}>Total Employers</p>
                                        </div>
                                    </div>
                                    <div className='Admin-Viewmore'>
                                        <p style={{ fontSize: "14px", fontWeight: "500" }}>View more</p>
                                        <img src={ViewMore} width={30} height={30} alt="Viewmore" />
                                    </div>
                                </div>
                                <div className='Admin-Overview-Container'>
                                    <div className='Admin-Overview-Data'>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img src={TotalJobseekers} width={25} height={25} alt="Total Jobseekers" />
                                            <p style={{ fontSize: "24px", fontWeight: "700", color: "#484848" }}>
                                                {dashboardData?.total_jobseekers || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "bold", color: "#484848" }}>Total Jobseekers</p>
                                        </div>
                                    </div>
                                    <div className='Admin-Viewmore'>
                                        <p style={{ fontSize: "14px", fontWeight: "500" }}>View more</p>
                                        <img src={ViewMore} width={30} height={30} alt="Viewmore" />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <div className='Admin-Job-Ads-Cont'>
                                    <div className="Admin-jobads-header">
                                        <h2>Your Job Ads</h2>
                                        <div className="Admin-jobads-buttons">
                                            <button className="Admin-view-btn">VIEW ALL</button>
                                            <button className="Admin-create-btn">Create Job Ad +</button>
                                        </div>
                                    </div>
                                    <div className="Admin-job-card">
                                        <div className="Admin-job-left">
                                            <p className="Admin-job-title">Investment ESG Analyst</p>
                                            <span className="Admin-job-under">W1</span>
                                        </div>
                                        <div className="Admin-job-right">
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">185</p>
                                                <span>New</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">0</p>
                                                <span>Waiting</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">250</p>
                                                <span>Total</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Admin-job-card">
                                        <div className="Admin-job-left">
                                            <p className="Admin-job-title">Finance Analyst</p>
                                            <span className="Admin-job-under">W1</span>
                                        </div>
                                        <div className="Admin-job-right">
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">120</p>
                                                <span>New</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">20</p>
                                                <span>Waiting</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">180</p>
                                                <span>Total</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Admin-job-card">
                                        <div className="Admin-job-left">
                                            <p className="Admin-job-title">Marketing Specialist</p>
                                            <span className="Admin-job-under">W1</span>
                                        </div>
                                        <div className="Admin-job-right">
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">140</p>
                                                <span>New</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">15</p>
                                                <span>Waiting</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">210</p>
                                                <span>Total</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Admin-job-card">
                                        <div className="Admin-job-left">
                                            <p className="Admin-job-title">Software Engineer</p>
                                            <span className="Admin-job-under">W1</span>
                                        </div>
                                        <div className="Admin-job-right">
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">135</p>
                                                <span>New</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">25</p>
                                                <span>Waiting</span>
                                            </div>
                                            <div className="Ads-Count-Cont">
                                                <p className="Ads-Count">200</p>
                                                <span>Total</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <div className='Admin-Experience'><AdminExperience experienceData={experienceData} /></div>
                                <div className='Admin-overview-cont'><TotalOverview totalOverview={totalOverviewData} /></div>
                            </div>
                        </div>
                    )}
                    {activetab === 'Job Monitoring' && <JobMonitoring />}
                    {activetab === 'Activity Monitoring' && (<ActivityMonitor />)}
                    {activetab === 'User Management' && (<UserManagement />)}
                    {activetab === 'Role Management' && (<RoleManagement />)}
                    {activetab === 'Membership' && (<Membership />)}
                    {activetab === 'Tickets' && (<h3>Tickets</h3>)}
                    {activetab === 'Reports' && (<AdminReports />)}
                    {activetab === 'settings' && (<h3>settings</h3>)}
                </div>
            </div>
        </>
    )
}