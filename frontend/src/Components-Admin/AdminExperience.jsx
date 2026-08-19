import React from 'react';
import './AdminExperience.css';

export const AdminExperience = ({ experienceData }) => {
  // If no data, show empty state
  if (!experienceData || experienceData.length === 0) {
    return (
      <div className="admin-exp-card">
        <h3 className="admin-exp-title">Top Experience Levels</h3>
        <p className="admin-exp-subtext">Applicants by Experience Level</p>
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          No experience data available
        </p>
      </div>
    );
  }

  // Color mapping for consistent styling
  const colorMap = {
    'Entry Level': '#4A76FD',
    'Junior Level': '#FFAC5F',
    'Mid Level': '#45CCE1',
    'Senior Level': '#A17DFF'
  };

  // Experience level descriptions (watermark/hint text)
  const experienceDescriptions = {
    'Entry Level': 'Less than 1 year (Freshers / Interns)',
    'Junior Level': '1 to 3 years of experience',
    'Mid Level': '3 to 6 years of experience',
    'Senior Level': 'More than 6 years of experience'
  };

  // Get color with fallback
  const getColor = (label) => {
    return colorMap[label] || '#4A76FD';
  };

  return (
    <div className="admin-exp-card">
      <h3 className="admin-exp-title">Top Experience Levels</h3>
      <p className="admin-exp-subtext">Applicants by Experience Level</p>
      <div className="admin-exp-list">
        {experienceData.map((item, index) => {
          const color = getColor(item.label);
          const description = experienceDescriptions[item.label] || '';

          return (
            <div key={index} className="admin-exp-item">
              {/* Label and Percentage in same row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div>
                  <span className="admin-exp-label">{item.label}</span>
                  {/* Watermark/Hint text - small and muted */}
                  {description && (
                    <span style={{
                      fontSize: '11px',
                      color: '#999',
                      marginLeft: '10px',
                      fontWeight: '400'
                    }}>
                      ({description})
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: '10px' }}>
                    {item.count || 0} applicants
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: color
                  }}>
                    {item.percentage || 0}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="admin-exp-bar-bg">
                <div
                  className="admin-exp-bar-fill"
                  style={{
                    width: `${item.percentage || 0}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};