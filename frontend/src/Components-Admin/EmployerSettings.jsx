import React, { useState, useEffect } from "react";
import "./EmployerSettings.css";
import Info from '../assets/AdminAssets/Circle-Info.png';
import api from "../api/axios";
import Registration from '../assets/AdminAssets/registrationAccess.png';

export const EmployerSettings = () => {

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedAccountStatus, setSelectedAccountStatus] = useState('Hold');

  const [registrationSettings, setRegistrationSettings] = useState({
    employerRegistration: false,
    emailVerification: false,
    mobileVerification: false,
    approvalType: 'Manual Type',
  });

  const [settings, setSettings] = useState({
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
    accountStatus: 'Hold',
    jobExpireDays: 30,
    maxJobPosts: 10,
    featuredJobLimit: 3,
    allowEditAfterApproval: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // ─────────────────────────────────────────
  // CHECK IF SELECTED PLAN IS STARTER
  // ─────────────────────────────────────────

  const isStarterPlan = () => {
    const planName = settings.defaultPlan?.toLowerCase() || '';
    return planName === 'starter plan' || planName === 'starter' || planName === 'free plan' || planName === 'free';
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
          // Set default plan name
          setSettings(prev => ({ ...prev, defaultPlan: res.data[0].name }));
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchRegistrationSettings = async () => {
      try {
        const res = await api.get("employer-registration-settings/");
        const data = res.data;
        setRegistrationSettings({
          employerRegistration: data.employer_registration ?? false,
          emailVerification: data.email_verification ?? false,
          mobileVerification: data.mobile_verification ?? false,
          approvalType: data.approval_type ?? 'Manual Type',
        });
      } catch (err) {
        console.error("Failed to fetch employer registration settings:", err);
      }
    };
    fetchRegistrationSettings();
  }, []);

  useEffect(() => {
    if (!selectedPlanId) return;

    const controller = new AbortController();

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const url = `employer-settings/${selectedPlanId}/${selectedAccountStatus}/`;
        const res = await api.get(url, { signal: controller.signal });
        const data = res.data;

        console.log("[DEBUG] Fetched data:", data);

        setSettings({
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
          defaultPlan: data.plan || settings.defaultPlan || 'Free plan',
          accountStatus: selectedAccountStatus,
          jobExpireDays: data.job_expire_days ?? 30,
          maxJobPosts: data.max_job_posts ?? 10,
          featuredJobLimit: data.featured_job_limit ?? 3,
          allowEditAfterApproval: data.allow_edit_after_approval ?? false,
        });

      } catch (err) {
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
        console.error("Failed to fetch employer settings:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

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
  // PREVIEW CHANGES
  // ─────────────────────────────────────────

  const handlePreviewChanges = () => {
    const preview = {
      ...settings,
      ...registrationSettings,
      jobExpireDays: Number(settings.jobExpireDays),
      maxJobPosts: Number(settings.maxJobPosts),
      featuredJobLimit: Number(settings.featuredJobLimit),
    };
    setPreviewData(preview);
    setShowPreview(true);
  };

  // ─────────────────────────────────────────
  // SAVE SETTINGS
  // ─────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedPlanId) return;

    setSaving(true);
    try {
      // ── 1. Save Registration Settings ──
      await api.patch("employer-registration-settings/", {
        employer_registration: registrationSettings.employerRegistration,
        email_verification: registrationSettings.emailVerification,
        mobile_verification: registrationSettings.mobileVerification,
        approval_type: registrationSettings.approvalType,
      });

      // ── 2. Save Platform Settings ──
      const url = `employer-settings/${selectedPlanId}/${selectedAccountStatus}/`;

      const payload = {
        account_status: selectedAccountStatus,
        job_expire_days: Number(settings.jobExpireDays),
        max_job_posts: Number(settings.maxJobPosts),
        featured_job_limit: Number(settings.featuredJobLimit),
        allow_edit_after_approval: settings.allowEditAfterApproval,
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

      console.log("[DEBUG] Saving payload (nested):", payload);

      const response = await api.patch(url, payload);

      if (response.status === 200) {
        alert("Settings saved successfully!");
        setShowPreview(false);

        // Refresh platform settings data
        const refreshRes = await api.get(url);
        const data = refreshRes.data;

        setSettings({
          ...settings,
          jobExpireDays: data.job_expire_days ?? settings.jobExpireDays,
          maxJobPosts: data.max_job_posts ?? settings.maxJobPosts,
          featuredJobLimit: data.featured_job_limit ?? settings.featuredJobLimit,
          allowEditAfterApproval: data.allow_edit_after_approval ?? settings.allowEditAfterApproval,
          requiredDocs: {
            companyCert: data.requiredDocs?.companyCert ?? settings.requiredDocs.companyCert,
            gstCert: data.requiredDocs?.gstCert ?? settings.requiredDocs.gstCert,
            businessEmail: data.requiredDocs?.businessEmail ?? settings.requiredDocs.businessEmail,
            companyWebsite: data.requiredDocs?.companyWebsite ?? settings.requiredDocs.companyWebsite,
          },
          preferences: {
            multipleCompany: data.preferences?.multipleCompany ?? settings.preferences.multipleCompany,
            multipleUsers: data.preferences?.multipleUsers ?? settings.preferences.multipleUsers,
            companyReviews: data.preferences?.companyReviews ?? settings.preferences.companyReviews,
            companyBranding: data.preferences?.companyBranding ?? settings.preferences.companyBranding,
            featuredEmployer: data.preferences?.featuredEmployer ?? settings.preferences.featuredEmployer,
          },
          notifications: {
            email: data.notifications?.email ?? settings.notifications.email,
            newSignups: data.notifications?.newSignups ?? settings.notifications.newSignups,
            alerts: data.notifications?.alerts ?? settings.notifications.alerts,
            announcements: data.notifications?.announcements ?? settings.notifications.announcements,
            weeklySummary: data.notifications?.weeklySummary ?? settings.notifications.weeklySummary,
          },
        });
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to save settings: ${err.response?.data?.error || err.message}`);
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
    // Reset to Hold when switching plans
    setSelectedAccountStatus('Hold');
  };

  // ─────────────────────────────────────────
  // ACCOUNT STATUS CHANGE HANDLER
  // ─────────────────────────────────────────

  const handleAccountStatusChange = (value) => {
    setSettings(prev => ({ ...prev, accountStatus: value }));
    setSelectedAccountStatus(value);
  };

  // ─────────────────────────────────────────
  // PREVIEW MODAL COMPONENT
  // ─────────────────────────────────────────

  const PreviewModal = () => {
    if (!showPreview || !previewData) return null;

    const getStatusClass = (value) => {
      return value ? 'preview-enabled' : 'preview-disabled';
    };

    return (
      <div className="employer-preview-overlay" onClick={() => setShowPreview(false)}>
        <div className="employer-preview-modal" onClick={(e) => e.stopPropagation()}>
          <div className="preview-header">
            <h3>📋 Preview Changes</h3>
            <button className="preview-close" onClick={() => setShowPreview(false)}>✕</button>
          </div>

          <div className="preview-content">
            {/* Job Posting Settings */}
            <div className="preview-section">
              <h4>📌 Job Posting Settings</h4>
              <div className="preview-row">
                <span>Job Expire Days:</span>
                <strong>{previewData.jobExpireDays} days</strong>
              </div>
              <div className="preview-row">
                <span>Max Job Posts:</span>
                <strong>{previewData.maxJobPosts}</strong>
              </div>
              <div className="preview-row">
                <span>Featured Job Limit:</span>
                <strong>{previewData.featuredJobLimit}</strong>
              </div>
              <div className="preview-row">
                <span>Allow Edit After Approval:</span>
                <strong className={getStatusClass(previewData.allowEditAfterApproval)}>
                  {previewData.allowEditAfterApproval ? "✅ Allowed" : "❌ Not Allowed"}
                </strong>
              </div>
            </div>

            {/* Registration Settings */}
            <div className="preview-section">
              <h4>🔐 Registration & Access</h4>
              <div className="preview-row">
                <span>Employer Registration:</span>
                <strong className={getStatusClass(previewData.employerRegistration)}>
                  {previewData.employerRegistration ? "✅ Enabled" : "❌ Disabled"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Email Verification:</span>
                <strong className={getStatusClass(previewData.emailVerification)}>
                  {previewData.emailVerification ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Mobile Verification:</span>
                <strong className={getStatusClass(previewData.mobileVerification)}>
                  {previewData.mobileVerification ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Approval Type:</span>
                <strong>{previewData.approvalType}</strong>
              </div>
            </div>

            {/* Required Documents */}
            <div className="preview-section">
              <h4>📄 Required Documents</h4>
              <div className="preview-row">
                <span>Company Certificate:</span>
                <strong className={getStatusClass(previewData.requiredDocs?.companyCert)}>
                  {previewData.requiredDocs?.companyCert ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
              <div className="preview-row">
                <span>GST Certificate:</span>
                <strong className={getStatusClass(previewData.requiredDocs?.gstCert)}>
                  {previewData.requiredDocs?.gstCert ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Business Email:</span>
                <strong className={getStatusClass(previewData.requiredDocs?.businessEmail)}>
                  {previewData.requiredDocs?.businessEmail ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Company Website:</span>
                <strong className={getStatusClass(previewData.requiredDocs?.companyWebsite)}>
                  {previewData.requiredDocs?.companyWebsite ? "✅ Required" : "❌ Not Required"}
                </strong>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="preview-section">
              <h4>🔔 Notification Settings</h4>
              <div className="preview-row">
                <span>Email Notifications:</span>
                <strong className={getStatusClass(previewData.notifications?.email)}>
                  {previewData.notifications?.email ? "✅ Enabled" : "❌ Disabled"}
                </strong>
              </div>
              <div className="preview-row">
                <span>New Signups:</span>
                <strong className={getStatusClass(previewData.notifications?.newSignups)}>
                  {previewData.notifications?.newSignups ? "✅ Enabled" : "❌ Disabled"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Alerts:</span>
                <strong className={getStatusClass(previewData.notifications?.alerts)}>
                  {previewData.notifications?.alerts ? "✅ Enabled" : "❌ Disabled"}
                </strong>
              </div>
              <div className="preview-row">
                <span>Weekly Summary:</span>
                <strong className={getStatusClass(previewData.notifications?.weeklySummary)}>
                  {previewData.notifications?.weeklySummary ? "✅ Enabled" : "❌ Disabled"}
                </strong>
              </div>
            </div>

            {/* Plan & Status */}
            <div className="preview-section">
              <h4>📊 Plan Configuration</h4>
              <div className="preview-row">
                <span>Default Plan:</span>
                <strong>{previewData.defaultPlan}</strong>
              </div>
              <div className="preview-row">
                <span>Account Status:</span>
                <strong>{previewData.accountStatus}</strong>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button className="preview-cancel" onClick={() => setShowPreview(false)}>
              Cancel
            </button>
            <button className="preview-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="Jobseeker-Set-main-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  const isStarter = isStarterPlan();

  return (
    <div className="Jobseeker-Set-main-wrapper">

      <PreviewModal />

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
                  checked={registrationSettings[item.field]}
                  onChange={(e) => setRegistrationSettings(prev => ({ ...prev, [item.field]: e.target.checked }))}
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
              value={registrationSettings.approvalType}
              onChange={(e) => setRegistrationSettings(prev => ({ ...prev, approvalType: e.target.value }))}
            >
              <option>Manual Type</option>
              <option>Automatic</option>
            </select>
          </div>
        </div>

        {/* ── Required Documents ── */}
        <div className="Jobseeker-Set-registration-right">
          <img src={Registration} alt="Verification illustration" loading="eager" />
        </div>

        {/* <div className="Jobseeker-Set-registration-right">
          <h2>Required Documents <span
            style={{
              marginLeft: '8px',
              cursor: 'help',
              fontSize: '12px',
              color: '#ff9800'
            }}
            title="Document verification feature is under implementation"
          >
            ⓘ
          </span></h2>
          <p className="Jobseeker-Set-subtitle">
            Select documents required during registration
          </p>
          <div className="Jobseeker-Set-checkbox-group">
            {[
              { label: 'Company registration certificate', id: 'companyCert' },
              { label: 'GST certificate', id: 'gstCert' },
              { label: 'Business email', id: 'businessEmail' },
              { label: 'Company website', id: 'companyWebsite' },
            ].map(doc => (
              <div className="Jobseeker-Set-checkbox-item" key={doc.id}>
                <input
                  type="checkbox"
                  id={`doc-${doc.id}`}
                  checked={settings.requiredDocs[doc.id]}
                  onChange={(e) => handleChange('requiredDocs', doc.id, e.target.checked, true)}
                  disabled
                  title="Under Implementation"
                />
                <label htmlFor={`doc-${doc.id}`} style={{ cursor: 'pointer' }}>
                  {doc.label}
                </label>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* ── Preferences / Notifications / Plan+Status ── */}
      <div className="Jobseeker-Set-preferences-container">

        {/* Other Preferences */}
        <div className="Jobseeker-Set-preferences-column">
          <h2>Other Preferences
            <span style={{ marginLeft: '8px', cursor: 'help', fontSize: '12px', color: '#ff9800' }}
              title="Multiple Company, Multiple Users, Company Reviews, Company Branding are under implementation">
              ⓘ
            </span>
          </h2>

          {[
            { label: 'Allow Multiple Company', id: 'multipleCompany', disabled: true },
            { label: 'Allow Multiple Users', id: 'multipleUsers', disabled: true },
            { label: 'Show Company Reviews', id: 'companyReviews', disabled: true },
            { label: 'Enable Company Branding', id: 'companyBranding', disabled: true },
            { label: 'Allow Job Highlighting', id: 'featuredEmployer', disabled: false },
          ].map(pref => (
            <div className="Jobseeker-Set-checkbox-item" key={pref.id}>
              <input
                type="checkbox"
                id={`pref-${pref.id}`}
                checked={settings.preferences[pref.id]}
                onChange={(e) => handleChange('preferences', pref.id, e.target.checked, true)}
                disabled={pref.disabled}
                title={pref.disabled ? "Under implementation" : ""}
              />
              <label htmlFor={`pref-${pref.id}`} style={{ cursor: 'pointer' }}>
                {pref.label}
              </label>
            </div>
          ))}
        </div>

        {/* Notification Settings */}
        <div className="Jobseeker-Set-preferences-column">
          <h2>Notification settings</h2>
          {[
            { label: 'Email Notifications', id: 'email' },
            {
              label: 'New employer signups',
              id: 'newSignups',
              disabled: !isStarter,
              tooltip: isStarter ? '' : 'Only available for Starter Plan/Free Plan.'
            },
            {
              label: 'Approval / Rejection alerts',
              id: 'alerts'
            },
            {
              label: 'System Announcements',
              id: 'announcements',
              disabled: true,
              tooltip: 'Under Development'
            },
            { label: 'Weekly summary', id: 'weeklySummary' },
          ].map(notif => (
            <div
              className={`Jobseeker-Set-checkbox-item ${notif.disabled ? 'Jobseeker-Set-disabled-item' : ''}`}
              key={notif.id}
            >
              <input
                type="checkbox"
                id={`notif-${notif.id}`}
                checked={settings.notifications[notif.id]}
                onChange={(e) => handleChange('notifications', notif.id, e.target.checked, true)}
                disabled={notif.disabled || false}
              />
              <label htmlFor={`notif-${notif.id}`} style={{ cursor: 'pointer' }}>
                {notif.label}
                {notif.disabled && (
                  <span
                    style={{
                      marginLeft: '8px',
                      cursor: 'help',
                      fontSize: '12px',
                      color: '#ff9800'
                    }}
                    title={notif.tooltip || 'Under Development'}
                  >
                    ⓘ
                  </span>
                )}
              </label>
            </div>
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
            <h2>Employer Account Status</h2>
            <select
              value={settings.accountStatus}
              onChange={(e) => handleAccountStatusChange(e.target.value)}
            >
              <option>Hold</option>
              <option>Active</option>
              <option>Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Job Posting Settings ── */}
      <div className="Jobseeker-Set-job-posting-container">
        <h2>Job Posting Settings</h2>
        <div className="Jobseeker-Set-job-settings-grid">

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Job Expire (Days)</h3>
            <input
              type="number"
              value={settings.jobExpireDays}
              onChange={(e) =>
                handleChange(null, 'jobExpireDays', parseInt(e.target.value) || 0)
              }
            />
            <p className="setting-hint">Jobs will expire after this many days</p>
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
            <p className="setting-hint">Maximum number of jobs an employer can post</p>
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
            <p className="setting-hint">Maximum number of featured jobs allowed</p>
          </div>

          <div className="Jobseeker-Set-job-setting-box">
            <h3>Job Edit After Approval  <span
              style={{
                marginLeft: '8px',
                cursor: 'help',
                fontSize: '12px',
                color: '#0066cc'
              }}
              title="Controls whether employers can edit a job after it has been approved"
            >
              ⓘ
            </span></h3>
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
            <p className="setting-hint">Allow employers to edit jobs after approval</p>
          </div>

        </div>
      </div>

      {/* ── Save & Preview Buttons ── */}
      <div className="Jobseeker-Set-save-section">
        <div className="Jobseeker-Set-info-message">
          <img src={Info} width="19" alt="CircleI" />
          Changes will apply to all Employers users on the platform
        </div>
        <div className="Jobseeker-Set-button-group">
          <button
            className="Jobseeker-Set-preview-btn"
            onClick={handlePreviewChanges}
          >
            Preview Changes
          </button>
          <button
            className="Jobseeker-Set-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : " Save Changes"}
          </button>
        </div>
      </div>

    </div>
  );
};