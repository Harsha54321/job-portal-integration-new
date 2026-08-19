import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Footer } from "../Components-LandingPage/Footer";
import FormEditIcon from "../assets/form_edit.png";
import deleteIcon from "../assets/DeleteIcon.png";
import time from "../assets/opportunity_time.png";
import experience from "../assets/opportunity_bag.png";
import place from "../assets/opportunity_location.png";
import SampleResume from "../assets/John_Christopher_Resume.pdf"
import './JobApplication.css'
import { Header } from "../Components-LandingPage/Header";
import api from "../api/axios";
import { useJobs } from "../JobContext";
import application_success from "../assets/application_success.png";
import { LocationDisplay } from './LocationDisplay';

export const JobApplication = () => {

  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [easyApplyEnabled, setEasyApplyEnabled] = useState(false);
  const { setAppliedJobs } = useJobs();
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status
  const [showSuccess, setShowSuccess] = useState(false); // New state for success message

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editableField, setEditableField] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    marital: "",
    mobile: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    coverLetter: "",
    resume: null,
  });

  // Fetch Easy Apply status and profile data on component load
  useEffect(() => {
    const fetchEasyApplyStatus = async () => {
      try {
        const response = await api.get("/jobs/apply/");

        if (response.data.status === true && response.data.data) {
          // Easy Apply is enabled, pre-fill form with profile data
          setEasyApplyEnabled(true);
          const profileData = response.data.data;

          setFormData(prev => ({
            ...prev,
            name: profileData.full_name || "",
            dob: profileData.date_of_birth || "",
            email: profileData.email || "",
            mobile: profileData.phone_number || "",
            marital: profileData.marital_status || "",
            street: profileData.street || "",
            city: profileData.city || "",
            state: profileData.state || "",
            zip: profileData.pincode || "",
            country: profileData.country || "",
            resume: profileData.resume
              ? {
                name: profileData.resume.split("/").pop(),
                url: profileData.resume,
                isExisting: true
              }
              : null
          }));
        } else {
          // Easy Apply is disabled, user must manually enter data
          setEasyApplyEnabled(false);
          // Reset form to empty values
          setFormData({
            name: "",
            dob: "",
            marital: "",
            mobile: "",
            email: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            coverLetter: "",
            resume: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch Easy Apply status", err);
        setEasyApplyEnabled(false);
      }
    };

    fetchEasyApplyStatus();
  }, []);

  // Fetch job details
  useEffect(() => {
    api.get(`/jobs/${jobId}/`)
      .then(res => {
        setJob(res.data);
        console.log(res.data)
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job", err);
        setLoading(false);
      });
  }, [jobId]);

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
      case "city":
      case "state":
      case "country":
        if (!value.trim()) error = "Required";
        else if (/[^a-zA-Z\s]/.test(value)) error = "Alphabets only";
        break;
      case "email":
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9.]*@(gmail|yahoo|outlook|hotmail|thestackly)\.[a-zA-Z]{2,}$/;
        if (!value) error = "Email is Required";
        else if (!emailRegex.test(value)) error = "Format: name@domain.com";
        break;
      case "mobile":
        if (!value) error = "Mobile Number is Required";
        else if (!/^[6-9]\d{9}$/.test(value)) error = "Must be 10 digits starting with 6-9";
        break;
      case "zip":
        if (!value) error = "Zip code is Required";
        else if (!/^\d{6}$/.test(value)) error = "Must be exactly 6 digits";
        break;
      case "coverLetter":
        if (!value.trim()) {
          error = "Cover letter is required";
        } else if (value.trim().length < 50) {
          error = `Please add ${50 - value.trim().length} more characters`;
        } else if (value.length > 2000) {
          error = "Maximum 2000 characters allowed";
        } else {
          error = "";
        }
        break;
      case "dob":
        if (!value) {
          error = "Date of Birth is required";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();

          let age = today.getFullYear() - selectedDate.getFullYear();
          const monthDiff = today.getMonth() - selectedDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
            age--;
          }

          if (selectedDate > today) {
            error = "Date of Birth cannot be in the future";
          } else if (age < 15) {
            error = "You must be at least 15 years old to apply";
          } else if (age > 80) {
            error = "Age must not exceed 80 years";
          }
        }
        break;
      case "resume":
        if (!value) error = "Resume is required";
        break;
      default:
        if (!value?.toString().trim()) error = "Required";
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "coverLetter") {
      val = value.slice(0, 2000);
    }

    if (name === "mobile" || name === "zip") {
      val = val.replace(/\D/g, "");
      if (name === "mobile") val = val.slice(0, 10);
      if (name === "zip") val = val.slice(0, 6);
    }
    else if (["name", "city", "state", "country"].includes(name)) {
      val = val.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: val }));

    const errorMsg = validateField(name, val);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, resume: file }));
      setErrors(prev => ({ ...prev, resume: "" }));
    } else {
      alert("Upload PDF only");
      fileInputRef.current.value = "";
    }
  };

  const removeResume = () => {
    setFormData(prev => ({ ...prev, resume: null }));
    setErrors(prev => ({ ...prev, resume: "Resume is required" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "dob",
      "marital",
      "mobile",
      "email",
      "street",
      "city",
      "state",
      "zip",
      "country",
      "coverLetter",
      "resume"
    ];

    let firstError = null;
    let newErrors = {};

    for (let field of requiredFields) {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
        if (!firstError) firstError = field;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setEditableField(["street", "city", "state", "zip", "country"].includes(firstError) ? "address" : firstError);
      alert("Please fill all required fields.");
      return false;
    }

    if (formData.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits");
      setEditableField("mobile");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!window.confirm("Are you sure want to apply?")) return;

    // Set submitting state to true
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("job", jobId);
      payload.append("cover_letter", formData.coverLetter);
      payload.append("marital_status", formData.marital);
      payload.append("street", formData.street);
      payload.append("city", formData.city);
      payload.append("state", formData.state);
      payload.append("pincode", formData.zip);
      payload.append("country", formData.country);

      if (formData.resume && !formData.resume.isExisting) {
        payload.append("resume", formData.resume);
      }

      const res = await api.post("/jobs/apply/", payload);

      setAppliedJobs(prev => {
        const filtered = prev.filter(app =>
          !(app.job?.id === job.id && app.status === "withdrawn")
        );
        return [...filtered, res.data];
      });

      // Show success state
      setShowSuccess(true);
      setIsSubmitting(false);

      // Wait for 5 seconds before redirecting
      setTimeout(() => {
        navigate(`/Job-portal/jobseeker/submitted/${job.id}`);
      }, 5000);

    } catch (error) {
      console.error("Full error object:", error);
      console.error("Response data:", error.response?.data);

      let errorMessage = "Application failed. Please try again.";

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else {
          const firstKey = Object.keys(error.response.data)[0];
          if (firstKey && error.response.data[firstKey]) {
            errorMessage = Array.isArray(error.response.data[firstKey])
              ? error.response.data[firstKey][0]
              : error.response.data[firstKey];
          }
        }
      }
      alert(errorMessage);
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <p style={{ padding: 40 }}>Loading job details...</p>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header />
        <p style={{ padding: 40 }}>Job not found</p>
        <Footer />
      </>
    );
  }

  // Success overlay component
  const SuccessOverlay = () => (
    <div className="success-overlay">
      <div className="success-content">
        <img src={application_success} alt="Success" className="success-icon" />
        <h2>Application Submitted Successfully!</h2>
        <p>Your application has been received. Redirecting in 5 seconds...</p>
        <div className="success-progress-bar">
          <div className="success-progress-fill"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />

      <div className="apply-form-page">
        {showSuccess && <SuccessOverlay />}

        <div className="apply-form-job-header">
          <h1 className="apply-form-job-title">{job.job_title}</h1>

          <div className="apply-form-job-meta">
            <span className="apply-form-company-name">
              {job.company?.company_name}
            </span>

            <span>
              <img src={time} className="apply-form-card-icons" alt="duration" />
              {job.work_duration}
            </span>

            <span>₹ {job.salary}</span>

            <span>
              <img src={experience} className="apply-form-card-icons" alt="experience" />
              {job.experience}
            </span>

            <span>
              <img src={place} className="apply-form-card-icons" alt="location" />
              <LocationDisplay locations={job.location} />
            </span>
          </div>
        </div>

        <div className="apply-form-container">
          <form className="apply-form-card" onSubmit={handleSubmit}>

            {!easyApplyEnabled && (
              <div className="easy-apply-disabled-warning">
                <p>Easy Apply is currently disabled. Please fill in all your details manually.</p>
              </div>
            )}

            <div className="apply-form-row">
              <div className="apply-form-label">Name</div>
              <div className="apply-form-input">
                <input
                  type="text"
                  className={`apply-form-text-input ${errors.name ? "error-border" : ""}`}
                  name="name"
                  disabled={editableField !== "name" || isSubmitting}
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <small className="error-text">{errors.name}</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("name")} title="Click to edit name"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Date of Birth</div>
              <div className="apply-form-input">
                <input
                  type="date"
                  className={`apply-form-text-input ${errors.dob ? "error-border" : ""}`}
                  name="dob"
                  disabled={editableField !== "dob" || isSubmitting}
                  value={formData.dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handleInputChange}
                />
                {errors.dob && <small className="error-text">{errors.dob}</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("dob")} title="Click to edit date of birth"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Marital Status</div>
              <div className="apply-form-input">
                <select
                  className={`apply-form-select-input ${errors.marital ? "error-border" : ""}`}
                  name="marital"
                  disabled={editableField !== "marital" || isSubmitting}
                  value={formData.marital}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
                {errors.marital && <small className="error-text">{errors.marital}</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("marital")} title="Click to edit marital status"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Mobile Number</div>
              <div className="apply-form-input">
                <input
                  type="tel"
                  className={`apply-form-text-input ${errors.mobile ? "error-border" : ""}`}
                  name="mobile"
                  disabled={editableField !== "mobile" || isSubmitting}
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
                {errors.mobile && <small className="error-text">{errors.mobile}</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("mobile")} title="Click to edit mobile number"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Mail ID</div>
              <div className="apply-form-input">
                <input
                  type="email"
                  className={`apply-form-text-input ${errors.email ? "error-border" : ""}`}
                  name="email"
                  disabled={editableField !== "email" || isSubmitting}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <small className="error-text">{errors.email}</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("email")} title="Click to edit email"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Current Address</div>
              <div className="apply-form-info-box">
                {editableField === "address" ? (
                  <>
                    <input className="apply-form-text-input mb" name="street" placeholder="Street" value={formData.street} onChange={handleInputChange} disabled={isSubmitting} />
                    <input className="apply-form-text-input mb" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} disabled={isSubmitting} />
                    <input className="apply-form-text-input mb" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} disabled={isSubmitting} />
                    <input className="apply-form-text-input mb" name="zip" placeholder="Zip" value={formData.zip} onChange={handleInputChange} disabled={isSubmitting} />
                    <input className="apply-form-text-input" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} disabled={isSubmitting} />
                  </>
                ) : (
                  <>
                    <div><strong>Street</strong><p>:</p> {formData.street}</div>
                    <div><strong>City</strong><p>:</p> {formData.city}</div>
                    <div><strong>State</strong><p>:</p> {formData.state}</div>
                    <div><strong>Zip</strong><p>:</p> {formData.zip}</div>
                    <div><strong>Country</strong><p>:</p> {formData.country}</div>
                  </>
                )}
                {(errors.city || errors.zip) && <small className="error-text">Address details required</small>}
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("address")} title="Click to edit address"  >
                <img src={FormEditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row align-top">
              <div className="apply-form-label">Cover Letter</div>
              <div className="apply-form-input">
                <textarea
                  className={`cover-textarea ${errors.coverLetter ? "error-border" : ""}`}
                  name="coverLetter"
                  placeholder="Write your cover letter here..."
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={2000}
                  disabled={isSubmitting}
                />
                {errors.coverLetter && (
                  <small className="error-text" style={{ display: 'block', marginTop: '5px' }}>
                    {errors.coverLetter}
                  </small>
                )}
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Resume</div>
              <div className="apply-form-input">
                {formData.resume ? (
                  <div className={`apply-form-resume-box ${errors.resume ? "error-border" : ""}`}>
                    <span>
                      {formData.resume?.name || formData.resumeName}
                    </span>
                    <button
                      type="button"
                      className="apply-form-remove-btn"
                      onClick={removeResume}
                      disabled={isSubmitting}
                    >
                      <img src={deleteIcon} alt="delete" />
                    </button>
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      disabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <input
                    type="file"
                    className={`apply-form-file-input ${errors.resume ? "error-border" : ""}`}
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                    disabled={isSubmitting}
                  />
                )}
                {errors.resume && <small className="error-text">{errors.resume}</small>}
              </div>
            </div>

            <div className="apply-form-action-buttons">
              <button type="button" className="apply-form-secondary-btn" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="apply-form-primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Applying..." : "Apply"}
              </button>
            </div>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}