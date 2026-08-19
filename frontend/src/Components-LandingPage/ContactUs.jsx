import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { FHeader } from '../Components-Jobseeker/FHeader';
import { Footer } from '../Components-LandingPage/Footer';
import ContactImage from '../assets/Contactus.png';
import './ContactUs.css';

export const ContactUs = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const initialValues = { name: "", email: "", contact: "", message: "" };
  const MAX_MESSAGE_LENGTH = 500;
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  // Client-side duplicate prevention states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [submittedMessages, setSubmittedMessages] = useState([]);
  const SUBMISSION_COOLDOWN = 30000; // 30 seconds cooldown
  const formRef = useRef();

  useEffect(() => {
    const img = new Image();
    img.src = ContactImage;
  }, []);

  // Load and manage submitted messages from sessionStorage
  useEffect(() => {
    const loadSubmittedMessages = () => {
      try {
        const saved = sessionStorage.getItem('contact_submissions');
        if (saved) {
          const parsed = JSON.parse(saved);
          const now = Date.now();
          // Keep only submissions from last 24 hours
          const filtered = parsed.filter(sub => now - sub.timestamp < 86400000);
          setSubmittedMessages(filtered);
          if (filtered.length !== parsed.length) {
            sessionStorage.setItem('contact_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {
        console.error('Error loading submissions:', e);
      }
    };
    loadSubmittedMessages();
  }, []);

  // Save submitted messages to sessionStorage
  useEffect(() => {
    if (submittedMessages.length > 0) {
      sessionStorage.setItem('contact_submissions', JSON.stringify(submittedMessages));
    }
  }, [submittedMessages]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem('access');

      if (!token) {
        setIsAuthenticated(false);
        setLoadingAuth(false);
        return;
      }

      try {
        const response = await api.get('/users/me/');
        const user = response.data;

        setIsAuthenticated(true);
        setFormValues(prev => ({
          ...prev,
          name: user.name || user.username || "",
          email: user.email || "",
          contact: user.phone || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (error.response?.status === 401) {
          sessionStorage.removeItem('access');
          sessionStorage.removeItem('refresh');
        }
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchUserData();
  }, []);

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    if (name === "message" && value.length >= MAX_MESSAGE_LENGTH) {
      setErrors({ ...errors, message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` });
    } else {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9.]*@(gmail|yahoo|outlook|hotmail|thestackly)\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formValues.name)) {
      newErrors.name = "Name should contain only letters";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email)) {
      newErrors.email = "Enter valid email (gmail, yahoo, outlook, hotmail, thestackly)";
    }

    if (!formValues.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!phoneRegex.test(formValues.contact)) {
      newErrors.contact = "Phone must be 10 digits & start with 6-9";
    }

    if (!formValues.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (formValues.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for duplicate submission
  const isDuplicateSubmission = () => {
    const normalizedMessage = formValues.message.trim().toLowerCase();
    const normalizedEmail = formValues.email.trim().toLowerCase();

    return submittedMessages.some(sub =>
      sub.email === normalizedEmail &&
      sub.message === normalizedMessage
    );
  };

  // Check cooldown period
  const isInCooldown = () => {
    const now = Date.now();
    return (now - lastSubmissionTime) < SUBMISSION_COOLDOWN;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Validate form first
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.input-error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Check cooldown
    if (isInCooldown()) {
      const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN - (Date.now() - lastSubmissionTime)) / 1000);
      setMessageType("error");
      setServerMessage(`Please wait ${remainingSeconds} seconds before submitting again`);
      setTimeout(() => {
        setServerMessage("");
        setMessageType("");
      }, 5000);
      return;
    }

    // Check for duplicate message
    if (isDuplicateSubmission()) {
      setMessageType("error");
      setServerMessage("You have already sent this message. Please wait for our response.");
      setTimeout(() => {
        setServerMessage("");
        setMessageType("");
      }, 5000);
      return;
    }

    // Start submission
    setIsSubmitting(true);
    setLoading(true);
    setServerMessage("");
    setMessageType("");

    try {
      const response = await api.post("contact/create/", formValues, {
        headers: { "Content-Type": "application/json" }
      });

      // Store successful submission
      const submission = {
        email: formValues.email.trim().toLowerCase(),
        message: formValues.message.trim().toLowerCase(),
        timestamp: Date.now()
      };

      setSubmittedMessages(prev => [...prev, submission]);
      setLastSubmissionTime(Date.now());

      // Show success message
      setMessageType("success");
      setServerMessage(response.data.message || "Message sent successfully!");

      // Reset form
      setFormValues(initialValues);

      // If authenticated, refill user data
      if (isAuthenticated) {
        try {
          const userRes = await api.get('/users/me/');
          const user = userRes.data;
          setFormValues(prev => ({
            ...prev,
            name: user.name || user.username || "",
            email: user.email || "",
            contact: user.phone || "",
          }));
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setServerMessage("");
        setMessageType("");
      }, 5000);

    } catch (error) {
      setMessageType("error");

      // Handle validation errors from backend
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        setServerMessage("Please check the highlighted fields.");
      } else if (error.response?.data?.message) {
        setServerMessage(error.response.data.message);
      } else if (error.response?.data?.detail) {
        setServerMessage(error.response.data.detail);
      } else {
        setServerMessage("Something went wrong. Please try again.");
      }

      // Clear error message after 5 seconds
      setTimeout(() => {
        setServerMessage("");
        setMessageType("");
      }, 5000);

    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Clear specific error when user starts typing
  const handleInputFocus = (fieldName) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  if (loadingAuth) {
    return (
      <div className="contact-page">
        <FHeader />
        <div className="contact-container" style={{ textAlign: "center", padding: "50px" }}>
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contact-page">
      <FHeader />
      <div className="contact-container">
        <div className="contact-left">
          <img src={ContactImage} loading="eager" alt="Contact Us" fetchpriority="high" />
        </div>
        <div className="contact-right">
          <h2>Contact Us</h2>
          <p className="contact-subtitle">Send us messages</p>
          <p className="contact-desc">
            Do you have a question? or need any help
          </p>

          {serverMessage && (
            <p style={{
              color: messageType === "success" ? "#155724" : "#721c24",
              backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
              border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`,
              padding: "12px",
              borderRadius: "4px",
              textAlign: "center",
              marginBottom: "15px"
            }}>
              {serverMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="contact-form" ref={formRef}>
            <div className="contact-form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formValues.name}
                onChange={handleForm}
                onFocus={() => handleInputFocus('name')}
                className={errors.name ? "input-error" : ""}
                disabled={loading}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="contact-form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email ID"
                value={formValues.email}
                onChange={handleForm}
                onFocus={() => handleInputFocus('email')}
                className={errors.email ? "input-error" : ""}
                disabled={loading}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="contact-form-group">
              <label>Contact number *</label>
              <input
                type="tel"
                name="contact"
                placeholder="Enter your number"
                value={formValues.contact}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[6-9]?\d{0,9}$/.test(value)) {
                    handleForm(e);
                  }
                }}
                onFocus={() => handleInputFocus('contact')}
                className={errors.contact ? "input-error" : ""}
                disabled={loading}
              />
              {errors.contact && <span className="error-msg">{errors.contact}</span>}
            </div>

            <div className="contact-form-group">
              <label>Message *</label>
              <textarea
                name="message"
                placeholder="Type something..."
                value={formValues.message}
                onChange={handleForm}
                onFocus={() => handleInputFocus('message')}
                className={errors.message ? "input-error" : ""}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={loading}
                rows={4}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "4px" }}>
                <span className={`char-counter ${formValues.message.length >= MAX_MESSAGE_LENGTH ? "char-limit-reached" : ""}`}>
                  {formValues.message.length}/{MAX_MESSAGE_LENGTH}
                </span>
                {formValues.message.length > 0 && formValues.message.length < 10 && (
                  <span style={{ color: "#666" }}>Message too short</span>
                )}
              </div>
              {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <button
                type="submit"
                className="contact-submit-btn"
                style={{
                  width: "100px",
                  padding: "15px",
                  opacity: loading || isSubmitting ? 0.6 : 1,
                  cursor: loading || isSubmitting ? "not-allowed" : "pointer"
                }}
                disabled={loading || isSubmitting}
              >
                {loading ? "Sending..." : isSubmitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>

          {isAuthenticated && (
            <p style={{ fontSize: "12px", color: "#666", textAlign: "center", marginTop: "15px" }}>
              Your profile information has been auto-filled. You can edit if needed.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};