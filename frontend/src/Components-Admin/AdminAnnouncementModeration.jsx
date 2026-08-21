import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./AdminAnnouncementModeration.css";

export default function AdminAnnouncementModeration() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleApprove = async (id) => {
    try {
      await api.patch(`admin/announcements/${id}/approve/`);
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "published" } : item))
      );
    } catch (err) {
      alert("Failed to approve announcement.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`admin/announcements/${id}/reject/`);
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "draft" } : item))
      );
    } catch (err) {
      alert("Failed to reject announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this announcement?")) return;
    try {
      await api.delete(`admin/announcements/${id}/`);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  const filtered = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company?.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="aam-container">
      <div className="aam-wrapper">
        
        {/* Header Bar */}
        <div className="aam-header">
          <div>
            <h1 className="aam-title">Announcement Moderation Hub</h1>
            <p className="aam-subtitle">Review, approve, or reject company announcements before broadcast.</p>
          </div>

          <div className="aam-controls">
            <input
              type="text"
              placeholder="Search company or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="aam-search"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="aam-select"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Pending / Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="aam-table-card">
          <table className="aam-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Title & Description</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="aam-empty">Loading announcements...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="aam-empty">No matching announcements found.</td>
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

                    <td><span className="aam-type-badge">{item.announcement_type}</span></td>

                    <td>
                      {new Date(item.start_date).toLocaleDateString()}{" "}
                      {item.end_date ? `→ ${new Date(item.end_date).toLocaleDateString()}` : "• Open"}
                    </td>

                    <td>
                      <span className={`aam-status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="aam-btn-group">
                        {item.status !== "published" && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="aam-btn aam-approve"
                          >
                            Approve
                          </button>
                        )}
                        {item.status !== "draft" && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="aam-btn aam-reject"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="aam-btn aam-delete"
                        >
                          Delete
                        </button>
                      </div>
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