import React, { useState, useEffect, useRef } from 'react'
import './Enquiries.css'
import ViewButton from '../assets/AdminAssets/EyeIcon.png';
import Enquiry from '../assets/AdminAssets/Enquires.png';
import Delete from '../assets/AdminAssets/DeleteIcon.png';
import pencil from '../assets/AdminAssets/Edit.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import Searchicon from '../assets/icon_search.png';
import leftArrow from '../assets/left_arrow.png';
import rightArrow from '../assets/right_arrow.png';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const Enquiries = () => {
    const { enquiries, setEnquiries, fetchEnquiries, enquiriesLoading } = useJobs();
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const modalRef = useRef(null);

    // Format enquiry ID
    const formatEnquiryId = (id, index) => {
        if (!id) return `ENQ-${String(index + 1).padStart(4, '0')}`;
        if (typeof id === 'string' && id.startsWith('#ENQ')) {
            return `ENQ-${String(index + 1).padStart(4, '0')}`;
        }
        if (typeof id === 'number' || !isNaN(id)) {
            return `ENQ-${String(id).padStart(4, '0')}`;
        }
        return id;
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            if (dateStr.includes('T')) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
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
        if (selectedEnquiry) {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = () => {
            if (selectedEnquiry) {
                setSelectedEnquiry(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedEnquiry]);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    // Notification click deep-link: open the specific enquiry once loaded.
    useEffect(() => {
        if (!enquiries || enquiries.length === 0) return;

        const highlightType = sessionStorage.getItem('adminNotifHighlightType');
        const highlightId = sessionStorage.getItem('adminNotifHighlightId');

        if (highlightType === 'enquiry' && highlightId) {
            const match = enquiries.find(e => String(e.id) === String(highlightId));
            if (match) {
                setSelectedEnquiry(match);
            }
            sessionStorage.removeItem('adminNotifHighlightType');
            sessionStorage.removeItem('adminNotifHighlightId');
        }
    }, [enquiries]);

    const getSortedEnquiries = () => {
        if (!enquiries || enquiries.length === 0) return [];
        // Sort by date - latest first
        return [...enquiries].sort((a, b) => {
            const dateA = new Date(a.created_at || a.date);
            const dateB = new Date(b.created_at || b.date);
            return dateB - dateA;
        });
    };

    // Filter enquiries based on search
    const filteredEnquiries = getSortedEnquiries().filter((item) => {
        const searchTerm = search.toLowerCase();
        const formattedId = formatEnquiryId(item.id, 0).toLowerCase();
        const message = (item.message || item.reason || "").toLowerCase();
        const name = (item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim()).toLowerCase();
        const status = (item.status || "").toLowerCase();

        return formattedId.includes(searchTerm) ||
            message.includes(searchTerm) ||
            name.includes(searchTerm) ||
            status.includes(searchTerm);
    });

    // Pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredEnquiries.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(filteredEnquiries.length / recordsPerPage) || 1;

    const prevPage = () => { if (currentPage !== 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage !== nPages) setCurrentPage(currentPage + 1); };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this enquiry?")) {
            try {
                setActionLoading(true);
                await api.delete(`/contact-messages/${id}/delete/`);
                const updatedEnquiries = enquiries.filter(item => item.id !== id);
                setEnquiries(updatedEnquiries);
                setSelectedEnquiry(null);
                alert("Enquiry deleted successfully!");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete enquiry. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Handle status selection
    const handleStatusSelection = async (newStatus) => {
        try {
            setActionLoading(true);

            // const allowedStatuses = ["Pending", "Contacted"];
            // if (!allowedStatuses.includes(newStatus)) {
            //     alert("Invalid status. Please select Pending or Contacted.");
            //     setActionLoading(false);
            //     return;
            // }

            await api.patch(`/contact/update/${selectedEnquiry.id}/`, {
                status: newStatus
            });

            setSelectedEnquiry((prev) => ({
                ...prev,
                status: newStatus
            }));

            setEnquiries((prevList) =>
                prevList.map((enquiry) =>
                    enquiry.id === selectedEnquiry.id
                        ? { ...enquiry, status: newStatus }
                        : enquiry
                )
            );

            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            alert(error.response?.data?.message || "Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };

    if (enquiriesLoading && enquiries.length === 0) {
        return (
            <div className="Enquiries-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    Loading enquiries...
                </div>
            </div>
        );
    }

    // DETAILS VIEW
    if (selectedEnquiry) {
        return (
            <div className="Enquiries-container">
                <div className="Enquiries-header">
                    <div>
                        <h2>Enquiry Details</h2>
                    </div>
                </div>

                <div className="enq-details-actions-bar">
                    <button
                        className="enq-back-to-contact-btn"
                        onClick={() => setSelectedEnquiry(null)}
                        disabled={actionLoading}
                    >
                        Back to Enquiries
                    </button>
                </div>

                <div className="enq-details-main-content">
                    <div className="enq-details-left-pane">
                        {/* Header Card with Status on Right */}
                        <div className="enq-details-header-card">
                            <div className="enq-details-header-left">
                                <img src={Enquiry} alt="Enquiry" className="enq-details-header-icon" />
                                <div>
                                    <h3 className="enq-details-id-title">
                                        {formatEnquiryId(selectedEnquiry.id, 0)}
                                    </h3>
                                    <p className="enq-details-created-on">
                                        Created on : {selectedEnquiry.created_at
                                            ? formatDate(selectedEnquiry.created_at)
                                            : (selectedEnquiry.date || 'Date not available')}
                                    </p>
                                </div>
                            </div>

                            <div className="enq-details-status-box">
                                <img src={AdminStatus} width={18} height={18} alt="Status" />
                                <span className="enq-details-status-label">Status :</span>
                                <span className={`enq-details-status-badge ${selectedEnquiry.status || 'Pending'}`}>
                                    {selectedEnquiry.status || "Pending"}
                                </span>
                            </div>
                        </div>

                        {/* User Information Section */}
                        <div className="enq-details-user-section">
                            <h2 className="enq-details-section-title">User Information</h2>
                            <div className="enq-details-user-grid">
                                <div className="enq-details-grid-row">
                                    <span className="enq-details-grid-label">Name :</span>
                                    <input type="text" disabled value={selectedEnquiry.name || 'N/A'} />
                                </div>
                                <div className="enq-details-grid-row">
                                    <span className="enq-details-grid-label">Mobile number :</span>
                                    <input type='text' disabled value={selectedEnquiry.contact || selectedEnquiry.mobile || 'N/A'} />
                                </div>
                                <div className="enq-details-grid-row">
                                    <span className="enq-details-grid-label">Mail ID :</span>
                                    <input disabled value={selectedEnquiry.email || 'N/A'} />
                                </div>
                            </div>
                        </div>

                        {/* Enquiry Details Section */}
                        <div className="enq-details-message-section">
                            <h2 className="enq-details-section-title">Enquiry details :</h2>
                            <div className="enq-details-message-text">
                                {selectedEnquiry.message || selectedEnquiry.reason || 'No message provided'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="enq-details-actions-bottom">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="enq-details-btn-edit-status"
                        disabled={actionLoading}
                    >
                        <img
                            src={pencil}
                            alt="edit"
                            className="enq-details-btn-icon"
                            style={{ marginRight: '6px', filter: 'brightness(0) invert(1)' }}
                        />
                        Edit Status
                    </button>
                    {/* <button
                        onClick={() => handleDelete(selectedEnquiry.id)}
                        className="enq-details-btn-delete"
                        disabled={actionLoading}
                    >
                        <img src={Delete} alt="delete" className="enq-details-btn-icon" /> Delete
                    </button> */}
                </div>

                {/* Status Modal */}
                {isModalOpen && (
                    <div className="enq-status-modal-overlay"
                        ref={modalRef}
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                        <div className="enq-status-modal-content">
                            <h3>Select Status</h3>
                            <p className="enq-status-modal-current">
                                Current Status: <span>{selectedEnquiry.status || "Pending"}</span>
                            </p>

                            <div className="enq-status-modal-options">
                                <button
                                    onClick={() => handleStatusSelection("Pending")}
                                    disabled={actionLoading}
                                    className="enq-status-option-pending"
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => handleStatusSelection("Contacted")}
                                    disabled={actionLoading}
                                    className="enq-status-option-contacted"
                                >
                                    Contacted
                                </button>
                                <button
                                    onClick={() => handleStatusSelection("Resolved")}
                                    disabled={actionLoading}
                                    className="enq-status-option-resolved"
                                >
                                    Resolved
                                </button>
                            </div>

                            <button
                                className="enq-status-modal-cancel"
                                onClick={() => setIsModalOpen(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="Enquiries-container">
            <div className="Enquiries-header">
                <div>
                    <h2>Received Enquiries</h2>
                    <p>List of newly received enquiries on this portal (contact us)</p>
                </div>
            </div>

            {/* Search */}
            <div className="enq-search-container">
                <div className="enq-search-wrapper">
                    <span className="enq-search-icon"><img src={Searchicon} alt="Search" /></span>
                    <input
                        type="text"
                        placeholder="Search by ID, enquiry, user or status"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="Enquiries-table-wrapper">
                <table className="Enquiries-table">
                    <thead>
                        <tr>
                            <th className="enq-col-id">Enquiry ID</th>
                            <th className="enq-col-enquiry">Enquiry</th>
                            <th className="enq-col-user">User</th>
                            <th className="enq-col-received">Received On</th>
                            <th className="enq-col-status" style={{ paddingLeft: "30px" }}>Status</th>
                            <th className="enq-col-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((item, index) => {
                                const globalIndex = filteredEnquiries.indexOf(item);
                                return (
                                    <tr key={item.id || index}>
                                        <td className="enq-cell-id">
                                            {formatEnquiryId(item.id, globalIndex)}
                                        </td>
                                        <td className="enq-cell-enquiry">
                                            {item.message || item.reason || 'No message'}
                                        </td>
                                        <td className="enq-cell-user">
                                            {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A'}
                                        </td>
                                        <td className="enq-cell-received">
                                            <div className="enq-received-date">
                                                {formatDate(item.created_at || item.date)}
                                            </div>
                                            {item.time && (
                                                <div className="enq-received-time">
                                                    {item.time}
                                                </div>
                                            )}
                                        </td>
                                        <td className="enq-cell-status">
                                            <span className={`enq-status-badge ${item.status || 'Pending'}`}>
                                                {item.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="enq-cell-action">
                                            <button
                                                className="enq-view-btn"
                                                onClick={() => setSelectedEnquiry(item)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="enq-no-records">
                                    {enquiriesLoading ? "Loading enquiries..." : "No Enquiries Found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="enq-pagination-footer">
                    <p>Page {currentPage} of {nPages}</p>
                    <div className="enq-pagination-btns">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            <img src={leftArrow} alt="prev" className="enq-nav-arrow" />
                        </button>
                        <button onClick={nextPage} disabled={currentPage === nPages}>
                            <img src={rightArrow} alt="next" className="enq-nav-arrow" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};