import React, { useState } from 'react'
import './EmployerDashboard.css'
import DashboardIC from '../assets/Employer/DashboardIC.png'
import PostJobs from '../assets/Employer/PostJob.png'
import Mypost from '../assets/Employer/JOBPOST.png'
import Applicant from '../assets/Employer/Group.png'
import Billing from '../assets/Employer/Billing.png'
import Logout from '../assets/Employer/Elogout.png'
import Profile from '../assets/Employer/Esettings.png'
import { EHeader } from './EHeader'
import { Footer } from '../Components-LandingPage/Footer'
import Shortlist from '../assets/Employer/EShortlist.png'
import InterviewS from '../assets/Employer/EInterviewS.png'
import ActiveJobs from '../assets/Employer/EActiveJobs.png'
import TotalAPP from '../assets/Employer/ETotalAPP.png'
import Close from '../assets/Employer/close.png'
import jobpost from '../assets/Employer/JOBPOST.png'

export const EmployerDashboard = () => {

    const [activetab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const ToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <>
            <EHeader />
            <div className='container1'>
                {isSidebarOpen ? (
                    <div className='EAside'>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", alignItems: "center", marginTop: "35px", marginBottom: "35px" }}>
                                <h3 style={{ color: "snow", margin: "25px", fontWeight: "900" }} >Yamuna</h3>
                                <img src={Close} width={10} itemType='icon' style={{ backgroundColor: "white", padding: '5px', color: "snow", margin: "25px", borderRadius: "30px" }} onClick={() => ToggleSidebar()} />
                            </div>
                            <h3 className='Aside-Title'>Overview</h3>
                            <div className='ENavbar' >
                                <div onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active" : 'Navbox'} >
                                    <img src={DashboardIC} height={15} width={15} alt="Dashboard" />
                                    <div className='Enav-item'>Dashboard</div>
                                </div>
                                <div onClick={() => setActiveTab('Post a Job')} className={activetab === 'Post a Job' ? "Active" : 'Navbox'} >
                                    <img src={PostJobs} height={15} width={15} alt="Post a Job" />
                                    <div className='Enav-item'>Post a Job</div>
                                </div>
                                <div onClick={() => setActiveTab('My job post')} className={activetab === 'My job post' ? "Active" : 'Navbox'} >
                                    <img src={Mypost} height={15} width={15} alt="My Job Post" />
                                    <div className='Enav-item'>My Job Post</div>
                                </div>
                                <div onClick={() => setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active" : 'Navbox'} >
                                    <img src={Applicant} height={15} width={15} alt="Analytics" />
                                    <div className='Enav-item'>Analytics</div>
                                </div>
                                <div onClick={() => setActiveTab('Billing')} className={activetab === 'Billing' ? "Active" : 'Navbox'} >
                                    <img src={Billing} height={15} width={15} alt="Billing" />
                                    <div className='Enav-item'>Billing</div>
                                </div>
                            </div>
                            <h3 className='Aside-Title'>Settings</h3>
                            <div className='ENavbar'>
                                <div onClick={() => setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active" : 'Navbox'} >
                                    <img src={Profile} height={15} width={15} alt="My Profile" />
                                    <div className='Enav-item'>My Profile</div>
                                </div>
                                <div onClick={() => setActiveTab('Logout')} className={activetab === 'Logout' ? "Active" : 'Navbox'} >
                                    <img src={Logout} height={15} width={15} alt="Logout" />
                                    <div className='Enav-item'>Logout</div>
                                </div>
                            </div>

                        </div>
                    </div>)
                    : (
                        <div className='EAside2'>
                            <div>
                                <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", alignItems: "center", textAlign: "center", marginTop: "15px", padding: "5px" }}>
                                    <div className='EE-Name'><h3 style={{ margin: "15px", fontSize: "22px" }} >Y</h3></div>
                                    <img src={jobpost} width={30} itemType='icon' style={{ padding: '5px', color: "snow", }} onClick={() => ToggleSidebar()} />
                                </div>
                                {/* <h3 className='Aside-Title'>Overview</h3> */}
                                <div className='ENavbar1' style={{ display: "flex", flexDirection: "column", alignItems: "center", }} >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Active1" : 'Navbox1'} >
                                        <img src={DashboardIC} height={20} width={20} alt="Dashboard" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('Post a Job')} className={activetab === 'Post a Job' ? "Active1" : 'Navbox1'} >
                                        <img src={PostJobs} height={20} width={20} alt="Post a Job" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('My job post')} className={activetab === 'My job post' ? "Active1" : 'Navbox1'} >
                                        <img src={Mypost} height={20} width={20} alt="My Job Post" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('Analytics')} className={activetab === 'Analytics' ? "Active1" : 'Navbox1'} >
                                        <img src={Applicant} height={20} width={20} alt="Analytics" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('Billing')} className={activetab === 'Billing' ? "Active1" : 'Navbox1'} >
                                        <img src={Billing} height={20} width={20} alt="Billing" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('My Profile')} className={activetab === 'My Profile' ? "Active1" : 'Navbox1'} >
                                        <img src={Profile} height={20} width={20} alt="My Profile" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setActiveTab('Logout')} className={activetab === 'Logout' ? "Active1" : 'Navbox1'} >
                                        <img src={Logout} height={20} width={20} alt="Logout" />
                                    </div>
                                </div>
                                {/* <h3 className='Aside-Title'>Settings</h3> */}
                                <div className='ENavbar'>

                                </div>

                                {/* <div className='Navbar' >
                
                <div onClick={()=>setActiveTab('Post a Job')} className={activetab ==='Post a Job' ? "Active" :'Navbox'} >
                <img src={PostJobs} height={15} width={15} alt="Post a Job" />
                <div className='Enav-item'>Post a Job</div>
                </div>
                <div onClick={()=>setActiveTab('My Job Post')} className={activetab ==='My Job Post' ? "Active" :'Navbox'} style={{display:"flex", alignItems:"center",fontFamily:"inter"}}>
                <img src={Mypost} height={15} width={15} alt="My Job Post" />
                <div className='Enav-item'>My Job Post</div>
                </div>
                <div onClick={()=>setActiveTab('Applicants')} className={activetab ==='Applicants' ? "Active" :'Navbox'} style={{display:"flex", alignItems:"center",fontFamily:"inter"}}>
                <img src={Applicant} height={15} width={15} alt="Applicants" />
                <div className='Enav-item'>Applicants</div>
                </div>
                <div onClick={()=>setActiveTab('Interviews')} className={activetab ==='Interviews' ? "Active" :'Navbox'} style={{display:"flex", alignItems:"center",fontFamily:"inter"}}>
                <img src={Interview} height={18} width={18} alt="Interviews" />
                <div className='Enav-item'>Interviews</div>
                </div>
            </div> */}

                            </div>
                        </div>
                    )}

                <div className={isSidebarOpen ? 'Emainsec' : 'Emainsec2'}>
                    {activetab === 'Dashboard' && (
                        <>
                            <div className='Welcome-Note'>
                                <div>
                                    <h2>Hi Yamuna,</h2>
                                    <p style={{ fontWeight: "600" }}>Here's, What's Going on... </p>
                                </div>
                                <button className='post-job-btn'>+ Post a Job</button>
                            </div>
                            <div className='E-DashB-Over-View'>
                                <h2 style={{ marginLeft: "40px" }}>OverView</h2>
                                <div className='EDashB-Application-Counts'>
                                    <div className='E-DashB-No-Counts'>
                                        <div><img src={ActiveJobs} width={40} alt="" /></div>
                                        <div >
                                            <p>0</p>
                                            <p className='E-job-status'>Active Jobs</p>
                                        </div>
                                    </div>
                                    <div className='E-DashB-No-Counts'>
                                        <div><img src={TotalAPP} width={40} alt="" /></div>
                                        <div >
                                            <p>0</p>
                                            <p className='E-job-status'>Total Applicants</p>
                                        </div>
                                    </div>
                                    <div className='E-DashB-No-Counts'>
                                        <div><img src={Shortlist} width={40} alt="" /></div>
                                        <div >
                                            <p>0</p>
                                            <p className='E-job-status'>ShortListed</p>
                                        </div>
                                    </div>
                                    <div className='E-DashB-No-Counts'>
                                        <div><img src={InterviewS} width={40} alt="" /></div>
                                        <div >
                                            <p>0</p>
                                            <p className='E-job-status'>Interview Schedules</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='ERecent-Post-Cont'>
                                <h3 style={{ marginLeft: "40px" }}>Recently Posted Jobs</h3>
                                <div className='ERecent-Post-Jobs'>
                                    <button className='post-job-btn'>+ Post a Job</button>
                                </div>
                            </div>
                            <div></div>
                        </>
                    )}

                    {activetab === 'Notifications' && (
                        <h1>Notifications Section</h1>)}
                    {activetab === 'Chats' && (
                        <h1>Chats</h1>)}
                    {activetab === 'Post a Job' && (
                        <h1>Post Job</h1>)}
                    {activetab === 'My job post' && (
                        <h1>Your Post</h1>)}
                    {activetab === 'Analytics' && (
                        <h1>Applicants Section</h1>)}
                    {activetab === 'Billing' && (
                        <h1>Interview Section</h1>)}
                    {activetab === 'My Profile' && (
                        <h1>My Profile Section</h1>)}
                    {activetab === 'Logout' && (
                        <h1>Logout Section</h1>)}

                </div>

            </div>
            <Footer />
        </>
    );
};

