import React, { useState, useEffect, useRef } from 'react';
import './Escalation.css';
import { useJobs } from '../JobContext';
import api from '../api/axios';
import pencil from '../assets/AdminAssets/Edit.png';
import backIcon from '../assets/AdminAssets/BackBtn.png';
import victor from '../assets/AdminAssets/ReportJob.png';
import docIcon from '../assets/AdminAssets/InProgress.png';
import deleteIcon from '../assets/AdminAssets/DeleteIcon.png';
import eye from '../assets/AdminAssets/EyeIcon.png';
import Priority from '../assets/AdminAssets/Priority.png';
import AdminCategory from '../assets/AdminAssets/AdminCategory.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import Searchicon from '../assets/icon_search.png';
import leftArrow from '../assets/left_arrow.png';
import rightArrow from '../assets/right_arrow.png';
import { JobMonitorOverview } from './JobMonitorOverview';

export const Escalation = () => {
    const { reports, setReports, fetchReports, reportsLoading, jobs, fetchJobs } = useJobs();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showJobOverviewId, setShowJobOverviewId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isJobsLoading, setIsJobsLoading] = useState(true);
    const [jobExistsCache, setJobExistsCache] = useState({});

    // Search and Pagination states
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const modalRef = useRef(null);

    // Helper function to get status class for styling
    const getStatusClass = (status) => {
        if (status === "Pending") return "Pending";
        if (status === "In Progress") return "InProgress";
        if (status === "Resolved") return "Resolved";
        return "Pending";
    };

    // Sync modal focus trap and body scroll lock configuration
    useEffect(() => {
        if (isModalOpen) {
            const handleTabKey = (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = modalRef.current?.querySelectorAll('button:not([disabled])');
                    if (!focusableElements || focusableElements.length === 0) return;

                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    const activeElement = document.activeElement;

                    if (e.shiftKey && activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    } else if (!modalRef.current?.contains(activeElement)) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            document.addEventListener('keydown', handleTabKey);
            setTimeout(() => {
                const firstBtn = modalRef.current?.querySelector('button');
                if (firstBtn) firstBtn.focus();
            }, 100);

            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleTabKey);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (selectedReport) {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = () => {
            if (selectedReport) {
                setSelectedReport(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedReport]);

    useEffect(() => {
        const loadData = async () => {
            setIsJobsLoading(true);
            await fetchReports();
            if (fetchJobs) {
                await fetchJobs();
            }
            setIsJobsLoading(false);
        };
        loadData();
    }, []);

    // Notification click deep-link: open the specific complaint/report once
    // reports (and jobs, for the "jobExists" check) have loaded.
    useEffect(() => {
        if (isJobsLoading || !reports || reports.length === 0) return;

        const highlightType = sessionStorage.getItem('adminNotifHighlightType');
        const highlightId = sessionStorage.getItem('adminNotifHighlightId');

        if (highlightType === 'complaint' && highlightId) {
            const match = reports.find(r => String(r.id) === String(highlightId));

            if (match) {
                const openMatch = async () => {
                    const jobId = match.JobId || match.jobId;
                    let jobExists = true;

                    if (jobId) {
                        const existsInContext = jobs.some(job => String(job.id) === String(jobId));
                        if (existsInContext) {
                            jobExists = true;
                        } else {
                            try {
                                const response = await api.get(`/admin/jobs/${jobId}/detail/`);
                                jobExists = !!response.data && !!response.data.id;
                            } catch (err) {
                                jobExists = false;
                            }
                        }
                    }

                    setSelectedReport({ ...match, jobExists });
                };
                openMatch();
            }

            sessionStorage.removeItem('adminNotifHighlightType');
            sessionStorage.removeItem('adminNotifHighlightId');
        }
    }, [isJobsLoading, reports, jobs]);

    const formatToLocalTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const dateObj = new Date(dateString);
            if (isNaN(dateObj.getTime())) return dateString;

            return dateObj.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            setActionLoading(true);
            console.log(`🔄 Updating report ${reportId} to ${newStatus}...`);

            // Map frontend display status to backend database values
            let backendStatus;
            switch (newStatus) {
                case "Pending":
                    backendStatus = "pending";
                    break;
                case "In Progress":
                    backendStatus = "investigating";
                    break;
                case "Resolved":
                    backendStatus = "resolved";
                    break;
                default:
                    backendStatus = "pending";
            }

            console.log(`Sending to backend: "${backendStatus}"`);

            const response = await api.patch(`/admin/complaints/${reportId}/`, {
                status: newStatus
            });

            console.log("Update response:", response.data);

            // Update local state with display status
            setReports((prev) =>
                prev.map((item) =>
                    item.id === reportId ? { ...item, status: newStatus } : item
                )
            );

            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport((prev) => ({ ...prev, status: newStatus }));
            }

            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            console.error("Error response:", error.response?.data);

            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert("Failed to update status. Please try again.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                setActionLoading(true);
                console.log(`🗑️ Deleting report ${reportId}...`);

                // API call to delete
                await api.delete(`/admin/complaints/${reportId}/`);

                // Update local state
                setReports((prev) => prev.filter((item) => item.id !== reportId));
                setSelectedReport(null);
                setIsModalOpen(false);
                alert("Report deleted successfully!");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete report. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Check if a job exists - first check cache, then context, then API
    // In the table row, when checking if job exists:
    const checkJobExists = async (jobId) => {
        if (!jobId) return false;  // If no jobId, job doesn't exist

        // Check in context
        const existsInContext = jobs.some(job => String(job.id) === String(jobId));
        if (existsInContext) return true;

        // Check via API
        try {
            const response = await api.get(`/admin/jobs/${jobId}/detail/`);
            return !!response.data && !!response.data.id;
        } catch (err) {
            return false;
        }
    };

    // Filter pipeline tracking down dynamic matches across critical keys
    const filteredReports = reports.filter((item) => {
        const searchTerm = search.toLowerCase();

        const subject = (item.reason || "Progress, project & status reports").toLowerCase();
        const priority = (item.priority || "Medium").toLowerCase();
        const status = (item.status || "Pending").toLowerCase();

        const firstName = item.firstName || "";
        const lastName = item.lastName || "";
        const nameAttr = item.name || "";
        const userCombined = `${firstName} ${lastName} ${nameAttr}`.toLowerCase();

        return subject.includes(searchTerm) ||
            priority.includes(searchTerm) ||
            status.includes(searchTerm) ||
            userCombined.includes(searchTerm);
    });

    // Pagination calculations based on filtered records
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(filteredReports.length / recordsPerPage) || 1;

    const prevPage = () => { if (currentPage !== 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage !== nPages) setCurrentPage(currentPage + 1); };

    if (reportsLoading && reports.length === 0) {
        return (
            <div className="RepAJob-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Loading reports...</h3>
                </div>
            </div>
        );
    }

    if (showJobOverviewId) {
        return (
            <div className="RepAJob-detail-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="RepAJob-main-title">Job ID: {showJobOverviewId}</h2>
                    <button
                        className="RepAJob-btn-back"
                        onClick={() => setShowJobOverviewId(null)}
                    >
                        Back to Report Details
                    </button>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <JobMonitorOverview
                        jobId={showJobOverviewId}
                        setSelectedJobId={setShowJobOverviewId}
                        onJobLoaded={() => { }}
                    />
                </div>
            </div>
        );
    }

    if (selectedReport) {
        const currentStatus = selectedReport.status || "Pending";
        const currentPriority = selectedReport.priority;
        const jobId = selectedReport.JobId || selectedReport.jobId;
        const jobExists = selectedReport.jobExists !== undefined ? selectedReport.jobExists : true;

        return (
            <div className="RepAJob-detail-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="RepAJob-main-title" style={{ margin: 0 }}>Report Information</h2>
                    <button
                        className="RepAJob-btn-back"
                        onClick={() => { setSelectedReport(null); setIsModalOpen(false); }}
                        disabled={actionLoading}
                    >
                        Back to Reports
                    </button>
                </div>

                <div className="RepAJob-detail-card">
                    <div className="RepAJob-card-left">
                        <div className="RepAJob-doc-icon-box">
                            <img src={victor} alt="document" className="RepAJob-svg-icon" />
                        </div>
                        <div className="RepAJob-ticket-header">
                            <h3>{selectedReport.reason || "Unable to submit the project status"}</h3>
                            <span className="RepAJob-ticket-id">{selectedReport.RepId || `REP-${selectedReport.id}`}</span>
                            <p className="RepAJob-timestamp">
                                Created on : {formatToLocalTime(selectedReport.created_at || selectedReport.date)}
                            </p>
                        </div>
                    </div>

                    <div className="RepAJob-card-right">
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Priority</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority" data-priority={currentPriority?.toLowerCase() || 'medium'}>
                                {currentPriority || "Medium"}
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={AdminStatus} width={15} height={15} alt="AdminStatus" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Status</span>
                            <span className="meta-separator">:</span>
                            <span className="status-text">
                                <span className={`status-badge-detail ${getStatusClass(currentStatus)}`}>
                                    {currentStatus}
                                </span>
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">JobId</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority">
                                {jobId || selectedReport.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="detail-page-wrapper" style={{ padding: 0 }}>
                    <div className="detail-section-card">
                        <h3 className="detail-section-title">User Information</h3>
                        <div className="detail-form-group">
                            <div className="detail-field-row">
                                <label>Name :</label>
                                <input type="text" readOnly value={`${selectedReport.firstName || ''} ${selectedReport.lastName || ''}`.trim() || selectedReport.name || 'N/A'} />
                            </div>
                            <div className="detail-field-row">
                                <label>Mobile number :</label>
                                <input type='text' readOnly value={selectedReport.mobile || selectedReport.contact || 'N/A'} />
                            </div>
                            <div className="detail-field-row">
                                <label>Mail ID :</label>
                                <input type='text' readOnly value={selectedReport.email || 'N/A'} />
                            </div>
                            <div className="detail-field-row">
                                <label>User :</label>
                                <input type='text' readOnly value={selectedReport.category || 'Report'} />
                            </div>
                        </div>
                    </div>

                    <div className="detail-section-card">
                        <h3 className="detail-section-title">Report details</h3>
                        <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#555' }}>
                            Job Id: <strong>{jobId || selectedReport.id}</strong>
                        </p>
                        <div className="detail-report-textbox">
                            {selectedReport.explanation || selectedReport.message || 'No details provided'}
                        </div>
                    </div>

                    <div className="detail-top-actions" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(!isModalOpen)}
                            className="detail-btn-action-edit"
                            disabled={actionLoading}
                            style={{
                                background: "#1E88E5",
                                color: "white",
                                borderRadius: "5px",
                                padding: "10px 20px",
                                outline: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <img src={pencil} alt="edit-icon" className="RepAJob-btn-icon-img" style={{ marginRight: '6px', filter: 'brightness(0) invert(1)' }} />
                            Edit Status
                        </button>

                        {jobExists && jobId && (
                            <button
                                style={{
                                    background: "#2b8bf9",
                                    borderColor: "#2b8bf9",
                                    color: "#ffffff",
                                    borderRadius: "5px",
                                    padding: "10px 20px",
                                    outline: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                                onClick={() => setShowJobOverviewId(jobId)}
                                className="detail-btn-action-edit"
                                disabled={actionLoading}
                            >
                                View this Job
                            </button>
                        )}

                        {!jobExists && jobId && (
                            <div style={{
                                padding: '12px 20px',
                                background: '#fef2f2',
                                border: '1px solid #fca5a5',
                                borderRadius: '6px',
                                color: '#991b1b',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flex: 1,
                                minWidth: '250px'
                            }}>
                                <span style={{ fontSize: '18px' }}>ℹ️</span>
                                <span>This job has been deleted by the administrator.</span>
                            </div>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="detail-status-modal-overlay"
                        ref={modalRef}
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
                    >
                        <div className="detail-status-modal-content">
                            <h3>Select Status</h3>
                            <div className="Report-detail-status-modal-options">
                                <button onClick={() => handleStatusChange(selectedReport.id, "Pending")} disabled={actionLoading}>
                                    Pending
                                </button>
                                <button onClick={() => handleStatusChange(selectedReport.id, "In Progress")} disabled={actionLoading}>
                                    In Progress
                                </button>
                                <button onClick={() => handleStatusChange(selectedReport.id, "Resolved")} disabled={actionLoading}>
                                    Resolved
                                </button>
                            </div>
                            <button className="detail-status-modal-cancel" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="RepAJob-container">
            <div className="RepAJob-header">
                <div>
                    <h2>Received Reports</h2>
                    <p>List of newly received reports for the job</p>
                </div>
            </div>

            {/* Search Module bridging styles from UserManagement */}
            <div className="um-search-container">
                <div className="search-wrapper">
                    <span className="search-icon"><img src={Searchicon} alt="Search" /></span>
                    <input
                        type="text"
                        placeholder="Search by subject, priority, status or user"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="RepAJob-table-wrapper">
                <table className="RepAJob-table">
                    <thead>
                        <tr>
                            <th>REPORT ID</th>
                            <th>SUBJECT</th>
                            <th>JOB ID</th>
                            <th>USER</th>
                            <th style={{ paddingLeft: "30px" }}>PRIORITY</th>
                            <th>RECEIVED ON</th>
                            <th style={{ paddingLeft: "30px" }}>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((item, index) => {
                                const itemPriority = item.priority || 'Medium';
                                const jobId = item.JobId || item.jobId;
                                const status = item.status || "Pending";

                                return (
                                    <tr key={item.id || index}>
                                        <td>{item.RepId || `REP-${item.id}`}</td>
                                        <td className="subject-column">{item.reason || "Progress, project & status reports"}</td>
                                        <td>{jobId || item.id}</td>
                                        <td>
                                            <span className="RepAJob-user-name">
                                                {item.firstName || item.name || 'N/A'} {item.lastName || ''}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                style={{ display: "flex", justifyContent: "center" }}
                                                className={`Escalation-priority ${itemPriority}`}
                                            >
                                                {itemPriority}
                                            </span>
                                        </td>
                                        <td>{formatToLocalTime(item.created_at || item.date)}</td>
                                        <td>
                                            <span className={`enq-status-badge ${getStatusClass(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                style={{
                                                    background: "#1E88E5",
                                                    color: "white",
                                                    borderRadius: "5px",
                                                    padding: "7px 10px",
                                                    outline: "none",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                                onClick={async () => {
                                                    let jobExists = true;
                                                    if (jobId) {
                                                        const existsInContext = jobs.some(job => String(job.id) === String(jobId));
                                                        if (existsInContext) {
                                                            jobExists = true;
                                                        } else {
                                                            try {
                                                                const response = await api.get(`/admin/jobs/${jobId}/detail/`);
                                                                jobExists = !!response.data && !!response.data.id;
                                                            } catch (err) {
                                                                jobExists = false;
                                                            }
                                                        }
                                                    }

                                                    setSelectedReport({
                                                        ...item,
                                                        jobExists: jobExists
                                                    });
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                                    {reportsLoading ? "Loading reports..." : "No Reports Found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footnotes pagination frame sync */}
                <div className="pagination-footer">
                    <p>Page {currentPage} of {nPages}</p>
                    <div className="pagination-btns">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            <img src={leftArrow} alt="prev" className="nav-arrow" />
                        </button>
                        <button onClick={nextPage} disabled={currentPage === nPages}>
                            <img src={rightArrow} alt="next" className="nav-arrow" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};