import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './AddManagerContact.css';
import DeleteIcon from '../assets/Billing/Delete_icon.png';
import ProfileIcon from "../assets/icon_profile.png";

export const AddManagerContact = () => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [allManagers, setAllManagers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [activeTargetManager, setActiveTargetManager] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [managersPerPage] = useState(5);
  const [totalManagers, setTotalManagers] = useState(0);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [assignErrors, setAssignErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: 'general',
    title: 'Account Manager',
    description: '',
    is_active: true,
    order: 0
  });

  const departmentOptions = [
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchData(1);
  }, []);

  // Notification click deep-link: best-effort — only opens the manager if
  // it's on the currently loaded page. Newly created managers are always
  // on page 1 (list is sorted by id desc), so account_manager_created will
  // reliably work; assigned/removed may not if the manager isn't on page 1.
  useEffect(() => {
    if (loading || !managers || managers.length === 0) return;

    const highlightType = sessionStorage.getItem('adminNotifHighlightType');
    const highlightId = sessionStorage.getItem('adminNotifHighlightId');

    if (highlightType === 'manager' && highlightId) {
      const match = managers.find(m => String(m.id) === String(highlightId));
      if (match) {
        handleEdit(match);
      }
      sessionStorage.removeItem('adminNotifHighlightType');
      sessionStorage.removeItem('adminNotifHighlightId');
    }
  }, [loading, managers]);

  // Update fetchData to handle pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [managersRes, assignmentsRes, allManagersRes] = await Promise.all([
        api.get(`/admin/account-managers/?page=${page}&limit=${managersPerPage}`),
        api.get('/admin/employer-assignments/'),
        api.get('/admin/account-managers/')
      ]);

      console.log('Managers Response:', managersRes.data);
      console.log('Assignments Response:', assignmentsRes.data);
      console.log('All Managers Response:', allManagersRes.data);

      // Handle paginated response
      if (managersRes.data && managersRes.data.results) {
        setManagers(managersRes.data.results);
        setTotalManagers(managersRes.data.count || managersRes.data.results.length);
      } else {
        const sortedManagers = [...managersRes.data].sort((a, b) => b.id - a.id);
        setTotalManagers(sortedManagers.length);

        const startIndex = (page - 1) * managersPerPage;
        const endIndex = startIndex + managersPerPage;
        setManagers(sortedManagers.slice(startIndex, endIndex));
      }

      // Store complete manager list for dropdown assignment
      const completeList = allManagersRes.data.results || allManagersRes.data || [];
      setAllManagers(completeList);

      setCurrentPage(page);
      setAssignments(assignmentsRes.data);

      if (activeTargetManager) {
        const updated = completeList.find(m => m.id === activeTargetManager.id);
        if (updated) setActiveTargetManager(updated);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber < 1) return;
    const totalPages = Math.ceil(totalManagers / managersPerPage);
    if (pageNumber > totalPages) return;
    fetchData(pageNumber);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalManagers / managersPerPage);
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push('...');

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

      if (currentPage < totalPages - 2) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const isManagerAssigned = (assignment, managerId) => {
    if (!assignment.assigned_managers || !Array.isArray(assignment.assigned_managers)) {
      return false;
    }
    return assignment.assigned_managers.some(m => m.id === managerId);
  };

  const getEmployersForManager = (managerId) => {
    if (!managerId) return [];
    return assignments.filter(assignment => isManagerAssigned(assignment, managerId));
  };

  const getManagerPrimaryStatus = (assignment, managerId) => {
    if (!assignment.assigned_managers || !Array.isArray(assignment.assigned_managers)) {
      return false;
    }
    const manager = assignment.assigned_managers.find(m => m.id === managerId);
    return manager ? manager.is_primary : false;
  };

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'full_name') {
      if (!value || !value.trim()) errorMsg = 'Full name is required.';
      else if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) errorMsg = 'Name must contain only alphabets and spaces (2-50 characters).';
    }
    if (name === 'title') {
      if (!value || !value.trim()) errorMsg = 'Title is required.';
      else if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) errorMsg = 'Title must contain only alphabets and spaces (2-50 characters).';
    }
    if (name === 'email') {
      if (!value || !value.trim()) errorMsg = 'Email address is required.';
      else {
        const emailRegex = /^[a-zA-Z0-9]{4,}@[a-zA-Z0-9]{2,}\.(com|in|net|org|gov|edu|site|io|int|jobs)$/;
        if (!emailRegex.test(value.trim())) {
          errorMsg = 'Email must have at least 4 alphanumeric characters before @ and end with a valid domain.';
        }
      }
    }
    if (name === 'phone') {
      if (!value || !value.trim()) errorMsg = 'Phone number is required.';
      else if (!/^[6-9]\d{9}$/.test(value.trim())) errorMsg = 'Please enter a valid phone number (10 digits starting with 6-9).';
    }
    if (name === 'description') {
      if (value && value.length > 200) errorMsg = `Description must not exceed 200 characters. Current: ${value.length}/200`;
    }
    return errorMsg;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (type !== 'checkbox') {
      const fieldError = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const checkDuplicates = (currentId) => {
    const emailDup = allManagers.some(m => m.email.toLowerCase() === formData.email.toLowerCase() && m.id !== currentId);
    const phoneDup = allManagers.some(m => m.phone === formData.phone && m.id !== currentId);

    let errors = {};
    if (emailDup) errors.email = 'An account manager with this email already exists.';
    if (phoneDup) errors.phone = 'An account manager with this phone number already exists.';
    return errors;
  };

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      department: 'general',
      title: 'Account Manager',
      description: '',
      is_active: true,
      order: 0
    });
    setFormErrors({});
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateField('full_name', formData.full_name);
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField('phone', formData.phone);
    const titleErr = validateField('title', formData.title);
    const descriptionErr = validateField('description', formData.description);

    if (nameErr || emailErr || phoneErr || titleErr || descriptionErr) {
      setFormErrors({
        full_name: nameErr,
        email: emailErr,
        phone: phoneErr,
        title: titleErr,
        description: descriptionErr
      });
      return;
    }

    const duplicateErrors = checkDuplicates(editingId);
    if (Object.keys(duplicateErrors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...duplicateErrors }));
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/account-managers/${editingId}/`, formData);
        triggerSuccess('Manager updated successfully!');
      } else {
        await api.post('/admin/account-managers/', formData);
        triggerSuccess('Account manager created successfully!');
      }
      await fetchData(currentPage);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (manager) => {
    setFormData({
      full_name: manager.full_name,
      email: manager.email,
      phone: manager.phone,
      department: manager.department,
      title: manager.title || 'Account Manager',
      description: manager.description || '',
      is_active: manager.is_active,
      order: manager.order || 0
    });
    setFormErrors({});
    setEditingId(manager.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    // Find the manager to get their details
    const manager = managers.find(m => m.id === id);
    if (!manager) return;

    // Get count of employers assigned to this manager
    const assignedEmployers = getEmployersForManager(id);
    const assignedCount = assignedEmployers.length;

    // Build confirmation message
    let confirmMessage = `Are you sure you want to permanently delete the account manager "${manager.full_name}"?`;

    if (assignedCount > 0) {
      confirmMessage += `\n\n This manager is currently assigned to ${assignedCount} employer(s).`;
      confirmMessage += `\nDeleting this manager will remove all these assignments.`;
    } else {
      confirmMessage += `\n\nThis manager has no active assignments.`;
    }

    confirmMessage += `\n\nDo you want to continue?`;

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      // First, remove all assignments for this manager
      if (assignedCount > 0) {
        for (const assign of assignedEmployers) {
          try {
            await api.delete(`/admin/employer-assignments/?employer_id=${assign.employer_id}&account_manager_id=${id}`);
          } catch {
            await api.delete('/admin/employer-assignments/', {
              data: { employer_id: parseInt(assign.employer_id), account_manager_id: parseInt(id) }
            });
          }
        }
      }

      await api.delete(`/admin/account-managers/${id}/`);
      triggerSuccess(`Account manager "${manager.full_name}" deleted successfully!`);
      await fetchData(currentPage);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignErrors({});
    setError(null);

    const parsedEmployerId = parseInt(selectedEmployer, 10);
    const managerIdParsed = parseInt(selectedManager, 10);

    if (!selectedEmployer || isNaN(parsedEmployerId) || parsedEmployerId <= 0) {
      setAssignErrors({ employer_id: 'Please enter a valid numeric Employer ID.' });
      return;
    }

    if (!selectedManager) {
      setAssignErrors({ manager: 'Please select a manager.' });
      return;
    }

    const isDuplicate = assignments.some(assign =>
      parseInt(assign.employer_id, 10) === parsedEmployerId &&
      assign.assigned_managers?.some(m => parseInt(m.id, 10) === managerIdParsed)
    );

    if (isDuplicate) {
      setAssignErrors({ employer_id: 'This Account Manager is already assigned to this Employer ID.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/assign-account-manager/', {
        employer_id: parsedEmployerId,
        account_manager_id: managerIdParsed,
        is_primary: isPrimary
      });

      await fetchData(currentPage);
      setSelectedEmployer('');
      setSelectedManager('');
      setIsPrimary(false);
      triggerSuccess('Manager assigned successfully!');
    } catch (err) {
      setAssignErrors({ employer_id: err.response?.data?.error || 'Invalid Employer ID or Manager.' });
    } finally {
      setLoading(false);
    }
  };

  const blockSpecialNumericSymbols = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleRemoveAssignment = async (employerId, managerId) => {
    if (!window.confirm(`Are you sure you want to remove account manager from Employer #${employerId}?`)) return;

    setLoading(true);
    try {
      await api.delete(`/admin/employer-assignments/?employer_id=${employerId}&account_manager_id=${managerId}`);
      triggerSuccess('Employer assignment removed successfully.');
      await fetchData(currentPage);
    } catch {
      try {
        await api.delete('/admin/employer-assignments/', {
          data: { employer_id: parseInt(employerId), account_manager_id: parseInt(managerId) }
        });
        triggerSuccess('Employer assignment removed successfully.');
        await fetchData(currentPage);
      } catch (err2) {
        alert(err2.response?.data?.error || 'Failed to remove assignment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openTargetModal = (manager) => {
    setActiveTargetManager(manager);
    setIsTargetModalOpen(true);
  };

  const closeTargetModal = () => {
    setActiveTargetManager(null);
    setIsTargetModalOpen(false);
  };

  const managerSpecificAssignments = activeTargetManager
    ? getEmployersForManager(activeTargetManager.id)
    : [];

  const renderFormFields = (isActiveContext) => {
    const activeTabIndex = isActiveContext ? 0 : -1;
    return (
      <>
        <div className="admin-form-row">
          <div className="admin-form-group admin-col-6">
            <label className="admin-form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              placeholder="Manager Name"
              value={formData.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              tabIndex={activeTabIndex}
              className={`admin-form-input ${formErrors.full_name ? 'input-error-border' : ''}`}
            />
            {formErrors.full_name && <span className="admin-field-error-text">{formErrors.full_name}</span>}
          </div>
          <div className="admin-form-group admin-col-6">
            <label className="admin-form-label">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="manager@jobportal.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              tabIndex={activeTabIndex}
              className={`admin-form-input ${formErrors.email ? 'input-error-border' : ''}`}
            />
            {formErrors.email && <span className="admin-field-error-text">{formErrors.email}</span>}
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group admin-col-6">
            <label className="admin-form-label">Phone *</label>
            <input
              type="text"
              name="phone"
              placeholder="+91 91********"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              tabIndex={activeTabIndex}
              className={`admin-form-input ${formErrors.phone ? 'input-error-border' : ''}`}
            />
            {formErrors.phone && <span className="admin-field-error-text">{formErrors.phone}</span>}
          </div>
          <div className="admin-form-group admin-col-6">
            <label className="admin-form-label">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              tabIndex={activeTabIndex}
              className="admin-form-input"
            >
              {departmentOptions.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Senior Account Manager"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            tabIndex={activeTabIndex}
            className={`admin-form-input ${formErrors.title ? 'input-error-border' : ''}`}
          />
          {formErrors.title && <span className="admin-field-error-text">{formErrors.title}</span>}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Description / Bio (Optional)</label>
          <textarea
            name="description"
            placeholder="Brief description about the manager... (Max 200 characters)"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            tabIndex={activeTabIndex}
            className={`admin-form-textarea ${formErrors.description ? 'input-error-border' : ''}`}
            rows="3"
            maxLength="200"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span className="admin-field-error-text" style={{ fontSize: '11px', color: formErrors.description ? '#dc2626' : '#64748b' }}>
              {formErrors.description || `${formData.description.length}/200 characters`}
            </span>
          </div>
        </div>

        <div className="admin-toggle-row">
          <label className="admin-form-label">Status:</label>
          <label className="admin-clickable-checkbox">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              tabIndex={activeTabIndex}
            />
            Active
          </label>
        </div>
      </>
    );
  };

  const isAnyModalOpen = isModalOpen || isTargetModalOpen;
  const backgroundTabIndex = !isAnyModalOpen ? 0 : -1;

  return (
    <div className="admin-portal-container">
      <div className={`admin-form-card ${isAnyModalOpen ? 'admin-inert-background' : ''}`}>
        <div className="admin-form-header">
          <h2 className="admin-form-title">
            <img src={ProfileIcon} alt="Profile" className="admin-title-icon" />
            Account Manager Management
          </h2>
          <p className="admin-form-subtitle">
            Create account managers, assign them to employers, and manage contacts
          </p>
        </div>

        {successMessage && (
          <div
            className="admin-status-alert admin-alert-success"
            style={{ borderColor: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32' }}
          >
            <span
              className="admin-status-dot admin-animate-pulse"
              style={{ backgroundColor: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32' }}
            ></span>
            <span
              style={{ color: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32', fontWeight: '600' }}
            >
              {successMessage}
            </span>
          </div>
        )}
        {error && (
          <div className="admin-status-alert admin-alert-danger">
            <span>❌ {error}</span>
          </div>
        )}

        {!editingId && (
          <form onSubmit={handleSubmit} className="admin-portal-form">
            {renderFormFields(true)}
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-submit" tabIndex={backgroundTabIndex} disabled={loading}>
                {loading ? 'Saving...' : 'Create Manager'}
              </button>
            </div>
          </form>
        )}

        {isModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-wrapper" role="dialog" aria-modal="true">
              <div className="admin-modal-header">
                <h3>Edit Account Manager Properties</h3>
                <button type="button" className="admin-modal-close-btn" tabIndex={0} onClick={resetForm}>&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="admin-portal-form admin-modal-body">
                {renderFormFields(true)}
                <div className="admin-form-actions modal-footer-actions">
                  <button type="button" onClick={resetForm} className="admin-btn-cancel" tabIndex={0}>Cancel</button>
                  <button type="submit" className="admin-btn-submit" tabIndex={0} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Records'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isTargetModalOpen && activeTargetManager && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-wrapper target-modal-width" role="dialog" aria-modal="true">
              <div className="admin-modal-header">
                <div>
                  <h3 className="target-modal-title">Assigned Workspace Targets</h3>
                  <p className="target-modal-subtitle">Assigned to: <strong>{activeTargetManager.full_name}</strong></p>
                  <p className="target-modal-subtitle">Total Assignments: <strong>{managerSpecificAssignments.length}</strong></p>
                </div>
                <button type="button" className="admin-modal-close-btn" tabIndex={0} onClick={closeTargetModal}>&times;</button>
              </div>
              <div className="admin-modal-body no-padding-mobile">
                {managerSpecificAssignments.length === 0 ? (
                  <div>
                    <p className="admin-no-data-placeholder">
                      No employers mapped to this specific workspace manager yet.
                    </p>
                    {assignments.length > 0 && (
                      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                          Tip: Total assignments in system: {assignments.length}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="admin-target-table">
                    <thead>
                      <tr>
                        <th>Employer ID</th>
                        <th>Employer Name</th>
                        <th>Plan</th>
                        <th>Role Type</th>
                        <th className="align-center-header">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerSpecificAssignments.map(assign => {
                        const isPrimary = getManagerPrimaryStatus(assign, activeTargetManager.id);
                        return (
                          <tr key={assign.employer_id}>
                            <td><span className="target-id-badge">{assign.employer_id}</span></td>
                            <td>
                              <strong className="target-employer-name">{assign.employer_name}</strong><br />
                              <small style={{ color: '#666' }}>{assign.employer_email}</small>
                            </td>
                            <td>
                              <span style={{
                                background: assign.plan === 'Enterprise Plan' ? '#e8f5e9' : assign.plan === 'Professional Plan' ? '#e3f2fd' : '#fff3e0',
                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
                              }}>
                                {assign.plan}
                              </span>
                            </td>
                            <td>
                              <span className={`target-role-tag ${isPrimary ? 'role-primary' : 'role-secondary'}`}>
                                {isPrimary ? 'Primary' : 'Secondary'}
                              </span>
                            </td>
                            <td className="align-center-cell">
                              <button
                                type="button"
                                onClick={() => handleRemoveAssignment(assign.employer_id, activeTargetManager.id)}
                                className="admin-btn-remove-row inline-table-delete"
                                title="Delete Assignment"
                              >
                                <img src={DeleteIcon} alt="Unassign" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="admin-assignment-container">
          <div className="admin-assignment-top-row">
            <h3 className="admin-list-title">Account Managers ({totalManagers})</h3>
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="admin-btn-submit admin-btn-assign-toggle"
              tabIndex={backgroundTabIndex}
            >
              {showAssign ? 'Hide Assign' : 'Assign to Employer'}
            </button>
          </div>

          {showAssign && (
            <form onSubmit={handleAssign} className="admin-assignment-panel">
              <div className="admin-assignment-inputs-grid">
                <div className="admin-input-wrapper-context">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Employer ID *"
                    title="Open User Management page to get employer ID"
                    value={selectedEmployer}
                    onKeyDown={blockSpecialNumericSymbols}
                    onChange={(e) => {
                      const val = e.target.value;
                      const filteredDigits = val.replace(/\D/g, '');
                      setSelectedEmployer(filteredDigits);
                    }}
                    tabIndex={backgroundTabIndex}
                    className={`admin-form-input ${assignErrors.employer_id ? 'input-error-border' : ''}`}
                  />
                  {assignErrors.employer_id && <span className="admin-field-error-text inline-assign-error">{assignErrors.employer_id}</span>}
                </div>

                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="admin-form-input"
                  required
                >
                  <option value="" hidden>
                    Select Manager *
                  </option>
                  {/* Maps all active managers regardless of list pagination page */}
                  {allManagers.filter(m => m.is_active).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} - {m.department_display || m.department}
                    </option>
                  ))}
                </select>

                <div className="admin-assignment-inline-actions">
                  <label className="admin-clickable-checkbox">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      tabIndex={backgroundTabIndex}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                    />
                    Primary Contact
                  </label>
                  <button type="submit" className="admin-btn-submit" tabIndex={backgroundTabIndex} disabled={loading}>
                    Assign
                  </button>
                </div>
              </div>
            </form>
          )}

          {successMessage && (
            <div
              className="admin-status-alert admin-alert-success"
              style={{ marginTop: '10px', borderColor: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32' }}
            >
              <span
                className="admin-status-dot admin-animate-pulse"
                style={{ backgroundColor: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32' }}
              ></span>
              <span
                style={{ color: successMessage.toLowerCase().includes('delet') || successMessage.toLowerCase().includes('remov') ? '#dc3545' : '#2e7d32', fontWeight: '600' }}
              >
                {successMessage}
              </span>
            </div>
          )}

          <div className="admin-managers-card-list">
            {managers.length === 0 ? (
              <p className="admin-no-data-placeholder">No account managers created yet.</p>
            ) : (
              managers.map(manager => {
                const employerCount = getEmployersForManager(manager.id).length;
                return (
                  <div
                    key={manager.id}
                    className={`admin-manager-item-card ${manager.is_active ? 'status-active' : 'status-inactive'}`}
                  >
                    <div className="admin-manager-meta-group">
                      <strong className="admin-manager-display-name">{manager.full_name}</strong>
                      <span className="admin-email-text-label">{manager.email}</span>
                      <span className="admin-tag-badge-department">{manager.department_display || manager.department}</span>

                      <div
                        className="admin-manager-count-inline interactive-target-trigger"
                        onClick={() => openTargetModal(manager)}
                        title="View Assigned Employers"
                      >
                        <img src={ProfileIcon} alt="Profile Icon View" className="admin-inline-user-icon" />
                        <span className="admin-count-numerical-text">{employerCount}</span>
                      </div>

                      {!manager.is_active && <span className="admin-tag-badge-inactive">Inactive</span>}
                    </div>

                    <div className="admin-row-action-buttons">
                      <button onClick={() => handleEdit(manager)} className="admin-btn-edit-row" tabIndex={backgroundTabIndex} title="Edit Properties">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(manager.id)} className="admin-btn-remove-row" tabIndex={backgroundTabIndex} title="Remove Profile Mapping">
                        <img src={DeleteIcon} alt="Delete" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalManagers > managersPerPage && (
            <div className="admin-pagination-container">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="admin-pagination-btn"
              >
                Previous
              </button>

              <div className="admin-pagination-numbers">
                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() => typeof number === 'number' ? paginate(number) : null}
                    className={`admin-pagination-btn ${currentPage === number ? 'active' : ''} ${typeof number !== 'number' ? 'pagination-ellipsis' : ''}`}
                    disabled={typeof number !== 'number' || loading}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalManagers / managersPerPage) || loading}
                className="admin-pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};