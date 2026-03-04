import React from 'react';
import './Opportunities.css';
import { OpportunitiesCard } from "./OpportunitiesCard";

export const Opportunities = ({ jobs = [] }) => {
  if (!jobs.length) {
    return <p className="empty-state">No opportunities available</p>;
  }
  console.log("jobs:",jobs);
  

  return (
      <div className="Opportunities-job-list">
      {jobs.map((job) => (
          <OpportunitiesCard key={job.id} job={job} />
        ))}
      </div>
  );
};
