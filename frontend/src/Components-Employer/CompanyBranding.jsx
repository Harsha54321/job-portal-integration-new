import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./CompanyBranding.css";

const PRESET_COLORS = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#EA580C", "#0F172A"];

export default function CompanyBranding() {
  const [activeTab, setActiveTab] = useState("branding");
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
    status: "published",
  });

  useEffect(() => {
    fetchCompanyData();
    fetchAnnouncements();
  }, []);

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
    formData.append("company_name", branding.company_name);
    formData.append("company_moto", branding.tagline);
    formData.append("about", branding.about);
    formData.append("website", branding.website);
    formData.append("linkedin_url", branding.linkedin_url);
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
    setLoading(true);
    try {
      await api.post("announcements/", newAnnouncement);
      setShowModal(false);
      setNewAnnouncement({
        title: "",
        description: "",
        announcement_type: "hiring",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "published",
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
            
            {/* Editor Form */}
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
                  <label className="cb-label">LinkedIn URL</label>
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

            {/* Live Preview Card */}
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
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="cb-empty-cell">
                        No announcements posted yet.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.title}</strong></td>
                        <td><span className="cb-type-badge">{item.announcement_type}</span></td>
                        <td>
                          {new Date(item.start_date).toLocaleDateString()}{" "}
                          {item.end_date ? `→ ${new Date(item.end_date).toLocaleDateString()}` : "• Open"}
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
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="e.g. Mega Off-Campus Hiring Drive"
                    className="cb-input"
                  />
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
                    <input
                      type="date"
                      value={newAnnouncement.end_date}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, end_date: e.target.value })}
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
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                    placeholder="Provide details about dates, eligibility, criteria, etc."
                    className="cb-textarea"
                  />
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