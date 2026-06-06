import React, { useState } from 'react';
import './Escalation.css';
import { useJobs } from '../JobContext';
import pencil from '../assets/AdminAssets/Edit.png';
import backIcon from '../assets/AdminAssets/BackBtn.png';
import victor from '../assets/AdminAssets/ReportJob.png';
import docIcon from '../assets/AdminAssets/InProgress.png';
import deleteIcon from '../assets/AdminAssets/DeleteIcon.png';
import eye from '../assets/AdminAssets/EyeIcon.png';
import Priority from '../assets/AdminAssets/Priority.png';
import AdminCategory from '../assets/AdminAssets/AdminCategory.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
;

export const Escalation = () => {
    const { reports, setReports } = useJobs();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStatusChange = (ticketId, value) => {
        setReports((prev) =>
            prev.map((item) => item.id === ticketId ? { ...item, status: value } : item)
        );
        if (selectedReport && selectedReport.id === ticketId) {
            setSelectedReport((prev) => ({ ...prev, status: value }));
        }
        setIsModalOpen(false);
    };

    const handleDeleteReport = (ticketId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            setReports((prev) => prev.filter((item) => item.id !== ticketId));
            setSelectedReport(null);
            setIsModalOpen(false);
        }
    };

    if (selectedReport) {
        const currentStatus = selectedReport.status;
        const currentPriority = selectedReport.priority;

        return (
            <div className="RepAJob-detail-container">
                <h2 className="RepAJob-main-title">Report Information</h2>

                <div className="RepAJob-detail-actions">
                    <button className="RepAJob-btn-back" onClick={() => { setSelectedReport(null); setIsModalOpen(false); }}>
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
                            <span className="RepAJob-ticket-id">{selectedReport.id}</span>
                            <p className="RepAJob-timestamp">Created on : {selectedReport.date}</p>
                        </div>
                    </div>

                    <div className="RepAJob-card-right">
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Priority</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority" data-priority={currentPriority.toLowerCase()}>
                                {currentPriority}
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={AdminStatus} width={15} height={15} alt="AdminStatus" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Status</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value status-text">
                                <img src={docIcon} alt="status-doc" style={{ width: '14px', marginRight: '6px', verticalAlign: 'middle' }} />
                                {currentStatus}
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">JobId</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority" data-priority={currentPriority.toLowerCase()}>
                                {selectedReport.JobId}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="RepAJob-grid-details">
                    <div className="RepAJob-user-section">
                        <h2 className="RepAJob-section-title">User Information</h2>
                        <div className="RepAJob-user-grid">
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Name :</span>
                                <input type="text" disabled value={`${selectedReport.firstName} ${selectedReport.lastName}`} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Mobile number :</span>
                                <input type='text' disabled value={selectedReport.mobile || '+91 9876543210'} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Mail ID :</span>
                                <input type='text' disabled value={selectedReport.email || 'jobportal@gmail.com'} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">User :</span>
                                <input type='text' disabled value={selectedReport.category || 'Report'} />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="RepAJob-section">
                    <h4>Report details</h4>
                    <p className="RepAJob-description-text">
                        {selectedReport.explanation}
                    </p>
                </div>
                <div className="RepAJob-top-actions">
                    <button onClick={() => setIsModalOpen(!isModalOpen)} className="RepAJob-btn-action">
                        <img src={pencil} alt="edit-icon" className="RepAJob-btn-icon-img" style={{ marginRight: '6px' }} />
                        Edit Status
                    </button>
                    <button onClick={() => handleDeleteReport(selectedReport.id)} className="RepAJob-btn-action RepAJob-btn-delete">
                        <img src={deleteIcon} alt="delete-icon" className="RepAJob-btn-icon-img" style={{ marginRight: '6px' }} />
                        Delete
                    </button>
                </div>

                {isModalOpen && (
                    <div className="RepAJob-status-modal-overlay">
                        <div className="RepAJob-status-modal-content">
                            <h3>Select Status</h3>

                            <div className="RepAJob-status-modal-options">
                                <button onClick={() => handleStatusChange(selectedReport.id, "Pending")}>Pending</button>
                                <button onClick={() => handleStatusChange(selectedReport.id, "In Progress")}>In Progress</button>
                                <button onClick={() => handleStatusChange(selectedReport.id, "Resolved")}>Resolved</button>
                            </div>

                            <button className="RepAJob-status-modal-cancel" onClick={() => setIsModalOpen(false)}>
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
                    <h2>Newly received reports</h2>
                    <p>List of newly received reports for the job</p>
                </div>
            </div>
            <div className="RepAJob-table-wrapper">
                <table className="RepAJob-table">
                    <thead>
                        <tr>
                            <th>REPORT ID</th>
                            <th>SUBJECT</th>
                            <th>USER</th>
                            <th>CATEGORY</th>
                            <th style={{ paddingLeft: "40px" }}>PRIORITY</th>
                            <th>RECEIVED AT</th>
                            <th>STATUS / TIME</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports && reports.length > 0 ? (
                            reports.map((item, index) => {
                                const itemPriority = item.priority || 'Medium';
                                return (
                                    <tr key={item.id || index}>
                                        <td>{item.id}</td>
                                        <td>{item.reason || "Progress, project & status reports"}</td>
                                        <td>{item.firstName} {item.lastName}</td>
                                        <td>Report</td>
                                        <td>
                                            <span
                                                style={{ display: "flex", justifyContent: "center" }}
                                                className={`Escalation-priority ${itemPriority}`}
                                            >
                                                {itemPriority}
                                            </span>
                                        </td>
                                        <td>{item.date?.split(',')[0] || "May 15, 2026"}</td>
                                        <td>{item.resolvedon ? item.resolvedon : (item.status || "Opened")}</td>
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
                                                onClick={() => setSelectedReport(item)}
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
                                    No Reports Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};