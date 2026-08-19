import React, { useState, useEffect, useRef } from 'react'
import './UserManagement.css'
import { useJobs } from '../JobContext'
import Searchicon from '../assets/icon_search.png'
import leftArrow from '../assets/left_arrow.png'
import rightArrow from '../assets/right_arrow.png'
import pencil from '../assets/AdminAssets/Edit.png';
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export const UserManagement = () => {
  const { Alluser, currentEmployer, updateUserStatus } = useJobs()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const recordsPerPage = 5;
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);
  const lastButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Reset to list view by default on fresh entry / module switching
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear session storage and reset views on module mount
  useEffect(() => {
    sessionStorage.removeItem('umIsDetailView');
    sessionStorage.removeItem('umSelectedUser');
    setIsDetailView(false);
    setSelectedUser(null);
  }, []);

  // Notification click deep-link: if we came from a "New Jobseeker/Employer
  // Signup" notification, pre-fill the search box with that user's email.
  useEffect(() => {
    const searchTerm = sessionStorage.getItem('adminNotifSearchTerm');
    if (searchTerm) {
      setSearch(searchTerm);
      sessionStorage.removeItem('adminNotifSearchTerm');
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      // Focus trap for modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button:not([disabled])'
          );

          if (!focusableElements || focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const activeElement = document.activeElement;

          if (e.shiftKey && activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
          else if (!e.shiftKey && activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
          else if (!modalRef.current?.contains(activeElement)) {
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

  // Keep session synced ONLY while remaining inside the component actively
  useEffect(() => {
    sessionStorage.setItem('umIsDetailView', isDetailView);
    if (selectedUser) {
      sessionStorage.setItem('umSelectedUser', JSON.stringify(selectedUser));
    } else {
      sessionStorage.removeItem('umSelectedUser');
    }
  }, [isDetailView, selectedUser]);

  useEffect(() => {
    if (location.state?.filterRole) {
      setSearch(location.state.filterRole);
      setCurrentPage(1);
      setIsDetailView(false);
      setSelectedUser(null);
      // Clear route state to prevent unexpected behavior on reloads
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch all users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      setUsersList(response.data);
      setError(null);
      console.log('Fetched users:', response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/`);
      return response.data;
    } catch (err) {
      console.error('Error fetching user details:', err);
      throw err;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/users/${id}/status/`, { status: newStatus });

      setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      setSelectedUser(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);

      if (updateUserStatus) {
        updateUserStatus(id, newStatus);
      }

      setIsModalOpen(false);
      alert("Status updated and saved successfully!");
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteReport = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await api.delete(`users/${id}/delete/`);

        setUsersList(prev => prev.filter(u => u.id !== id));
        setSelectedUser(null);
        setIsDetailView(false);
        alert("User deleted successfully!");
      } catch (err) {
        console.error('Error deleting user:', err);
        alert("Failed to delete user");
      }
    }
  };

  const prevPage = () => { if (currentPage !== 1) setCurrentPage(currentPage - 1) };
  const nextPage = () => { if (currentPage !== nPages) setCurrentPage(currentPage + 1) };

  const handleViewDetails = async (user) => {
    try {
      const userDetails = await fetchUserDetails(user.id);
      setSelectedUser(userDetails);
      setIsDetailView(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert("Failed to load user details");
    }
  };

  const handleBackToList = () => {
    setIsDetailView(false);
    setSelectedUser(null);
    fetchUsers(); // Auto-refresh user tables on view exit
  };

  // Filter and globally sort users by ID descending (Latest Registered first)
  const filteredUsers = usersList
    .filter(user => {
      const searchTerm = search.toLowerCase();
      const fullName = (user.profile?.fullName || "").toLowerCase();
      const email = (user.contact?.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase();

      return fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        role.includes(searchTerm);
    })
    .sort((a, b) => {
      return b.id - a.id; // Sorts newest entries to top globally
    });

  // Calculate statistics
  const totalUsers = usersList.length;
  const activeNow = usersList.filter(user => user.status === 'Active').length;
  const candidates = usersList.filter(user => user.role === 'candidate').length;
  const employers = usersList.filter(user => user.role === 'employer').length;

  // Pagination setups
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredUsers.length / recordsPerPage);

  if (loading) {
    return (
      <div className="user-management-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-container">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
        </div>
      </div>
    );
  }

  if (isDetailView && selectedUser) {
    const isEmployer = selectedUser.role === 'employer';
    // Fallback checks for real-time mobile alterations
    const mobileNumber = selectedUser.contact?.mobile || selectedUser.phone || "N/A";

    return (
      <div className="detail-page-wrapper">
        <div className="detail-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="detail-section-title" style={{ margin: 0 }}>
              {isEmployer ? "Employer Information" : "User Information"}
            </h3>
            <button onClick={handleBackToList} className="RepAJob-btn-back">
              Back to List
            </button>
          </div>

          <div className="detail-form-group">
            <div className="detail-field-row">
              <label>Id :</label>
              <input type="text" readOnly value={selectedUser.id || "N/A"} />
            </div>

            <div className="detail-field-row">
              <label>Name :</label>
              <input type="text" readOnly value={selectedUser.profile?.fullName || "N/A"} />
            </div>

            <div className="detail-field-row">
              <label>Mobile number :</label>
              <input type="text" readOnly value={mobileNumber} />
            </div>

            <div className="detail-field-row">
              <label>Mail ID :</label>
              <input type="text" readOnly value={selectedUser.contact?.email || "N/A"} />
            </div>

            {isEmployer ? (
              <>
                <div className="detail-field-row">
                  <label>Company ID :</label>
                  <input type="text" readOnly value={selectedUser.companyDetails?.companyId || "N/A"} />
                </div>

                <div className="detail-field-row">
                  <label>Company Name :</label>
                  <input type="text" readOnly value={selectedUser.companyDetails?.companyName || "N/A"} />
                </div>

                <div className="detail-field-row">
                  <label>Join Date :</label>
                  <input type="text" readOnly value={selectedUser.joinDate || "N/A"} />
                </div>

                <div className="detail-field-row">
                  <label>Membership Plan :</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedUser.companyDetails?.planName || selectedUser.plan_name || "Basic Plan"}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="detail-field-row">
                  <label>Preferred Role :</label>
                  <input type="text" readOnly value={selectedUser.preferences?.[0]?.role || "Candidate"} />
                </div>

                <div className="detail-field-row">
                  <label>Current Details :</label>
                  <input type="text" readOnly value={selectedUser.currentDetails?.currentLocation || "Chennai"} />
                </div>

                <div className="detail-field-row">
                  <label>Education :</label>
                  <input type="text" readOnly value={selectedUser.education?.highestQual || "B.E / B.Tech / Graduate"} />
                </div>

                <div className="detail-field-row">
                  <label>Skills :</label>
                  <input type="text" readOnly value={Array.isArray(selectedUser.skills) ? selectedUser.skills.join(", ") : selectedUser.skills || "React, Node.js, JavaScript, CSS"} />
                </div>
              </>
            )}

            <div className="detail-field-row">
              <label>Current Status :</label>
              <input type="text" readOnly value={selectedUser.status} style={{ fontWeight: 'bold', color: selectedUser.status === 'Active' ? '#2e7d32' : selectedUser.status === 'Hold' ? '#f57c00' : '#d32f2f' }} />
            </div>
          </div>
        </div>

        <div className="detail-section-card summary-card">
          <div className="detail-section-header">
            <h3 className="detail-section-title" title='Overview Details'>Overview Details</h3>
            <span className={`badge-pill ${isEmployer ? 'badge-employer' : 'badge-candidate'}`}>
              {isEmployer ? 'Corporate Profile' : 'Professional Summary'}
            </span>
          </div>

          <div className="detail-report-textbox card-message-body">
            {isEmployer ? (
              <div className="info-flex-wrapper">
                <p>
                  This employer officially registered on <strong className="highlight-text">{selectedUser.joinDate}</strong> and is currently authorized to manage corporate postings, configure active membership plans, and review platform applications.
                </p>
              </div>
            ) : (
              <div className="info-flex-wrapper">
                <p>
                  An online job profile acts as your personal digital storefront. It allows you to effectively present your key skillsets, highlight top technical competencies to prospective employers, and optimize your overall search discoverability.
                </p>
              </div>
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
          <button onClick={() => handleDeleteReport(selectedUser.id)} className="detail-btn-action detail-btn-delete">
            Delete
          </button>  
        </div>

        {isModalOpen && (
          <div className="detail-status-modal-overlay"
            ref={modalRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="detail-status-modal-content">
              <h3>Select Status</h3>
              <div className="detail-status-modal-options">
                <button
                  ref={firstButtonRef}
                  onClick={() => handleStatusChange(selectedUser.id, "Active")}
                >
                  Active
                </button>
                <button onClick={() => handleStatusChange(selectedUser.id, "Hold")}>
                  Hold
                </button>
                <button
                  ref={lastButtonRef}
                  onClick={() => handleStatusChange(selectedUser.id, "Deactivated")}
                >
                  Deactivated
                </button>
              </div>
              <button className="detail-status-modal-cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div style={{ marginBottom: "25px" }} className='Admin-Welcome-Container'>
        <p style={{ margin: "5px 0" }} className='Admin-Welcome-Note' >User Management</p>
        <p style={{ margin: "5px 0" }} className='Admin-Welcome-para'>Manage and monitor all platform members and their activity.</p>
      </div>

      <div className="um-stats">
        <div className="um-card"><p>Total Users</p><h3>{totalUsers}</h3></div>
        <div className="um-card green"><p>Active Now</p><h3>{activeNow}</h3></div>
        <div className="um-card yellow"><p>Candidates</p><h3>{candidates}</h3></div>
        <div className="um-card black"><p>Employers</p><h3>{employers}</h3></div>
      </div>

      <div className="um-search-container">
        <div className="search-wrapper">
          <span className="search-icon"><img src={Searchicon} alt="Search" /></span>
          <input
            type="text"
            placeholder="Search by name, email or Role"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="um-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Joined Date</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((user) => {
              const isEmployer = user.role === "employer"

              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className={`avatar ${isEmployer ? 'employer-avatar' : ''}`}>
                        {user.profile?.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p>{user.profile?.fullName || "N/A"}</p>
                        <span>{user.contact?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`role ${isEmployer ? 'employer' : 'candidate'}`}>
                      {isEmployer ? "Employer" : "Candidate"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`status ${user.status?.toLowerCase() || 'active'}`}>
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }} className="last-seen">
                    {user.last_seen || "N/A"}
                  </td>
                  <td style={{ textAlign: "center" }} className="joined-date">
                    {user.joinDate}
                  </td>
                  <td style={{ textAlign: "center" }}>
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
                      onClick={() => handleViewDetails(user)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )
            })}
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
  )
}