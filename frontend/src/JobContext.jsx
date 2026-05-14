import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from "./api/axios";

const JobContext = createContext();

export const JobProvider = ({ children }) => {

    // ================= STATE =================
    const [jobs, setJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState([]);
    const [notificationsData, setNotificationsData] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    // Jobseeker
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserId = currentUser?.id || localStorage.getItem("user_id") || null;

    // Employer
    const [currentEmployer, setCurrentEmployer] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [employerNotifications, setEmployerNotifications] = useState([]);

    // All jobseekers for employer
    const [Alluser, setAlluser] = useState([]);

    // UI States
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [employeractiveMenuId, setEmployerActiveMenuId] = useState(null);
    const [employershowNotification, setEmployerShowNotification] = useState(false);
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [activeSidebarUsers, setActiveSidebarUsers] = useState([]);
    const [onlineStatus, setOnlineStatus] = useState("yes");

    // ================= HELPER FUNCTIONS =================
    const getFormattedDate = () => {
        return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    const formatSavedJobs = (data) => {
        return data.map(item => ({
            ...item.job,
            savedDate: `Saved on ${new Date(item.saved_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}`
        }));
    };

    const formatAppliedJobs = (jobs) => {
        return jobs.map(job => ({
            ...job,
            appliedDate:
                job.appliedDate ||
                (job.applied_date
                    ? `Applied on ${new Date(job.applied_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}`
                    : "")
        }));
    };

    // ================= NOTIFICATIONS =================
    const addNotification = (text) => {
        const newNotif = {
            id: Date.now(),
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };
        setNotificationsData(prev => [newNotif, ...prev]);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get("/notifications/");
            const transformedData = res.data.map(notification => ({
                id: notification.id,
                text: notification.message,
                isRead: notification.is_read,
                time: new Date(notification.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                targetId: notification.user
            }));

            const userType = localStorage.getItem("user_type");

            if (userType === "jobseeker") {
                setNotificationsData(transformedData);
            } else if (userType === "employer") {
                setEmployerNotifications(transformedData);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, []);

    // ================= FETCH JOB DATA =================
    const fetchAllJobs = useCallback(async () => {
        try {
            const [jobsRes, savedRes, appliedRes] = await Promise.all([
                api.get("/jobs/all/"),
                api.get("/jobs/saved/"),
                api.get("/jobs/applied/")
            ]);

            setJobs(jobsRes.data.jobs || []);
            setSavedJobs(formatSavedJobs(savedRes.data));
            setAppliedJobs(formatAppliedJobs(appliedRes.data));

        } catch (err) {
            console.error("Jobs fetch error:", err);
            if (err.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        }
        finally {
            setLoading(false);
        }
    }, []);

    const fetchEmployerJobs = useCallback(async () => {
        try {
            const res = await api.get("/jobs/my-jobs/");
            return res.data.jobs || [];   // FIX
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    // ================= JOB ACTIONS =================
    const isJobSaved = (jobId) => {
        return savedJobs.some(item => item.id === jobId);
    };

    const isJobApplied = (jobId) => {
        return appliedJobs.some(item => {
            const id = item.job ? item.job.id : item.id;
            const status = item.status?.toLowerCase?.() || "";
            return Number(id) === Number(jobId) && status !== "withdrawn";
        });
    };

    const saveJob = async (jobId) => {
        try {
            await api.post("/jobs/save/", { job_id: jobId });
            await fetchAllJobs();
            addNotification("Job saved successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const unsaveJob = async (jobId) => {
        try {
            await api.delete(`/jobs/save/${jobId}/`);
            await fetchAllJobs();
            addNotification("Job removed from saved list!");
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSaveJob = async (originalJob) => {
        if (isJobSaved(originalJob.id)) {
            await unsaveJob(originalJob.id);
        } else {
            await saveJob(originalJob.id);
        }
    };

    const applyForJob = async (jobId, formData) => {
        try {
            await api.post("/jobs/apply/", {
                job: jobId,
                ...formData
            });
            await fetchAllJobs();
            addNotification("Application submitted successfully!");
            return true;
        } catch (err) {
            if (err.response?.status === 409) return "already";
            console.error(err);
            throw err;
        }
    };

    // ================= EMPLOYER JOB ACTIONS =================
    const postJob = async (jobData) => {
        try {
            console.log('📤 Sending job data to PostAJob endpoint:', JSON.stringify(jobData, null, 2));

            const token = localStorage.getItem('access');
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await api.post('/jobs/preview/', jobData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ Job created as draft:', response.data);

            if (response.data.id) {
                try {
                    // const publishResponse = await api.patch(`/jobs/publish/${response.data.id}/`, {}, {
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`
                    //     }
                    // });

                    const publishResponse = await api.patch(`/jobs/publish/${response.data.id}/`,
                        { is_highlighted: jobData.is_highlighted ?? false },
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );



                    console.log('✅ Job published:', publishResponse.data);
                } catch (publishError) {
                    console.warn('Job created but publishing failed:', publishError);
                }
            }

            await fetchAllJobs();
            addNotification(`Job "${response.data.job_title}" posted successfully!`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("❌ Error posting job:", error);
            addNotification("Failed to post job", "error");
            return { success: false, error: error.message };
        }
    };

    const editJob = async (jobId, data) => {
        try {
            const response = await api.patch(`/jobs/update/${jobId}/`, data);
            await fetchAllJobs();
            addNotification("Job updated successfully!");
            return {
                success: true,
                data: response.data
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteJob = async (jobId) => {
        try {
            await api.delete(`/jobs/delete/${jobId}/`);
            await fetchAllJobs();
            addNotification("Job deleted successfully!");
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // ================= CHAT FUNCTIONS =================
    const fetchChats = useCallback(async () => {
        try {
            const token = localStorage.getItem('access');
            const userType = localStorage.getItem('user_type');
            const currentUserId = parseInt(localStorage.getItem('user_id'), 10);

            console.log("Fetching chats for:", { userType, currentUserId });

            const response = await api.get("chat/conversations/");
            console.log('Chats API response:', response.data);

            const chatsWithMessages = response.data.map(chat => ({
                ...chat,
                messages: chat.messages || []
            }));

            console.log("All conversations stored:", chatsWithMessages.length);
            setChats(chatsWithMessages);
            return chatsWithMessages;
        } catch (err) {
            console.error("Error fetching chats:", err);
            throw err;
        }
    }, []);

    const startConversation = useCallback(async (userId, message) => {
        try {
            console.log("startConversation called with:", { userId, message });

            const jobseekerId = parseInt(userId, 10);
            console.log("Sending jobseeker_id:", jobseekerId);

            const res = await api.post("/chat/employer/initiate/", {
                jobseeker_id: jobseekerId,
                message: message
            });

            console.log("API Response:", res.data);

            addChatToSidebar(userId);
            await fetchChats();
            addNotification("Conversation started successfully");

            return res.data.conversation_id;
        } catch (err) {
            console.error("Error response:", err.response?.data);
            throw err;
        }
    }, [fetchChats]);

    const fetchMessages = async (conversationId) => {
        try {
            console.log("Fetching messages for conversation:", conversationId);
            const res = await api.get(`chat/conversations/${conversationId}/messages/`);
            console.log("Messages response:", res.data);

            setChats(prev => prev.map(chat =>
                chat.id === conversationId
                    ? { ...chat, messages: res.data }
                    : chat
            ));

            return res.data;
        } catch (err) {
            console.error("Error fetching messages:", err);
            throw err;
        }
    };

    const sendMessage = async (conversationId, content) => {
        try {
            const userId = parseInt(localStorage.getItem('user_id'), 10);

            if (!conversationId) {
                throw new Error("Conversation ID missing");
            }

            const conversation = chats.find(c => c.id === conversationId);
            let receiverId = null;

            if (conversation) {
                const receiver = conversation.participants?.find(p => p.id !== userId);
                receiverId = receiver?.id;
            }

            if (!receiverId) {
                console.warn("Conversation not in state, using fallback API call");
                const res = await api.post("chat/messages/send/", {
                    conversation_id: conversationId,
                    content: content
                });
                return { success: true, data: res.data };
            }

            const response = await api.post("chat/messages/send/", {
                receiver_id: receiverId,
                content: content
            });

            setChats(prev => prev.map(chat =>
                chat.id === conversationId
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), response.data],
                        last_message: response.data
                    }
                    : chat
            ));

            return { success: true, data: response.data };
        } catch (err) {
            console.error("Error sending message:", err.response?.data || err);
            return { success: false, error: err.response?.data };
        }
    };

    const addChatToSidebar = (userId) => {
        if (!activeSidebarUsers.includes(parseInt(userId))) {
            setActiveSidebarUsers(prev => [...prev, parseInt(userId)]);
        }
    };

    // ================= EMPLOYER DATA FETCH =================
    const fetchEmployerData = useCallback(async () => {
        try {
            console.log("📡 Fetching employer data...");
            const employerRes = await api.get("profile/employer/");
            const employerData = employerRes.data;

            let companyData = null;
            try {
                const companyRes = await api.get("company/profile/");
                companyData = companyRes.data;
                console.log("✅ Company profile loaded");
            } catch (err) {
                console.log("No company profile found:", err.response?.status);
            }

            const employerJobs = await fetchEmployerJobs();
            console.log(`📋 Loaded ${employerJobs.length} jobs`);

            let allJobseekers = [];
            try {
                const jobseekersRes = await api.get("/jobseekers/");
                const allData = jobseekersRes.data;
                const jobseekersOnly = allData.filter(item => item.user?.user_type === "jobseeker");
                setAlluser(jobseekersOnly);
            } catch (err) {
                console.error("Error fetching jobseekers:", err);
                setAlluser([]);
            }

            const employer = {
                id: employerData.user?.id,
                companyId: companyData?.id || "",
                company: companyData?.company_name || "",
                hrName: employerData.full_name || employerData.user?.username || "Employer",
                email: employerData.user?.email || "",
                role: employerData.user?.user_type || "",
                companyLogo: companyData?.company_logo || "",
                companyOverview: companyData?.about || "",
                jobPosted: employerJobs || [],
                messages: [],
            };

            setCurrentEmployer(employer);
            setCompanyProfile(companyData);

            console.log("✅ Employer data set:", employer.hrName);
            return employer;
        } catch (err) {
            console.error("Employer fetch error:", err);
            throw err;
        }
    }, [fetchEmployerJobs]);

    // ================= REFRESH EMPLOYER DATA (ONLY FOR EMPLOYER) =================
    const refreshEmployerData = useCallback(async () => {
        const userType = localStorage.getItem("user_type");

        // Only refresh if user is employer
        if (userType !== "employer") {
            console.log("Not employer, skipping refresh");
            return;
        }

        try {
            console.log("🔄 Refreshing employer data only...");
            await fetchEmployerData();
            await fetchAllJobs();
            await fetchNotifications();
            await fetchChats();
            console.log("✅ Employer data refreshed successfully");
        } catch (err) {
            console.error("Refresh error:", err);
        }
    }, [fetchEmployerData, fetchAllJobs, fetchNotifications, fetchChats]);

    // ================= JOB STATS =================
    const getJobStats = (jobId) => {
        const jobExists = currentEmployer?.jobPosted?.some(j => j.id === jobId);
        if (!jobExists) return { total: 0, new: 0, screening: 0, interview: 0, rejected: 0 };

        const jobApplicants = Alluser.filter(user =>
            user.appliedJobs?.some(aj => aj.id === jobId)
        );

        const getCountByStatus = (statusList) => {
            return jobApplicants.filter(user => {
                const jobInfo = user.appliedJobs.find(aj => aj.id === jobId);
                return statusList.includes(jobInfo?.status);
            }).length;
        };

        return {
            total: jobApplicants.length,
            new: getCountByStatus(["applied"]),
            screening: getCountByStatus(["resume_screening", "recruiter_review"]),
            interview: getCountByStatus(["shortlisted", "interview_called"]),
            rejected: getCountByStatus(["rejected"])
        };
    };

    // ================= INITIAL LOAD (Without breaking jobseeker) =================
    useEffect(() => {
        const token = localStorage.getItem("access");
        const userType = localStorage.getItem("user_type");

        if (!token) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                console.log("🚀 Initial data load starting...");
                setLoading(true);

                await fetchAllJobs();
                await fetchChats();
                await fetchNotifications();

                if (userType === "jobseeker") {
                    const res = await api.get("profile/jobseeker/");
                    setCurrentUser(res.data);
                    console.log("✅ Jobseeker data loaded");
                }

                if (userType === "employer") {
                    await fetchEmployerData();
                    console.log("✅ Employer data loaded");
                }

                console.log("✅ Initial data load complete");
            } catch (err) {
                console.error("Initial load error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []); // Empty dependency array - runs only once on mount

    // ================= PROVIDER =================
    return (
        <JobContext.Provider value={{
            // Jobs
            jobs, setJobs,
            appliedJobs, setAppliedJobs,
            savedJobs, setSavedJobs,
            loading, setLoading,

            // Jobseeker
            currentUser, setCurrentUser,
            currentUserId,
            isJobSaved,
            isJobApplied,
            saveJob,
            unsaveJob,
            toggleSaveJob,
            applyForJob,

            // Employer
            currentEmployer, setCurrentEmployer,
            companyProfile, setCompanyProfile,
            employerNotifications, setEmployerNotifications,
            fetchEmployerJobs,
            postJob,
            editJob,
            deleteJob,
            getJobStats,
            refreshEmployerData,  // ← Added only for employer

            // All users
            Alluser, setAlluser,

            // UI States
            activeMenuId, setActiveMenuId,
            employeractiveMenuId, setEmployerActiveMenuId,
            employershowNotification, setEmployerShowNotification,
            isChatEnded, setIsChatEnded,
            activeSidebarUsers, setActiveSidebarUsers,
            onlineStatus, setOnlineStatus,
            addChatToSidebar,

            // Chat
            chats, setChats,
            fetchChats,
            startConversation,
            fetchMessages,
            sendMessage,

            // Notifications
            notificationsData, setNotificationsData,
            showNotification, setShowNotification,
            addNotification,
            fetchNotifications,

            // Utils
            fetchAllJobs,
            getFormattedDate
        }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => useContext(JobContext);