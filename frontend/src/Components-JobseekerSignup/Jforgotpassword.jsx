import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Jforgotpassword.css'
import forgot from "../assets/Forgot.png"
import api from '../api/axios'

export const Jforgotpassword = () => {

  const [formValues, setFormValues] = useState({ email: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const navigate = useNavigate();

  //  Jobseeker platform settings state for allowed domains
  const [jobseekerSettings, setJobseekerSettings] = useState({
    domainRest: false,
    allowedDomains: []
  });

  //  Fetch Jobseeker Platform Settings
  useEffect(() => {
    const fetchJobseekerSettings = async () => {
      try {
        const response = await api.get('/jobseeker/settings/');
        setJobseekerSettings({
          domainRest: response.data.domainRest || false,
          allowedDomains: response.data.allowedDomains || []
        });
      } catch (error) {
        console.error('Failed to fetch jobseeker settings:', error);
        setJobseekerSettings({
          domainRest: false,
          allowedDomains: []
        });
      }
    };

    fetchJobseekerSettings();
  }, []);

  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
    setApiError("")
  }

  //  Email Format & Allowed Domain Checkers (matching Jsignup.jsx)
  const isValidEmailFormat = (email) => {
    if (!email.includes('@') || !email.includes('.')) {
      return false;
    }
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }
    const localPart = parts[0];
    const domain = parts[1];
    if (!/[a-zA-Z]/.test(localPart)) {
      return false;
    }
    if (localPart.length === 0) {
      return false;
    }
    if (domain.length === 0 || !domain.includes('.')) {
      return false;
    }
    return true;
  };

  const isEmailDomainAllowed = (email) => {
    if (!jobseekerSettings.domainRest) {
      return true;
    }
    if (jobseekerSettings.domainRest && jobseekerSettings.allowedDomains.length === 0) {
      return true;
    }
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return false;
    }
    const domain = emailParts[1].toLowerCase().trim();
    return jobseekerSettings.allowedDomains.some(allowedDomain =>
      allowedDomain.toLowerCase().trim() === domain
    );
  };

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!isValidEmailFormat(formValues.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com)"
    } else if (!isEmailDomainAllowed(formValues.email)) {
      const allowedDomainsList = jobseekerSettings.allowedDomains.join(', ');
      newErrors.email = `Email domain not allowed. Please use an email from: ${allowedDomainsList}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setApiError("")
    setErrors({})

    if (!validateForm()) {
      return false
    }

    setLoading(true)

    try {
      const res = await api.post('auth/forgot-password/', formValues)
      alert(res.data.message)
      setFormValues({ email: "" })
      setLoading(false)

    } catch (error) {
      setLoading(false)

      const errorMessage = error.response?.data?.error

      if (errorMessage) {
        setApiError(errorMessage)
      } else {
        const message = error.response?.data?.email?.[0]
        setApiError(message || "An error occurred. Please try again.")
      }
    }
  }

  return (
    <div className="j-forgot-password-page">
      <header className="j-forgot-password-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
        </Link>
        <div className="j-forgot-password-header-links">
          <span className='no-account'>Don't have an account?</span>
          <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Sign up</Link>
        </div>
      </header>
      <div className='j-forgot-password-login-body'>
        <div className="forgot-password-illustration">
          <img src={forgot} alt="Forgot password Illustration" />
        </div>
        <button
          type="button"
          className="back-to-login"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <h2>Forgot Your Password?</h2>

          <label>Email ID</label>
          <input
            type="email"
            placeholder="Enter your Email ID"
            name="email"
            value={formValues.email}
            onChange={handleForm}
            className={errors.email || apiError ? "input-error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
          {apiError && <p className="error-text">{apiError}</p>}

          {/* Allowed Domains Hint */}
          {jobseekerSettings.domainRest && jobseekerSettings.allowedDomains.length > 0 && (
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', marginBottom: '8px', display: 'block' }}>
              Allowed domains: {jobseekerSettings.allowedDomains.join(', ')}
            </span>
          )}

          <button
            className="j-send-link-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Link"}
          </button>

          <div className='center-div-text'>
            <p>Remember your password? <Link to="/Job-portal/jobseeker/login" className='j-password-form-login-link'>Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}