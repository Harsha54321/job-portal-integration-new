import React from 'react';
import './TotalOverview.css';

export const TotalOverview = ({ overviewData = {} }) => {
  const data = [
    { label: 'Application Submitted', value: overviewData.applicants ?? 0, color: '#4cc3e0' },
    { label: 'Resume Screening', value: overviewData.resume_screening ?? 0, color: '#ffcc00' },
    { label: 'Recruiter Review', value: overviewData.recommended ?? 0, color: '#5b83ff' },
    { label: 'Shortlisted', value: overviewData.shortlisted ?? 0, color: '#a67dff' },
    { label: 'Interview', value: overviewData.interview ?? 0, color: '#ffb36b' },
    { label: 'Offered', value: overviewData.offered ?? 0, color: '#00cc66' },
    { label: 'Rejected', value: overviewData.rejected ?? 0, color: '#ff7070' },
    { label: 'Hired', value: overviewData.hired ?? 0, color: '#cfd8dc' },
    { label: 'Withdrawn', value: overviewData.withdrawn ?? 0, color: '#999999' },
  ];

  const total = overviewData.total_candidates
    ?? data.reduce((acc, item) => acc + item.value, 0);

  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="Admin-overview-card">
      <h2 className="Admin-overview-title">Total Overview</h2>
      <hr className="Admin-divider" />

      <div className="Admin-chart-container">
        <svg width="250" height="250" viewBox="0 0 200 200">
          {data.map((item, index) => {
            if (item.value === 0) return null;

            const strokeDasharray = (item.value / total) * circumference;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += strokeDasharray;

            return (
              <circle
                key={index}
                cx="100" cy="100" r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="25"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                className="Admin-chart-segment"
              />
            );
          })}
          <text x="50%" y="50%" textAnchor="middle" className="Admin-total-count">{total}</text>
          <text x="50%" y="56%" textAnchor="middle" className="Admin-total-label">Total Applicants Count</text>
        </svg>
      </div>

      <div className="Admin-legend-grid">
        {data.map((item, index) => (
          <div key={index} className="Admin-legend-item">
            <span className="Admin-dot" style={{ backgroundColor: item.color }}></span>
            <span className="Admin-label-text">{item.label}:</span>
            <span className="Admin-label-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

