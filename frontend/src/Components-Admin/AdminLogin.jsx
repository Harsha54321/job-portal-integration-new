import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import manSitting from '../assets/Illustration_1.png';
import eye from '../assets/show_password.png';
import eyeHide from '../assets/eye-hide.png';
import './AdminLogin.css'
import api from '../api/axios';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [passwordShow, setPasswordShow] = useState(true);
    const [formValues, setFormValues] = useState({ adminID: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // ========== 2FA STATE VARIABLES ==========
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [tempToken, setTempToken] = useState("");
    const [userId, setUserId] = useState(null);
    const [availableMethods, setAvailableMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent for current method
    const [isSendingOTP, setIsSendingOTP] = useState(false); // Loading state for send OTP button
    const otpInputRef = useRef(null);
    // =================================================

    // useEffect(() => {
    //     const savedRemember = sessionStorage.getItem("admin_remember_me") === "true";
    //     if (savedRemember) {
    //         const savedAdminID = sessionStorage.getItem("admin_saved_id") || "";
    //         const savedPassword = sessionStorage.getItem("admin_saved_password") || "";
    //         setFormValues({ adminID: savedAdminID, password: savedPassword });
    //         setRememberMe(true);
    //     }
    // }, []);

    useEffect(() => {
        const savedRemember = localStorage.getItem("admin_remember_me") === "true";
        if (savedRemember) {
            const savedAdminID = localStorage.getItem("admin_saved_id") || "";
            const savedPassword = localStorage.getItem("admin_saved_password") || "";
            setFormValues({ adminID: savedAdminID, password: savedPassword });
            setRememberMe(true);
        }
    }, []);

    // Countdown timer for OTP resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const togglePasswordView = () => {
        setPasswordShow((prev) => !prev);
    };

    const handleForm = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setErrors({ ...errors, [name]: "" });
        setServerError("");
    };

    useEffect(() => {
        if (showOTPModal && otpSent) {
            const t = setTimeout(() => {
                otpInputRef.current?.focus();
            }, 150);
            return () => clearTimeout(t);
        }
    }, [showOTPModal, otpSent]);

    // const handleRememberMe = (e) => {
    //     const checked = e.target.checked;
    //     setRememberMe(checked);
    //     if (!checked) {
    //         sessionStorage.removeItem("admin_remember_me");
    //         sessionStorage.removeItem("admin_saved_id");
    //         sessionStorage.removeItem("admin_saved_password");
    //     }
    // };

    const handleRememberMe = (e) => {
        const checked = e.target.checked;
        setRememberMe(checked);
        if (!checked) {
            localStorage.removeItem("admin_remember_me");
            localStorage.removeItem("admin_saved_id");
            localStorage.removeItem("admin_saved_password");
        }
    };

    // ========== 2FA FUNCTIONS ==========

    // Send OTP for selected method (called when user clicks "Send OTP" or switches method)
    const sendOTPForMethod = async (method) => {
        if (!method) {
            setOtpError("Please select a verification method first");
            return;
        }

        setIsSendingOTP(true);
        setOtpError("");

        try {
            const response = await api.post('admin/login/send-otp/', {
                method: method,
                temp_token: tempToken,
            });

            if (response.data?.success) {
                setOtpSent(true);
                setCanResend(false);
                setCountdown(60);
                setOtpError(""); // Clear any previous errors
                console.log(`OTP sent to ${method} successfully`);
            } else {
                setOtpError(response.data?.message || `Failed to send OTP to ${method}`);
                setOtpSent(false);
            }
        } catch (error) {
            console.error("Send OTP error:", error);
            setOtpError(error?.response?.data?.message || `Failed to send OTP to ${method}`);
            setOtpSent(false);
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Resend OTP for 2FA
    const handleResendOTP = async () => {
        if (!canResend) return;
        await sendOTPForMethod(selectedMethod);
    };

    // Close OTP modal and reset state
    const handleCloseOTPModal = () => {
        setShowOTPModal(false);
        setOtpValue("");
        setOtpError("");
        setTempToken("");
        setUserId(null);
        setAvailableMethods([]);
        setSelectedMethod("");
        setIs2FALoading(false);
        setOtpSent(false);
        setCanResend(true);
        setCountdown(0);
    };

    // Verify OTP and complete login
    const handleVerifyOTP = async () => {
        if (!otpValue || otpValue.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }

        if (!selectedMethod) {
            setOtpError("Please select a verification method");
            return;
        }

        if (!otpSent) {
            setOtpError("Please send OTP first by clicking the 'Send OTP' button");
            return;
        }

        setIs2FALoading(true);
        setOtpError("");

        try {
            const response = await api.post('admin-2fa/login/verify-otp/', {
                temp_token: tempToken,
                otp: otpValue,
                method: selectedMethod
            });

            if (response.data?.success && response.data?.access) {
                // Store tokens
                sessionStorage.setItem("access", response.data.access);
                sessionStorage.setItem("refresh", response.data.refresh);
                sessionStorage.setItem("user_type", response.data.user?.user_type || "admin");
                sessionStorage.setItem("admin_id", response.data.user?.id || formValues.adminID);
                sessionStorage.setItem('token', response.data.access);
                sessionStorage.setItem('access_token', response.data.access);

                // Handle remember me
                // if (rememberMe) {
                //     sessionStorage.setItem("admin_remember_me", "true");
                //     sessionStorage.setItem("admin_saved_id", formValues.adminID);
                //     sessionStorage.setItem("admin_saved_password", formValues.password);
                // } else {
                //     sessionStorage.removeItem("admin_remember_me");
                //     sessionStorage.removeItem("admin_saved_id");
                //     sessionStorage.removeItem("admin_saved_password");
                // }

                if (rememberMe) {
                    localStorage.setItem("admin_remember_me", "true");
                    localStorage.setItem("admin_saved_id", formValues.adminID);
                    localStorage.setItem("admin_saved_password", formValues.password);
                } else {
                    localStorage.removeItem("admin_remember_me");
                    localStorage.removeItem("admin_saved_id");
                    localStorage.removeItem("admin_saved_password");
                }

                // Close modal and navigate
                handleCloseOTPModal();
                navigate("/Job-portal/admin/dashboard");
            } else {
                setOtpError(response.data?.message || "OTP verification failed");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            const message = error.response?.data?.message ||
                error.response?.data?.detail ||
                "Invalid OTP. Please try again.";
            setOtpError(message);
        } finally {
            setIs2FALoading(false);
        }
    };

    // Handle method selection change (does NOT auto-send OTP)
    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        setOtpValue(""); // Clear previous OTP
        setOtpError(""); // Clear previous errors
        setOtpSent(false); // Reset OTP sent status for new method
        // Do NOT auto-send OTP - user must click Send OTP button
    };

    // =============================================
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
        if (!formValues.adminID.trim()) {
            newErrors.adminID = "Admin ID or Email is required";
        } else if (!validateEmail(formValues.adminID)) {
            newErrors.adminID = "Please enter a valid email address";
        }
        if (!formValues.password.trim()) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(formValues.password)) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setServerError("");
        setErrors({});

        try {
            const response = await api.post('admin-login/', {
                email: formValues.adminID,
                password: formValues.password
            });

            if (response.data?.requires_2fa === true) {
                setTempToken(response.data.temp_token);
                setUserId(response.data.user_id);
                setAvailableMethods(response.data.available_methods || []);

                const defaultMethod = response.data.default_method ||
                    (response.data.available_methods?.[0]) ||
                    "email";
                setSelectedMethod(defaultMethod);

                // IMPORTANT: DO NOT send OTP automatically
                // User must manually click "Send OTP" button
                setOtpSent(false);
                setCanResend(true);
                setCountdown(0);

                setShowOTPModal(true);
                setIsLoading(false);
                return;
            }

            if (response.data.access) {
                sessionStorage.setItem("access", response.data.access);
                sessionStorage.setItem("refresh", response.data.refresh);
                sessionStorage.setItem("user_type", response.data.user?.user_type || "admin");
                sessionStorage.setItem("admin_id", response.data.user?.id || formValues.adminID);
                sessionStorage.setItem('token', response.data.access);
                sessionStorage.setItem('access_token', response.data.access);

                // if (rememberMe) {
                //     sessionStorage.setItem("admin_remember_me", "true");
                //     sessionStorage.setItem("admin_saved_id", formValues.adminID);
                //     sessionStorage.setItem("admin_saved_password", formValues.password);
                // } else {
                //     sessionStorage.removeItem("admin_remember_me");
                //     sessionStorage.removeItem("admin_saved_id");
                //     sessionStorage.removeItem("admin_saved_password");
                // }

                if (rememberMe) {
                    localStorage.setItem("admin_remember_me", "true");
                    localStorage.setItem("admin_saved_id", formValues.adminID);
                    localStorage.setItem("admin_saved_password", formValues.password);
                } else {
                    localStorage.removeItem("admin_remember_me");
                    localStorage.removeItem("admin_saved_id");
                    localStorage.removeItem("admin_saved_password");
                }
                navigate("/Job-portal/admin/dashboard");
            } else {
                setServerError(response.data.message || "Login failed");
            }
        } catch (error) {
            console.error("Admin login error:", error);
            if (!error.response) {
                setServerError("Network error. Please check your connection.");
            } else {
                const status = error.response.status;
                const errorData = error.response?.data;

                // Check if it's a non-admin user trying to login
                if (errorData?.errors?.email && errorData.errors.email.includes("does not have admin access")) {
                    setErrors({
                        adminID: "Invalid credentials. This login is only for Admin users."
                    });
                }
                // Check for "No account found" error
                else if (errorData?.errors?.email && errorData.errors.email.includes("No account found")) {
                    setErrors({
                        adminID: "No account found with this email address."
                    });
                }
                // Check for incorrect password
                else if (errorData?.errors?.password && errorData.errors.password.includes("Incorrect password")) {
                    setErrors({
                        password: "Incorrect password. Please try again."
                    });
                }
                // Check for account disabled
                else if (errorData?.errors?.email && errorData.errors.email.includes("disabled")) {
                    setErrors({
                        adminID: "This account is disabled. Please contact support."
                    });
                }
                // Handle other error formats
                else {
                    const message = errorData?.detail ||
                        errorData?.message ||
                        errorData?.non_field_errors?.[0] ||
                        errorData?.username?.[0] ||
                        errorData?.password?.[0] ||
                        errorData?.email?.[0] ||
                        null;

                    if (message) {
                        // Try to determine which field the error belongs to
                        if (message.toLowerCase().includes('password')) {
                            setErrors({ password: message });
                        } else if (message.toLowerCase().includes('email') || message.toLowerCase().includes('account') || message.toLowerCase().includes('found')) {
                            setErrors({ adminID: message });
                        } else {
                            setErrors({ adminID: message });
                        }
                    } else if (status === 400) {
                        setErrors({ adminID: "Invalid input. Please check your credentials." });
                    } else if (status === 401) {
                        setErrors({ password: "Invalid Admin ID or Password." });
                    } else if (status === 403) {
                        setErrors({ adminID: "Access denied. You are not authorized." });
                    } else if (status === 404) {
                        setServerError("Login service not found. Contact support.");
                    } else if (status === 500) {
                        setServerError("Server error. Please try again later.");
                    } else {
                        setErrors({ adminID: message || "Something went wrong. Please try again." });
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <Link to="/" className="logo">
                    <span className="logo-text">Job portal</span>
                    <span className='subtext'> For Administrator</span>
                </Link>
                <div className="login-header-actions">
                    <Link to="/Job-portal/role-selection" className="login-header-back-btn">
                        ← Back
                    </Link>
                </div>
            </header>

            <div className="Admin-Login-Module">
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-login-title-row">
                        <h2>Login as Administrator</h2>
                    </div>

                    <p style={{ color: '#666', textAlign: "center", fontSize: '14px' }}>Login to manage users and postings</p>
                    {serverError && (
                        <div className="server-error" style={{
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {serverError}
                        </div>
                    )}
                    <label>Admin ID / Email</label>
                    <input
                        type="text"
                        name="adminID"
                        placeholder="Enter Admin ID or Email"
                        value={formValues.adminID}
                        onChange={handleForm}
                        className={errors.adminID ? "input-error" : ""}
                    />
                    {errors.adminID && <span className="error-msg">{errors.adminID}</span>}

                    <label>Password</label>
                    <div className="login-password-wrapper">
                        <input
                            type={passwordShow ? "password" : "text"}
                            placeholder="Enter your password"
                            name='password'
                            value={formValues.password}
                            onChange={handleForm}
                            className={errors.password ? "input-error" : ""}
                        />
                        <span className="login-eye-icon" onClick={togglePasswordView}>
                            <img src={passwordShow ? eyeHide : eye} className='show-icon' alt='toggle' />
                        </span>
                    </div>
                    {errors.password && <span className="error-msg">{errors.password}</span>}

                    <div className="form-options">
                        <label className="remember-me-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={handleRememberMe}
                            />
                            <span>Remember me</span>

                        </label>
                        <Link to="/Job-portal/admin/login/forgotpassword" className="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>

                    <button style={{ marginBottom: "10px" }} type="submit" className="j-login-btn" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Admin Login"}
                    </button>
                </form>
            </div>

            {/* ========== 2FA OTP MODAL (UPDATED) ========== */}
            {showOTPModal && (
                <div className="otp-modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="otp-modal-content" style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h2 style={{ marginBottom: '10px', color: '#333' }}>Two-Factor Authentication</h2>
                        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                            Please verify your identity to complete login
                        </p>

                        {/* Method Selection with Send OTP Button */}
                        <div className="2fa-method-selector" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                                Select Verification Method:
                            </label>

                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {availableMethods.includes('email') && (
                                        <button
                                            type="button"
                                            onClick={() => handleMethodChange('email')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: selectedMethod === 'email' ? '2px solid #2563eb' : '1px solid #ddd',
                                                backgroundColor: selectedMethod === 'email' ? '#eff6ff' : 'white',
                                                color: selectedMethod === 'email' ? '#2563eb' : '#666',
                                                cursor: 'pointer',
                                                fontWeight: selectedMethod === 'email' ? '600' : '400',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            📧 Email
                                        </button>
                                    )}
                                    {availableMethods.includes('sms') && (
                                        <button
                                            type="button"
                                            onClick={() => handleMethodChange('sms')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: selectedMethod === 'sms' ? '2px solid #2563eb' : '1px solid #ddd',
                                                backgroundColor: selectedMethod === 'sms' ? '#eff6ff' : 'white',
                                                color: selectedMethod === 'sms' ? '#2563eb' : '#666',
                                                cursor: 'pointer',
                                                fontWeight: selectedMethod === 'sms' ? '600' : '400',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            📱 SMS
                                        </button>
                                    )}
                                </div>

                                {/* Send OTP Button - appears after method selection */}
                                {selectedMethod && (
                                    <button
                                        type="button"
                                        onClick={() => sendOTPForMethod(selectedMethod)}
                                        disabled={isSendingOTP || (otpSent && !canResend)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: (isSendingOTP || (otpSent && !canResend)) ? '#ccc' : '#10b981',
                                            color: 'white',
                                            cursor: (isSendingOTP || (otpSent && !canResend)) ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            marginTop: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isSendingOTP ? 'Sending...' : otpSent ? 'Resend OTP' : `Send OTP via ${selectedMethod === 'email' ? 'Email' : 'SMS'}`}
                                    </button>
                                )}
                            </div>

                            {/* Show OTP sent confirmation */}
                            {otpSent && selectedMethod && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '8px',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    color: '#065f46'
                                }}>
                                    ✓ OTP has been sent to your {selectedMethod === 'email' ? 'email address' : 'phone number'}
                                </div>
                            )}
                        </div>

                        {/* OTP Input */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                                Enter Verification Code
                            </label>
                            <input
                                type="text"
                                ref={otpInputRef}
                                value={otpValue}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtpValue(value);
                                    setOtpError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (otpValue.length === 6 && otpSent && !is2FALoading) {
                                            handleVerifyOTP();
                                        }
                                    }
                                }}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                disabled={!otpSent}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '18px',
                                    textAlign: 'center',
                                    letterSpacing: '4px',
                                    border: otpError ? '1px solid #dc3545' : '1px solid #ddd',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    backgroundColor: !otpSent ? '#f5f5f5' : 'white'
                                }}
                                autoFocus
                            />
                            {otpError && (
                                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                                    {otpError}
                                </p>
                            )}
                            {!otpSent && selectedMethod && (
                                <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '5px' }}>
                                    ⚠️ Please click "Send OTP" button to receive verification code
                                </p>
                            )}
                        </div>

                        {/* Resend OTP Link - Only show if OTP already sent */}
                        {otpSent && (
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={!canResend || isSendingOTP}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: canResend ? '#2563eb' : '#999',
                                        cursor: canResend ? 'pointer' : 'not-allowed',
                                        fontSize: '14px'
                                    }}
                                >
                                    {canResend ? 'Didn\'t receive OTP? Resend' : `Resend available in ${countdown}s`}
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={handleCloseOTPModal}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={is2FALoading || !otpValue || otpValue.length !== 6 || !otpSent}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: (is2FALoading || !otpValue || otpValue.length !== 6 || !otpSent) ? '#ccc' : '#2563eb',
                                    color: 'white',
                                    cursor: (is2FALoading || !otpValue || otpValue.length !== 6 || !otpSent) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {is2FALoading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ========================================== */}
        </div>
    );
};