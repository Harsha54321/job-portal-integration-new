// src/Components-Employer/WeeklySummary.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './WeeklySummary.css';

const WeeklySummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('employer/weekly-summary-data/');
      setData(response.data);
    } catch (err) {
      setError('Failed to load weekly summary. Please try again.');
      console.error('Weekly summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get relative time (e.g. "2 days ago")
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    if (diff < 7) return `${diff} days ago`;
    return formatDate(dateString);
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status) => {
    const map = {
      applied: 'badge-applied',
      shortlisted: 'badge-shortlisted',
      rejected: 'badge-rejected',
      hired: 'badge-hired',
      interview_called: 'badge-interview',
      withdrawn: 'badge-withdrawn',
    };
    return map[status] || 'badge-default';
  };

  const getStatusLabel = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="weekly-summary-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-cards">
            {[...Array(7)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
          </div>
          <div className="skeleton-table"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-summary-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchSummary} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { generated_date, summary, job_application_stats, recent_notifications, recent_applications } = data;

  // Calculate date range (last 7 days from generated_date)
  const endDate = new Date(generated_date);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  const dateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;

  // Summary cards configuration
  const summaryCards = [
    { key: 'total_jobs', label: 'Total Jobs', value: summary.total_jobs },
    { key: 'active_jobs', label: 'Active Jobs', value: summary.active_jobs },
    { key: 'expired_jobs', label: 'Expired Jobs', value: summary.expired_jobs },
    { key: 'highlighted_jobs', label: 'Highlighted Jobs', value: summary.highlighted_jobs },
    { key: 'total_applications', label: 'Total Applications', value: summary.total_applications },
    { key: 'applications_this_week', label: 'Applications This Week', value: summary.applications_this_week },
    { key: 'unread_notifications', label: 'Unread Notifications', value: summary.unread_notifications },
  ];

  return (
    <div className="weekly-summary-container">
      {/* Header */}
      <header className="summary-header">
        <h1>Weekly Summary</h1>
        <p className="subtitle">{dateRange}</p>
      </header>

      {/* Summary Stat Cards */}
      <section className="summary-cards-section">
        <div className="cards-grid">
          {summaryCards.map((card) => (
            <div key={card.key} className="stat-card">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Job Performance Table */}
      <section className="job-performance-section">
        <h2>Job Performance</h2>
        {job_application_stats.length === 0 ? (
          <p className="empty-state">No jobs posted in this period</p>
        ) : (
          <div className="table-wrapper">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Applications</th>
                  <th>Shortlisted</th>
                  <th>Rejected</th>
                  <th>Hired</th>
                </tr>
              </thead>
              <tbody>
                {job_application_stats.map((job) => (
                  <tr key={job.job_id}>
                    <td data-label="Job Title">{job.job_title}</td>
                    <td data-label="Applications">{job.applications_count}</td>
                    <td data-label="Shortlisted">{job.shortlisted}</td>
                    <td data-label="Rejected">{job.rejected}</td>
                    <td data-label="Hired">{job.hired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Two-column layout for recent activity */}
      <div className="recent-activity-grid">
        {/* Recent Applications */}
        <section className="recent-applications-section">
          <h2>Recent Applications</h2>
          {recent_applications.length === 0 ? (
            <p className="empty-state">No new applications this week.</p>
          ) : (
            <ul className="activity-list">
              {recent_applications.map((app, index) => (
                <li key={index} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-email">{app.candidate}</span>
                    <span className="activity-job-title">{app.job_title}</span>
                  </div>
                  <div className="activity-meta">
                    <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    <span className="activity-date">{getRelativeTime(app.applied_date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Notifications */}
        <section className="recent-notifications-section">
          <h2>Recent Notifications</h2>
          {recent_notifications.length === 0 ? (
            <p className="empty-state">No new notifications.</p>
          ) : (
            <ul className="activity-list">
              {recent_notifications.map((notif) => (
                <li key={notif.id} className="activity-item">
                  <div className="activity-info">
                    <span className={`unread-dot ${!notif.is_read ? 'unread' : ''}`} />
                    <span className="notification-message">{notif.message}</span>
                  </div>
                  <span className="activity-date">{getRelativeTime(notif.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default WeeklySummary;