// adminNotificationRouter.js
//
// Single source of truth that maps a Notification's `event_type`
// (coming from the backend Notification model) to where the Admin
// Notification panel should send the admin when they click it.
//
// tab          -> value AdminDashboard expects in sessionStorage('adminActiveTab')
// subTab       -> value ActivityMonitor expects in sessionStorage('adminSubTab')
// supportHubTab-> value SupportHub expects in sessionStorage('adminSupportHubTab')
// highlightType-> which deep-link handler (if any) should open the record
// searchFromMessage -> if true, we try to pull an email out of the notification
//                       text and pre-fill the User Management search box with it
//
// If an event_type isn't in this table, we fall back to a sensible default
// based on notification_type / category so nothing silently does nothing.

const ROUTES = {
    // ---- Signups ----
    jobseeker_signup: { tab: 'User Management', searchFromMessage: true },
    employer_signup: { tab: 'User Management', searchFromMessage: true },

    // ---- Jobs ----
    job_pending_approval: { tab: 'Job Monitoring', highlightType: 'job' },
    job_approved: { tab: 'Job Monitoring', highlightType: 'job' },
    job_rejected: { tab: 'Job Monitoring', highlightType: 'job' },
    job_flagged: { tab: 'Job Monitoring', highlightType: 'job' },
    job_hold: { tab: 'Job Monitoring', highlightType: 'job' },
    // job was deleted -> record no longer exists, just land on the list
    job_deleted: { tab: 'Job Monitoring' },

    // ---- Applications ----
    application_withdrawn: { tab: 'Job Monitoring' },

    // ---- Support Hub: Tickets ----
    support_ticket_created: { tab: 'SupportHub', supportHubTab: 'Tickets', highlightType: 'ticket' },

    // ---- Support Hub: Reports/Complaints (Escalation tab) ----
    complaint_submitted: { tab: 'SupportHub', supportHubTab: 'Escalation', highlightType: 'complaint' },

    // ---- Support Hub: Enquiries (contact form messages) ----
    contact_message_submitted: { tab: 'SupportHub', supportHubTab: 'Enquiries', highlightType: 'enquiry' },

    // ---- Companies (Activity Monitoring -> Company Approval sub-tab) ----
    // NOTE: the Company Approval list is backed by CompanyVerification objects,
    // so related_object_id from these two event_types (which store the
    // CompanyVerification id) can be matched against that list's `id` field.
    company_verification_submitted: { tab: 'Activity Monitoring', subTab: 'CompanyApproval', highlightType: 'company' },
    company_verification_updated: { tab: 'Activity Monitoring', subTab: 'CompanyApproval', highlightType: 'company' },
    // company_profile_created stores a different model's id (Company.id, not
    // CompanyVerification.id), which doesn't match the ids in the Company
    // Approval list -> can't safely deep-link this one without a backend change.
    company_profile_created: { tab: 'Activity Monitoring', subTab: 'CompanyApproval' },

    // ---- Subscriptions / Membership ----
    // Orders and Subscriptions are combined into one "Billing" sub-tab under
    // Membership (see MembershipHub.jsx / MembershipBilling.jsx) so admin
    // sees payment + access status together instead of two separate screens.
    new_subscription_plan: { tab: 'Membership', membershipTab: 'Plans', highlightType: 'plan' },
    subscription_order_created: { tab: 'Membership', membershipTab: 'Billing', highlightType: 'order' },
    subscription_cancelled: { tab: 'Membership', membershipTab: 'Billing', highlightType: 'subscription' },
    subscription_reactivated: { tab: 'Membership', membershipTab: 'Billing', highlightType: 'subscription' },

    // ---- Roles ----
    // There is no Role Management screen anywhere in the current codebase
    // (Security Settings is account security - password/2FA - not roles).
    // Routes to settings for now; update once a Role Management page exists.
    role_created: { tab: 'settings' },
    role_deleted: { tab: 'settings' },

    // ---- Account Managers ----
    // Best-effort: the managers list is paginated, so this only opens the
    // record if it's on the first page (always true for newly-created
    // managers, since the list is sorted by id desc).
    account_manager_created: { tab: 'AccountManager', highlightType: 'manager' },
    account_manager_assigned: { tab: 'AccountManager', highlightType: 'manager' },
    account_manager_removed: { tab: 'AccountManager', highlightType: 'manager' },
};

// Fallback when event_type is missing/unknown, based on notification_type.
const NOTIFICATION_TYPE_FALLBACK = {
    job_alert: { tab: 'Job Monitoring' },
    job_approved: { tab: 'Job Monitoring' },
    job_rejected: { tab: 'Job Monitoring' },
    application: { tab: 'Job Monitoring' },
    complaint: { tab: 'SupportHub', supportHubTab: 'Escalation' },
    announcement: { tab: 'Dashboard' },
    message: { tab: 'SupportHub', supportHubTab: 'Enquiries' },
};

// Pulls the first email address out of a notification message, e.g.
// "New jobseeker account has been created: someone@example.com"
const extractEmail = (text) => {
    if (!text) return null;
    const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return match ? match[0] : null;
};

export const resolveAdminNotificationTarget = (notification) => {
    const byEventType = notification?.event_type
        ? ROUTES[notification.event_type]
        : null;

    const target = byEventType
        || NOTIFICATION_TYPE_FALLBACK[notification?.notification_type]
        || { tab: 'Dashboard' };

    const result = {
        tab: target.tab || 'Dashboard',
        subTab: target.subTab || null,
        supportHubTab: target.supportHubTab || null,
        membershipTab: target.membershipTab || null,
        highlightType: target.highlightType || null,
        highlightId: target.highlightType ? (notification?.related_object_id ?? null) : null,
        searchTerm: target.searchFromMessage ? extractEmail(notification?.text || notification?.message) : null,
    };

    return result;
};
