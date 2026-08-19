import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Reportsubmitted from '../assets/Report_Submitted.png';
import './RaiseTicket.css';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from '../Components-Jobseeker/FHeader';
import axios from 'axios';
import api from '../api/axios';
import deleteIcon from '../assets/DeleteIcon.png';

export const RaiseTicket = () => {
    const navigate = useNavigate();

    // Initial blank values mapping strategy from ContactUs logic[cite: 6]
    const initialFormValues = {
        category: '',
        subject: '',
        name: '',
        email: '',
        phone: '',
        message: '',
        attachment: null,
    };

    const [formData, setFormData] = useState(initialFormValues);
    const [fileError, setFileError] = useState('');
    const [step, setStep] = useState('form');
    const [showCategory, setShowCategory] = useState(false);
    const [showSubject, setShowSubject] = useState(false);
    const [errors, setErrors] = useState({});
    const [countdown, setCountdown] = useState(5);

    // Context message alert handling tracks[cite: 6]
    const [serverMessage, setServerMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Client-side duplicate prevention states from ContactUs[cite: 6]
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
    const [submittedTickets, setSubmittedTickets] = useState([]);
    const SUBMISSION_COOLDOWN = 30000; // 30 seconds cooldown threshold[cite: 6]

    const subjects = [
        "Broken 'Apply' Button/Application Failure",
        "File Upload/Resume Parsing Errors",
        "Outdated or Ghost Job Listings",
        "Incorrect/Irrelevant Search Results & Filters",
        "Profile Update/Saved Data Not Saving",
        "Application Status Unchanged/Limbo",
        "Broken Job Alerts & Notifications",
        "Login/Registration Issues (Social Login Bugs)",
        "Site Incompatibility/Non-Responsive Mobile Layout",
        "Duplicate Job Listings (Spam)",
        "Others"
    ];

    // Allowed file types
    const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];

    // Allowed file extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

    // Max file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const MAX_NAME_LENGTH = 50;
    const MAX_MESSAGE_LENGTH = 500;

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load historical matching ticket strings from sessionStorage[cite: 6]
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('ticket_submissions');
            if (saved) {
                const parsed = JSON.parse(saved);
                const now = Date.now();
                // Retain historical records from the last 24 hours only[cite: 6]
                const filtered = parsed.filter(sub => now - sub.timestamp < 86400000);
                setSubmittedTickets(filtered);
                if (filtered.length !== parsed.length) {
                    sessionStorage.setItem('ticket_submissions', JSON.stringify(filtered));
                }
            }
        } catch (e) {
            console.error('Error loading historical submissions:', e);
        }
    }, []);

    // Sync state collections down to local storage contexts[cite: 6]
    useEffect(() => {
        if (submittedTickets.length > 0) {
            sessionStorage.setItem('ticket_submissions', JSON.stringify(submittedTickets));
        }
    }, [submittedTickets]);

    // Profile retrieval execution flow based on ContactUs logic[cite: 6]
    useEffect(() => {
        const fetchUserData = async () => {
            const token = sessionStorage.getItem('access');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            try {
                const response = await api.get('/users/me/');
                const user = response.data;
                setIsAuthenticated(true);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || user.username || "",
                    email: user.email || "",
                    phone: user.phone || "",
                }));
            } catch (error) {
                console.error("Failed to populate profile context settings:", error);
                if (error.response?.status === 401) {
                    sessionStorage.removeItem('access');
                    sessionStorage.removeItem('refresh');
                }
                setIsAuthenticated(false);
            }
        };
        fetchUserData();
    }, []);

    const validateFile = (file) => {
        if (!file) return true;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File size exceeds 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
            return false;
        }

        // Check file type by MIME type
        if (!allowedFileTypes.includes(file.type)) {
            const fileName = file.name.toLowerCase();
            const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!hasValidExtension) {
                setFileError(`Invalid file format. Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG`);
                return false;
            }
        }

        setFileError('');
        return true;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.message.trim()) {
            errors.message = "Message is required";
        } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
            errors.message = `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
        }

        if (!formData.category) errors.category = "Category is required";
        if (!formData.subject) errors.subject = "Subject is required";

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            errors.name = "Name should contain only letters";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[a-zA-Z][a-zA-Z0-9.]*@(gmail|yahoo|outlook|hotmail|thestackly)\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Enter valid email (gmail, yahoo, outlook, hotmail, thestackly)";
        }

        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
            errors.phone = "Phone must be exactly 10 digits & start with 6-9";
        }

        if (formData.attachment) {
            const isValid = validateFile(formData.attachment);
            if (!isValid) errors.attachment = fileError;
        }

        setErrors(errors);
        return errors;
    };

    // Duplicate submission assessment checker logic[cite: 6]
    const isDuplicateSubmission = () => {
        const normalizedMsg = formData.message.trim().toLowerCase();
        const normalizedEmail = formData.email.trim().toLowerCase();
        const normalizedSubject = formData.subject.trim().toLowerCase();
        const normalizedCategory = formData.category.trim().toLowerCase();

        return submittedTickets.some(sub =>
            sub.email === normalizedEmail &&
            sub.message === normalizedMsg &&
            sub.subject === normalizedSubject &&
            sub.category === normalizedCategory
        );
    };

    const isInCooldown = () => {
        return (Date.now() - lastSubmissionTime) < SUBMISSION_COOLDOWN;
    };

    const handleSubmitClick = (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            console.log(validationErrors);
            return;
        }

        // Apply duplicate prevention checks from ContactUs logic[cite: 6]
        if (isInCooldown()) {
            const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN - (Date.now() - lastSubmissionTime)) / 1000);
            setMessageType("error");
            setServerMessage(`Please wait ${remainingSeconds} seconds before submitting again`);
            scrollToTop();
            return;
        }

        if (isDuplicateSubmission()) {
            setMessageType("error");
            setServerMessage("You have already raised a ticket with these exact details. Please wait for our response.");
            scrollToTop();
            return;
        }

        setServerMessage("");
        setMessageType("");
        setStep('confirming');
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setStep('loading');
        scrollToTop();

        const data = new FormData();
        data.append("category", formData.category);
        data.append("subject", formData.subject);
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("message", formData.message || '');
        if (formData.attachment) {
            data.append("attachment", formData.attachment);
        }

        try {
            const response = await api.post("raise-ticket/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log("SUCCESS:", response.data);

            // Record successful transaction snapshot entries inside context[cite: 6]
            const record = {
                email: formData.email.trim().toLowerCase(),
                category: formData.category.trim().toLowerCase(),
                subject: formData.subject.trim().toLowerCase(),
                message: formData.message.trim().toLowerCase(),
                timestamp: Date.now()
            };

            setSubmittedTickets(prev => [...prev, record]);
            setLastSubmissionTime(Date.now());

            setStep('success');
            setCountdown(5);
        } catch (error) {
            console.error("ERROR SUBMITTING TICKET:", error.response?.data || error);
            setStep('form');
            setMessageType("error");

            // Extract accurate field or contextual alert messages based on backend errors[cite: 6]
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
                setServerMessage("Please check the highlighted fields.");
            } else if (error.response?.data?.message) {
                setServerMessage(error.response.data.message);
            } else if (error.response?.data?.detail) {
                setServerMessage(error.response.data.detail);
            } else {
                setServerMessage("Something went wrong. Ticket submission failed.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (step === 'success') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/Job-portal/jobseeker/help-center');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData({ ...formData, attachment: null });
            setFileError('');
            return;
        }

        const isValid = validateFile(file);
        if (isValid) {
            setFormData({ ...formData, attachment: file });
            if (errors.attachment) {
                setErrors(prev => ({ ...prev, attachment: null }));
            }
        } else {
            setFormData({ ...formData, attachment: null });
            e.target.value = '';
        }
    };

    const handleRemoveFile = () => {
        setFormData({ ...formData, attachment: null });
        setFileError('');
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        if (errors.attachment) {
            setErrors(prev => ({ ...prev, attachment: null }));
        }
    };

    const handleClearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    if (step === 'success') {
        return (
            <div>
                <FHeader />
                <div className="Raiseticket-status-container">
                    <div className="Raiseticket-success-msg">
                        <img src={Reportsubmitted} alt="ReportSubmitted" className="Raiseticket-success-image" />
                        <h2>Ticket Raised successfully</h2>
                        <p className="Raiseticket-countdown">Redirecting in {countdown} seconds...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (step === 'loading') {
        return (
            <div>
                <FHeader />
                <div className="Raiseticket-status-container">
                    <div className="Raiseticket-loader"></div>
                    <p className="Raiseticket-loading-text">Submitting your ticket...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <FHeader />
            <div className="Raiseticket-main-wrapper">
                <div className="Raiseticket-page">
                    <div className="Raiseticket-header">
                        <h1>Ticket Raise</h1>
                        <p>We're here to help.</p>
                        <p>Raise a ticket and we'll get back to you soon</p>
                    </div>

                    <div className="Raiseticket-card">
                        {/* Dynamic error/success feedback panel styling[cite: 6] */}
                        {serverMessage && (
                            <p style={{
                                color: messageType === "success" ? "#155724" : "#721c24",
                                backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
                                border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                                padding: "12px",
                                borderRadius: "6px",
                                textAlign: "center",
                                marginBottom: "20px",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>
                                {serverMessage}
                            </p>
                        )}

                        <form onSubmit={handleSubmitClick}>
                            <div className="Raiseticket-form-group">
                                <label>Category*</label>
                                <div className={`Raiseticket-custom-select ${showCategory ? 'open' : ''} ${errors.category ? 'Raiseticket-custom-select-err' : ''}`}
                                    onClick={() => {
                                        setShowCategory(!showCategory);
                                        handleClearError('category');
                                    }}>
                                    {formData.category || "Select type"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showCategory && (
                                        <ul className="Raiseticket-options">
                                            <li onClick={() => setFormData({ ...formData, category: 'Jobseeker' })}>Jobseeker</li>
                                            <li onClick={() => setFormData({ ...formData, category: 'Employer' })}>Employer</li>
                                        </ul>
                                    )}
                                </div>
                                {errors.category && <span className='form-group-err'>{errors.category}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Subject*</label>
                                <div className={`Raiseticket-custom-select ${showSubject ? 'open' : ''} ${errors.subject ? 'Raiseticket-custom-select-err' : ''}`}
                                    onClick={() => {
                                        setShowSubject(!showSubject);
                                        handleClearError('subject');
                                    }}>
                                    {formData.subject || "Select an issue"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showSubject && (
                                        <ul className="Raiseticket-options scrollable">
                                            {subjects.map(s => (
                                                <li key={s} onClick={() => setFormData({ ...formData, subject: s })}>{s}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.subject && <span className='form-group-err'>{errors.subject}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Name*</label>
                                <input
                                    className={`${errors.name ? 'Raiseticket-form-group-err' : ''}`}
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    maxLength={MAX_NAME_LENGTH}
                                    onFocus={() => handleClearError('name')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(value)) {
                                            setFormData({ ...formData, name: value });
                                            if (value.length >= MAX_NAME_LENGTH) {
                                                setErrors(prev => ({ ...prev, name: `Name cannot exceed ${MAX_NAME_LENGTH} characters` }));
                                            } else {
                                                setErrors(prev => ({ ...prev, name: '' }));
                                            }
                                        }
                                    }}
                                />
                                <span style={{ fontSize: '12px', color: formData.name.length >= MAX_NAME_LENGTH ? '#dc2626' : '#999', float: 'right' }}>
                                    {formData.name.length}/{MAX_NAME_LENGTH}
                                </span>
                                {errors.name && <span className='form-group-err'>{errors.name}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Email*</label>
                                <input
                                    type="email"
                                    placeholder="Enter email ID"
                                    className={`${errors.email ? 'Raiseticket-form-group-err' : ''}`}
                                    value={formData.email}
                                    onFocus={() => handleClearError('email')}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.email && <span className='form-group-err'>{errors.email}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Phone number*</label>
                                <input
                                    type='tel'
                                    placeholder="Enter phone number"
                                    className={`${errors.phone ? 'Raiseticket-form-group-err' : ''}`}
                                    value={formData.phone}
                                    maxLength={10}
                                    onFocus={() => handleClearError('phone')}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        if (value.length === 0) {
                                            setFormData({ ...formData, phone: "" });
                                            return;
                                        }
                                        if (!/^[6-9]/.test(value)) return;
                                        if (value.length <= 10) {
                                            setFormData({ ...formData, phone: value });
                                        }
                                    }}
                                />
                                {errors.phone && <span className='form-group-err'>{errors.phone}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Message*</label>
                                <textarea
                                    placeholder="Describe the issue here..."
                                    rows="4"
                                    className={`${errors.message ? 'Raiseticket-form-group-err' : ''}`}
                                    maxLength={MAX_MESSAGE_LENGTH}
                                    value={formData.message}
                                    onFocus={() => handleClearError('message')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, message: value });
                                        if (value.length >= MAX_MESSAGE_LENGTH) {
                                            setErrors(prev => ({ ...prev, message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` }));
                                        } else {
                                            setErrors(prev => ({ ...prev, message: '' }));
                                        }
                                    }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "4px" }}>
                                    <span style={{ color: formData.message.length >= MAX_MESSAGE_LENGTH ? '#dc2626' : '#999' }}>
                                        {formData.message.length}/{MAX_MESSAGE_LENGTH}
                                    </span>
                                </div>
                                {errors.message && <span className='form-group-err'>{errors.message}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Attachment (Optional)</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                {formData.attachment ? (
                                    <div className={`apply-form-resume-box ${fileError ? "error-border" : ""}`}>
                                        <span>{formData.attachment.name}</span>
                                        <button
                                            type="button"
                                            className="apply-form-remove-btn"
                                            onClick={handleRemoveFile}
                                            title="Remove file"
                                        >
                                            <img src={deleteIcon} alt="delete" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={`apply-form-file-input ${fileError ? 'error-border' : ''}`}
                                        onClick={() => document.getElementById('file-upload').click()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Click to attach a file (Optional)
                                    </div>
                                )}
                                {(fileError || errors.attachment) && (
                                    <span className='form-group-err' style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                        {fileError || errors.attachment}
                                    </span>
                                )}
                                <small className="file-info">Accepted formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG</small>
                            </div>

                            <div className="Raiseticket-form-actions">
                                <button type="button" className="Raiseticket-btn-cancel" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="Raiseticket-btn-submit" disabled={isSubmitting}>Submit</button>
                            </div>
                        </form>
                    </div>

                    {step === 'confirming' && (
                        <div className="Raiseticket-modal-overlay">
                            <div className="Raiseticket-modal">
                                <h3>Please confirm before submit</h3>
                                <div className="Raiseticket-modal-buttons">
                                    <button className="Raiseticket-btn-yes" onClick={handleConfirm}>Yes</button>
                                    <button className="Raiseticket-btn-no" onClick={() => setStep('form')}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};