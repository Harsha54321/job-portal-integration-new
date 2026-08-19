import React, { useEffect, useState } from "react";
import "./JobSeekerSettings.css";
import vector from '../assets/EditIcon.png';
import Info from '../assets/AdminAssets/Circle-Info.png'
import save from '../assets/AdminAssets/Save-White.png';
import arrowDownImg from "../assets/AdminAssets/DownArrow.png";
import api from '../api/axios'

export const JobSeekerSettings = () => {
  const [formData, setFormData] = useState({
    registration: true,
    emailVer: true,
    phoneVer: true,
    domainRest: true,
    allowedDomains: ["gmail.com", "yahoo.com", "outlook.com"],
    defaultRole: "Job Seeker",
    accountStatus: "Active",
    profileVisibility: "Employers Only",
    resumeVisibility: "Employers Only",
    anonymous: false,
    completionPercent: "0 %",
    salary: true,
    reviews: true,
    appStatus: true,
    similarJobs: true,
    advice: true,
    easyApply: true,
    saveJobs: true,
    maxApps: 30,
    appExpiry: 60
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('jobseeker/settings/');
      const data = response.data;

      setFormData({
        registration: data.registration,
        emailVer: data.emailVer,
        phoneVer: data.phoneVer,
        domainRest: data.domainRest,
        allowedDomains: data.allowedDomains || [],
        defaultRole: data.defaultRole,
        accountStatus: data.accountStatus,
        profileVisibility: data.profileVisibility,
        resumeVisibility: data.resumeVisibility,
        anonymous: data.anonymous,
        completionPercent: data.completionPercent,
        salary: data.salary,
        reviews: data.reviews,
        appStatus: data.appStatus,
        similarJobs: data.similarJobs,
        advice: data.advice,
        easyApply: data.easyApply,
        saveJobs: data.saveJobs,
        maxApps: data.maxApps,
        appExpiry: data.appExpiry,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateDomain = (domain) => {
    domain = domain.trim().toLowerCase();

    if (!domain) {
      return { valid: false, error: "Domain cannot be empty" };
    }

    if (domain.includes('@')) {
      return {
        valid: false,
        error: "Please enter only the domain name (e.g., domain.com). Do not include '@' symbol"
      };
    }

    if (domain.includes(' ')) {
      return {
        valid: false,
        error: "Domain cannot contain spaces"
      };
    }

    if (!domain.includes('.')) {
      return {
        valid: false,
        error: "Domain must contain a dot (.) (e.g., domain.com)"
      };
    }

    if (domain.startsWith('.') || domain.endsWith('.')) {
      return {
        valid: false,
        error: "Domain cannot start or end with a dot (.)"
      };
    }

    if (domain.includes('..')) {
      return {
        valid: false,
        error: "Domain cannot contain consecutive dots (..)"
      };
    }

    const validDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;
    if (!validDomainRegex.test(domain)) {
      return {
        valid: false,
        error: "Domain can only contain letters, numbers, dots (.), and hyphens (-)"
      };
    }

    const parts = domain.split('.');
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return {
        valid: false,
        error: "Domain must have a valid top-level domain (e.g., .com, .org)"
      };
    }

    if (domain.length > 253) {
      return {
        valid: false,
        error: "Domain is too long (maximum 253 characters)"
      };
    }

    for (let part of parts) {
      if (part.length > 63) {
        return {
          valid: false,
          error: `Part "${part}" exceeds maximum length of 63 characters`
        };
      }
      if (part.startsWith('-') || part.endsWith('-')) {
        return {
          valid: false,
          error: `Part "${part}" cannot start or end with a hyphen (-)`
        };
      }
    }

    if (formData.allowedDomains.includes(domain)) {
      return {
        valid: false,
        error: `"${domain}" is already in the allowed domains list`
      };
    }

    return { valid: true, error: null };
  };

  const handleDomainKeyDown = (e) => {
    if (e.key === "Enter" && domainInput.trim()) {
      e.preventDefault();
      const domain = domainInput.trim().toLowerCase();

      const validation = validateDomain(domain);

      if (!validation.valid) {
        setDomainError(validation.error);
        return;
      }

      setDomainError("");
      setFormData(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, domain]
      }));
      setDomainInput("");
    }
  };

  const handleDomainBlur = () => {
    if (domainInput.trim()) {
      const domain = domainInput.trim().toLowerCase();
      const validation = validateDomain(domain);

      if (!validation.valid) {
        setDomainError(validation.error);
      } else {
        setDomainError("");
      }
    } else {
      setDomainError("");
    }
  };

  const handleDomainInputChange = (e) => {
    setDomainInput(e.target.value);
    if (domainError) {
      setDomainError("");
    }
  };

  const removeDomain = (domainToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domainToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let payload = { ...formData };
      if (domainInput.trim()) {
        const domain = domainInput.trim().toLowerCase();
        const validation = validateDomain(domain);

        if (!validation.valid) {
          setDomainError(validation.error);
          setSaving(false);
          return;
        }

        if (!payload.allowedDomains.includes(domain)) {
          payload.allowedDomains = [...payload.allowedDomains, domain];
          setDomainInput("");
          setDomainError("");
        }
      }

      const response = await api.patch("jobseeker/settings/", payload);

      console.log("Settings updated:", response.data);
      setFormData(payload);

      alert(
        response?.data?.message || "Settings updated successfully!"
      );

    } catch (error) {
      console.error("Failed to save settings:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to update settings. Please try again.";

      alert(errorMessage);

    } finally {
      setSaving(false);
    }
  };

  const Switch = ({ active, onToggle }) => (
    <div className={`jobset-switch ${active ? "active" : ""}`} onClick={onToggle}>
      <div className="jobset-switch-handle"></div>
    </div>
  );

  const ToggleRow = ({ label, desc, active, onToggle }) => (
    <div className="jobset-toggle-row">
      <div><h4>{label}</h4><p>{desc}</p></div>
      <Switch active={active} onToggle={onToggle} />
    </div>
  );
  const PrefItem = ({ label, active, onToggle }) => (
    <div className="jobset-pref-item">
      <span>{label}</span>
      <Switch active={active} onToggle={onToggle} />
    </div>
  );
  if (loading) {
    return (
      <div className="Jobseeker-Set-main-wrapper" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div className="Jobseeker-Set-main-wrapper">
      <div className="jobset-header-flex">
        <div className="jobset-header-text">
          <h2>Job Seeker Setting</h2>
          <p>Manage preferences and permissions for job seeker users</p>
        </div>
      </div>

      <div className="jobset-card">
        <div className="jobset-card-header">
          <h3>Registration & Access</h3>
          <p>Configure how job seekers can register and access the platform</p>
        </div>

        <div className="jobset-grid-three">
          <div className="jobset-col">
            <ToggleRow label="Job Seeker Registration" desc="Allow new users to register" active={formData.registration} onToggle={() => toggleSwitch('registration')} />
            <ToggleRow label="Email Verification" desc="Require email verification" active={formData.emailVer} onToggle={() => toggleSwitch('emailVer')} />
            <ToggleRow label="Phone Verification" desc="Require mobile verification" active={formData.phoneVer} onToggle={() => toggleSwitch('phoneVer')} />
            {/* <ToggleRow label="Email Domains Restriction" desc="Restrict specific domains" active={formData.domainRest} onToggle={() => toggleSwitch('domainRest')} /> */}
          </div>

          <div className="jobset-col">
            <div className="jobset-field">
              <label title="Upcoming feature to restrict domains in jobseeker (e.g., domain.com)">
                Allowed Domains
                <span className="jobset-optional">(Optional)</span>
              </label>
              <p className="jobset-field-desc">Add email domains allowed to register</p>
              <input
                type="text"
                title="Upcoming feature to restrict domains in jobseeker (e.g., domain.com)"
                placeholder="Enter domain and press Enter (e.g., domain.com)"
                className={`jobset-input ${domainError ? 'jobset-input-error' : ''}`}
                value={domainInput}
                onChange={handleDomainInputChange}
                onKeyDown={handleDomainKeyDown}
                onBlur={handleDomainBlur}
                disabled
              />
              {domainError && (
                <div className="jobset-domain-error">
                  <span className="error-text">{domainError}</span>
                </div>
              )}
              <div className="jobset-tags">
                {formData.allowedDomains.map((domain, index) => (
                  <span key={index} className="jobset-tag">
                    {domain}
                    {/* <span className="jobset-tag-close" onClick={() => removeDomain(domain)}>×</span> */}
                  </span>
                ))}
              </div>
              <div className="jobset-domain-hint">
                <small>Valid format: domain.com, subdomain.example.org</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="jobset-grid-four">
        <div className="jobset-field">
          <label>Easy Apply</label>
          <p className="jobset-field-desc">Enable one click apply for jobs</p>
          <div className="jobset-status-box-inline">
            <Switch active={formData.easyApply} onToggle={() => toggleSwitch('easyApply')} />
            <span className="status-label">{formData.easyApply ? "Enabled" : "Disabled"}</span>
          </div>
        </div>

        <div className="jobset-field">
          <label>Allow Save Jobs</label>
          <p className="jobset-field-desc">Allow job seekers to save jobs</p>
          <div className="jobset-status-box-inline">
            <Switch active={formData.saveJobs} onToggle={() => toggleSwitch('saveJobs')} />
            <span className="status-label">{formData.saveJobs ? "Enabled" : "Disabled"}</span>
          </div>
        </div>

        <div className="jobset-field">
          <label>Max Applications Per Day</label>
          <p className="jobset-field-desc">Limit applications per day</p>
          <div className="jobset-input-wrapper">
            <input type="number" name="maxApps" className="jobset-input" value={formData.maxApps} onChange={handleChange} />
          </div>
        </div>

        <div className="jobset-field">
          <label>Application Expiry (Days)</label>
          <p className="jobset-field-desc">Auto close old applications</p>
          <div className="jobset-input-wrapper">
            <input type="number" name="appExpiry" className="jobset-input" value={formData.appExpiry} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="jobset-footer">
        <div className="jobset-alert">
          <img src={Info} alt="info-icon" />
          Changes will apply to all job seeker users on the platform
        </div>
        <button className="jobset-save-btn" onClick={handleSave} disabled={saving}>
          <img src={save} alt="save-icon" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};