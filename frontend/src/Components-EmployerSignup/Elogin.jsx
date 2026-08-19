import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import manSitting from "../assets/Illustration_1.png";
import eye from "../assets/show_password.png";
import eyeHide from "../assets/eye-hide.png";
import "./Elogin.css";
import { requestAndRegisterNotificationPermission } from "../firebaseTokenHandler";

export const Elogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const savedEmail = sessionStorage.getItem("rememberedEmail");
  // const savedPassword = sessionStorage.getItem("rememberedPassword");
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

  // useEffect(() => {
  //   if (sessionStorage.getItem("rememberedEmail")) {
  //     setRememberMe(true);
  //   }
  // }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail) {
      setFormValues({
        username: savedEmail || "",
        password: savedPassword || "",
      });
      setRememberMe(true);
    }
  }, []);

  // const handleRememberMeChange = (e) => {
  //   setRememberMe(e.target.checked);
  // };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }
  };

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev);
  };

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "", general: "" });
  };

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Password validation - at least 6 characters
  const validatePassword = (password) => {
    return password && password.trim().length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    // Username/Email validation - accept both
    if (!formValues.username.trim()) {
      newErrors.username = "Username or Email is required";
    } else {
      const input = formValues.username.trim();
      // Check if it's an email (contains @) or username
      const isEmail = input.includes('@');

      if (isEmail) {
        // Validate as email
        if (!validateEmail(input)) {
          newErrors.username = "Please enter a valid email address";
        }
      }
    }

    // Password validation
    if (!formValues.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formValues.password)) {
      newErrors.password = "Password must be at least 6 characters";
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
        return;
      }

      if (!has_verification || verification_status === 'rejected') {
        navigate('/Job-portal/Employer/about-your-company/company-verification', {
          replace: true,
          state: { fromLoginRedirect: true, rejected: verification_status === 'rejected' }
        });
        return;
      }

      const intendedPath = location.state?.intendedPath || '/Job-portal/employer/dashboard';
      const targetTab = location.state?.targetTab || 'Dashboard';
      const fromFooter = location.state?.fromFooter || false;

      setTimeout(() => {
        navigate(intendedPath, {
          replace: true,
          state: {
            justLoggedIn: true,
            fromFooter: fromFooter,
            targetTab: targetTab
          }
        });
      }, 100);

    } catch (error) {
      console.error("Error checking status, falling back:", error);

      const intendedPath = location.state?.intendedPath || '/Job-portal/employer/dashboard';
      const targetTab = location.state?.targetTab || 'Dashboard';

      navigate(intendedPath, {
        replace: true,
        state: { justLoggedIn: true, targetTab: targetTab }
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
        setErrors({
          username: "Invalid credentials. This login is only for Employer users."
        });
        setLoading(false);
        return;
      }

      // if (rememberMe) {
      //   sessionStorage.setItem("rememberedEmail", formValues.username);
      //   sessionStorage.setItem("rememberedPassword", formValues.password);
      // } else {
      //   sessionStorage.removeItem("rememberedEmail");
      //   sessionStorage.removeItem("rememberedPassword");
      // }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formValues.username);
        localStorage.setItem("rememberedPassword", formValues.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // ✅ First store ALL tokens
      sessionStorage.setItem("access", res.data.access);
      sessionStorage.setItem("refresh", res.data.refresh);
      sessionStorage.setItem("userRole", "Employer");

      if (res.data.user_id) {
        sessionStorage.setItem("user_id", res.data.user_id);
      } else if (res.data.user && res.data.user.id) {
        sessionStorage.setItem("user_id", res.data.user.id);
      } else if (res.data.id) {
        sessionStorage.setItem("user_id", res.data.id);
      }

      sessionStorage.setItem("user_type", res.data.user.user_type);

      if (res.data.profile_id) {
        sessionStorage.setItem("profile_id", res.data.profile_id);
      }

      // ✅ IMPORTANT: Wait a moment for tokens to be fully stored
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ Now register FCM token with proper authentication
      try {
        console.log("📱 Registering FCM token after login...");
        await requestAndRegisterNotificationPermission();
      } catch (fcmError) {
        // Non-critical - don't block login flow
        console.warn("⚠️ FCM registration failed but login successful:", fcmError);
      }

      // ✅ Now check onboarding and redirect
      await checkAndRedirect();

    } catch (err) {
      console.error("Login error:", err);

      const newErrors = {};
      const errorData = err.response?.data;

      // 🔥 CRITICAL FIX: Check for user_type mismatch first
      if (errorData?.user && errorData.user.user_type !== 'employer') {
        newErrors.username = "Invalid credentials. This login is only for Employer users.";
      }
      // Check for user_type in response data
      else if (errorData?.user_type && errorData.user_type !== 'employer') {
        newErrors.username = "Invalid credentials. This login is only for Employer users.";
      }
      else if (err.response?.status === 401) {
        const errorMessage = errorData?.detail || errorData?.message || "";

        if (errorMessage && (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("incorrect"))) {
          newErrors.password = "Incorrect password. Please try again.";
        } else if (errorMessage && (errorMessage.toLowerCase().includes("no account") || errorMessage.toLowerCase().includes("not found"))) {
          newErrors.username = "No account found with this email address or username.";
        } else if (errorMessage && errorMessage.toLowerCase().includes("employer")) {
          newErrors.username = "Invalid credentials. This login is only for Employer users.";
        } else {
          newErrors.password = "Incorrect password. Please try again.";
        }
      }
      else if (err.response?.status === 400) {
        if (errorData?.detail) {
          const detail = errorData.detail;
          const detailStr = Array.isArray(detail) ? detail[0] : detail;

          if (detailStr && detailStr.toLowerCase().includes("password") && detailStr.toLowerCase().includes("incorrect")) {
            newErrors.password = "Incorrect password. Please try again.";
          }
          else if (detailStr && (detailStr.toLowerCase().includes("no account") || detailStr.toLowerCase().includes("not found"))) {
            newErrors.username = "No account found with this email address or username.";
          }
          else if (detailStr && (detailStr.toLowerCase().includes("jobseeker") || detailStr.toLowerCase().includes("employer"))) {
            // Check which user type is mentioned in error
            if (detailStr.toLowerCase().includes("employer")) {
              newErrors.username = "Invalid credentials. This login is only for Employer users.";
            } else if (detailStr.toLowerCase().includes("jobseeker")) {
              newErrors.username = "Invalid credentials. This login is only for Employer users.";
            } else {
              newErrors.username = "Invalid credentials. This login is only for Employer users.";
            }
          }
          else {
            newErrors.general = detailStr;
          }
        }
        else if (errorData?.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
          if (errorMsg && errorMsg.toLowerCase().includes("password")) {
            newErrors.password = "Incorrect password. Please try again.";
          } else if (errorMsg && (errorMsg.toLowerCase().includes("account") || errorMsg.toLowerCase().includes("found"))) {
            newErrors.username = "No account found with this email address or username.";
          } else if (errorMsg && (errorMsg.toLowerCase().includes("employer") || errorMsg.toLowerCase().includes("jobseeker"))) {
            newErrors.username = "Invalid credentials. This login is only for Employer users.";
          } else {
            newErrors.general = errorMsg;
          }
        }
        else if (errorData?.email) {
          const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
          newErrors.username = emailError;
        }
        else if (errorData?.password) {
          const passwordError = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
          newErrors.password = passwordError;
        }
        else {
          newErrors.general = "Invalid email or password";
        }
      }
      // Handle 404 - User not found
      else if (err.response?.status === 404) {
        newErrors.username = "No account found with this email address or username.";
      }
      else {
        newErrors.general = "Something went wrong. Please try again.";
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
        <div className="login-header-actions">
          <span className="no-account">Don’t have an account?</span>
          <Link to="/Job-portal/employer/signup" className="signup-btn">Create</Link>
          <Link to="/Job-portal/role-selection" className="login-header-back-btn">← Back</Link>
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
          {errors.username && <span className="error-msg">{errors.username}</span>}

          <label>Password</label>
          <div className="login-password-wrapper">
            <input
              type={passwordShow ? "password" : "text"}
              name="password"
              placeholder="Enter your password"
              value={formValues.password}
              onChange={handleForm}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
            />
            <span className="login-eye-icon" onClick={togglePasswordView}>
              <img src={passwordShow ? eyeHide : eye} className="show-icon" alt="toggle" />
            </span>
          </div>
          {errors.password && <span className="error-msg">{errors.password}</span>}

          <div className="form-options">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            <Link to="/Job-portal/employer/login/forgotpassword" className="forgot-password">
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