import React, { createContext, useState, useContext, useEffect } from 'react';
import { JobList } from './JobList';
import api from "./api/axios";

const JobContext = createContext();

export const JobProvider = ({ children }) => {
    // Total JobList
    const [jobs, setJobs] = useState([]);

    // States to Toggle online status in chats
    const [onlineStatus, setOnlineStatus] = useState("yes");

    // Jobs to show when Applied
    const [appliedJobs, setAppliedJobs] = useState([]);

    // Jobs to show when Saved
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Load everything from backend
    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem("access");
            if (!token) {
                setLoading(false);
                return; // 🚫 Don't call backend without token
            }
            try {
                const jobsRes = await api.get("/jobs/");
                const savedRes = await api.get("/jobs/saved/");
                const appliedRes = await api.get("/jobs/applied/");

                setJobs(jobsRes.data);
                setSavedJobs(savedRes.data);     // backend saved objects
                setAppliedJobs(appliedRes.data); // backend applied objects
            } catch (err) {
                console.error("Error loading jobs data", err);

                // 401 error వస్తే - redirect to login
                if (err.response?.status === 401) {
                    localStorage.clear();
                    window.location.href = "/login";
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);


    // Using Id to Toggle Menu in Notification Window
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Chats/messages between Employer and Jobseeker 1:1;
    const [chats, setChats] = useState([
        {
            id: 1,
            name: "Employer",
            role: "employer",
            messages: []
        },
        {
            id: 2,
            name: "jobseeker",
            role: "jobseeker",
            messages: []
        }
    ]);

    // Toggle End Conversation Logic In Employer Chat Window
    const [isChatEnded, setIsChatEnded] = useState(false);

    // NotificationData previously passed from AfterLoginLanding page
    // const [notificationsData, setNotificationsData] = useState([{
    //     id: Date.now(),
    //     text: "Welcome to Job Portal",
    //     time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    //     isRead: false,
    // }]);

    // // New Messages Notification Logic
    // const [showNotification, setShowNotification] = useState(false);

    // // to add NewNotification in NotificationData 
    // const addNotification = (text) => {
    //     const newNotif = {
    //         id: Date.now(),
    //         text: text,
    //         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    //         isRead: false
    //     };
    //     setNotificationsData(prev => [newNotif, ...prev]);
    // };


    // const getFormattedDate = () => {
    //     return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    // };

    // 🔹 Check if job saved
    const isJobSaved = (jobId) => {
        return savedJobs.some(item =>
            item.job ? item.job.id === jobId : item.id === jobId
        );
    };

    // 🔹 Check if job applied
    const isJobApplied = (jobId) => {
        const activeApplication = appliedJobs.find(item =>
            (
                item.job
                    ? Number(item.job.id) === Number(jobId)
                    : Number(item.id) === Number(jobId)
            ) &&
            item.status?.toLowerCase() !== "withdrawn"
        );

        return !!activeApplication;
    };

    // 🔹 Save job (Backend integrated)
    const saveJob = async (jobId) => {
        try {
            await api.post("/jobs/save/", { job_id: jobId });

            const savedRes = await api.get("/jobs/saved/");
            setSavedJobs(savedRes.data);

            return true;
        } catch (err) {
            // if (err.response?.status === 400) {
            //     return "already";
            // }
            throw err;
        }
    };

    // 🔹 Apply job (Backend integrated)
    const applyForJob = async (jobId, formData) => {
        try {
            await api.post("/jobs/apply/", formData);

            const appliedRes = await api.get("/jobs/applied/");
            setAppliedJobs(appliedRes.data);

            return true;
        } catch (err) {
            if (err.response?.status === 409) {
                return "already";
            }
            throw err;
        }
    };

    // const applyForJob = (originalJob) => {
    //     const newAppliedJob = {
    //         ...originalJob,
    //         appliedDate: `Applied on ${getFormattedDate()}`,
    //         status: { text: 'Hiring in Progress', type: 'progress' },
    //         // other 2 options for Status:
    //         // status= {text: 'Reviewing Application', type: 'reviewing'},
    //         // status= {text: 'Hiring Done', type: 'done'},
    //         applicationStatus: [
    //             { label: 'Application Submitted', sub: "Your profile, resume, and cover letter have successfully entered the company's database, and an acknowledgment has been sent.", status: 'completed' },
    //             { label: 'Resume Screening', sub: "Your resume is currently being reviewed...", status: 'pending' },
    //             { label: 'Recruiter Review', sub: "A hiring manager manually reviews your specific experience...", status: 'pending' },
    //             { label: 'Shortlisted', sub: "You have passed the initial review stages...", status: 'pending' },
    //             { label: 'Interview Called', sub: "The hiring team has officially reached out...", status: 'pending' },
    //         ]
    //     };
    //     setAppliedJobs((prev) => [...prev, newAppliedJob]);
    //     setJobs((prev) => prev.filter((j) => j.id !== originalJob.id));
    //     setSavedJobs((prev) => prev.filter((j) => j.id !== originalJob.id));
    //     alert(`Successfully applied to ${originalJob.title} at ${originalJob.company}!`);
    // };

    // const toggleSaveJob = (originalJob) => {
    //     if (isJobSaved(originalJob.id)) {
    //         setSavedJobs((prev) => prev.filter((j) => j.id !== originalJob.id));
    //     } else {
    //         const newSavedJob = {
    //             ...originalJob,
    //             savedDate: `Saved on ${getFormattedDate()}`
    //         };
    //         setSavedJobs((prev) => [...prev, newSavedJob]);
    //     }
    // };

    return (
        <JobContext.Provider value={{
            jobs,
            appliedJobs,
            setAppliedJobs,
            savedJobs,
            loading,
            chats,
            setChats,
            setJobs,
            onlineStatus,
            setOnlineStatus,
            isJobSaved,
            isJobApplied,
            saveJob,
            applyForJob,
            isChatEnded,
            setIsChatEnded,
            // setNotificationsData,
            //addNotification,
            //notificationsData,
            //showNotification,
            //setShowNotification,
            activeMenuId,
            setActiveMenuId
        }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => useContext(JobContext);

