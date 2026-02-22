import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Footer } from "../Components-LandingPage/Footer";
import EditIcon from "../assets/EditIcon.png";
import deleteIcon from "../assets/DeleteIcon.png";
import time from "../assets/opportunity_time.png";
import experience from "../assets/opportunity_bag.png";
import place from "../assets/opportunity_location.png";
import './JobApplication.css'
import { Header } from "../Components-LandingPage/Header";
import api from "../api/axios";
import application_success from "../assets/application_success.png";


export const JobApplication = () => {

  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    api.get("profile/jobseeker/")
      .then(res => {
        setFormData(prev => ({
          ...prev,
          name: res.data.user?.username || "",
          dob: res.data.dob || "",
          email: res.data.email || "",
          mobile: res.data.phone || "",
          marital: res.data.marital_status || "",
          street: res.data.street || "",
          city: res.data.city || "",
          state: res.data.state || "",
          zip: res.data.pincode || "",
          country: res.data.country || "",
          resume: res.data.resume
            ? {
              name: res.data.resume.split("/").pop(),
              url: res.data.resume,
              isExisting: true
            }
            : null
        }));
      })
      .catch(err => {
        console.error("Failed to preload profile data", err);
      });
  }, []);

  useEffect(() => {
    api.get(`/jobs/${jobId}/`)
      .then(res => {
        setJob(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job", err);
        setLoading(false);
      });
  }, [jobId]);





  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: value }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, resume: file }));
    } else {
      alert("Upload PDF only");
      fileInputRef.current.value = "";
    }
  };

  const removeResume = () => {
    setFormData({
      ...formData,
      resume: null,
    });

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
    ];

    for (let field of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        alert(`Please fill ${field}`);
        setEditableField(
          ["street", "city", "state", "zip", "country"].includes(field)
            ? "address"
            : field
        );
        return false;
      }
    }

    if (formData.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits");
      setEditableField("mobile");
      return false;
    }
    return true;
  };

  console.log("JOB ID FROM URL:", jobId);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!window.confirm("Are you sure want to apply?")) return;

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

      if (formData.resume) {
        payload.append("resume", formData.resume);
      }

      await api.post("/jobs/apply/", payload);

      navigate(`/Job-portal/jobseeker/submitted/${job.id}`);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 || error.response?.status === 409) {
        alert("You have already applied for this job");
      } else {
        alert("Failed to apply for job");
      }
    }
  };

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


  return (
    <>
      <Header />

      <div className="apply-form-page">

        <div className="apply-form-job-header">
          <h1 className="apply-form-job-title">{job.title}</h1>

          <div className="apply-form-job-meta">
            <span className="apply-form-company-name">
              {job.company?.name}
            </span>


            <span>
              <img src={time} className="apply-form-card-icons" />
              {job.work_type}
            </span>

            <span>₹ {job.salary} LPA</span>

            <span>
              <img src={experience} className="apply-form-card-icons" />
              {job.experience_required}
            </span>

            <span>
              <img src={place} className="apply-form-card-icons" />
              {job.location}
            </span>
          </div>
        </div>

        <div className="apply-form-container">
          <form className="apply-form-card" onSubmit={handleSubmit}>

            <div className="apply-form-row">
              <div className="apply-form-label">Name</div>
              <div className="apply-form-input">
                <input
                  type="text"
                  className="apply-form-text-input"
                  name="name"
                  disabled={editableField !== "name"}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("name")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Date of Birth</div>
              <div className="apply-form-input">
                <input
                  type="date"
                  className="apply-form-text-input"
                  name="dob"
                  disabled={editableField !== "dob"}
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("dob")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Marital status</div>
              <div className="apply-form-input">
                <select
                  className="apply-form-select-input"
                  name="marital"
                  disabled={editableField !== "marital"}
                  value={formData.marital}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("marital")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Mobile number</div>
              <div className="apply-form-input">
                <input
                  type="tel"
                  className="apply-form-text-input"
                  name="mobile"
                  disabled={editableField !== "mobile"}
                  value={formData.mobile}
                  onChange={handleMobileChange}
                />
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("mobile")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Mail ID</div>
              <div className="apply-form-input">
                <input
                  type="email"
                  className="apply-form-text-input"
                  name="email"
                  disabled={editableField !== "email"}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("email")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Current address</div>
              <div className="apply-form-info-box">
                {editableField === "address" ? (
                  <>
                    <input className="apply-form-text-input mb" name="street" placeholder="Street" value={formData.street} onChange={handleChange} />
                    <input className="apply-form-text-input mb" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                    <input className="apply-form-text-input mb" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <input className="apply-form-text-input mb" name="zip" placeholder="Zip" value={formData.zip} onChange={handleChange} />
                    <input className="apply-form-text-input" name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
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
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("address")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row align-top">
              <div className="apply-form-label">Cover letter</div>
              <div className="apply-form-input">
                <textarea
                  className="cover-textarea"
                  name="coverLetter"
                  placeholder="Write your cover letter here..."
                  disabled={editableField !== "coverLetter"}
                  value={formData.coverLetter}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div className="apply-form-edit" onClick={() => setEditableField("coverLetter")}>
                <img src={EditIcon} alt="edit" />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-label">Resume</div>
              <div className="apply-form-input">
                {formData.resume ? (
                  <div className="apply-form-resume-box">
                    <span>{formData.resume?.name}</span>

                    <button
                      type="button"
                      className="apply-form-remove-btn"
                      onClick={removeResume}
                    >
                      <img src={deleteIcon} alt="delete" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Replace
                    </button>

                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                    />
                  </div>
                ) : (

                  <input
                    type="file"
                    className="apply-form-file-input"
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                  />
                )}
              </div>

            </div>

            <div className="apply-form-action-buttons">
              <button type="submit" className="apply-form-primary-btn">
                Apply
              </button>
            </div>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}