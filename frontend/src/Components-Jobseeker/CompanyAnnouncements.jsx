import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./CompanyAnnouncements.css";
import backicon from "../assets/curved-go-back.png";

export default function JobseekerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBack();
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("announcements/");
        setAnnouncements(res.data.results || res.data || []);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company?.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || item.announcement_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="ja-container">
      <div className="ja-wrapper">

        <button
          className="Fheader-back-btn"
          onClick={handleBack}
          onKeyDown={handleKeyDown}
          aria-label="Go back to previous page"
          type="button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
            
          }}

        >
          <img
            src={backicon}
            alt="Go back"
            style={{ display: 'block' }}
            title="Go back to previous page"
          />
        </button>

        {/* Banner Section */}
        <div className="ja-banner">

          <div>
            <span className="ja-badge">Official Company Feeds</span>
            <h1 className="ja-title">Hiring Drives & Recruitment Updates</h1>
            <p className="ja-subtitle">
              Live notifications regarding off-campus drives, job fairs, and walk-ins.
            </p>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search companies or drives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ja-search-input"
            />
          </div>
        </div>


        {/* Filter Bar */}
        <div className="ja-filter-bar">
          {["all", "hiring", "event", "deadline", "notice"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`ja-filter-btn ${filterType === type ? "active" : ""}`}
            >
              {type === "all" ? "All Updates" : `${type}s`}
            </button>
          ))}
        </div>


        {/* Card Feed Grid */}
        {loading ? (
          <div className="ja-loading">Loading feeds...</div>
        ) : filtered.length === 0 ? (
          <div className="ja-empty">No announcements found matching your criteria.</div>
        ) : (
          <div className="ja-grid">
            {filtered.map((item) => {
              const brandColor = item.company?.brand_color || "#2563EB";
              return (
                <div key={item.id} className="ja-card">
                  <div className="ja-card-accent" style={{ backgroundColor: brandColor }} />

                  <div className="ja-card-body">
                    <div className="ja-company-row">
                      <div className="ja-company-logo">
                        {item.company?.company_logo ? (
                          <img src={item.company.company_logo} alt="" />
                        ) : (
                          <span>{item.company?.company_name?.charAt(0) || "C"}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="ja-company-name">{item.company?.company_name || "Partner Company"}</h4>
                        <span className="ja-type-label">{item.announcement_type}</span>
                      </div>
                    </div>

                    <h3 className="ja-card-title">{item.title}</h3>
                    <p className="ja-card-desc">{item.description}</p>
                  </div>

                  <div className="ja-card-footer">
                    <span className="ja-date">
                      📅 {new Date(item.start_date).toLocaleDateString()}
                    </span>

                    {item.company?.id && (
                      <Link
                        to={`/Job-portal/jobseeker/companies/${item.company.id}`}
                        style={{ color: brandColor }}
                        className="ja-link"
                      >
                        Company Profile →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>

  );
}