import React, { useState } from 'react'
import { useJobs } from '../JobContext'
import Highlight from '../assets/Employer/HighLight-Active.png'

export const HighligtedJobs = ({ highlightedJobsData = [], onBack }) => {
    const jobAds = Array.isArray(highlightedJobsData) ? highlightedJobsData : [];

    console.log("HighlightedJobs received data:", highlightedJobsData);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentJobs = jobAds.slice(firstIndex, lastIndex);
    const npage = Math.ceil(jobAds.length / recordsPerPage);

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    // Get the approved date - show proper label based on approval status
    const getApprovedDisplay = (job) => {
        if (job.approved_at) {
            return formatDate(job.approved_at);
        }
        // If not approved, show "Pending Approval" or the posted date
        return 'Pending Approval';
    };

    // Get expiry date
    const getExpiryDate = (job) => {
        if (job.expiry_date) return formatDate(job.expiry_date);
        if (job.expiryDate) return formatDate(job.expiryDate);
        if (job.expired_on) return formatDate(job.expired_on);
        if (job.expiredOn) return formatDate(job.expiredOn);
        if (job.last_date_to_apply) return formatDate(job.last_date_to_apply);
        if (job.lastDateToApply) return formatDate(job.lastDateToApply);

        // Calculate from highlighted_at + 30 days
        if (job.highlighted_at || job.highlightOn) {
            const highlightDate = job.highlighted_at || job.highlightOn;
            const date = new Date(highlightDate);
            if (!isNaN(date.getTime())) {
                const expiryDate = new Date(date);
                expiryDate.setDate(expiryDate.getDate() + 30);
                return formatDate(expiryDate);
            }
        }

        return 'N/A';
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const siblingCount = 1;

        if (npage <= 5) {
            for (let i = 1; i <= npage; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            let startPage = Math.max(2, currentPage - siblingCount);
            let endPage = Math.min(npage - 1, currentPage + siblingCount);

            if (currentPage <= 3) {
                endPage = 4;
            }
            if (currentPage >= npage - 2) {
                startPage = npage - 3;
            }
            if (startPage > 2) {
                pageNumbers.push('...');
            }
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            if (endPage < npage - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(npage);
        }

        return pageNumbers.map((number, index) => {
            if (number === '...') {
                return <span key={`dots-${index}`} className="dots">...</span>;
            }
            return (
                <button
                    key={number}
                    className={`page-btn ${currentPage === number ? "active" : ""}`}
                    onClick={() => setCurrentPage(number)}>
                    {number}
                </button>
            );
        });
    };

    const prePage = () => {
        if (currentPage <= 1) return;
        setCurrentPage(prev => prev - 1);
    };

    const nextPage = () => {
        if (currentPage >= npage) return;
        setCurrentPage(prev => prev + 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px', justifyContent: 'space-between', border: "0.5px solid #adadad", marginTop: "5px", borderRadius: "10px" }}>
            <div>
                <div className="back-button-container" style={{ margin: "10px" }}>
                    <button className="Adm-tic-btn-back" onClick={onBack}>← Back</button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", border: "0.5px solid #adadad", margin: "15px", borderRadius: "10px" }}>
                    <h2 style={{ textAlign: "center" }}>Highlighted Jobs</h2>
                    <img src={Highlight} width={22} alt="" />
                </div>

                <div style={{ display: "flex", margin: "5px", flexDirection: "column", padding: "15px" }}>
                    {currentJobs.length > 0 ? (
                        currentJobs.map((job, index) => {
                            console.log(`Job ${index}:`, job);

                            // Check if job is approved
                            const isApproved = job.isApproved || job.approved_at;
                            const approvedDisplay = getApprovedDisplay(job);
                            const postedDate = job.posted || job.created_at;

                            return (
                                <div className="Admin-job-card" key={index}>
                                    <div className="Admin-job-left">
                                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                            <p className="Admin-job-title">{job.title}</p>
                                            <img src={Highlight} width={15} alt="" />
                                            {!isApproved && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    color: '#f59e0b',
                                                    background: '#fef3c7',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: '500'
                                                }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <span className="Admin-job-under">{job.company}</span>
                                    </div>
                                    <div className="Admin-job-right">
                                        <div className="Ads-Count-Cont">
                                            <span className="Ads-Count">Approved On</span>
                                            <p style={{
                                                margin: "0",
                                                fontSize: "11px",
                                                color: isApproved ? "rgb(95, 94, 94)" : "#f59e0b",
                                                fontWeight: isApproved ? "600" : "500"
                                            }}>
                                                {approvedDisplay}
                                                {!isApproved && (
                                                    <span style={{
                                                        display: 'block',
                                                        fontSize: '9px',
                                                        color: '#94a3b8',
                                                        fontWeight: '400'
                                                    }}>
                                                        Posted: {postedDate ? formatDate(postedDate) : 'N/A'}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="Ads-Count-Cont">
                                            <span className="Ads-Count">Highlighted on</span>
                                            <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>
                                                {job.highlighted_at ? formatDate(job.highlighted_at) : (job.highlightOn || 'N/A')}
                                            </p>
                                        </div>
                                        <div className="Ads-Count-Cont">
                                            <span className="Ads-Count">Expired on</span>
                                            <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>
                                                {getExpiryDate(job)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center' }}>No highlighted jobs found.</p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px', marginTop: "auto" }}>
                <ul style={{ display: 'flex', listStyle: 'none', gap: '10px', alignItems: 'center', visibility: jobAds.length > 0 ? 'visible' : 'hidden' }}>
                    <li>
                        <button onClick={prePage} disabled={currentPage <= 1} className="Navigation-btn">Prev</button>
                    </li>
                    <div className="page-numbers">{renderPageNumbers()}</div>
                    <li>
                        <button onClick={nextPage} disabled={currentPage >= npage || npage <= 1} className="Navigation-btn">Next</button>
                    </li>
                </ul>
            </div>
        </div>
    )
}