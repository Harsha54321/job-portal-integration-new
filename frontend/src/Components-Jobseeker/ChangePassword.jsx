import React, { useState } from 'react';
import api from '../api/axios';
import showPassword from '../assets/show_password.png';
import hidePassword from '../assets/eye-hide.png';

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    const regexUpper = /[A-Z]/,
          regexLower = /[a-z]/,
          regexNumber = /[0-9]/,
          regexSpecial = /[!@#$%^&*]/;

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'At least 8 characters';
    } else if (!regexUpper.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain uppercase';
    } else if (!regexLower.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain lowercase';
    } else if (!regexNumber.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain a number';
    } else if (!regexSpecial.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain special character';
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setMessage('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.patch('/jobseeker/change-password/', {
        current_password: form.currentPassword,
        new_password: form.newPassword,
        confirm_password: form.confirmPassword,
      });
      setMessage('✅ Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      const data = err.response?.data;
      if (data?.current_password) {
        setErrors({ currentPassword: data.current_password });
      } else if (data?.new_password) {
        setErrors({ newPassword: data.new_password });
      } else if (data?.confirm_password) {
        setErrors({ confirmPassword: data.confirm_password });
      } else {
        setApiError(data?.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (password) => {
    let points = 0;
    if (!password) return { width: '0%', color: '#ddd', label: '' };
    if (password.length > 5) points++;
    if (password.length > 8) points++;
    if (/[A-Z]/.test(password)) points++;
    if (/[0-9]/.test(password)) points++;
    if (/[^A-Za-z0-9]/.test(password)) points++;
    if (points <= 2) return { width: '33%', color: '#ff4d4d', label: 'Weak' };
    if (points <= 4) return { width: '66%', color: '#cc9b07', label: 'Medium' };
    return { width: '100%', color: '#2563eb', label: 'Strong' };
  };
  const strength = getStrength(form.newPassword);

  return (
    <div className="Ad-security-container">
      <div className="Ad-security-header" style={{ cursor: 'default' }}>
        <div className="Ad-security-title-box">
          <span className="Ad-security-title">Change Password</span>
        </div>
      </div>

      {apiError && (
        <div className="api-error-message" style={{ color: '#c62828', padding: '10px', marginBottom: '10px', background: '#ffebee', borderRadius: '5px' }}>
          {apiError}
        </div>
      )}
      {message && (
        <div className="success-message" style={{ color: '#2e7d32', padding: '10px', marginBottom: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
          {message}
        </div>
      )}

      <form className="Ad-security-form" onSubmit={handleSubmit}>
        <div className="Ad-security-input-group">
          <label>Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Enter current password"
              disabled={loading}
            />
            <span className="admin-eye-icon" onClick={() => setShowCurrent(!showCurrent)}>
              <img src={showCurrent ? showPassword : hidePassword} width={20} alt="toggle" />
            </span>
          </div>
          {errors.currentPassword && <span className="error-msg">{errors.currentPassword}</span>}
        </div>

        <div className="Ad-security-input-group">
          <label>New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Enter new password"
              disabled={loading}
            />
            <span className="admin-eye-icon" onClick={() => setShowNew(!showNew)}>
              <img src={showNew ? showPassword : hidePassword} width={20} alt="toggle" />
            </span>
          </div>
          {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}
          {form.newPassword && (
            <div className="Ad-security-strength-wrapper">
              <div className="Ad-security-progress-bg">
                <div
                  className="Ad-security-progress-fill"
                  style={{ width: strength.width, backgroundColor: strength.color }}
                />
              </div>
              <span className="strength-Text" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className="Ad-security-input-group">
          <label>Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              disabled={loading}
            />
            <span className="admin-eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              <img src={showConfirm ? showPassword : hidePassword} width={20} alt="toggle" />
            </span>
          </div>
          {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
        </div>

        <div className="Ad-security-actions">
          <button type="submit" className="Ad-security-update-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

