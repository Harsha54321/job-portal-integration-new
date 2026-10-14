import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./CompanyBranding.css";
import calenderCard from "../assets/calender_card.png";

const PRESET_COLORS = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#EA580C", "#0F172A"];

const DateInput = ({
  name,
  value,
  onChange,
  onBlur,
  min,
  max,
  className = "",
  error = false,
  disabled = false,
}) => {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (disabled) return;
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
        // Safari can throw if not triggered by a trusted gesture — ignore.
      }
    } else {
      el.focus();
    }
  };

  return (
    <div className="date-input-wrapper">
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        className={`${error ? "error-msg-border" : ""} ${className}`}
      />

      <button
        type="button"
        className="date-picker-icon-btn"
        onClick={openPicker}
        aria-label="Open calendar"
        tabIndex={-1}
        disabled={disabled}
        title="Open calendar"
      >
        <img
          src={calenderCard}
          alt="calendar"
          loading="eager"
          draggable={false}
        />
      </button>
    </div>
  );
};

// ================================================================
// TEXT SANITIZER
// - No leading whitespace
// - Collapse 2+ consecutive whitespace → single space
// - Trailing whitespace NOT trimmed here (user can type "Hello World")
// ================================================================
const sanitizeText = (value) => {
  if (!value) return "";
  let cleaned = value.replace(/^\s+/, "");     // remove leading spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");   // collapse multiple → single
  return cleaned;
};

// Final trim — used on blur & submit
const finalTrim = (value) => (value || "").trim();

export default function CompanyBranding() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.targetAnnouncementId ? "announcements" : "branding"
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Branding State
  const [branding, setBranding] = useState({
    company_name: "",
    tagline: "",
    about: "",
    website: "",
    linkedin_url: "",
    brand_color: "#2563EB",
    company_logo: null,
    banner_image: null,
  });
  const [previews, setPreviews] = useState({ logo: "", banner: "" });

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    announcement_type: "hiring",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "draft",
  });

  const [formErrors, setFormErrors] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchCompanyData();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (location.state?.targetAnnouncementId) {
      setActiveTab("announcements");
    }
  }, [location.state]);

  const fetchCompanyData = async () => {
    try {
      const res = await api.get("company/profile/");
      if (res.data) {
        setBranding({
          company_name: res.data.company_name || "",
          tagline: res.data.company_moto || res.data.tagline || "",
          about: res.data.about || "",
          website: res.data.website || "",
          linkedin_url: res.data.linkedin_url || "",
          brand_color: res.data.brand_color || "#2563EB",
          company_logo: null,
          banner_image: null,
        });
        setPreviews({
          logo: res.data.logo_absolute_url || res.data.logo_url || "",
          banner: res.data.banner_image || "",
        });
      }
    } catch (err) {
      console.error("Error loading branding:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("announcements/");
      setAnnouncements(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setBranding((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({
        ...prev,
        [field === "company_logo" ? "logo" : "banner"]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("company_name", finalTrim(branding.company_name));
    formData.append("company_moto", finalTrim(branding.tagline));
    formData.append("about", finalTrim(branding.about));
    formData.append("website", finalTrim(branding.website));
    formData.append("linkedin_url", finalTrim(branding.linkedin_url));
    formData.append("brand_color", branding.brand_color);

    if (branding.company_logo) formData.append("company_logo", branding.company_logo);
    if (branding.banner_image) formData.append("banner_image", branding.banner_image);

    try {
      await api.patch("company/profile/update/", formData);
      setFeedback({ type: "success", text: "Branding saved successfully!" });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to update branding settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    // Final trim before validation & submit
    const trimmedTitle = finalTrim(newAnnouncement.title);
    const trimmedDescription = finalTrim(newAnnouncement.description);

    const errors = {};
    if (hasOnlySpecialChars(trimmedTitle)) {
      errors.title = "Title must include some text, not only special characters.";
    }
    if (hasOnlySpecialChars(trimmedDescription)) {
      errors.description = "Description must include some text, not only special characters.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setLoading(true);
    try {
      const payload = {
        ...newAnnouncement,
        title: trimmedTitle,
        description: trimmedDescription,
      };
      await api.post("announcements/", payload);
      setShowModal(false);
      setFormErrors({});

      setNewAnnouncement({
        title: "",
        description: "",
        announcement_type: "hiring",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "draft",
      });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create announcement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Permanently delete this announcement?")) return;
    try {
      await api.delete(`announcements/${id}/`);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  const getAnnouncementHighlight = (id) => {
    return location.state?.targetAnnouncementId === id ? "cb-highlighted-row" : "";
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      const [year] = value.split("-");
      if (year.length > 4) return;
    }
    setNewAnnouncement({ ...newAnnouncement, end_date: value });
  };

  const hasOnlySpecialChars = (value) => {
    return !/[a-zA-Z0-9]/.test(value || "");
  };

  // ===== Pagination calculations =====
  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentAnnouncements = announcements.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [announcements.length, currentPage, totalPages]);

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");
    pages.push(total);

    return pages;
  };

  return (
    <div className="cb-container">
      <div className="cb-wrapper">
        {/* Navigation Header */}
        <div className="cb-header">
          <div>
            <h1 className="cb-title">Company Branding & Announcements</h1>
            <p className="cb-subtitle">
              Manage how candidates view your organization and publish recruitment drives.
            </p>
          </div>
          <div className="cb-tab-buttons">
            <button
              onClick={() => setActiveTab("branding")}
              className={`cb-tab-btn ${activeTab === "branding" ? "active" : ""}`}
            >
              Company Branding
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`cb-tab-btn ${activeTab === "announcements" ? "active" : ""}`}
            >
              Announcements
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`cb-alert ${feedback.type === "success" ? "cb-alert-success" : "cb-alert-error"}`}>
            {feedback.text}
          </div>
        )}

        {/* TAB 1: BRANDING BUILDER */}
        {activeTab === "branding" && (
          <div className="cb-grid">
            <form onSubmit={handleSaveBranding} className="cb-card cb-form">
              <h2 className="cb-card-heading">Visual Identity & Links</h2>

              <div className="cb-row">
                <div className="cb-field">
                  <label className="cb-label">Company Logo</label>
                  <label className="cb-file-drop">
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "company_logo")}
                    />
                  </label>
                </div>
                <div className="cb-field">
                  <label className="cb-label">Cover Banner</label>
                  <label className="cb-file-drop">
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "banner_image")}
                    />
                  </label>
                </div>
              </div>

              <div className="cb-field">
                <label className="cb-label">Brand Color Accent</label>
                <div className="cb-color-picker-row">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBranding({ ...branding, brand_color: color })}
                      style={{ backgroundColor: color }}
                      className={`cb-color-swatch ${branding.brand_color === color ? "selected" : ""}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={branding.brand_color}
                    onChange={(e) => setBranding({ ...branding, brand_color: e.target.value })}
                    className="cb-native-color-picker"
                  />
                </div>
              </div>

              <div className="cb-field">
                <label className="cb-label">Company Tagline</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  placeholder="e.g. Innovating next-gen workflows"
                  className="cb-input"
                />
              </div>

              <div className="cb-field">
                <label className="cb-label">About Company</label>
                <textarea
                  rows={3}
                  value={branding.about}
                  onChange={(e) => setBranding({ ...branding, about: e.target.value })}
                  placeholder="Brief description of your mission and team culture..."
                  className="cb-textarea"
                />
              </div>

              <div className="cb-row">
                <div className="cb-field">
                  <label className="cb-label">Website URL</label>
                  <input
                    type="url"
                    value={branding.website}
                    onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                    placeholder="https://"
                    className="cb-input"
                  />
                </div>
                <div className="cb-field">
                  <label className="cb-label">LinkedIn URL (Optional)</label>
                  <input
                    type="url"
                    value={branding.linkedin_url}
                    onChange={(e) => setBranding({ ...branding, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                    className="cb-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: branding.brand_color }}
                className="cb-submit-btn"
              >
                {loading ? "Saving..." : "Save Branding"}
              </button>
            </form>

            <div className="cb-preview-container">
              <div className="cb-preview-tag">Candidate Profile View Preview</div>
              <div className="cb-card cb-preview-card">
                <div
                  className="cb-preview-banner"
                  style={{
                    backgroundImage: previews.banner ? `url(${previews.banner})` : "none",
                    backgroundColor: !previews.banner ? `${branding.brand_color}25` : "transparent",
                  }}
                />
                <div className="cb-preview-body">
                  <div className="cb-preview-top-row">
                    <div className="cb-preview-logo-box">
                      {previews.logo ? (
                        <img src={previews.logo} alt="Logo" className="cb-preview-logo-img" />
                      ) : (
                        <span>{branding.company_name?.charAt(0) || "C"}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      style={{ backgroundColor: branding.brand_color }}
                      className="cb-preview-follow-btn"
                    >
                      Follow
                    </button>
                  </div>
                  <h3 className="cb-preview-name">{branding.company_name || "Company Name"}</h3>
                  <p className="cb-preview-tagline">{branding.tagline || "Tagline appears here"}</p>
                  <p className="cb-preview-about">{branding.about || "Description will display here..."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENTS MANAGER */}
        {activeTab === "announcements" && (
          <div className="cb-announcements-section">
            <div className="cb-announcements-header">
              <div>
                <h2 className="cb-card-heading">Broadcasted Announcements</h2>
                <p className="cb-subtitle">Publish drives, walk-ins, and critical updates.</p>
              </div>
              <button onClick={() => setShowModal(true)} className="cb-create-btn">
                + Create Announcement
              </button>
            </div>

            <div className="cb-card cb-table-card">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="cb-empty-cell">
                        No announcements posted yet.
                      </td>
                    </tr>
                  ) : (
                    currentAnnouncements.map((item) => (
                      <tr
                        key={item.id}
                        className={getAnnouncementHighlight(item.id)}
                        style={{
                          backgroundColor:
                            location.state?.targetAnnouncementId === item.id
                              ? "#FFF8E1"
                              : "transparent",
                          borderLeft:
                            location.state?.targetAnnouncementId === item.id
                              ? "4px solid #FFD700"
                              : "none",
                        }}
                      >
                        <td>
                          <strong style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                            {item.title}
                          </strong>
                        </td>
                        <td>
                          <span className="cb-type-badge">{item.announcement_type}</span>
                        </td>
                        <td>
                          {new Date(item.start_date).toLocaleDateString()}{" "}
                          {item.end_date
                            ? `→ ${new Date(item.end_date).toLocaleDateString()}`
                            : "• Open"}
                        </td>
                        <td>
                          <span className={`cb-status-badge ${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="cb-delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {announcements.length > 0 && (
                <div className="cb-pagination-footer">
                  <p>
                    Showing {indexOfFirstItem + 1}–
                    {Math.min(indexOfLastItem, announcements.length)} of{" "}
                    {announcements.length} announcements
                  </p>

                  <div className="cb-pagination-btns">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="cb-page-arrow"
                      aria-label="Previous page"
                      title="Prev"
                    >
                      ‹
                    </button>

                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="cb-page-ellipsis">
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`cb-page-num ${currentPage === page ? "active" : ""}`}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="cb-page-arrow"
                      aria-label="Next page"
                      title="Next"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: New Announcement */}
        {showModal && (
          <div className="cb-modal-overlay">
            <div className="cb-modal">
              <div className="cb-modal-header">
                <h3>New Announcement</h3>
                <button onClick={() => setShowModal(false)} className="cb-modal-close">✕</button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="cb-modal-form">
                <div className="cb-field">
                  <label className="cb-label">Title</label>
                  <input
                    required
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => {
                      const cleaned = sanitizeText(e.target.value);
                      setNewAnnouncement({ ...newAnnouncement, title: cleaned });
                      setFormErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    onBlur={(e) => {
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        title: finalTrim(prev.title),
                      }));
                    }}
                    placeholder="e.g. Mega Off-Campus Hiring Drive"
                    className="cb-input"
                  />
                  {formErrors.title && <span className="error-msg">{formErrors.title}</span>}
                </div>

                <div className="cb-row">
                  <div className="cb-field">
                    <label className="cb-label">Type</label>
                    <select
                      value={newAnnouncement.announcement_type}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, announcement_type: e.target.value })}
                      className="cb-select"
                    >
                      <option value="hiring">Hiring Drive</option>
                      <option value="event">Event / Fair</option>
                      <option value="deadline">Application Deadline</option>
                      <option value="notice">Notice</option>
                    </select>
                  </div>
                  <div className="cb-field">
                    <label className="cb-label">End Date</label>
                    <DateInput
                      name="end_date"
                      value={newAnnouncement.end_date}
                      min={newAnnouncement.start_date || new Date().toISOString().split("T")[0]}
                      onChange={handleEndDateChange}
                      className="cb-input"
                    />
                  </div>
                </div>

                <div className="cb-field">
                  <label className="cb-label">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newAnnouncement.description}
                    onChange={(e) => {
                      const cleaned = sanitizeText(e.target.value);
                      setNewAnnouncement({ ...newAnnouncement, description: cleaned });
                      setFormErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    onBlur={(e) => {
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        description: finalTrim(prev.description),
                      }));
                    }}
                    placeholder="Provide details about dates, eligibility, criteria, etc."
                    className="cb-textarea"
                  />
                  {formErrors.description && <span className="error-msg">{formErrors.description}</span>}
                </div>

                <div className="cb-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cb-modal-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="cb-modal-submit">
                    {loading ? "Publishing..." : "Publish Broadcast"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}