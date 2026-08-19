import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import './Jforgotpassword.css'
import forgot from "../assets/Forgot.png"
import api from '../api/axios'

export const Jforgotpassword = () => {

  const [formValues, setFormValues] = useState({ email: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const navigate = useNavigate();

  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
    setApiError("")
  }

  const validateForm = () => {
    const newErrors = {}

    const regexOfMail = /^[a-zA-Z][a-zA-Z0-9.]*@(gmail|yahoo|outlook|hotmail|thestackly)\.[a-zA-Z]{2,}$/;

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!regexOfMail.test(formValues.email)) {
      newErrors.email = "Invalid email format"
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