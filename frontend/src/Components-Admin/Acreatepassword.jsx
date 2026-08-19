import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import confirm_password from "../assets/ConfirmPassword.png"
import eye from '../assets/show_password.png'
import eyeHide from '../assets/eye-hide.png'
import api from '../api/axios'

export const Acreatepassword = () => {
  const [passwordShow, setPasswordShow] = useState(true)
  const [confirmPasswordShow, setconfirmPasswordShow] = useState(true)
  const navigate = useNavigate();

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev)
  }

  const toggleConfirmPasswordView = () => {
    setconfirmPasswordShow((prev) => !prev)
  }

  const initialValues = { newPassword: "", confirmPassword: "" }
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
    setApiError("")
  }

  const validateForm = () => {
    const newErrors = {}

    const regexofUppercase = /[A-Z]/;
    const regexofNumber = /[0-9]/;
    const regexofSpecialChar = /[!@#$%^&*]/;
    const regexofLowercase = /[a-z]/;

    if (!formValues.newPassword.trim()) {
      newErrors.newPassword = "New Password is required";
    } else if (formValues.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }
    // ✅ FIX: First check lowercase (must have at least one)
    else if (!regexofLowercase.test(formValues.newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter";
    }
    // Then check uppercase
    else if (!regexofUppercase.test(formValues.newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter";
    }
    // Then check number
    else if (!regexofNumber.test(formValues.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    }
    // Then check special character
    else if (!regexofSpecialChar.test(formValues.newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character (e.g., ! @ # $ %)";
    }

    if (!formValues.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required"
    } else if (formValues.confirmPassword.length < 8) {
      newErrors.confirmPassword = "Password must be at least 8 characters"
    } else if (formValues.confirmPassword !== formValues.newPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("")

    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromURL = queryParams.get('token');
    
    if (!tokenFromURL) {
      setApiError("Invalid reset link. Please request a new password reset.")
      return
    }
    
    if (!validateForm()) {
      return false
    }
    
    setLoading(true)
    
    try {
      const res = await api.post('auth/admin/reset-password-confirm/', {
        token: tokenFromURL,
        new_password: formValues.newPassword,
        confirm_password: formValues.confirmPassword
      })
      alert(res.data.message);
      navigate('/Job-portal/admin/login')
    } catch (error) {
      setLoading(false)
      const errorMessage = error.response?.data?.error
      if (errorMessage) {
        setApiError(errorMessage)
      } else {
        setApiError('Invalid token or expired token. Please request a new password reset.')
      }
    }
  }

  return (
    <div className="j-create-password-page">
      <header className="j-create-password-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
          <span className='subtext'>For Admin</span>
        </Link>
        <div className="j-create-password-header-links">
          <span className='no-account'>Admin Access</span>
          <Link to="/Job-portal/admin/login" className="signup-btn">Login</Link>
        </div>
      </header>
      <div className='j-create-password-login-body'>
        <div className="create-password-illustration">
          <img src={confirm_password} alt="create password Illustration" />
        </div>
        <form onSubmit={handleSubmit} className="create-password-form">
          <h2>Create Admin Password</h2>

          <label>New Password</label>
          <div className="password-wrapper">
            <input 
              type={passwordShow ? "password" : "text"} 
              placeholder="Enter new password" 
              name="newPassword"
              value={formValues.newPassword}
              onChange={handleForm}
              className={errors.newPassword ? "input-error" : ""} 
            />
            <span className="eye-icon" onClick={togglePasswordView}>
              <img src={passwordShow ? eyeHide : eye} className='show-icon' alt='show' />
            </span>
          </div>
          {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input 
              type={confirmPasswordShow ? "password" : "text"} 
              placeholder="Re-enter new password" 
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleForm}
              className={errors.confirmPassword ? "input-error" : ""} 
            />
            <span className="eye-icon" onClick={toggleConfirmPasswordView}>
              <img src={confirmPasswordShow ? eyeHide : eye} className='show-icon' alt='show' />
            </span>
          </div>
          {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          {apiError && <p className="error-text" style={{ marginTop: '10px' }}>{apiError}</p>}

          <button 
            className="j-reset-link-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Password"}
          </button>

          <div className='center-div-text'>
            <p>Remember your password? <Link to="/Job-portal/admin/login" className='j-password-form-login-link'>Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}