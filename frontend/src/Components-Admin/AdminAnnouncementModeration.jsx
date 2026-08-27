import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./AdminAnnouncementModeration.css";
import Searchicon from "../assets/icon_search.png";

export default function AdminAnnouncementModeration() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/announcements/");
      setAnnouncements(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load moderation announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ---------- Detail View ----------
  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setEditingStatus(announcement.status);
  };

  const handleBackToList = () => {
    setSelectedAnnouncement(null);
    setEditingStatus("");
  };

  // Update status using the correct backend endpoints
  const handleStatusChange = async (newStatus) => {
    if (!selectedAnnouncement) return;

    try {
      let response;
      if (newStatus === "published") {
        response = await api.patch(`admin/announcements/${selectedAnnouncement.id}/approve/`);
      } else if (newStatus === "draft") {
        response = await api.patch(`admin/announcements/${selectedAnnouncement.id}/reject/`);
      } else {
        // If you ever add "expired" support, add an endpoint or use reject
        alert("Status change not supported.");
        return;
      }

      // Update local state
      const updated = { ...selectedAnnouncement, status: newStatus };
      setSelectedAnnouncement(updated);
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === selectedAnnouncement.id ? updated : item
        )
      );
      alert(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this announcement?")) return;
    try {
      await api.delete(`admin/announcements/${id}/`);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
      if (selectedAnnouncement?.id === id) handleBackToList();
      alert("Deleted.");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // ---------- Filter ----------
  const filtered = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.announcement_type?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---------- Render: Detail View ----------
  if (selectedAnnouncement) {
    return (
      <div className="aam-container">
        <div className="aam-wrapper">
          {/* Back button (styled like AdminTickets) */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleBackToList}
              className="Adm-tic-btn-back"
              style={{
                background: "#1E88E5",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              ← Back to Announcements
            </button>
          </div>

          {/* Detail card - using AdminTickets style classes */}
          <div className="Adm-tic-header-section" style={{ display: "block" }}>
            <div className="Adm-tic-title-block">
              <div>
                <h1 className="Adm-tic-main-title">{selectedAnnouncement.title}</h1>
                <p className="Adm-tic-id">
                  {selectedAnnouncement.company?.company_name || "Unknown Company"}
                </p>
                <p className="Adm-tic-date-created">
                  Created: {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="Adm-tic-meta-info" style={{ marginTop: "15px" }}>
              <div className="Adm-tic-meta-row">
                <span className="Adm-tic-meta-label">Status</span>
                <span className={`aam-status-badge ${selectedAnnouncement.status}`}>
                  {selectedAnnouncement.status}
                </span>
              </div>
              <div className="Adm-tic-meta-row">
                <span className="Adm-tic-meta-label">Type</span>
                <span className="aam-type-badge">{selectedAnnouncement.announcement_type}</span>
              </div>
              <div className="Adm-tic-meta-row">
                <span className="Adm-tic-meta-label">Duration</span>
                <span>
                  {new Date(selectedAnnouncement.start_date).toLocaleDateString()}
                  {selectedAnnouncement.end_date
                    ? ` → ${new Date(selectedAnnouncement.end_date).toLocaleDateString()}`
                    : " • Open"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section-card" style={{ marginTop: "24px" }}>
            <h3 className="detail-section-title">Description</h3>
            <div className="detail-report-textbox">
              {selectedAnnouncement.description || "No description provided."}
            </div>
          </div>

          {/* Status update section */}
          <div className="detail-top-actions" style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label style={{ fontWeight: "600", color: "#1e293b" }}>Change Status:</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
                className="aam-status-select"
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                {/* Expired is not editable via approve/reject, but you can add it later */}
              </select>
              <button
                onClick={() => handleStatusChange(editingStatus)}
                className="aam-btn aam-approve"
                style={{ padding: "8px 20px" }}
              >
                Update Status
              </button>
            </div>
          </div>

          {/* Quick action buttons */}
          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleStatusChange("published")}
              className="aam-btn aam-approve"
            >
              Approve (Publish)
            </button>
            <button
              onClick={() => handleStatusChange("draft")}
              className="aam-btn aam-reject"
            >
              Reject (Draft)
            </button>
            <button
              onClick={() => handleDelete(selectedAnnouncement.id)}
              className="aam-btn aam-delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render: List View ----------
  return (
    <div className="aam-container">
      <div className="aam-wrapper">
        <div className="aam-header">
          <div>
            <h1 className="aam-title">Announcement Moderation Hub</h1>
            <p className="aam-subtitle">
              Review, approve, or reject company announcements before broadcast.
            </p>
          </div>
        </div>

        {/* Search & Filter (like AdminTickets) */}
        <div className="um-search-container" style={{ marginBottom: "20px" }}>
          <div className="search-wrapper">
            <span className="search-icon">
              <img src={Searchicon} alt="Search" />
            </span>
            <input
              type="text"
              placeholder="Search by company, title, description, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="aam-search-input"
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="aam-select"
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="aam-table-card">
          <table className="aam-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Title & Description</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="aam-empty">
                    Loading announcements...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="aam-empty">
                    No matching announcements found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="aam-company-cell">
                        <div className="aam-logo-box">
                          {item.company?.company_logo ? (
                            <img src={item.company.company_logo} alt="" />
                          ) : (
                            <span>{item.company?.company_name?.charAt(0) || "C"}</span>
                          )}
                        </div>
                        <strong>{item.company?.company_name || "Unknown"}</strong>
                      </div>
                    </td>

                    <td style={{ maxWidth: "280px" }}>
                      <div className="aam-item-title">{item.title}</div>
                      <div className="aam-item-desc">{item.description}</div>
                    </td>

                    <td>
                      <span className="aam-type-badge">{item.announcement_type}</span>
                    </td>

                    <td>
                      {new Date(item.start_date).toLocaleDateString()}
                      {item.end_date
                        ? ` → ${new Date(item.end_date).toLocaleDateString()}`
                        : " • Open"}
                    </td>

                    <td>
                      <span className={`aam-status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="aam-btn"
                        style={{
                          background: "#1E88E5",
                          color: "#fff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}