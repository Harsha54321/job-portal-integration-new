import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AddManagerSupport.css';
import ProfileIcon from "../assets/icon_profile.png";

export const AddManagerSupport = ({ targetManagerId } = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState('');
  const [actionRequired, setActionRequired] = useState(null);
  const [actionButton, setActionButton] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAllContacts, setShowAllContacts] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/employer/account-managers/');
      const data = response.data;

      setHasAccess(data.has_access);
      setMessage(data.message || '');
      setActionRequired(data.action_required);
      setActionButton(data.action_button);

      if (data.has_access && data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts);

          const target = targetManagerId
              ? data.contacts.find(c => String(c.id) === String(targetManagerId))
              : null;
          const primary = data.contacts.find(c => c.is_primary);

          setSelectedContact(target || primary || data.contacts[0]);
          setShowAllContacts(false);
      }else {
        setContacts([]);
        setSelectedContact(null);
        setShowAllContacts(true);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleActionButton = () => {
    switch (actionRequired) {
      case 'upgrade':
      case 'renew':
      case 'reactivate':
        navigate('/Job-portal/Employer/Billing');
        break;
      case 'contact_support':
        navigate('/Job-portal/Employer/SupportHub');
        break;
      default:
        window.location.reload();
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowAllContacts(false);
  };

  const handleBackToList = () => {
    setShowAllContacts(true);
    setSelectedContact(null);
  };

  const handleEmailClick = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      const phoneClean = phone.replace(/\s/g, '');
      window.location.href = `tel:${phoneClean}`;
    }
  };

  if (loading) {
    return (
      <div className="employer-manager-container">
        <div className="employer-manager-card status-loading-center">
          <div className="spinner"></div>
          <p className="employer-loading-text">Loading account managers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-manager-container">
        <div className="employer-manager-card">
          <div className="employer-manager-header">
            <h3 className="employer-manager-title">Account Manager</h3>
          </div>
          <div className="employer-error-fallback-view">
            <p className="employer-error-message-text">{error}</p>
            <button
              onClick={fetchContacts}
              className="employer-manager-btn employer-manager-btn-primary margin-top-12"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // NO ACCESS / PLAN ISSUE
  // ──────────────────────────────────────────────
  if (!hasAccess) {
    let icon = '📋';
    let title = 'No Access';

    if (actionRequired === 'upgrade') {
      icon = '⬆️';
      title = 'Upgrade Required';
    } else if (actionRequired === 'reactivate') {
      icon = '⏸️';
      title = 'Plan Cancelled';
    } else if (actionRequired === 'renew') {
      icon = '⏰';
      title = 'Plan Expired';
    }

    return (
      <div className="employer-manager-container">
        <div className="employer-manager-card">
          <div className="employer-manager-header">
            <div className="employer-manager-badge badge-warning-theme">
              <span className="badge-dot dot-warning-active"></span>
              Action Required
            </div>
            <h3 className="employer-manager-title">Account Manager</h3>
            <p className="employer-manager-subtitle">
              {actionRequired === 'upgrade' ? 'Upgrade to get dedicated support' : 'Get access to your account manager'}
            </p>
          </div>

          <div className="employer-manager-empty">
            <div className="empty-icon">{icon}</div>
            <div className="empty-title">{title}</div>
            <div className="empty-subtitle">{message}</div>

            {actionButton && (
              <button
                onClick={handleActionButton}
                className="employer-manager-btn employer-manager-btn-primary margin-top-16"
              >
                {actionButton}
              </button>
            )}

            <button
              onClick={fetchContacts}
              className="employer-manager-btn employer-manager-btn-secondary btn-refresh-small"
            >
              Refresh
            </button>
          </div>

          <div className="employer-plan-status-footer">
            <span>Plan Status:</span>
            <span className="font-weight-600">
              {actionRequired === 'upgrade' ? '⬆️ Upgrade Needed' :
                actionRequired === 'reactivate' ? '⏸️ Cancelled' :
                  actionRequired === 'renew' ? '⏰ Expired' : '❓ Unknown'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // NO CONTACTS AVAILABLE
  // ──────────────────────────────────────────────
  if (contacts.length === 0) {
    return (
      <div className="employer-manager-container">
        <div className="employer-manager-card">
          <div className="employer-manager-header">
            <div className="employer-manager-badge">
              <span className="badge-dot"></span>
              Account Manager
            </div>
            <h3 className="employer-manager-title">Support Contact Hub</h3>
            <p className="employer-manager-subtitle">Your dedicated account managers are here to help</p>
          </div>
          <div className="employer-manager-empty">
            <div className="empty-icon">
              <img src={ProfileIcon} alt="No Manager" className="employer-empty-avatar-fallback" />
            </div>
            <div className="empty-title">No Account Manager Assigned</div>
            <div className="empty-subtitle">{message || 'Please contact support to get your dedicated account manager.'}</div>
            <button
              onClick={() => navigate('/Job-portal/Employer/SupportHub')}
              className="employer-manager-btn employer-manager-btn-primary margin-top-16"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // SHOW SINGLE CONTACT (Default View)
  // ──────────────────────────────────────────────
  if (!showAllContacts && selectedContact) {
    const contact = selectedContact;
    return (
      <div className="employer-manager-container">
        <div className="employer-manager-card">
          <div className="employer-manager-header heading-relative-container">
            {contacts.length > 1 && (
              <button onClick={handleBackToList} className="employer-view-all-trigger">
                View All Contacts →
              </button>
            )}
            <div className="employer-manager-badge margin-top-0">
              <span className="badge-dot"></span>
              <span className="text-transform-capitalize">{contact.department} Department</span>
              {contact.is_primary && <span className="employer-inline-primary-badge">PRIMARY</span>}
            </div>
            <h3 className="employer-manager-title">{contact.full_name}</h3>
            <p className="employer-manager-subtitle">{contact.title}</p>
          </div>

          <div className="employer-manager-body">
            <div className="employer-single-avatar-alignment">
              <img
                src={contact.profile_photo || ProfileIcon}
                alt={contact.full_name}
                className="employer-single-profile-image"
              />
            </div>

            <div className="employer-manager-row">
              <span className="label">📧 Email</span>
              <span className="value contact" onClick={() => handleEmailClick(contact.email)}>
                {contact.email}
              </span>
            </div>

            <div className="employer-manager-row">
              <span className="label">📞 Phone</span>
              <span className="value contact" onClick={() => handlePhoneClick(contact.phone)}>
                {contact.phone}
              </span>
            </div>

            {contact.description && (
              <div className="employer-manager-row display-column-align-start">
                <span className="label">About</span>
                <span className="value text-bio-description">
                  {contact.description}
                </span>
              </div>
            )}
          </div>

          <div className="employer-manager-actions">
            {contacts.length > 1 && (
              <button className="employer-manager-btn employer-manager-btn-secondary" onClick={handleBackToList}>
                All Contacts
              </button>
            )}
            <button className="employer-manager-btn employer-manager-btn-primary" onClick={() => handleEmailClick(contact.email)}>
              ✉ Send Message
            </button>
          </div>

          <div className="employer-plan-status-footer active-plan-theme">
            <span>Plan Status:</span>
            <span className="font-weight-600"> Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-manager-container">
      <div className="employer-manager-card width-max-550">
        <div className="employer-manager-header">
          <div className="employer-manager-badge">
            <span className="badge-dot"></span>
            {contacts.filter(c => c.is_primary).length > 0 ? 'Primary Contact' : 'Account Managers'}
          </div>
          <h3 className="employer-manager-title">Support Contact Hub</h3>
          <p className="employer-manager-subtitle">
            {contacts.length} department contact{contacts.length > 1 ? 's' : ''} available
          </p>
        </div>

        <div className="employer-manager-body body-list-wrapper">
          {contacts.map((contact, index) => (
            <div
              key={index}
              onClick={() => handleContactClick(contact)}
              className={`employer-list-item-card ${contact.is_primary ? 'list-primary-border' : 'list-standard-border'}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleContactClick(contact);
                }
              }}
            >
              <div className="employer-list-avatar-frame">
                <img
                  src={contact.profile_photo || ProfileIcon}
                  alt={contact.full_name}
                  className="employer-list-avatar-img"
                />
              </div>
              <div className="employer-list-meta-column">
                <div className="employer-list-headline">
                  <strong className="employer-list-name">{contact.full_name}</strong>
                  {contact.is_primary && <span className="employer-inline-primary-badge">PRIMARY</span>}
                  <span className="employer-list-badge-dept">{contact.department}</span>
                </div>
                <div className="employer-list-subheading">
                  {contact.title}
                </div>
              </div>
              <div className="employer-list-chevron-arrow">›</div>
            </div>
          ))}
        </div>

        <button onClick={fetchContacts} className="employer-manager-btn employer-manager-btn-secondary width-100-percent">
          ← Back to main view
        </button>

        <div className="employer-plan-status-footer active-plan-theme">
          <span>Plan Status:</span>
          <span className="font-weight-600">✅ Active</span>
        </div>
      </div>
    </div>
  );
};