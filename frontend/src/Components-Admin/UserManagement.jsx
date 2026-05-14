import React, { useEffect, useState } from 'react'
import './UserManagement.css'
import { useJobs } from '../JobContext'
import Searchicon from '../assets/icon_search.png'
import leftArrow from '../assets/left_arrow.png'
import rightArrow from '../assets/right_arrow.png'
import threedots from '../assets/ThreeDots.png'
import api from '../api/axios'

export const UserManagement = () => {
  const { Alluser, currentEmployer, fetchEmployerData } = useJobs()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const recordsPerPage = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get('/users/')
      
      if (res.data && Array.isArray(res.data)) {
        const processedUsers = res.data.map((user, index) => {
          let status = user.status || "Active";
          
          
          
          return { 
            ...user, 
            status,
            profile: user.profile || { fullName: 'Unknown User' },
            contact: user.contact || { email: 'no-email@example.com', city: 'Unknown' },
            joinDate: user.joinDate || new Date().toISOString().split('T')[0]
          };
        });
        
        setUsersList(processedUsers);
      } else {
        setUsersList([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Unauthorized access. Please login again.');
        } else if (err.response.status === 403) {
          setError('You don\'t have permission to view users.');
        } else if (err.response.status === 404) {
          setError('Users endpoint not found.');
        } else {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Please try again later'}`);
        }
      } else if (err.request) {
        setError('Unable to connect to server.');
      } else {
        setError(`Error: ${err.message || 'An unexpected error occurred'}`);
      }
      
      const mockUsers = Alluser.length > 0 ? [
        ...Alluser.map((user, index) => {
          let status = "Active";
          if (index === 3 || index === 5) status = "Hold";
          if (index === 4) status = "Deactivated";
          return { ...user, status };
        }),
        {
          id: 78,
          role: "employer",
          status: "Active",
          profile: { fullName: 'sudhakar' },
          contact: { email: 'sudhakar@gmail.com', city: "Chennai" },
          joinDate: '12/02/2023'
        }
      ] : [];
      
      setUsersList(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      setStatusUpdateLoading(userId);
      setError(null);
      setSuccessMessage(null);
      
      setUsersList(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
      
      const response = await api.patch(`/users/${userId}/status/`, { status: newStatus });
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (response.status === 200 || response.status === 204) {
        setSuccessMessage(`User status updated to ${newStatus} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        
      } else {
        const originalUsers = await fetchUsers();
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      
      await fetchUsers();
      
      if (err.response?.status === 401) {
        setError('Unauthorized: Please login again to change user status');
      } else if (err.response?.status === 403) {
        setError('Permission denied: You don\'t have rights to change user status');
      } else {
        setError(`Failed to update status: ${err.response?.data?.message || err.message || 'Please try again'}`);
      }
      
      setTimeout(() => setError(null), 5000);
    } finally {
      setStatusUpdateLoading(null);
      setActiveMenuId(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const user = usersList.find(u => u.id === id);
    if (!user) {
      setError('User not found');
      return;
    }
    
    if (user.status === newStatus) {
      setError(`User is already ${newStatus}`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (newStatus === 'Deactivated') {
      const confirmDeactivate = window.confirm(`Are you sure you want to deactivate ${user.profile.fullName}? They will not be able to access the platform.`);
      if (!confirmDeactivate) {
        setActiveMenuId(null);
        return;
      }
    }
    
    updateUserStatus(id, newStatus);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter((user) => {
    if (!search.trim()) return true;
    
    const name = user.profile?.fullName?.toLowerCase() || '';
    const email = user.contact?.email?.toLowerCase() || '';
    const role = user.role ? user.role.toLowerCase() : "candidate";
    const searchTerm = search.toLowerCase().trim();
    
    return (
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      role.includes(searchTerm)
    );
  });

  const totalUsers = usersList.length;
  const candidates = usersList.filter(u => u.role !== "employer").length;
  const employers = usersList.filter(u => u.role === "employer").length;
  const activeNow = usersList.filter(u => u.status === "Active").length;

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = [...filteredUsers].reverse().slice(firstIndex, lastIndex);
  const nPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const prevPage = () => { 
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
      setActiveMenuId(null);
    }
  };
  
  const nextPage = () => { 
    if (currentPage !== nPages && nPages > 0) {
      setCurrentPage(currentPage + 1);
      setActiveMenuId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return "Invalid date";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuId && !event.target.closest('.um-actions')) {
        setActiveMenuId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="alert-close">×</button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">×</button>
          {error.includes('Network error') && (
            <button onClick={fetchUsers} className="alert-retry">Retry</button>
          )}
        </div>
      )}

      <div style={{ marginBottom: "25px" }} className='Admin-Welcome-Container'>
        <p className='Admin-Welcome-Note'>User Management</p>
        <p className='Admin-Welcome-para'>Manage and monitor all platform members and their activity.</p>
      </div>

      <div className="um-stats">
        <div className="um-card">
          <p>Total Users</p>
          <h3>{totalUsers}</h3>
        </div>
        <div className="um-card green">
          <p>Active Now</p>
          <h3>{activeNow}</h3>
        </div>
        <div className="um-card yellow">
          <p>Candidates</p>
          <h3>{candidates}</h3>
        </div>
        <div className="um-card black">
          <p>Employers</p>
          <h3>{employers}</h3>
        </div>
      </div>

      <div className="um-search-container">
        <div className="search-wrapper">
          <span className="search-icon">
            <img src={Searchicon} alt="Search" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or Role"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              setActiveMenuId(null);
            }}
          />
          {search && (
            <button 
              className="search-clear" 
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>No users found matching your search criteria.</p>
          {search && (
            <button onClick={() => setSearch("")}>Clear Search</button>
          )}
        </div>
      ) : (
        <div className="um-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((user) => {
                const isEmployer = user.role === "employer";
                const isLoading = statusUpdateLoading === user.id;
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className={`avatar ${isEmployer ? 'employer-avatar' : ''}`}>
                          {user.profile?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p>{user.profile?.fullName || 'Unknown User'}</p>
                          <span>{user.contact?.email || 'No email'}</span>
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
                    <td style={{ textAlign: "center" }} className="joined-date">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="um-actions">
                      {isLoading ? (
                        <div className="loading-small"></div>
                      ) : (
                        <>
                          <img
                            src={threedots}
                            alt="options"
                            className="action-icon"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === user.id ? null : user.id);
                            }}
                          />
                          
                          {activeMenuId === user.id && (
                            <div className="status-dropdown">
                              {user.status === "Active" && (
                                <>
                                  <button onClick={() => handleStatusChange(user.id, "Deactivated")}>
                                    Deactivate
                                  </button>
                                  <button onClick={() => handleStatusChange(user.id, "Hold")}>
                                    Hold
                                  </button>
                                </>
                              )}
                              {user.status === "Hold" && (
                                <>
                                  <button onClick={() => handleStatusChange(user.id, "Deactivated")}>
                                    Deactivate
                                  </button>
                                  <button onClick={() => handleStatusChange(user.id, "Active")}>
                                    Activate
                                  </button>
                                </>
                              )}
                              {user.status === "Deactivated" && (
                                <>
                                  <button onClick={() => handleStatusChange(user.id, "Active")}>
                                    Activate
                                  </button>
                                  <button onClick={() => handleStatusChange(user.id, "Hold")}>
                                    Hold
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-footer">
            <p>
              Page {currentPage} of {nPages} 
              {filteredUsers.length > 0 && ` (${filteredUsers.length} total users)`}
            </p>
            <div className="pagination-btns">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1 || nPages === 0}
                aria-label="Previous page"
              >
                <img src={leftArrow} alt="prev" className="nav-arrow" />
              </button>
              <button 
                onClick={nextPage} 
                disabled={currentPage === nPages || nPages === 0}
                aria-label="Next page"
              >
                <img src={rightArrow} alt="next" className="nav-arrow" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};