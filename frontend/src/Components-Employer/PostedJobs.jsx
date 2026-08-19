import React, { useState, useEffect } from 'react';
import './PostedJobs.css';
import place from '../assets/opportunity_location.png'
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../JobContext';
import api from "../api/axios";
import { LocationDisplay } from '../Components-Jobseeker/LocationDisplay';

export const PostedJobs = ({ onViewApplicants, onEditJob, allowEditAfterApproval = true }) => {
  const navigate = useNavigate();
  const { jobs, getJobStats, currentEmployer, deleteJob, setCurrentEmployer, setAlluser } = useJobs();

  const [activeMenu, setActiveMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);


  const PostedJob = currentEmployer?.jobPosted || [];

  // Fetch applications from API for accurate stats
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('jobs/applications/');
        console.log("PostedJobs - Applications:", response.data);
        setApplications(response.data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Calculate stats for each job using actual application data
  const getJobApplicationStats = (jobId) => {
    if (!applications.length) {
      return { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 };
    }

    const jobApplications = applications.filter(app =>
      String(app.job?.id) === String(jobId)
    );

    return {
      total: jobApplications.length,
      new: jobApplications.filter(app => app.status?.toLowerCase() === 'applied').length,
      shortlisted: jobApplications.filter(app =>
        app.status?.toLowerCase() === 'shortlisted'
      ).length,
      interview: jobApplications.filter(app => app.status?.toLowerCase() === 'interview_called').length,
      rejected: jobApplications.filter(app => app.status?.toLowerCase() === 'rejected').length
    };
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEditClick = (job) => {
    setActiveMenu(null);
    navigate('/Job-portal/Employer/EditJob', { state: job });
  };

  const handleEditJobClick = (job) => {
    setActiveMenu(null);
    if (job.approval_status === 'approved' && !allowEditAfterApproval) return;

    if (onEditJob) onEditJob(job);
  };

  const handleDeleteClick = async (id) => {
    setSelectedJobId(id);
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteJob(selectedJobId);
      setShowDeleteModal(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="postedjobs-container">
        <h2 className="postedjobs-header">Jobs posted by you</h2>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>
          <h2>Loading jobs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="postedjobs-container">
      <h2 className="postedjobs-header">Jobs posted by you</h2>

      {PostedJob.length > 0 ? (
        <>
          <div className="postedjobs-grid-layout postedjobs-table-header">
            <div />
            <span className="postedjobs-label">Applicants</span>
            <span className="postedjobs-label" title="Candidates who applied but not yet reviewed">
              New ⓘ
            </span>
            <span className="postedjobs-label">Shortlisted</span>
            <span className="postedjobs-label">Interview</span>
            <span className="postedjobs-label">Rejected</span>
            <div />
          </div>

          <div className="postedjobs-list">
            {PostedJob.map((job) => {
              const stats = getJobApplicationStats(job.id);

              // ONLY highlighted jobs get styling
              const isHighlighted = job.is_highlighted === true;

              let cardClassName = "postedjobs-grid-layout postedjobs-card";
              if (isHighlighted) {
                cardClassName += " highlighted-job";
              }

              // return (
              //   <div key={job.id} className={cardClassName} style={{ position: 'relative', overflow: 'visible' }}>
              // replace with
              return (
                <div key={job.id} className={cardClassName} style={{ position: 'relative', overflow: 'visible', zIndex: activeMenu === job.id ? 1000 : 1 }}>
                  {/* Badge only for highlighted jobs */}
                  {isHighlighted && <span className="job-badge premium-badge">⭐ Highlighted job</span>}

                  <div className="postedjobs-info">
                    <h3>{job.job_title}</h3>
                    <p className="postedjobs-loc flex items-center gap-2">
                      <img src={place} alt="location" className="post-job-locationicon" />
                      <LocationDisplay locations={job.location} />
                    </p>
                    <small>Created on: {new Date(job.created_at || job.posted_date).toLocaleDateString()}</small>
                  </div>

                  <span className="postedjobs-badge">{stats.total}</span>
                  <span className="postedjobs-badge">{stats.new}</span>
                  <span className="postedjobs-badge">{stats.shortlisted}</span>
                  <span className="postedjobs-badge">{stats.interview}</span>
                  <span className="postedjobs-badge">{stats.rejected}</span>

                  <div className="postedjobs-actions" style={{ position: 'relative' }}>
                    <button
                      className="postedjobs-view-btn"
                      onClick={() => onViewApplicants(job)}
                    >
                      View applicants
                    </button>
                    <div className="postedjobs-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={() => toggleMenu(job.id)}
                        className="postedjobs-dots"
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '5px 10px' }}
                      >
                        ⋮
                      </button>
                      {activeMenu === job.id && (
                        <div
                          className="postedjobs-dropdown"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '30px',
                            background: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                            zIndex: 99999,
                            overflow: 'hidden',
                            minWidth: '130px'
                          }}
                        >

                          <button
                            onClick={() => handleEditClick(job)}
                            style={{ display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                          >
                            Edit Status
                          </button>
                          {/* <button
                            onClick={() => handleEditJobClick(job)}
                            style={{ display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                          >
                            Edit Job
                          </button> */}
                          <button
                            onClick={() => handleEditJobClick(job)}
                            disabled={job.approval_status === 'approved' && !allowEditAfterApproval}
                            title={job.approval_status === 'approved' && !allowEditAfterApproval ? 'Editing approved jobs is disabled' : undefined}
                            style={{
                              display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', fontSize: '14px',
                              cursor: (job.approval_status === 'approved' && !allowEditAfterApproval) ? 'not-allowed' : 'pointer',
                              color: (job.approval_status === 'approved' && !allowEditAfterApproval) ? '#a0aab5' : 'inherit'
                            }}
                          >
                            Edit Job
                          </button>
                          <button
                            onClick={() => handleDeleteClick(job.id)}
                            className="delete-opt"
                            style={{ display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#d9534f', fontWeight: '600' }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>
          <h2>No Jobs posted by you</h2>
        </div>
      )}

      {showDeleteModal && (
        <div className="postedjobs-modal-overlay" style={{ zIndex: 999999 }}>
          <div className="postedjobs-modal">
            <p>Do you want to remove this job post?</p>
            <div className="postedjobs-modal-btns">
              <button onClick={() => setShowDeleteModal(false)} className="postedjobs-btn-cancel">Cancel</button>
              <button onClick={confirmDelete} className="postedjobs-btn-delete">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="postedjobs-toast" style={{ zIndex: 999999 }}>
          Your job post has been removed <span className="close-icon" onClick={() => setShowSuccessToast(false)}>X</span>
        </div>
      )}
    </div>
  );
};