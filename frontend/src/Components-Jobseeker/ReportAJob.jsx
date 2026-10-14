import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Header } from '../Components-LandingPage/Header';
import { Footer } from '../Components-LandingPage/Footer';
import api from '../api/axios'; // base api

// Style
import './ReportAJob.css';

// Named export to match your App.jsx import
export const ReportAJob = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const initialValues = {
        job_id: "",
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        reason: "",
        explanation: ""
    };

    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const { id } = useParams();
    const EXPLANATION_MAX_LENGTH = 100;

    // Jobseeker platform settings state
    const [jobseekerSettings, setJobseekerSettings] = useState({
        domainRest: false,
        allowedDomains: []
    });

    // Fetch Jobseeker Platform Settings
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

    useEffect(() => {
        if (id) {
            setFormValues(prev => ({
                ...prev,
                job_id: id
            }));
        }
    }, [id]);

    // Fetch logged in user data
    useEffect(() => {
        const fetchUserData = async () => {
            const token = sessionStorage.getItem('access');

            if (!token) {
                setIsAuthenticated(false);
                setFormValues(initialValues);
                return;
            }

            try {
                const response = await api.get('/users/me/');
                const user = response.data;

                setIsAuthenticated(true);

                // Split name into first and last if needed
                const fullName = user.name || user.username || "";
                const nameParts = fullName.trim().split(" ");
                const firstName = user.first_name || nameParts[0] || "";
                const lastName = user.last_name || nameParts.slice(1).join(" ") || "";

                setFormValues({
                    job_id: id || "",
                    firstName: firstName,
                    lastName: lastName,
                    mobile: user.phone || "",
                    email: user.email || "",
                    reason: "",
                    explanation: ""
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                if (error.response?.status === 401) {
                    sessionStorage.removeItem('access');
                    sessionStorage.removeItem('refresh');
                }
                setIsAuthenticated(false);
                setFormValues(initialValues);
            }
        };

        fetchUserData();
    }, [id]);

    // Validation for alphabets only (no spaces, no numbers, no special characters)
    const isValidName = (name) => {
        // Only letters A-Z and a-z allowed
        const nameRegex = /^[A-Za-z]+$/;
        return nameRegex.test(name);
    };

    // Validation for alphabets with spaces (for reason and explanation)
    const isValidTextWithSpaces = (text) => {
        // Only letters A-Z, a-z, and spaces allowed
        const textRegex = /^[A-Za-z\s]*$/;
        return textRegex.test(text);
    };

    // Email Format & Allowed Domain Checkers (Matching Jsignup.jsx)
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

    const validate = () => {
        let newErrors = {};

        // Email Validation using Dynamic Allowed Domains
        if (!formValues.email) {
            newErrors.email = "Email is required";
        } else if (!isValidEmailFormat(formValues.email)) {
            newErrors.email = "Please enter a valid email address (e.g., name@domain.com)";
        } else if (!isEmailDomainAllowed(formValues.email)) {
            const allowedDomainsList = jobseekerSettings.allowedDomains.join(', ');
            newErrors.email = `Email domain not allowed. Please use an email from: ${allowedDomainsList}`;
        } else if (formValues.email.length > 100) {
            newErrors.email = "Email cannot exceed 100 characters";
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formValues.mobile) {
            newErrors.mobile = "Phone number is required";
        } else if (!phoneRegex.test(formValues.mobile)) {
            newErrors.mobile = "Number must start with 6, 7, 8, or 9 and be 10 digits";
        }

        // First Name validation - alphabets only
        if (!formValues.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (!isValidName(formValues.firstName)) {
            newErrors.firstName = "Only alphabets allowed";
        } else if (formValues.firstName.length > 15) {
            newErrors.firstName = "First name cannot exceed 15 characters";
        }

        // Last Name validation - alphabets only
        if (!formValues.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (!isValidName(formValues.lastName)) {
            newErrors.lastName = "Only alphabets allowed";
        } else if (formValues.lastName.length > 15) {
            newErrors.lastName = "Last name cannot exceed 15 characters";
        }

        // Reason validation - alphabets and spaces only
        if (!formValues.reason.trim()) {
            newErrors.reason = "Reason for complaint is required";
        } else if (!isValidTextWithSpaces(formValues.reason)) {
            newErrors.reason = "Only alphabets and spaces allowed";
        } else if (formValues.reason.length > 100) {
            newErrors.reason = "Reason cannot exceed 100 characters";
        }

        // Explanation validation - alphabets and spaces only
        if (!formValues.explanation.trim()) {
            newErrors.explanation = "Please provide an explanation";
        } else if (!isValidTextWithSpaces(formValues.explanation)) {
            newErrors.explanation = "Only alphabets and spaces allowed";
        } else if (formValues.explanation.length > EXPLANATION_MAX_LENGTH) {
            newErrors.explanation = `Explanation cannot exceed ${EXPLANATION_MAX_LENGTH} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Sanitize input: block leading space, collapse multiple spaces, limit trailing spaces to one
    const sanitizeInput = (name, value) => {
        // Block leading space for text fields
        if (value.startsWith(' ') && (name === 'firstName' || name === 'lastName' || name === 'reason' || name === 'explanation' || name === 'email')) {
            return null; // ignore this change
        }

        // For email, remove all spaces
        if (name === 'email') {
            return value.replace(/\s/g, '');
        }

        // For names, reason, explanation: collapse multiple spaces and limit trailing spaces to one
        if (name === 'firstName' || name === 'lastName' || name === 'reason' || name === 'explanation') {
            return value
                .replace(/\s{2,}/g, ' ')   // collapse multiple spaces to single
                .replace(/\s+$/g, ' ');    // replace trailing spaces with single space
        }

        // Mobile: only digits, max 10
        if (name === 'mobile') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            return onlyNums.slice(0, 10);
        }

        return value;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const sanitized = sanitizeInput(name, value);
        if (sanitized === null) return; // blocked leading space

        // Now apply field-specific filtering using sanitized
        if (name === "firstName" || name === "lastName") {
            const onlyAlpha = sanitized.replace(/[^A-Za-z]/g, "");
            // Limit to 15 characters
            const limitedValue = onlyAlpha.slice(0, 15);
            setFormValues({ ...formValues, [name]: limitedValue });
        } else if (name === "reason") {
            const onlyAlphaAndSpace = sanitized.replace(/[^A-Za-z\s]/g, "");
            // Limit to 100 characters
            const limitedValue = onlyAlphaAndSpace.slice(0, 100);
            setFormValues({ ...formValues, [name]: limitedValue });
             //  Handle Explanation - Only alphabets and spaces
        } else if (name === "explanation") {

            const onlyAlphaAndSpace = sanitized.replace(/[^A-Za-z\s]/g, "");
            const limitedValue = onlyAlphaAndSpace.slice(0, EXPLANATION_MAX_LENGTH);
            setFormValues({ ...formValues, [name]: limitedValue });
        } else if (name === "mobile") {
            // sanitized already only digits and max 10
            setFormValues({ ...formValues, [name]: sanitized });
        } else if (name === "email") {
            // sanitized already removed spaces, limit to 100
            const limitedValue = sanitized.slice(0, 100);
            setFormValues({ ...formValues, [name]: limitedValue });
        } else {
            setFormValues({ ...formValues, [name]: sanitized });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);

            try {
                console.log("Submitting complaint for job:", formValues.job_id);

                const responseData = await api.post(`complaints/submit/${formValues.job_id}/`, {
                    firstName: formValues.firstName,
                    lastName: formValues.lastName,
                    mobile: formValues.mobile,
                    email: formValues.email,
                    reason: formValues.reason,
                    explanation: formValues.explanation
                });

                console.log("Response:", responseData);

                // Show success state
                setShowSuccess(true);
                setIsSubmitting(false);

                // If authenticated, refill user data after reset
                if (isAuthenticated) {
                    try {
                        const userRes = await api.get('/users/me/');
                        const user = userRes.data;
                        const fullName = user.name || user.username || "";
                        const nameParts = fullName.trim().split(" ");
                        const firstName = user.first_name || nameParts[0] || "";
                        const lastName = user.last_name || nameParts.slice(1).join(" ") || "";

                        setFormValues({
                            job_id: id || "",
                            firstName: firstName,
                            lastName: lastName,
                            mobile: user.phone || "",
                            email: user.email || "",
                            reason: "",
                            explanation: ""
                        });
                    } catch (error) {
                        console.error("Failed to refresh user data:", error);
                        setFormValues(initialValues);
                    }
                } else {
                    setFormValues(initialValues);
                }

                // Wait for 5 seconds before redirecting
                setTimeout(() => {
                    navigate("/Job-portal/jobseeker");
                }, 5000);

            } catch (error) {
                const errData = error.response?.data;
                console.log("Error:", errData);

                if (errData?.non_field_errors) {
                    if (errData.non_field_errors[0]) {
                        alert(errData.non_field_errors[0]);
                    }
                } else if (errData?.job_id && errData.job_id[0]) {
                    alert(errData.job_id[0]);
                } else if (errData?.detail) {
                    alert(errData.detail);
                } else if (errData?.error) {
                    alert(errData.error);
                } else {
                    alert("Failed to submit report. Please try again.");
                }
                setIsSubmitting(false);
            }
        }
    };

    // Auto-capitalize first letter of each name
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if ((name === "firstName" || name === "lastName") && value) {
            const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            if (value !== capitalized) {
                setFormValues({ ...formValues, [name]: capitalized });
            }
        }
    };

    // Success overlay component
    const SuccessOverlay = () => (
        <div className="success-overlay">
            <div className="success-content">
                <h2>Report Submitted Successfully!</h2>
                <p>Your complaint has been received. Redirecting in 5 seconds...</p>
                <div className="success-progress-bar">
                    <div className="success-progress-fill"></div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="report-container">
                {showSuccess && <SuccessOverlay />}

                <h2 className="report-title">Complaint Form</h2>
                <form className="report-card" onSubmit={handleSubmit}>
                    <div className="report-row">
                        <label>Name</label>
                        <div className="report-input-value">
                            <div className="report-input-split">
                                {/* First Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        value={formValues.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength={15}
                                        disabled={isSubmitting}
                                        className={errors.firstName ? "error-field" : ""}
                                    />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>

                                {/* Last Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        value={formValues.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength={15}
                                        disabled={isSubmitting}
                                        className={errors.lastName ? "error-field" : ""}
                                    />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mobile number</label>
                        <div className="report-input-value">
                            <input
                                type="text"
                                name="mobile"
                                placeholder="9145******"
                                value={formValues.mobile}
                                onChange={handleChange}
                                maxLength={10}
                                disabled={isSubmitting}
                                className={errors.mobile ? "error-field" : ""}
                            />
                            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mail ID</label>
                        <div className="report-input-value">
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g., name@gmail.com"
                                value={formValues.email}
                                onChange={handleChange}
                                maxLength={100}
                                disabled={isSubmitting || isAuthenticated}
                                className={errors.email ? "error-field" : ""}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                            {/* {jobseekerSettings.domainRest && jobseekerSettings.allowedDomains.length > 0 && (
                                <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                                    Allowed domains: {jobseekerSettings.allowedDomains.join(', ')}
                                </span>
                            )} */}
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Reason for complaint</label>
                        <div className="report-input-value">
                            <input
                                type="text"
                                name="reason"
                                placeholder="Enter a subject"
                                value={formValues.reason}
                                onChange={handleChange}
                                maxLength={100}
                                disabled={isSubmitting}
                                className={errors.reason ? "error-field" : ""}
                            />
                            {errors.reason && <span className="error-text">{errors.reason}</span>}
                        </div>
                    </div>

                    <div className="report-row align-top">
                        <label>Explain</label>
                        <div className="report-input-value">
                            <textarea
                                name="explanation"
                                rows="4"
                                value={formValues.explanation}
                                onChange={handleChange}
                                maxLength={EXPLANATION_MAX_LENGTH}
                                disabled={isSubmitting}
                                placeholder="Please provide detailed explanation"
                                className={errors.explanation ? "error-field" : ""}
                            />
                            <div className="character-count">
                                Character limit: {formValues.explanation.length}/{EXPLANATION_MAX_LENGTH}
                            </div>

                            {errors.explanation && (
                                <span className="error-text">{errors.explanation}</span>
                            )}
                        </div>
                    </div>

                    <div className="report-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};