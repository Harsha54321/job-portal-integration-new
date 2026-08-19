import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import VerifyTick from '../assets/AdminAssets/Verified.png';
import AuthenticatorApp from '../assets/AdminAssets/Authenticator.png';
import Sms from '../assets/AdminAssets/Sms.png';

const TwoFactorAuth = ({ userEmail, userPhone }) => {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [smsVerified, setSmsVerified] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('email');
    const [otp, setOtp] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('input');
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/jobseeker/2fa/status/');
            setIs2FAEnabled(Boolean(res.data.two_factor_enabled));
            setEmailVerified(Boolean(res.data.email_verified));
            setSmsVerified(Boolean(res.data.sms_verified));
        } catch (err) {
            console.error('Failed to fetch 2FA status', err);
        }
    };

    const handleToggle = async () => {
        if (is2FAEnabled) {
            if (window.confirm('Are you sure you want to disable 2FA?')) {
                try {
                    await api.patch('/jobseeker/2fa/disable/');
                    setIs2FAEnabled(false);
                    setEmailVerified(false);
                    setSmsVerified(false);
                } catch (err) {
                    alert('Failed to disable 2FA');
                }
            }
        } else {
            alert('Please verify your Email or SMS first using the verify buttons below.');
        }
    };

    const handleVerifyClick = (method) => {
        const targetMethod = method.toLowerCase();
        setSelectedMethod(targetMethod);
        setShowModal(true);
        setStatus('input');
        setOtp('');
        setApiError('');
        sendOTP(targetMethod);
    };

    const sendOTP = async (method) => {
        setLoading(true);
        setApiError('');
        try {
            const res = await api.post('/jobseeker/2fa/send-otp/', { method });
            if (!res.data.success && res.data.error) {
                setApiError(res.data.error);
            }
        } catch (err) {
            setApiError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otp || otp.trim().length < 4) {
            setApiError('Please enter a valid OTP.');
            return;
        }

        setLoading(true);
        setApiError('');
        try {
            const res = await api.post('/jobseeker/2fa/verify-otp/', {
                otp: otp.trim(),
                method: selectedMethod,
            });

            if (res.data.success) {
                setStatus('success');
                await fetchStatus();
                setTimeout(() => {
                    setShowModal(false);
                    setStatus('input');
                    setOtp('');
                }, 1500);
            } else {
                setStatus('error');
                setApiError(res.data.message || 'Invalid OTP');
            }
        } catch (err) {
            setStatus('error');
            setApiError(err.response?.data?.message || err.response?.data?.error || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Ad-security-container">
            <div className="Ad-security-header" style={{ cursor: 'default' }}>
                <div className="Ad-security-title-box">
                    <span className="Ad-security-title">Two-Factor Authentication</span>
                </div>
            </div>

            <div className="Ad-2fa-content-wrapper">
                <p className="Ad-2fa-desc">
                    Enhance your account security by requiring a verification code in addition to your password.
                </p>

                <div className="Ad-2fa-card-white">
                    <div className="Ad-2fa-card-info">
                        <span style={{ fontWeight: '600' }}>2FA Status</span>
                        <span className="Ad-security-light-text">
                            {is2FAEnabled ? 'Two-Factor Authentication is currently active' : 'Verify a method below to enable 2FA'}
                        </span>
                    </div>
                    <label className="Adm-Not-switch">
                        <input
                            type="checkbox"
                            checked={is2FAEnabled}
                            onChange={handleToggle}
                            disabled={loading}
                        />
                        <span className="Adm-Not-slider"></span>
                    </label>
                </div>

                <div className="Ad-2fa-methods">
                    {/* SMS Method */}
                    <div className="Ad-2fa-method-box active">
                        <div className="Ad-security-icon-bg blue">
                            <img src={Sms} width={50} alt="SMS" />
                        </div>
                        <div className="Ad-2fa-method-info">
                            <span style={{ fontWeight: '600' }}>SMS Verification</span>
                            <span style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                                {userPhone || 'No phone number added'}
                            </span>
                        </div>
                        {smsVerified ? (
                            <img src={VerifyTick} width={20} alt="Verified" />
                        ) : (
                            <button
                                className="verify-btn"
                                onClick={() => handleVerifyClick('sms')}
                                disabled={loading || !userPhone}
                                style={{
                                    padding: '6px 16px',
                                    backgroundColor: userPhone ? '#007bff' : '#ccc',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: userPhone ? 'pointer' : 'not-allowed',
                                    fontWeight: '500',
                                }}
                            >
                                {loading && selectedMethod === 'sms' ? 'Sending...' : 'Verify'}
                            </button>
                        )}
                    </div>

                    {/* Email Method */}
                    <div className="Ad-2fa-method-box active">
                        <div className="Ad-security-icon-bg light-blue">
                            <img src={AuthenticatorApp} width={50} alt="Email" />
                        </div>
                        <div className="Ad-2fa-method-info">
                            <span style={{ fontWeight: '600' }}>Email Verification</span>
                            <span style={{
                                color: '#6c757d',
                                fontSize: '14px',
                                marginTop: '4px',
                                display: 'block',
                                wordBreak: 'break-word',
                                maxWidth: '100%',
                            }}>
                                {userEmail || 'No email address'}
                            </span>
                        </div>
                        {emailVerified ? (
                            <img src={VerifyTick} width={20} alt="Verified" />
                        ) : (
                            <button
                                className="verify-btn"
                                onClick={() => handleVerifyClick('email')}
                                disabled={loading || !userEmail}
                                style={{
                                    padding: '6px 16px',
                                    backgroundColor: userEmail ? '#007bff' : '#ccc',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: userEmail ? 'pointer' : 'not-allowed',
                                    fontWeight: '500',
                                }}
                            >
                                {loading && selectedMethod === 'email' ? 'Sending...' : 'Verify'}
                            </button>
                        )}
                    </div>
                </div>

                {/* OTP Modal */}
                {showModal && (
                    <div className="otp-modal-overlay">
                        <div className="otp-modal-content">
                            {status === 'success' ? (
                                <div className="status-view success">
                                    <img src={VerifyTick} width={30} alt="Success" />
                                    <h2 style={{ color: '#28a745' }}>Verified!</h2>
                                    <p>{selectedMethod.toUpperCase()} verification completed successfully.</p>
                                    <button
                                        className="Otp-Submit-Btn"
                                        onClick={() => {
                                            setShowModal(false);
                                            setStatus('input');
                                            setOtp('');
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2>Verify Your {selectedMethod === 'sms' ? 'Mobile Number' : 'Email Address'}</h2>
                                    <p style={{
                                        color: '#28a745',
                                        fontWeight: '500',
                                        backgroundColor: '#e6f4ea',
                                        padding: '10px',
                                        borderRadius: '5px',
                                    }}>
                                        OTP has been sent to your registered {selectedMethod}.
                                    </p>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                    {apiError && (
                                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                                            {apiError}
                                        </p>
                                    )}
                                    <div className="Otp-modal-actions">
                                        <button
                                            className="Otp-Submit-Btn"
                                            onClick={handleOtpSubmit}
                                            disabled={loading || !otp}
                                        >
                                            {loading ? 'Verifying...' : 'Submit'}
                                        </button>
                                        <button
                                            className="Otp-cancel-Btn"
                                            onClick={() => {
                                                setShowModal(false);
                                                setStatus('input');
                                                setOtp('');
                                                setApiError('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwoFactorAuth;