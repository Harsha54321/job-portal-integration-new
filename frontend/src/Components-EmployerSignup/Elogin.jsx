import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import manSitting from "../assets/Illustration_1.png";
import eye from "../assets/show_password.png";
import eyeHide from "../assets/eye-hide.png";
import "./Elogin.css";

export const Elogin = () => {
  const navigate = useNavigate();
  const savedEmail = localStorage.getItem("rememberedEmail");
  const savedPassword = localStorage.getItem("rememberedPassword");
  const [rememberMe, setRememberMe] = useState(false);

  const [passwordShow, setPasswordShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formValues, setFormValues] = useState({
    username: savedEmail || "",
    password: savedPassword || "",
  });

  useEffect(() => {
    if (localStorage.getItem("rememberedEmail")) {
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev);
  };

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "", general: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.username.trim()) {
      newErrors.username = "Username or Email is required";
    }

    if (!formValues.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to check onboarding status and redirect with auto-refresh
  const checkAndRedirect = async () => {
    try {
      console.log("🔍 Checking onboarding status after login...");
      
      const response = await api.get('/employer/onboarding-status/');
      console.log("Onboarding status:", response.data);

      const { has_company_profile, has_verification, verification_status } = response.data;

      if (!has_company_profile) {
        navigate('/Job-portal/Employer/about-your-company', {
          replace: true,
          state: { fromSignup: false, fromLoginRedirect: true }
        });
      } else if (!has_verification) {
        navigate('/Job-portal/Employer/about-your-company/company-verification', {
          replace: true,
          state: { fromLoginRedirect: true }
        });
      } else if (verification_status === 'rejected') {
        navigate('/Job-portal/Employer/about-your-company/company-verification', {
          replace: true,
          state: { fromLoginRedirect: true, rejected: true }
        });
      } else {
        // ✅ Add justLoggedIn: true to trigger auto-refresh in dashboard
        setTimeout(() => {
          navigate('/Job-portal/employer/dashboard', { 
            replace: true,
            state: { justLoggedIn: true }
          });
        }, 100);
      }
    } catch (error) {
      console.error("Error checking status:", error);
      // ✅ Add justLoggedIn: true to trigger auto-refresh in dashboard
      navigate('/Job-portal/employer/dashboard', { 
        replace: true,
        state: { justLoggedIn: true }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const isEmail = formValues.username.includes('@');
      const loginData = isEmail
        ? { email: formValues.username, password: formValues.password }
        : { username: formValues.username, password: formValues.password };

      const res = await api.post("/login/", loginData);

      console.log("Login response:", res.data);

      if (res.data.user.user_type !== 'employer') {
        setErrors({ general: "Please use job seeker login" });
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formValues.username);
        localStorage.setItem("rememberedPassword", formValues.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("userRole", "Employer");

      if (res.data.user_id) {
        localStorage.setItem("user_id", res.data.user_id);
      } else if (res.data.user && res.data.user.id) {
        localStorage.setItem("user_id", res.data.user.id);
      } else if (res.data.id) {
        localStorage.setItem("user_id", res.data.id);
      }

      localStorage.setItem("user_type", res.data.user.user_type);

      if (res.data.profile_id) {
        localStorage.setItem("profile_id", res.data.profile_id);
      }

      await checkAndRedirect();

    } catch (err) {
      console.error("Login error:", err);

      const newErrors = {};

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (Array.isArray(detail) && detail[0] === "jobseeker_portal") {
          newErrors.general = "Access denied. Please use the Job Seeker login.";
        } else if (detail === "jobseeker_portal") {
          newErrors.general = "Access denied. Please use the Job Seeker login.";
        }
        else if (Array.isArray(detail) && detail[0].toLowerCase().includes('password')) {
          newErrors.password = detail[0];
        }
        else if (Array.isArray(detail) && (detail[0].toLowerCase().includes('account') || detail[0].toLowerCase().includes('found'))) {
          newErrors.username = detail[0];
        }
        else if (Array.isArray(detail)) {
          newErrors.general = detail[0];
        } else if (typeof detail === 'string') {
          if (detail.toLowerCase().includes('password')) {
            newErrors.password = detail;
          } else if (detail.toLowerCase().includes('account') || detail.toLowerCase().includes('found')) {
            newErrors.username = detail;
          } else {
            newErrors.general = detail;
          }
        }
      }

      if (err.response?.data?.email) {
        newErrors.username = Array.isArray(err.response.data.email)
          ? err.response.data.email[0]
          : err.response.data.email;
      }

      if (err.response?.data?.username) {
        newErrors.username = Array.isArray(err.response.data.username)
          ? err.response.data.username[0]
          : err.response.data.username;
      }

      if (err.response?.data?.password) {
        newErrors.password = Array.isArray(err.response.data.password)
          ? err.response.data.password[0]
          : err.response.data.password;
      }

      if (err.response?.data?.non_field_errors) {
        const nonFieldError = Array.isArray(err.response.data.non_field_errors)
          ? err.response.data.non_field_errors[0]
          : err.response.data.non_field_errors;
        newErrors.general = nonFieldError;
      }

      if (Object.keys(newErrors).length === 0) {
        newErrors.general = "Invalid email or password";
      }

      setErrors(newErrors);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
          <span className="subtext">For Employers</span>
        </Link>
        <div className="header-links">
          <span className="no-account">Don’t have an account?</span>
          <Link to="/Job-portal/employer/signup" className="signup-btn">
            Create
          </Link>
          <div className="separator"></div>
          <Link
            to="/Job-portal/jobseeker/login"
            className="employer-redirect-link"
          >
            Job seekers Login
          </Link>
        </div>
      </header>

      <div className="login-body">
        <div className="login-illustration">
          <img src={manSitting} alt="Login Illustration" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login to continue</h2>

          {errors.general && (
            <span className="error-msg" style={{ color: 'red', marginBottom: '10px', display: 'block' }}>
              {errors.general}
            </span>
          )}

          <label>Username / Email</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username or email"
            value={formValues.username}
            onChange={handleForm}
            className={errors.username ? "input-error" : ""}
            disabled={loading}
          />
          {errors.username && (
            <span className="error-msg">{errors.username}</span>
          )}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordShow ? "password" : "text"}
              name="password"
              placeholder="Enter your password"
              value={formValues.password}
              onChange={handleForm}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
            />
            <span className="eye-icon" onClick={togglePasswordView}>
              <img
                src={passwordShow ? eyeHide : eye}
                className="show-icon"
                alt="toggle"
              />
            </span>
          </div>
          {errors.password && (
            <span className="error-msg">{errors.password}</span>
          )}

          <div className="form-options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
              />
              Remember me
            </label>
            <Link
              to="/Job-portal/employer/login/forgotpassword"
              className="forgot-password"
            >
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="j-login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};