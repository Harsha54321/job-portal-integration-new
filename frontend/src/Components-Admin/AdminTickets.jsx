import React, { useState, useEffect, useRef } from 'react';
import './AdminTickets.css';
import TicketIcon from '../assets/AdminAssets/TicketsIcon.png';
import Priority from '../assets/AdminAssets/Priority.png';
import AdminCategory from '../assets/AdminAssets/AdminCategory.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import Enq from '../assets/AdminAssets/ApplicationSet.png';
import dwd from '../assets/AdminAssets/Download.png';
import Searchicon from '../assets/icon_search.png';
import leftArrow from '../assets/left_arrow.png';
import rightArrow from '../assets/right_arrow.png';
import pencil from '../assets/AdminAssets/Edit.png';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const AdminTickets = () => {
    const { raisedTickets, setRaisedTickets, fetchTickets, ticketsLoading } = useJobs();
    const [selectedTickets, setSelectedTickets] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const modalRef = useRef(null);

    const formatTicketId = (id) => {
        if (!id) return "TICK-0000";
        const numericId = String(id).replace(/\D/g, "");
        if (!numericId) return String(id);
        return `TICK-${numericId.padStart(4, '0')}`;
    };

    // Sync modal focus trap and body styling
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
        if (selectedTickets) {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = () => {
            if (selectedTickets) {
                setSelectedTickets(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedTickets]);

    useEffect(() => {
        fetchTickets();
    }, []);

    // Notification click deep-link: open the specific ticket once tickets load.
    useEffect(() => {
        if (!raisedTickets || raisedTickets.length === 0) return;

        const highlightType = sessionStorage.getItem('adminNotifHighlightType');
        const highlightId = sessionStorage.getItem('adminNotifHighlightId');

        if (highlightType === 'ticket' && highlightId) {
            const match = raisedTickets.find(t => String(t.id) === String(highlightId));
            if (match) {
                setSelectedTickets(match);
            }
            sessionStorage.removeItem('adminNotifHighlightType');
            sessionStorage.removeItem('adminNotifHighlightId');
        }
    }, [raisedTickets]);

    const statusOrder = { "Pending": 1, "In Progress": 2, "Resolved": 3 };

    // Filter tickets matching Subject, Priority, Status, Category, Formatted ID, or Combined Username
    const filteredTickets = raisedTickets.filter((ticket) => {
        const searchTerm = search.toLowerCase();
        const subject = (ticket.subject || "").toLowerCase();
        const priority = (ticket.priority || "").toLowerCase();
        const status = (ticket.status || "").toLowerCase();
        const category = (ticket.category || "").toLowerCase();
        const formattedId = formatTicketId(ticket.id).toLowerCase();
        const firstName = ticket.firstName || "";
        const lastName = ticket.lastName || "";
        const nameAttr = ticket.name || "";
        const userCombined = `${firstName} ${lastName} ${nameAttr}`.toLowerCase();

        return subject.includes(searchTerm) ||
            priority.includes(searchTerm) ||
            status.includes(searchTerm) ||
            category.includes(searchTerm) ||
            formattedId.includes(searchTerm) ||
            userCombined.includes(searchTerm);
    });

    // Sort matching your original layout
    const sortedTickets = [...filteredTickets].sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || a.updated_at);
        const dateB = new Date(b.date || b.created_at || b.updated_at);
        return dateB - dateA; // Latest first
    });

    // Pagination splits
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedTickets.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(sortedTickets.length / recordsPerPage) || 1;

    const prevPage = () => { if (currentPage !== 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage !== nPages) setCurrentPage(currentPage + 1); };

    const handleStatusSelection = async (newStatus) => {
        try {
            await api.patch(`/admin/tickets/${selectedTickets.id}/update/`, {
                status: newStatus
            });

            const todayStr = new Date(Date.now()).toLocaleDateString('en-GB');

            if (newStatus !== "Resolved") {
                setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
                setRaisedTickets((prevList) =>
                    prevList.map((ticket) =>
                        ticket.id === selectedTickets.id ? { ...ticket, status: newStatus } : ticket
                    )
                );
            } else {
                setSelectedTickets((prev) => ({ ...prev, status: newStatus, resolvedon: todayStr }));
                setRaisedTickets((prevList) =>
                    prevList.map((ticket) =>
                        ticket.id === selectedTickets.id ? { ...ticket, status: newStatus, resolvedon: todayStr } : ticket
                    )
                );
            }
            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    if (ticketsLoading) {
        return (
            <div className="AdminTickets-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading tickets...</div>
            </div>
        );
    }

    return (
        <>
            {!selectedTickets ? (
                <div className="AdminTickets-container">
                    <div className="AdminTickets-header">
                        <div>
                            <h2>Raised Tickets</h2>
                            <p>Manage and review all user raised tickets</p>
                        </div>
                    </div>

                    <div className="um-search-container">
                        <div className="search-wrapper">
                            <span className="search-icon"><img src={Searchicon} alt="Search" /></span>
                            <input
                                type="text"
                                placeholder="Search by subject, user, priority, status or category"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="AdminTickets-table-wrapper">
                        <table className="AdminTickets-table">
                            <thead>
                                <tr>
                                    <th>TICKET ID</th>
                                    <th>SUBJECT</th>
                                    <th>USER</th>
                                    <th>CATEGORY</th>
                                    <th style={{ paddingLeft: "30px" }}>PRIORITY</th>
                                    <th>RECEIVED On</th>
                                    <th style={{ paddingLeft: "30px" }}>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentRecords.map((ticket, index) => (
                                    <tr key={ticket.id || index}>
                                        <td>{formatTicketId(ticket.id)}</td>
                                        <td>{ticket.subject}</td>
                                        <td>{ticket.name}</td>
                                        <td>{ticket.category}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`Escalation-priority ${ticket.priority}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td>{ticket.date}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`AdminTickets-status-pill ${ticket.status.replace(/\s/g, "")}`}>
                                                {ticket.status}
                                                {/* {ticket.resolvedon ? ` (${ticket.resolvedon})` : ''} */}
                                            </span>
                                        </td>
                                        <td>
                                            <button style={{
                                                background: "#1E88E5", color: "white", borderRadius: "5px",
                                                padding: "7px 10px", outline: "none", border: "none", cursor: "pointer"
                                            }} onClick={() => { setSelectedTickets(ticket); }}>View Details</button>
                                        </td>
                                    </tr>
                                ))}
                                {currentRecords.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                                            No tickets match your search filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

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
            ) : (
                <div className="Adm-tic-container">
                    <div className="Adm-tic-top-nav">
                        <button onClick={() => setSelectedTickets(null)} className="Adm-tic-btn-back">Back to Tickets</button>
                    </div>

                    <div className="Adm-tic-header-section">
                        <div className="Adm-tic-title-block">
                            <img src={TicketIcon} width={65} alt='' />
                            <div>
                                <h1 className="Adm-tic-main-title">{selectedTickets.subject}</h1>
                                <p className="Adm-tic-id">{formatTicketId(selectedTickets.id)}</p>
                                <p className="Adm-tic-date-created">Created on : {selectedTickets.date}</p>
                            </div>
                        </div>
                        <div className="Adm-tic-meta-info">
                            <div className="Adm-tic-meta-row">
                                <img src={Priority} width={15} height={15} alt="Priority" />
                                <span style={{ paddingLeft: "15px" }} className="Adm-tic-meta-label"> Priority :</span>
                                <span className="Adm-tic-meta-value Adm-tic-priority-medium">{selectedTickets.priority}</span>
                            </div>
                            <div className="Adm-tic-meta-row">
                                <img src={AdminCategory} width={15} height={15} alt="AdminCategory" />
                                <span style={{ paddingLeft: "15px" }} className="Adm-tic-meta-label"> Category :</span>
                                <span className="Adm-tic-meta-value">{selectedTickets.category}</span>
                            </div>
                            <div className="Adm-tic-meta-row">
                                <img src={AdminStatus} width={15} height={15} alt="AdminStatus" />
                                <span style={{ paddingLeft: "15px" }} className="Adm-tic-meta-label"> Status :</span>
                                <span className={`AdminTickets-status-pill ${selectedTickets.status.replace(/\s/g, "")}`}>
                                    {selectedTickets.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-page-wrapper">
                        <div className="detail-section-card">
                            <h3 className="detail-section-title">User Information</h3>
                            <div className="detail-form-group">
                                <div className="detail-field-row">
                                    <label>Ticket Ref :</label>
                                    <input type="text" readOnly value={formatTicketId(selectedTickets.id)} />
                                </div>
                                <div className="detail-field-row">
                                    <label>Name :</label>
                                    <input type="text" readOnly value={selectedTickets.name || "N/A"} />
                                </div>
                                <div className="detail-field-row">
                                    <label>Mobile number :</label>
                                    <input type="text" readOnly value={selectedTickets.mobile || "N/A"} />
                                </div>
                                <div className="detail-field-row">
                                    <label>Mail ID :</label>
                                    <input type="text" readOnly value={selectedTickets.email || "N/A"} />
                                </div>
                                <div className="detail-field-row">
                                    <label>User Role :</label>
                                    <input type="text" readOnly value={selectedTickets.category || "N/A"} />
                                </div>
                            </div>
                        </div>

                        <div className="detail-section-card">
                            <h3 className="detail-section-title">Description :</h3>
                            <div className="detail-report-textbox">
                                {selectedTickets.message}
                            </div>
                        </div>

                        <div className="Adm-tic-attachment-block">
                            <span className="Adm-tic-attachment-label">Attachment</span>
                            <div className="Adm-tic-attachment-card">
                                <img style={{ paddingRight: "10px" }} src={Enq} width={15} alt="AdminStatus" />
                                <span className="Adm-tic-file-name">
                                    {selectedTickets.attachment ? selectedTickets.attachment.split('/').pop() : "No attachment"}
                                </span>
                                <span className="Adm-tic-file-size">
                                    {selectedTickets.attachment ? "Download" : ""}
                                </span>
                                {selectedTickets.attachment ? (
                                    <img
                                        src={dwd}
                                        width={15}
                                        alt='download'
                                        className="Adm-tic-download-btn"
                                        style={{ cursor: "pointer" }}
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(selectedTickets.attachment);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = selectedTickets.attachment.split('/').pop();
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                window.open(selectedTickets.attachment, '_blank');
                                            }
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: "12px", color: "#999" }}>No file</span>
                                )}
                            </div>
                        </div>

                        <div className="detail-top-actions">
                            <button onClick={() => setIsModalOpen(!isModalOpen)} className="detail-btn-action-edit">
                                <img
                                    src={pencil}
                                    alt="edit"
                                    className="enq-details-btn-icon"
                                    style={{ marginRight: '6px', filter: 'brightness(0) invert(1)' }}
                                />
                                Edit Status
                            </button>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="detail-status-modal-overlay"
                            ref={modalRef}
                            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
                        >
                            <div className="detail-status-modal-content">
                                <h3>Select Status</h3>
                                <div className="detail-status-modal-options">
                                    <button onClick={() => handleStatusSelection("In Progress")}>In Progress</button>
                                    <button onClick={() => handleStatusSelection("Hold")}>Hold</button>
                                    <button onClick={() => handleStatusSelection("Resolved")}>Resolved</button>
                                </div>
                                <button className="detail-status-modal-cancel" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};