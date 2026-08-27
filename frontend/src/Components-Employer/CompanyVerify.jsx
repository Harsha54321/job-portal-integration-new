import React, { useState, useEffect } from "react";
import { Footer } from "../Components-LandingPage/Footer";
import fileIcon from "../assets/Employer/fileIcon.png";
import "./CompanyVerify.css";
import { EHeader } from "./EHeader";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import emailIcon from '../assets/icon_email_otp.png';
import mobileIcon from '../assets/icon_mobile_otp.png';
import Verified from '../assets/verified-otpimage.png';
import { useLocation } from "react-router-dom";
import uploadIcon from "../assets/UploadIcon.png";

export const CompanyVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Loading states ──
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isMobileLoading, setIsMobileLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [blockedByAdmin, setBlockedByAdmin] = useState(false);

  const isFirstTime = location.state?.fromCompanyProfile === true;
  const employerEmail = location.state?.employerEmail || "";

  // ── OTP STATES ──
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpValues, setOtpValues] = useState({ emailOtp: "", mobileOtp: "" });
  const [timer, setTimer] = useState(0);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [mobileForOtp, setMobileForOtp] = useState("");
  const [errors, setErrors] = useState({});

  // ── Upload visibility toggles ──
  const [showRegUpload, setShowRegUpload] = useState(false);
  const [showTaxUpload, setShowTaxUpload] = useState(false);

  const [formData, setFormData] = useState({
    legalName: "",
    registrationNumber: "",
    registrationFile: null,
    taxId: "",
    taxFile: null,
    websiteUrl: "",
    officialEmail: "",
    phoneNumber: "",
  });

  // ── Timer logic ──
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => { setTimer((prev) => prev - 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Handle form changes ──
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ""
    }));

    setBackendError("");
    setBlockedByAdmin(false);

    if (files) {
      const file = files[0];
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      // if (file && !allowedTypes.includes(file.type)) {
      //   alert("Only PDF, JPG, JPEG, and PNG files are allowed!");
      //   return;
      // }

      // const maxSize = 5 * 1024 * 1024;
      // if (file && file.size > maxSize) {
      //   alert("File size exceeds 5 MB. Please upload a smaller file.");
      //   return;
      // }

      //       if (file && !allowedTypes.includes(file.type)) {
      //   setErrors(prev => ({ ...prev, incorporationCertificate: "Only PDF, JPG, JPEG, and PNG files are allowed!" }));
      //   return;
      // }

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [name]: "Unsupported file format. Allowed: PDF, JPG, PNG, GIF, WEBP, DOC, DOCX." }));
        return;
      }

      //       const maxSize = 5 * 1024 * 1024;
      // if (file && file.size > maxSize) {
      //   setErrors(prev => ({ ...prev, incorporationCertificate: "File size exceeds 5 MB. Please upload a smaller file." }));
      //   return;
      // }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [name]: "File size exceeds 5 MB. Please upload a smaller file." }));
        return;
      }

      setFormData({ ...formData, [name]: file });
    } else {
      let val = value;

      if (name === "registrationNumber") {
        val = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 21);
      } else if (name === "taxId") {
        val = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
      } else if (name === "phoneNumber") {
        val = value.replace(/\D/g, "").slice(0, 10);
      }

      setFormData({ ...formData, [name]: val });
    }
  };

  const removeFile = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    const input = document.getElementById(fieldName);
    if (input) input.value = "";
  };

  // ── Validate form ──
  const validateForm = () => {
    const newErrors = {};

    const companyRegex = /^[a-zA-Z][a-zA-Z0-9\s&.,-]{2,99}$/;
    const urlRegex = /^(https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/;
    const regPattern = /^[a-zA-Z](?=.*[0-9])[a-zA-Z0-9]{4,20}$/;
    const smartTaxRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,15}$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const regexOfMail = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.legalName.trim()) {
      newErrors.legalName = "Company Legal Name is required";
    } else if (!companyRegex.test(formData.legalName)) {
      newErrors.legalName = "Must start with a letter and contain at least 3 characters (no special symbols like @ # $ %)";
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Please fill out this field.";
    } else if (!regPattern.test(formData.registrationNumber)) {
      newErrors.registrationNumber = "Must start with a letter and contain both letters and numbers (5-21 chars).";
    } else if (formData.registrationNumber.length < 5) {
      newErrors.registrationNumber = "Invalid Registration Number length";
    }

    if (!formData.registrationFile) {
      newErrors.registrationFile = "Please upload the Registration Number document.";
      setShowRegUpload(true); // Auto-open the box to show the error
    }

    // Tax ID Text Validation
    if (!formData.taxId.trim()) {
      newErrors.taxId = "Please fill out this field.";
    } else if (!smartTaxRegex.test(formData.taxId)) {
      newErrors.taxId = "Tax ID must be 8-15 characters and contain both letters and numbers.";
    }

    // Tax file validation
    if (!formData.taxFile) {
      newErrors.taxFile = "Please upload the TIN / GST document.";
      setShowTaxUpload(true); // Auto-open the box to show the error
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = "Website URL is required";
    } else if (!urlRegex.test(formData.websiteUrl)) {
      newErrors.websiteUrl = "Please enter a valid URL (e.g., https://example.com)";
    }

    if (!formData.officialEmail.trim()) {
      newErrors.officialEmail = "Please fill out this field.";
    } else if (!regexOfMail.test(formData.officialEmail)) {
      newErrors.officialEmail = "Email must start with a letter and be in a valid format (e.g., hr@company.com)";
    } else if (!isEmailVerified) {
      newErrors.officialEmail = "Please verify your email via OTP";
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Mobile number is required";
    } else if (!mobileRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter valid 10-digit mobile (starts with 6-9)";
    } else if (!isMobileVerified) {
      newErrors.phoneNumber = "Please verify phone number via OTP";
    }

    // if (!formData.incorporationCertificate) {
    //   newErrors.incorporationCertificate = "Certificate upload is required";
    // }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
    return Object.keys(newErrors).length === 0;
  };

  // ── COMPANY EMAIL OTP FUNCTIONS ──
  const sendCompanyEmailOtp = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const email = formData.officialEmail;
    if (!email) {
      setErrors({ ...errors, officialEmail: "Please enter email first" });
      return;
    }

    if (!/^[a-zA-Z]/.test(email)) {
      setErrors({ ...errors, officialEmail: "Email must start with a letter to receive OTP" });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, officialEmail: "Please enter a valid email address" });
      return;
    }

    setIsEmailLoading(true);
    try {
      const response = await api.post('/company/send-email-otp/', {
        email: email,
        company_name: formData.legalName
      });

      if (response.status === 200) {
        alert(`OTP sent to ${email}`);
        setTimer(180);
        setEmailForOtp(email);
        setShowEmailOtp(true);
        setOtpValues(prev => ({ ...prev, emailOtp: "" }));
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const verifyCompanyEmailOtp = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (otpValues.emailOtp.length !== 6) {
      alert("Enter 6-digit OTP");
      return;
    }

    setIsEmailLoading(true);
    try {
      const response = await api.post('/company/verify-email-otp/', {
        email: emailForOtp,
        otp: otpValues.emailOtp
      });

      if (response.status === 200 && response.data.verified) {
        setIsEmailVerified(true);
        setErrors(prev => ({ ...prev, officialEmail: "" }));
        setTimeout(() => setShowEmailOtp(false), 1500);
        alert("Email verified successfully!");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── MOBILE OTP FUNCTIONS ──
  const sendMobileOtp = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const phone = formData.phoneNumber;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrors(prev => ({ ...prev, phoneNumber: "Enter valid 10-digit mobile number (starts with 6-9)" }));
      return;
    }

    setIsMobileLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`OTP sent to ${phone}`);
      setTimer(180);
      setMobileForOtp(phone);
      setShowMobileOtp(true);
      setOtpValues(prev => ({ ...prev, mobileOtp: "" }));
    } catch (err) {
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsMobileLoading(false);
    }
  };

  const verifyMobileOtp = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (otpValues.mobileOtp.length !== 6) {
      alert("Enter 6-digit OTP");
      return;
    }

    setIsMobileLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (otpValues.mobileOtp === "123456") {
        setIsMobileVerified(true);
        setErrors(prev => ({ ...prev, phoneNumber: "" }));
        setTimeout(() => setShowMobileOtp(false), 1500);
        alert("Mobile verified successfully!");
      } else {
        alert("Invalid OTP. For demo, use 123456");
      }
    } catch (err) {
      alert("Verification failed");
    } finally {
      setIsMobileLoading(false);
    }
  };

  // ── File Upload Section Component ──
  const FileUploadSection = ({ fieldName, accept }) => {
    const file = formData[fieldName];
    const error = errors[fieldName];
    const inputId = `file-${fieldName}`;

    return (
      <div className="company-verify-file-upload-box" style={{ marginTop: '10px' }}>
        <input
          type="file"
          name={fieldName}
          id={inputId}
          accept={accept}
          onChange={handleChange}
          hidden
          disabled={isSubmitting}
        />

        {!file ? (
          <label htmlFor={inputId} className="company-verify-upload-placeholder">
            <p>Click to upload document</p>
            <small style={{ display: 'block', color: '#888' }}>PDF, JPG, PNG, DOC, DOCX (Max 5MB)</small>
          </label>
        ) : (
          <div className="company-verify-file-preview" title="Remove file and re-upload">
            <div className="company-verify-file-left clickable-area">
              <img src={fileIcon} alt="file" />
              <div>
                <p>{file.name}</p>
                <span>
                  {file.size < 1024 * 1024
                    ? `${(file.size / 1024).toFixed(2)} KB`
                    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                </span>
              </div>
            </div>
            <span title="Remove File" style={{ display: 'inline-flex' }}>
              <button
                type="button"
                className="file-remove-btn"
                onClick={() => removeFile(fieldName)}
                aria-label="Remove File"
              >
                ✕
              </button>
            </span>
          </div>
        )}
        {error && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
      </div>
    );
  };

  // ── OTP Modal Renderer ──
  const renderEmployerOtpModal = (type) => {
    const isEmail = type === 'email';
    const targetValue = isEmail ? formData.officialEmail : formData.phoneNumber;
    const otpKey = isEmail ? "emailOtp" : "mobileOtp";
    const isCurrentlyVerified = isEmail ? isEmailVerified : isMobileVerified;

    if (isCurrentlyVerified) {
      return (
        <div className="otp-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="otp-modal-content success-popup-content" onClick={(e) => e.stopPropagation()}>
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
      <div className="otp-modal-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-content" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="back-arrow"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
                        if (otpValues[otpKey]?.length === 6) {
                          isEmail ? verifyCompanyEmailOtp(e) : verifyMobileOtp(e);
                        } else {
                          alert("Please enter the complete 6-digit OTP");
                        }
                      }
                    }}
                    autoFocus={index === 0}
                    disabled={isEmail ? isEmailLoading : isMobileLoading}
                  />
                ))}
              </div>

              <div className="resend-timer">
                Did not receive code?{' '}
                <span
                  className="resend-link"
                  style={{ cursor: 'pointer', color: '#0081FF', fontWeight: 'bold' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isEmail ? sendCompanyEmailOtp(e) : sendMobileOtp(e);
                  }}
                >
                  Resend OTP
                </span>
                {timer > 0 && <span> in {formatTime(timer)}</span>}
              </div>

              <button
                type="button"
                className="verify-final-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isEmail ? verifyCompanyEmailOtp(e) : verifyMobileOtp(e);
                }}
                disabled={isEmail ? isEmailLoading : isMobileLoading}
              >
                {isEmail
                  ? (isEmailLoading ? "Verifying..." : "Verify")
                  : (isMobileLoading ? "Verifying..." : "Verify")
                }
              </button>
            </>
          ) : (
            <div className="expired-state">
              <p className="error-msg-otp">OTP Session Expired</p>
              <p>The verification code is no longer valid. Please request a new one.</p>
              <button
                type="button"
                className="verify-final-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isEmail ? sendCompanyEmailOtp(e) : sendMobileOtp(e);
                }}
                disabled={isEmail ? isEmailLoading : isMobileLoading}
              >
                {isEmail
                  ? (isEmailLoading ? "Sending..." : "Resend New OTP")
                  : (isMobileLoading ? "Sending..." : "Resend New OTP")
                }
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── MAIN SUBMIT HANDLER with allow_multiple_users check ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isEmailVerified || !isMobileVerified) {
      alert("Please verify your Email and Mobile number before proceeding.");
      return;
    }

    setIsSubmitting(true);
    setBackendError("");
    setBlockedByAdmin(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("legal_name", formData.legalName);
      formDataToSend.append("registration_number", formData.registrationNumber);
      formDataToSend.append("tax_id", formData.taxId);
      formDataToSend.append("website_url", formData.websiteUrl);
      formDataToSend.append("official_email", formData.officialEmail);
      formDataToSend.append("phone_number", formData.phoneNumber);

      if (formData.registrationFile) {
        formDataToSend.append("registration_certificate", formData.registrationFile);
      }
      if (formData.taxFile) {
        formDataToSend.append("tax_certificate", formData.taxFile);
      }

      if (employerEmail) {
        formDataToSend.append("employer_email", employerEmail);
      }

      console.log("Submitting verification data...");

      const response = await api.post("/company/verify/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Verification response:", response.data);

      if (response.status === 200 || response.status === 201) {
        alert("Verification submitted successfully! Admin will review your application.");
        navigate('/Job-portal/Employer/Dashboard', {
          replace: true,
          state: {
            fromVerify: true,
            verificationSubmitted: true,
            justLoggedIn: true
          }
        });
      }
    } catch (err) {
      console.error("Verification error:", err);

      // ── Check for "multiple users not allowed" error ──
      const errorMsg = err.response?.data?.error || "";

      if (errorMsg.includes("multiple users not allowed")) {
        setBlockedByAdmin(true);
        setBackendError(
          "❌ This company is already registered with another employer. " +
          "Multiple users are not allowed for this company. " +
          "Please contact admin for assistance."
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (err.response?.data?.error) {
        setBackendError(err.response.data.error);
        alert(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK') {
        setBackendError("Network error. Please check your connection.");
        alert("Network error. Please check your connection.");
      } else {
        setBackendError("Failed to submit verification. Please try again.");
        alert("Failed to submit. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* MODALS */}
      {showEmailOtp && renderEmployerOtpModal('email')}
      {showMobileOtp && renderEmployerOtpModal('mobile')}

      <div className="verify-page">
        <EHeader />

        <div className="company-verify-container">
          <h2 className="company-verify-title">Company Verify</h2>

          {backendError && (
            <div style={{
              backgroundColor: blockedByAdmin ? '#ffebee' : '#fff3cd',
              color: blockedByAdmin ? '#d32f2f' : '#856404',
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              border: blockedByAdmin ? '2px solid #d32f2f' : '1px solid #ffc107',
              fontWeight: blockedByAdmin ? '600' : 'normal'
            }}>
              {backendError}
            </div>
          )}

          <form className="company-verify-form" onSubmit={handleSubmit}>
            {/* ── Legal Name ── */}
            <div className="company-verify-form-group">
              <label>Company Legal Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="legalName"
                className={errors.legalName ? "input-error" : ""}
                placeholder="e.g., Wipro Technologies"
                value={formData.legalName}
                onChange={handleChange}
                disabled={isSubmitting || blockedByAdmin}
              />
              {errors.legalName && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.legalName}</span>}
            </div>

            {/* ── Registration Number with Upload ── */}
            <div className="company-verify-form-group">
              <label>Registration Number <span style={{ color: 'red' }}>*</span></label>
              <div className="company-verify-input-with-btn">
                <input
                  type="text"
                  name="registrationNumber"
                  className={errors.registrationNumber ? "input-error" : ""}
                  placeholder="e.g., L12345MH2023PTC123456"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  disabled={isSubmitting || blockedByAdmin}
                />
                <button
                  type="button"
                  className="company-small-upload-btn"
                  title="upload certificate"
                  onClick={() => setShowRegUpload(!showRegUpload)}
                  disabled={blockedByAdmin}
                >
                  <div className="remove-action-wrapper">
                    <img
                      className="upload-icon-btn"
                      src={uploadIcon}
                      alt="upload"
                      loading="eager"
                      fetchPriority="high"
                      title="Upload Registration Document"
                    />
                  </div>
                </button>
              </div>
              {errors.registrationNumber && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.registrationNumber}</span>}
              {showRegUpload && (
                <FileUploadSection
                  fieldName="registrationFile"
                  label="Registration Document"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                />
              )}
            </div>

            {/* ── Tax ID with Upload ── */}
            <div className="company-verify-form-group">
              <label>TIN / GST <span style={{ color: 'red' }}>*</span></label>
              <div className="company-verify-input-with-btn">
                <input
                  type="text"
                  name="taxId"
                  className={errors.taxId ? "input-error" : ""}
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  value={formData.taxId}
                  onChange={handleChange}
                  disabled={isSubmitting || blockedByAdmin}
                />
                <button
                  type="button"
                  className="company-small-upload-btn"
                  title="upload certificate"
                  onClick={() => setShowTaxUpload(!showTaxUpload)}
                  disabled={blockedByAdmin}
                >
                  <div className="remove-action-wrapper">
                    <img
                      className="upload-icon-btn"
                      src={uploadIcon}
                      alt="upload"
                      loading="eager"
                      fetchPriority="high"
                      title="Upload TIN / GST Document"
                    />
                  </div>
                </button>
              </div>
              {errors.taxId && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.taxId}</span>}
              {showTaxUpload && (
                <FileUploadSection
                  fieldName="taxFile"
                  label="Tax Document"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                />
              )}
            </div>

            {/* ── Website URL ── */}
            <div className="company-verify-form-group">
              <label>Web Site URL <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="websiteUrl"
                className={errors.websiteUrl ? "input-error" : ""}
                placeholder="e.g., https://example.com"
                value={formData.websiteUrl}
                onChange={handleChange}
                disabled={isSubmitting || blockedByAdmin}
              />
              {errors.websiteUrl && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.websiteUrl}</span>}
            </div>

            {/* ── Official Email ── */}
            <div className="company-verify-form-group">
              <label>Official Company Mail Id <span style={{ color: 'red' }}>*</span></label>
              <div className="company-verify-input-with-btn">
                <input
                  type="email"
                  name="officialEmail"
                  className={errors.officialEmail ? "input-error" : ""}
                  placeholder="e.g., hr@example.com"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  disabled={isSubmitting || isEmailVerified || blockedByAdmin}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendCompanyEmailOtp();
                    }
                  }}
                />
                {!isEmailVerified && formData.officialEmail.length > 0 && !blockedByAdmin && (
                  <button
                    type="button"
                    className="company-small-verify-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      sendCompanyEmailOtp(e);
                    }}
                    disabled={isEmailLoading || isSubmitting || blockedByAdmin}
                  >
                    {isEmailLoading ? "Sending..." : "Verify"}
                  </button>
                )}
                {isEmailVerified && <span className="verified-badge" style={{ color: 'green', marginLeft: '10px' }}>✓ Verified</span>}
              </div>
              {errors.officialEmail && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.officialEmail}</span>}
            </div>

            {/* ── Phone Number ── */}
            <div className="company-verify-form-group">
              <label>Phone Number <span style={{ color: 'red' }}>*</span></label>
              <div className="company-verify-input-with-btn">
                <input
                  type="text"
                  name="phoneNumber"
                  className={errors.phoneNumber ? "input-error" : ""}
                  placeholder="e.g., 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isSubmitting || blockedByAdmin}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.phoneNumber.length === 10 && !blockedByAdmin) {
                      e.preventDefault();
                      sendMobileOtp();
                    }
                  }}
                />
                {!isMobileVerified && formData.phoneNumber.length === 10 && !blockedByAdmin && (
                  <button
                    type="button"
                    className="company-small-verify-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      sendMobileOtp(e);
                    }}
                    disabled={isMobileLoading || isSubmitting || blockedByAdmin}
                  >
                    {isMobileLoading ? "Sending..." : "Verify"}
                  </button>
                )}
                {isMobileVerified && <span className="verified-badge" style={{ color: 'green', marginLeft: '10px' }}>✓ Verified</span>}
              </div>
              {errors.phoneNumber && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.phoneNumber}</span>}
            </div>

            {/* Incorporation Certificate */}
            {/* <div className="company-verify-form-group">
              <label>Company Incorporation Certificate <span style={{ color: 'red' }}>*</span></label>
              <div className={`company-verify-file-upload-box ${errors.incorporationCertificate ? "input-error" : ""}`}>
                <input
                  type="file"
                  name="incorporationCertificate"
                  accept="application/pdf, image/jpeg, image/jpg, image/png"
                  id="pdfUpload"
                  onChange={handleChange}
                  hidden
                  disabled={isSubmitting}
                />

                {!formData.incorporationCertificate && (
                  <label htmlFor="pdfUpload" className="company-verify-upload-placeholder">
                    <p>Click to Upload File</p>
                    <small style={{ display: 'block', color: '#888' }}>PDF, JPG, JPEG, PNG (Max 5MB)</small>
                  </label>
                )}

                {formData.incorporationCertificate && (
                  <div className="company-verify-file-preview">
                    <label htmlFor="pdfUpload" className="company-verify-file-left clickable-area">
                      <img src={fileIcon} alt="file" />
                      <div>
                        <p>{formData.incorporationCertificate.name}</p>
                        <span>
                          {formData.incorporationCertificate.size < 1024 * 1024 ? `${(formData.incorporationCertificate.size / 1024).toFixed(2)} KB` : `${(formData.incorporationCertificate.size / (1024 * 1024)).toFixed(2)} MB`}
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              {errors.incorporationCertificate && <span className="error-msg" style={{ color: 'red', fontSize: '12px' }}>{errors.incorporationCertificate}</span>}
            </div> */}

            <div className="company-verify-btn-wrapper">
              <button
                type="submit"
                className="company-main-verify-btn"
                disabled={isSubmitting || isEmailLoading || isMobileLoading || blockedByAdmin}
                style={{
                  backgroundColor: blockedByAdmin ? '#ccc' : undefined,
                  cursor: blockedByAdmin ? 'not-allowed' : 'pointer'
                }}
              >
                {blockedByAdmin ? "Blocked by Admin" : (isSubmitting ? "Submitting..." : "Verify")}
              </button>
            </div>

            {blockedByAdmin && (
              <div style={{
                textAlign: 'center',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fff3e0',
                borderRadius: '6px'
              }}>
                <p style={{ color: '#e65100', fontSize: '14px' }}>
                  ⚠️ You cannot submit verification because multiple users are not allowed for this company.
                  Please contact admin or use a different company.
                </p>
              </div>
            )}
          </form>
        </div>

        <Footer />
      </div>
    </>
  );
};