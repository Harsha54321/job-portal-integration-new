import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import './Esignup.css'
import workTime from '../assets/WorkTime.png'
import eye from '../assets/show_password.png'
import eyeHide from '../assets/eye-hide.png'
import emailIcon from '../assets/icon_email_otp.png'
import mobileIcon from '../assets/icon_mobile_otp.png'
import Verified from '../assets/verified-otpimage.png'
import api from '../api/axios';

export const Esignup = () => {
  const navigate = useNavigate();
  const [passwordShow, setPasswordShow] = useState(true)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [backendError, setBackendError] = useState("")

  // OTP States
  const [showEmailOtp, setShowEmailOtp] = useState(false)
  const [showMobileOtp, setShowMobileOtp] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isMobileVerified, setIsMobileVerified] = useState(false)
  const [otpValues, setOtpValues] = useState({ emailOtp: "", mobileOtp: "" })
  const [timer, setTimer] = useState(0);
  const [emailForOtp, setEmailForOtp] = useState("")
  const [mobileForOtp, setMobileForOtp] = useState("")


  // Add these after your existing state declarations 05/06/26
  const [isEmailOtpSending, setIsEmailOtpSending] = useState(false)
  const [isMobileOtpSending, setIsMobileOtpSending] = useState(false)
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [isMobileVerifying, setIsMobileVerifying] = useState(false)

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && (showEmailOtp || showMobileOtp)) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, showEmailOtp, showMobileOtp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [regSettings, setRegSettings] = useState({
    emailVerification: true,
    mobileVerification: false,
  });

  useEffect(() => {
    if (showEmailOtp) {
      const t = setTimeout(() => {
        document.getElementById('otp-email-0')?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [showEmailOtp]);

  useEffect(() => {
    if (showMobileOtp) {
      const t = setTimeout(() => {
        document.getElementById('otp-mobile-0')?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [showMobileOtp]);

  useEffect(() => {
    const fetchRegSettings = async () => {
      try {
        const res = await api.get("employer-registration-settings/");
        setRegSettings({
          emailVerification: res.data.email_verification,
          mobileVerification: res.data.mobile_verification,
        });
        // If email verification disabled, mark as already verified
        if (!res.data.email_verification) setIsEmailVerified(true);
        if (!res.data.mobile_verification) setIsMobileVerified(true);
      } catch (err) {
        console.error("Failed to fetch registration settings:", err);
      }
    };
    fetchRegSettings();
  }, []);

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev)
  }

  const toggleConfirmPasswordView = () => {
    setConfirmPasswordShow((prev) => !prev)
  }

  const initialValues = { companyname: "", username: "", email: "", password: "", confirmpassword: "", phone: "" }
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
    setBackendError("")
  }

  // SEND EMAIL OTP 05/06/26
  // const sendEmailOtp = async () => {
  //   const email = formValues.email;

  const sendEmailOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const email = formValues.email;

    if (!email) {
      setErrors({ ...errors, email: "Please enter email first" });
      return;
    } else if (!/^[a-zA-Z]/.test(email)) {
      setErrors({ ...errors, email: "Email must start with a letter to receive OTP" });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Please enter a valid email address" });
      return;
    }

    setIsEmailOtpSending(true);  // ← CHANGE THIS

    try {
      const response = await api.post('send-email-otp/', {
        email: email
      });

      if (response.status === 200 || response.status === 201) {
        alert(`OTP sent to ${email}`);
        setTimer(180);
        setEmailForOtp(email);
        setShowEmailOtp(true);
        setOtpValues(prev => ({ ...prev, emailOtp: "" }));

        if (response.data.otp) {
          console.log('Test OTP:', response.data.otp);
        }
      } else {
        alert(response.data.message || response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error("Send OTP error:", err);

      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message;
        if (errorMsg && errorMsg.includes('already registered')) {
          setErrors({ ...errors, email: "This email is already registered. Please login instead." });
        } else {
          alert(errorMsg || 'Failed to send OTP. Please try again.');
        }
      } else if (err.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to send OTP. Please check your connection.');
      }
    } finally {
      setIsEmailOtpSending(false);  // ← CHANGE THIS
    }
  }

  // VERIFY EMAIL OTP 05/06/26
  // const verifyEmailOtp = async () => {
  //   const code = otpValues.emailOtp;

  const verifyEmailOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const code = otpValues.emailOtp;

    if (!code || code.length !== 6) {
      alert("Please enter complete 6-digit OTP");
      return;
    }

    setIsEmailVerifying(true);  // ← CHANGE THIS

    try {
      const response = await api.post('/verify-email-otp/', {
        email: emailForOtp,
        otp: code
      });

      if (response.status === 200 || response.status === 201) {
        setIsEmailVerified(true);

        setTimeout(() => {
          setShowEmailOtp(false);
          setTimer(0);
          setOtpValues(prev => ({ ...prev, emailOtp: "" }));
        }, 1500);

        alert('Email verified successfully!');
      } else {
        alert(response.data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Verification failed. Please try again.";
      alert(errorMsg);
    } finally {
      setIsEmailVerifying(false);  // ← CHANGE THIS
    }
  }

  // SEND MOBILE OTP 05/06/26

  // const sendMobileOtp = async () => {
  //   const phone = formValues.phone;

  const sendMobileOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = formValues.phone;

    if (!phone) {
      setErrors({ ...errors, phone: "Please enter mobile number first" });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrors({ ...errors, phone: "Enter valid 10-digit mobile number" });
      return;
    }

    setIsMobileOtpSending(true);  // ← CHANGE THIS

    try {
      // If you have a mobile OTP endpoint, use it
      // const response = await api.post('send-mobile-otp/', { phone: phone });

      // For now, simulate OTP sending
      setTimeout(() => {
        alert(`OTP sent to ${phone}`);
        setTimer(180);
        setMobileForOtp(phone);
        setShowMobileOtp(true);
        setOtpValues(prev => ({ ...prev, mobileOtp: "" }));
        setIsLoading(false);
      }, 1000);

      console.log('Test OTP for mobile: 123456');

    } catch (err) {
      console.error("Send Mobile OTP error:", err);
      alert('Failed to send OTP. Please try again.');
      setIsMobileOtpSending(false);  // ← CHANGE THIS
    }
  }

  // VERIFY MOBILE OTP 05/06/26
  // const verifyMobileOtp = async () => {
  //   const code = otpValues.mobileOtp;

  const verifyMobileOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const code = otpValues.mobileOtp;

    if (!code || code.length !== 6) {
      alert("Please enter complete 6-digit OTP");
      return;
    }

    setIsMobileVerifying(true);  // ← CHANGE THIS

    try {
      // For demo purposes, accept 123456 as valid OTP
      if (code === "123456") {
        setIsMobileVerified(true);

        setTimeout(() => {
          setShowMobileOtp(false);
          setTimer(0);
          setOtpValues(prev => ({ ...prev, mobileOtp: "" }));
        }, 1500);

        alert('Mobile number verified successfully!');
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify Mobile OTP error:", err);
      alert("Verification failed. Please try again.");
    } finally {
      setIsMobileVerifying(false);  // ← CHANGE THIS
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const regexOfCompany = /^(?=.*[a-zA-Z])[a-zA-Z0-9][a-zA-Z0-9\s&.,-]{2,}$/;
    const regexOfMail = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexofUppercase = /^(?=.*[A-Z]).+$/
    const regexofNumber = /^(?=.*\d).+$/
    const regexofSpecialChar = /^(?=.*[!@#$%^&*]).+$/
    const regexofLowercase = /^(?=.*[a-z]).+$/
    const regexofUserName = /^(?=[a-zA-Z])[a-zA-Z\s]+$/  // ← FIXED: Allows spaces
    const regexofMobile = /^[6-9]\d{9}$/

    if (!formValues.companyname.trim()) {
      newErrors.companyname = "Company or Organization's name is required";
    } else if (formValues.companyname.length < 3) {
      newErrors.companyname = "Company name must be at least 3 characters";
    } else if (!regexOfCompany.test(formValues.companyname)) {
      newErrors.companyname = "Invalid Company name format (avoid special symbols like @ # $ %)";
    }

    if (!formValues.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formValues.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters"
    } else if (formValues.username.length > 20) {
      newErrors.username = "Username should not exceed 20 characters"
    } else if (!regexofUserName.test(formValues.username)) {
      newErrors.username = "Invalid username Format"
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z]/.test(formValues.email)) {
      newErrors.email = "Email must start with a letter";
    } else if (!regexOfMail.test(formValues.email)) {
      newErrors.email = "Invalid email format";
    } else if (regSettings.emailVerification && !isEmailVerified) {
      newErrors.email = "Please verify your email via OTP";
    }

    if (!formValues.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!regexofUppercase.test(formValues.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!regexofLowercase.test(formValues.password)) {  // ← ADD THIS BLOCK
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!regexofNumber.test(formValues.password)) {
      newErrors.password = "Password must contain at least one number"
    } else if (!regexofSpecialChar.test(formValues.password)) {
      newErrors.password = "Password must contain at least one special character"
    }

    if (!formValues.confirmpassword.trim()) {
      newErrors.confirmpassword = "Confirm Password is required"
    } else if (formValues.password !== formValues.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match"
    }

    if (!formValues.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!regexofMobile.test(formValues.phone)) {
      newErrors.phone = "Invalid mobile number format (10 digits required)";
    } else if (regSettings.mobileVerification && !isMobileVerified) {
      newErrors.phone = "Please verify your mobile number via OTP";
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // SIGNUP SUBMISSION
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     console.log("Validation failed");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setBackendError("");

  //   try {
  //     const response = await api.post("register/employer/", {
  //       username: formValues.username,
  //       email: formValues.email,
  //       phone: formValues.phone,
  //       password: formValues.password,
  //       password_confirm: formValues.confirmpassword,
  //     });

  //     console.log("Registration response:", response.data);

  //     if (response.status === 201 || response.status === 200) {
  //       alert("Employer account created successfully! Please complete your company profile.");
  //       console.log("Signed up successfully", formValues);

  //       // Store tokens if returned
  //       if (response.data.access && response.data.refresh) {
  //         sessionStorage.setItem("access", response.data.access);
  //         sessionStorage.setItem("refresh", response.data.refresh);
  //         sessionStorage.setItem("userType", "employer");
  //         console.log("✅ Tokens stored successfully");
  //       }

  //       // Clear form but keep verification states
  //       setFormValues(initialValues);

  //       setTimeout(() => {
  //         // navigate("/Job-portal/Employer/about-your-company");
  //         navigate("/Job-portal/Employer/about-your-company", {
  //           state: { fromSignup: true }  // ← fromSignup flag pass cheyyali
  //         });
  //       }, 2000);
  //     } else {
  //       alert("Signup failed. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Registration error:", err);
  //     const apiErrors = err.response?.data;

  //     if (apiErrors) {
  //       const newErrors = {};
  //       Object.keys(apiErrors).forEach((key) => {
  //         newErrors[key] = Array.isArray(apiErrors[key])
  //           ? apiErrors[key][0]
  //           : apiErrors[key];
  //       });
  //       setErrors(newErrors);

  //       if (apiErrors.detail) {
  //         setBackendError(apiErrors.detail);
  //       } else if (apiErrors.error) {
  //         setBackendError(apiErrors.error);
  //       }
  //     } else {
  //       setBackendError("Signup failed. Please check your connection.");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };  


  const handleSubmit = async (e) => {  // Make it async
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      console.log("Validation failed, errors set in state");
      // Explicitly scroll to the top so the user sees the error messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; // STOP execution here
    }

    // if (!validateForm()) {
    //   console.log("Validation failed");
    //   return;
    // }

    setIsLoading(true); // Add loading state

    setBackendError("");

    try {
      // Step 1: Register employer
      const registerResponse = await api.post("register/employer/", {
        username: formValues.username,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        password_confirm: formValues.confirmpassword,
      });

      console.log("Registration response:", registerResponse.data);

      if (registerResponse.status === 201) {
        console.log("Registration successful!");

        try {
          const loginResponse = await api.post("login/", {
            email: formValues.email,
            password: formValues.password,
          });

          if (loginResponse.data.access) {
            // Store tokens
            sessionStorage.setItem("access", loginResponse.data.access);
            sessionStorage.setItem("refresh", loginResponse.data.refresh);
            sessionStorage.setItem("userType", "employer");

            console.log(" Tokens stored");

            // Step 3: Navigate to About Your Company
            navigate("/Job-portal/Employer/about-your-company", {
              state: { fromSignup: true }
            });
          }

        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.detail ? "you have registered successfully,it is under account approval" : "something went wrong" || "something went wrong"

          alert(errorMessage)
        }
        // Step 2: Auto-login to get tokens

      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.error || "something went wrong"
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmployerOtpModal = (type) => {
    const isEmail = type === 'email';
    const targetValue = isEmail ? formValues.email : formValues.phone;
    const otpKey = isEmail ? "emailOtp" : "mobileOtp";
    const isCurrentlyVerified = isEmail ? isEmailVerified : isMobileVerified;

    // SUCCESS POPUP VIEW
    if (isCurrentlyVerified) {
      return (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content success-popup-content">
            <div className="verified-container">
              <img
                src={Verified}
                alt="Verified Success"
                className="verified-popup-img"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="otp-modal-overlay">
        <div className="otp-modal-content">
          <button
            className="back-arrow"
            onClick={() => {
              setTimer(0);
              setOtpValues({ ...otpValues, [otpKey]: "" });
              isEmail ? setShowEmailOtp(false) : setShowMobileOtp(false);
            }}
          >
            Back
          </button>
          <div className="otp-icon-container">
            <img src={isEmail ? emailIcon : mobileIcon} alt="Verify" className="otp-status-icon" />
          </div>
          <h3>{isEmail ? "Email Verification" : "Mobile Verification"}</h3>
          {timer > 0 ? (
            <>
              <p>We've sent a code to <strong>{targetValue}</strong>. Please enter it below.</p>

              <div className="otp-input-group">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-${type}-${index}`}
                    maxLength="1"
                    value={otpValues[otpKey]?.[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9]$/.test(val) || val === "") {
                        const newOtpArray = (otpValues[otpKey] || "").split("");
                        newOtpArray[index] = val;
                        const combinedOtp = newOtpArray.join("");

                        setOtpValues({ ...otpValues, [otpKey]: combinedOtp });

                        if (val && index < 5) {
                          document.getElementById(`otp-${type}-${index + 1}`).focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValues[otpKey]?.[index] && index > 0) {
                        document.getElementById(`otp-${type}-${index - 1}`).focus();
                      }
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentOtp = otpValues[otpKey] || "";
                        if (currentOtp.length === 6) {
                          isEmail ? verifyEmailOtp(e) : verifyMobileOtp(e);
                        }
                      }
                    }}
                  />
                ))}
              </div>

              <div className="resend-timer">
                Did not receive code?{' '}
                <span
                  className="resend-link"
                  style={{ cursor: 'pointer', color: '#0081FF', fontWeight: 'bold' }}
                  onClick={(e) => isEmail ? sendEmailOtp(e) : sendMobileOtp(e)}                >
                  Resend OTP
                </span>
                {timer > 0 && <span> in {formatTime(timer)}</span>}
              </div>

              <button
                type="button"
                className="verify-final-btn"
                onClick={(e) => isEmail ? verifyEmailOtp(e) : verifyMobileOtp(e)} disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </>
          ) : (
            <div className="expired-state">
              <p className="error-msg-otp">OTP Session Expired</p>
              <p>The verification code is no longer valid. Please request a new one.</p>
              <button
                type="button"
                className="verify-final-btn"
                onClick={(e) => isEmail ? sendEmailOtp(e) : sendMobileOtp(e)} disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend New OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="j-sign-up-page">
      {/* OTP Modals */}
      {showEmailOtp && renderEmployerOtpModal('email')}
      {showMobileOtp && renderEmployerOtpModal('mobile')}

      <header className="j-sign-up-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
          <span className='subtext'>For Employers</span>
        </Link>
        <div className="j-sign-up-header-links">
          <span className="no-account">Already have an account?</span>

          <Link to="/Job-portal/employer/login" className="signup-btn">
            Login
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="header-back-btn"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="j-sign-up-body">
        <div className="signup-illustration">
          <img src={workTime} alt="Signup Illustration" />
        </div>

        {/* Backend Error Display */}
        {backendError && (
          <div className="backend-error" style={{
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="j-sign-up-form">
          <h2>Create an employer account</h2>

          <label>Company name</label>
          <input
            type="text"
            name="companyname"
            maxLength="80"
            value={formValues.companyname}
            onChange={handleForm}
            placeholder="Enter your Company name or Organization's name"
            className={errors.companyname ? "input-error" : ""}
            disabled={isLoading}
          />
          {errors.companyname && <span className="error-msg">{errors.companyname}</span>}

          <label>User name</label>
          <input
            type="text"
            name="username"
            value={formValues.username}
            onChange={handleForm}
            placeholder="Create your Username"
            className={errors.username ? "input-error" : ""}
            disabled={isLoading}
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}

          <label>Email ID</label>
          <div className="input-container">
            <input
              type="text"
              name="email"
              value={formValues.email}
              onChange={handleForm}
              placeholder="Enter Company Email"
              className={errors.email ? "input-error" : ""}
              disabled={(regSettings.emailVerification && isEmailVerified) || isLoading}
            />
            {regSettings.emailVerification && !isEmailVerified && formValues.email.length > 0 && (
              // <button 05/06/26
              //   type="button"
              //   className="jsignup-small-verify-btn"
              //   onClick={sendEmailOtp}
              //   disabled={isLoading}
              // >

              <button
                type="button"
                className="jsignup-small-verify-btn"
                onClick={(e) => sendEmailOtp(e)}
                disabled={isEmailOtpSending || isEmailVerified}  // ← CHANGE THIS
              >

                {isEmailOtpSending ? "Sending..." : "Verify"}

              </button>
            )}
            {regSettings.emailVerification && isEmailVerified && (<span className="verified-badge">✓ Verified</span>)}
          </div>
          {errors.email && <span className="error-msg">{errors.email}</span>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordShow ? "password" : "text"}
              name="password"
              value={formValues.password}
              onChange={handleForm}
              placeholder="Create a new password"
              className={errors.password ? "input-error" : ""}
              disabled={isLoading}
            />
            <span className="eye-icon" onClick={togglePasswordView}>
              <img src={passwordShow ? eyeHide : eye} className='show-icon' alt='show' />
            </span>
          </div>
          {errors.password && <span className="error-msg">{errors.password}</span>}

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={confirmPasswordShow ? "password" : "text"}
              name="confirmpassword"
              value={formValues.confirmpassword}
              onChange={handleForm}
              placeholder="Confirm password"
              className={errors.confirmpassword ? "input-error" : ""}
              disabled={isLoading}
            />
            <span className="eye-icon" onClick={toggleConfirmPasswordView}>
              <img src={confirmPasswordShow ? eyeHide : eye} className='show-icon' alt='show' />
            </span>
          </div>
          {errors.confirmpassword && <span className="error-msg">{errors.confirmpassword}</span>}

          <label>Mobile number</label>
          <div className="input-container">
            <input
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const validatedValue = /^[6-9]/.test(rawValue) ? rawValue : "";

                setFormValues({ ...formValues, phone: validatedValue.slice(0, 10) });
                setErrors({ ...errors, phone: "" });
              }}
              placeholder="Enter mobile number"
              className={errors.phone ? "input-error" : ""}
              disabled={(regSettings.mobileVerification && isMobileVerified) || isLoading}
            />

            {regSettings.mobileVerification && !isMobileVerified && formValues.phone.length === 10 && (
              // <button 05/06/26
              //   type="button"
              //   className="jsignup-small-verify-btn"
              //   onClick={sendMobileOtp}
              //   disabled={isLoading}
              // >

              <button
                type="button"
                className="jsignup-small-verify-btn"
                onClick={(e) => sendMobileOtp(e)}
                disabled={isMobileOtpSending || isMobileVerified}  // ← CHANGE THIS
              >

                {isMobileOtpSending ? "Sending..." : "Verify"}
              </button>
            )}

            {regSettings.mobileVerification && isMobileVerified && (
              <span className="verified-badge">✓ Verified</span>
            )}
          </div>
          {errors.phone && <span className="error-msg">{errors.phone}</span>}

          <button
            type="submit"
            className="j-sign-up-submit"
            // disabled={
            //   (regSettings.emailVerification && !isEmailVerified) ||
            //   (regSettings.mobileVerification && !isMobileVerified) ||
            //   isLoading
            // }
          disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
