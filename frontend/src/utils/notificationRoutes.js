import api from "../api/axios";
 
const DASHBOARD_PATH = "/Job-portal/Employer/Dashboard";
 
const EMPLOYER_ROUTES = {
   
    application_submitted: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "ViewApplicants", targetJobId: roid } }),
    job_submitted_for_review: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: roid } }),
    job_approved: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: roid } }),
    job_rejected: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: roid } }),
    job_pending_approval: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: roid } }),
    job_flagged: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: roid } }),
    job_deleted: () => null, // job no longer exists
    payment_method_added: () => ({ path: DASHBOARD_PATH, state: { targetTab: "Billing" } }),
    payment_method_removed: () => ({ path: DASHBOARD_PATH, state: { targetTab: "Billing" } }),
    subscription_cancelled: () => ({ path: DASHBOARD_PATH, state: { targetTab: "Billing" } }),
    account_manager_assigned: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "AccountManager" , targetManagerId: roid } }),
    weekly_report: () => ({ path: "/Job-portal/Employer/WeeklySummary" }),
    ticket_submitted: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "MyTickets", targetTicketId: roid } }),
    ticket_status_updated: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "MyTickets", targetTicketId: roid } }),
    // account_manager_removed: (roid) => ({ path: DASHBOARD_PATH, state: { targetTab: "AccountManager", targetManagerId: roid  } }), // no need it here, keep it for future update if needed
    // new_message: (roid) => ({ path: `/Job-portal/Employer/Chat`, state:{ userId : roid } }),
};
 
const JOBSEEKER_ROUTES = {
    ticket_submitted: (roid) => ({ path: "/Job-portal/jobseeker/mytickets", state: { targetTicketId: roid } }),
    jobseeker_signup: () => ({ path: "/Job-portal/jobseeker/myprofile" }),
    ticket_status_updated: (roid) => ({ path: "/Job-portal/jobseeker/mytickets", state: { targetTicketId: roid } }),
    complaint_submitted: (roid) => ({ path: "/Job-portal/jobseeker/mytickets", state: { targetReportId: roid } }),
    complaint_status_updated: (roid) => ({ path: "/Job-portal/jobseeker/mytickets", state: { targetReportId: roid } }),
    application_submitted: (roid) => ({path: `/Job-portal/jobseeker/appliedjobsoverview/${roid}`}),
    application_status_updated: (roid) => ({ path: `/Job-portal/jobseeker/appliedjobsoverview/${roid}` }),
    application_withdrawn: (roid) => ({ path: `/Job-portal/jobseeker/appliedjobsoverview/${roid}` }),
    job_saved: (roid) => ({ path: "/Job-portal/jobseeker/myjobs", state: { targetJobId: roid } }),
    new_message: (roid) => ({ path: `/Job-portal/jobseeker/chat/`
        ,state: { conversationId: roid }, }),
};
 
async function resolveViaBackend(notificationId) {
    try {
        const res = await api.get(`/notifications/${notificationId}/route/`);
        return res.data?.path ? res.data : null;
    } catch {
        return null;
    }
}
 
export async function getNotificationRoute(notification, role) {
   
    if (role === "employer" && ["new_message", "new_job_application","application_withdrawn","application_status_updated"].includes(notification.event_type)) {
        return resolveViaBackend(notification.id);
    }
 
    const map = role === "employer" ? EMPLOYER_ROUTES : JOBSEEKER_ROUTES;
    const builder = map[notification.event_type];
 
    if (builder) {
        const route = builder(notification.related_obj_id);
        if (route) return route;
    }
 
    // Fallback: legacy new_message rows (jobseeker side), or unmapped event_type
    if (notification.event_type === "new_message") {
        return resolveViaBackend(notification.id);
    }
 
    return null;
}
