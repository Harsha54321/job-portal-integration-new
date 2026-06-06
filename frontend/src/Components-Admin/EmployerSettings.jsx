import React, { useState, useEffect } from "react";
import "./EmployerSettings.css";
import Info from '../assets/AdminAssets/Circle-Info.png';
import api from "../api/axios";

export const EmployerSettings = () => {

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────
  // SINGLE SOURCE OF TRUTH
  // selectedAccountStatus is ALWAYS in backend format (Hold / Active / Deactivated).
  // It is NEVER written from inside fetchSettings — only from user interactions.
  // ─────────────────────────────────────────
  const [selectedAccountStatus, setSelectedAccountStatus] = useState('Hold');

  const [settings, setSettings] = useState({
    employerRegistration: false,
    emailVerification: false,
    mobileVerification: false,
    approvalType: 'Manual Type',
    requiredDocs: {
      companyCert: false,
      gstCert: false,
      businessEmail: false,
      companyWebsite: false,
    },
    preferences: {
      multipleCompany: false,
      multipleUsers: false,
      companyReviews: false,
      companyBranding: false,
      featuredEmployer: false,
    },
    notifications: {
      email: false,
      newSignups: false,
      alerts: false,
      announcements: false,
      weeklySummary: false,
    },
    defaultPlan: 'Free plan',
    accountStatus: 'Pending approval', // display-only label, always in sync with selectedAccountStatus
    jobExpireDays: 30,
    maxJobPosts: 10,
    featuredJobLimit: 3,
    allowEditAfterApproval: false,
  });

  // ─────────────────────────────────────────
  // STATUS MAPPING HELPERS
  // ─────────────────────────────────────────

  const mapToBackendStatus = (frontendStatus) => {
    const map = {
      'Pending approval': 'Hold',
      'Approved': 'Active',
      'Rejected': 'Deactivated',
    };
    return map[frontendStatus] || 'Hold';
  };

  const mapToFrontendStatus = (backendStatus) => {
    const map = {
      'Hold': 'Pending approval',
      'Active': 'Approved',
      'Deactivated': 'Rejected',
    };
    return map[backendStatus] || 'Pending approval';
  };

  // ─────────────────────────────────────────
  // FETCH PLANS (on mount only)
  // ─────────────────────────────────────────

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("plans/");
        setPlans(res.data);
        if (res.data.length > 0) {
          setSelectedPlanId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ─────────────────────────────────────────
  // FETCH SETTINGS
  // Runs whenever selectedPlanId or selectedAccountStatus changes.
  // Uses AbortController to cancel stale in-flight requests — this
  // prevents a slow "Hold" response from landing after the user has
  // already switched to "Active", which was the root cause of the revert bug.
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!selectedPlanId) return;

    const controller = new AbortController();

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const url = `employer-settings/${selectedPlanId}/${selectedAccountStatus}/`;
        const res = await api.get(url, { signal: controller.signal });
        const data = res.data;

        // KEY FIX: derive accountStatus display label from selectedAccountStatus
        // (our source of truth), NOT from data.account_status returned by the backend.
        // Previously, setSelectedAccountStatus(data.account_status) was called here,
        // which re-triggered this useEffect and caused the revert loop.
        setSettings({
          employerRegistration: data.employer_registration ?? false,
          emailVerification: data.email_verification ?? false,
          mobileVerification: data.mobile_verification ?? false,
          approvalType: data.approval_type ?? 'Manual Type',
          // ✅ WITH THIS:
          requiredDocs: {
            companyCert: data.requiredDocs?.companyCert ?? false,
            gstCert: data.requiredDocs?.gstCert ?? false,
            businessEmail: data.requiredDocs?.businessEmail ?? false,
            companyWebsite: data.requiredDocs?.companyWebsite ?? false,
          },
          preferences: {
            multipleCompany: data.preferences?.multipleCompany ?? false,
            multipleUsers: data.preferences?.multipleUsers ?? false,
            companyReviews: data.preferences?.companyReviews ?? false,
            companyBranding: data.preferences?.companyBranding ?? false,
            featuredEmployer: data.preferences?.featuredEmployer ?? false,
          },
          notifications: {
            email: data.notifications?.email ?? false,
            newSignups: data.notifications?.newSignups ?? false,
            alerts: data.notifications?.alerts ?? false,
            announcements: data.notifications?.announcements ?? false,
            weeklySummary: data.notifications?.weeklySummary ?? false,
          },
          defaultPlan: data.plan || 'Free plan',
          // Derived from selectedAccountStatus — never from the API response
          accountStatus: mapToFrontendStatus(selectedAccountStatus),
          jobExpireDays: data.job_expire_days ?? 30,
          maxJobPosts: data.max_job_posts ?? 10,
          featuredJobLimit: data.featured_job_limit ?? 3,
          allowEditAfterApproval: data.allow_edit_after_approval ?? false,
        });

      } catch (err) {
        // Ignore AbortError — this is expected when the user changes
        // selection before the previous fetch completes.
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
        console.error("Failed to fetch employer settings:", err);
      } finally {
        // Only clear loading if this request was not aborted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    // Cleanup: abort any in-flight request when dependencies change
    return () => controller.abort();

  }, [selectedPlanId, selectedAccountStatus]);

  // ─────────────────────────────────────────
  // GENERIC FIELD CHANGE HANDLER
  // ─────────────────────────────────────────

  const handleChange = (category, field, value, isNested = false) => {
    if (isNested) {
      setSettings(prev => ({
        ...prev,
        [category]: { ...prev[category], [field]: value },
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  // ─────────────────────────────────────────
  // SAVE SETTINGS
  // ─────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedPlanId) return;

    setSaving(true);
    try {
      // selectedAccountStatus is already in backend format — no mapping needed
      const url = `employer-settings/${selectedPlanId}/${selectedAccountStatus}/`;

      const payload = {
        employer_registration: settings.employerRegistration,
        email_verification: settings.emailVerification,
        mobile_verification: settings.mobileVerification,
        approval_type: settings.approvalType,
        account_status: selectedAccountStatus,
        job_expire_days: Number(settings.jobExpireDays),
        max_job_posts: Number(settings.maxJobPosts),
        featured_job_limit: Number(settings.featuredJobLimit),
        allow_edit_after_approval: settings.allowEditAfterApproval,
        // ✅ REPLACE WITH NESTED OBJECTS:
        requiredDocs: {
          companyCert: settings.requiredDocs.companyCert,
          gstCert: settings.requiredDocs.gstCert,
          businessEmail: settings.requiredDocs.businessEmail,
          companyWebsite: settings.requiredDocs.companyWebsite,
        },
        preferences: {
          multipleCompany: settings.preferences.multipleCompany,
          multipleUsers: settings.preferences.multipleUsers,
          companyReviews: settings.preferences.companyReviews,
          companyBranding: settings.preferences.companyBranding,
          featuredEmployer: settings.preferences.featuredEmployer,
        },
        notifications: {
          email: settings.notifications.email,
          newSignups: settings.notifications.newSignups,
          alerts: settings.notifications.alerts,
          announcements: settings.notifications.announcements,
          weeklySummary: settings.notifications.weeklySummary,
        },
      };

      await api.patch(url, payload);
      alert("Settings saved successfully!");

      // No re-fetch needed after save — the state already reflects
      // what was just saved, and selectedAccountStatus hasn't changed.

    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // PLAN CHANGE HANDLER
  // ─────────────────────────────────────────

  const handlePlanChange = (planName, planId) => {
    setSettings(prev => ({ ...prev, defaultPlan: planName }));
    setSelectedPlanId(planId);
    // Reset to Hold when switching plans so the useEffect
    // fetches the correct default combination for the new plan
    setSelectedAccountStatus('Hold');
  };

  // ─────────────────────────────────────────
  // ACCOUNT STATUS CHANGE HANDLER
  //
  // Only sets selectedAccountStatus (backend format) and updates the
  // optimistic display label. The useEffect handles the actual fetch.
  // We do NOT set selectedAccountStatus from inside fetchSettings —
  // that was the cause of the revert bug.
  // ─────────────────────────────────────────

  const handleAccountStatusChange = (frontendValue) => {
    const backendValue = mapToBackendStatus(frontendValue);

    // Optimistically update the display label so there's no flicker
    // while the fetch is in progress
    setSettings(prev => ({ ...prev, accountStatus: frontendValue }));

    // This is the only line that triggers the useEffect fetch
    setSelectedAccountStatus(backendValue);
  };

  // ─────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="Jobseeker-Set-main-wrapper">
        <p style={{ padding: '2rem' }}>Loading...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div className="Jobseeker-Set-main-wrapper">

      {/* ── Registration & Access ── */}
      <div className="Jobseeker-Set-registration">
        <div className="Jobseeker-Set-registration-left">
          <h2>Registration & Access</h2>
          <p className="Jobseeker-Set-subtitle">
            Configure how employers can register and access the platform
          </p>

          {[
            { label: 'Employer Registration', desc: 'Allow new users to register', field: 'employerRegistration' },
            { label: 'Email Verification', desc: 'Require email verification', field: 'emailVerification' },
            { label: 'Mobile Verification', desc: 'Require mobile number verification', field: 'mobileVerification' },
          ].map(item => (
            <div className="Jobseeker-Set-details" key={item.field}>
              <div className="Jobseeker-Set-details-content">
                <h4>{item.label}</h4>
                <p>{item.desc}</p>
              </div>
              <label className="Jobseeker-Set-toggle-switch">
                <input
                  type="checkbox"
                  checked={settings[item.field]}
                  onChange={(e) => handleChange(null, item.field, e.target.checked)}
                />
                <span className="Jobseeker-Set-toggle-slider"></span>
              </label>
            </div>
          ))}

          <div className="Jobseeker-Set-details">
            <div className="Jobseeker-Set-details-content">
              <h4>Approval Type</h4>
              <p>Choose how new employer accounts are approved</p>
            </div>
            <select
              className="Jobseeker-Set-approval"
              value={settings.approvalType}
              onChange={(e) => handleChange(null, 'approvalType', e.target.value)}
            >
              <option>Manual Type</option>
              <option>Automatic</option>
            </select>
          </div>
        </div>

        {/* ── Required Documents ── */}
        <div className="Jobseeker-Set-registration-right">
          <h2>Required Documents</h2>
          <p className="Jobseeker-Set-subtitle">
            Select documents required during registration
          </p>
          <div className="Jobseeker-Set-checkbox-group">
            {/* {[
              { label: 'Company registration certificate', id: 'companyCert' },
              { label: 'GST certificate', id: 'gstCert' },
              { label: 'Business email', id: 'businessEmail' },
              { label: 'Company website', id: 'companyWebsite' },
            ].map(doc => (
              <label className="Jobseeker-Set-checkbox-item" key={doc.id}>
                <input
                  type="checkbox"
                  checked={settings.requiredDocs[doc.id]}
                  onChange={(e) =>
                    handleChange('requiredDocs', doc.id, e.target.checked, true)
                  }
                />
                <span>{doc.label}</span>
              </label>
            ))} */}

            {[
  { label: 'Company registration certificate', id: 'companyCert' },
  { label: 'GST certificate', id: 'gstCert' },
  { label: 'Business email', id: 'businessEmail' },
  { label: 'Company website', id: 'companyWebsite' },
].map(doc => (
  <label className="Jobseeker-Set-checkbox-item Jobseeker-Set-disabled-item" key={doc.id}>
    <input
      type="checkbox"
      checked={settings.requiredDocs[doc.id]}
      onChange={(e) => handleChange('requiredDocs', doc.id, e.target.checked, true)}
      disabled
    />
    <span>{doc.label}</span>
  </label>
))}
          </div>
        </div>
      </div>

      {/* ── Preferences / Notifications / Plan+Status ── */}
      <div className="Jobseeker-Set-preferences-container">

        {/* Other Preferences */}
        <div className="Jobseeker-Set-preferences-column">
          <h2>Other Preferences</h2>
          {/* {[
            { label: 'Allow Multiple Company', id: 'multipleCompany' },
            { label: 'Allow Multiple Users', id: 'multipleUsers' },
            { label: 'Show Company Reviews', id: 'companyReviews' },
            { label: 'Enable Company Branding', id: 'companyBranding' },
            { label: 'Feature Employer Option', id: 'featuredEmployer' },
          ].map(pref => (
            <label className="Jobseeker-Set-checkbox-item" key={pref.id}>
              <input
                type="checkbox"
                checked={settings.preferences[pref.id]}
                onChange={(e) =>
                  handleChange('preferences', pref.id, e.target.checked, true)
                }
              />
              <span>{pref.label}</span>
            </label>
          ))} */}
          {[
  { label: 'Allow Multiple Company', id: 'multipleCompany' },
  { label: 'Allow Multiple Users', id: 'multipleUsers' },
  { label: 'Show Company Reviews', id: 'companyReviews' },
  { label: 'Enable Company Branding', id: 'companyBranding' },
  { label: 'Feature Employer Option', id: 'featuredEmployer' },
].map(pref => (
  <label className="Jobseeker-Set-checkbox-item Jobseeker-Set-disabled-item" key={pref.id}>
    <input
      type="checkbox"
      checked={settings.preferences[pref.id]}
      onChange={(e) => handleChange('preferences', pref.id, e.target.checked, true)}
      disabled
    />
    <span>{pref.label}</span>
  </label>
))}
        </div>

        {/* Notification Settings */}
        <div className="Jobseeker-Set-preferences-column">
          <h2>Notification settings</h2>
          {[
            { label: 'Email Notifications', id: 'email' },
            { label: 'New employer signups', id: 'newSignups' },
            { label: 'Approval / Rejection alerts', id: 'alerts' },
            { label: 'System Announcements', id: 'announcements' },
            { label: 'Weekly summary', id: 'weeklySummary' },
          ].map(notif => (
            <label className="Jobseeker-Set-checkbox-item" key={notif.id}>
              <input
                type="checkbox"
                checked={settings.notifications[notif.id]}
                onChange={(e) =>
                  handleChange('notifications', notif.id, e.target.checked, true)
                }
              />
              <span>{notif.label}</span>
            </label>
          ))}
        </div>

        {/* Default Plan + Account Status */}
        <div className="Jobseeker-Set-preferences-column Jobseeker-Set-right-section">
          <div className="Jobseeker-Set-select-group">
            <h2>Default Plan</h2>
            <select
              value={settings.defaultPlan}
              onChange={(e) => {
                const matched = plans.find(p => p.name === e.target.value);
                if (matched) handlePlanChange(matched.name, matched.id);
              }}
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.name}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="Jobseeker-Set-select-group">
            <h2>Account status</h2>
            <select
              value={settings.accountStatus}
              onChange={(e) => handleAccountStatusChange(e.target.value)}
            >
              <option>Pending approval</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Job Posting Settings ── */}
      <div className="Jobseeker-Set-job-posting-container">
        <h2>Job Posting Settings</h2>
        <div className="Jobseeker-Set-job-settings-grid">

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Job Expire(Days)</h3>
            <input
              type="number"
              value={settings.jobExpireDays}
              onChange={(e) =>
                handleChange(null, 'jobExpireDays', parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Max Job Posts</h3>
            <input
              type="number"
              value={settings.maxJobPosts}
              onChange={(e) =>
                handleChange(null, 'maxJobPosts', parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Featured Job Limit</h3>
            <input
              type="number"
              value={settings.featuredJobLimit}
              onChange={(e) =>
                handleChange(null, 'featuredJobLimit', parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Job Edit After Approval</h3>
            <div className="Jobseeker-Set-allowed-toggle">
              <label className="Jobseeker-Set-toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.allowEditAfterApproval}
                  onChange={(e) =>
                    handleChange(null, 'allowEditAfterApproval', e.target.checked)
                  }
                />
                <span className="Jobseeker-Set-toggle-slider"></span>
              </label>
              <span className="Jobseeker-Set-allowed-text">
                {settings.allowEditAfterApproval ? "Allowed" : "Not Allowed"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Save ── */}
      <div className="Jobseeker-Set-save-section">
        <div className="Jobseeker-Set-info-message">
          <img src={Info} width="19" alt="CircleI" />
          Changes will apply to all Employers users on the platform
        </div>
        <button
          className="Jobseeker-Set-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </div>
  );
};