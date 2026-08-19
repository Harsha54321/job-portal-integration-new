import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './PlanExpiryPopup.css';

export const PlanExpiryPopup = ({ onUpgrade, onClose, onReactivateSuccess }) => {
    const [expiryData, setExpiryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        checkPlanExpiry();
    }, []);

    // ✅ Timer to update time remaining every minute
    useEffect(() => {
        if (!showPopup || !expiryData?.time_remaining) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 60; // Decrease by 1 minute
            });
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [showPopup, expiryData]);

    const checkPlanExpiry = async () => {
        try {
            const response = await api.get('/check-plan-expiry/');
            const data = response.data;
            setExpiryData(data);
            setTimeRemaining(data.time_remaining);

            console.log("🔍 Plan Data:", JSON.stringify(data, null, 2));

            const isExpired = data.is_expired === true;
            const isCancelled = data.is_cancelled === true || data.status === 'cancelled';
            const daysUntilExpiry = data.days_until_expiry;
            const isExpiringSoon = daysUntilExpiry !== null &&
                daysUntilExpiry !== undefined &&
                daysUntilExpiry <= 7;

            if (isExpired || isExpiringSoon || isCancelled) {
                setShowPopup(true);
            }

        } catch (error) {
            console.error('Error checking plan expiry:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Format time remaining for display
    const formatTimeRemaining = (seconds) => {
        if (!seconds || seconds <= 0) return '0 minutes';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        let parts = [];
        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

        return parts.join(' ') || '0 minutes';
    };

    const handleReactivate = async () => {
        setIsProcessing(true);
        try {
            console.log("🔄 Attempting to reactivate plan...");

            const response = await api.patch('/cancel/', { action: 'reactivate' });

            console.log("✅ Reactivation response:", response.data);

            alert("Your plan has been reactivated successfully!");

            setShowPopup(false);

            await checkPlanExpiry();

            if (onReactivateSuccess) {
                onReactivateSuccess();
            }

        } catch (error) {
            console.error("❌ Failed to reactivate plan:", error);

            if (error?.response?.data?.is_expired) {
                alert("Your plan has expired. Please renew instead.");
                if (onUpgrade) onUpgrade();
            } else {
                alert("Failed to reactivate plan. Please try again or contact support.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpgrade = () => {
        setShowPopup(false);
        if (onUpgrade) onUpgrade();
    };

    const handleClose = () => {
        setShowPopup(false);
        if (onClose) onClose();
    };

    if (loading) {
        return (
            <div className="plan-expiry-overlay">
                <div className="plan-expiry-modal">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="loading-spinner">⏳</div>
                        <p>Checking plan status...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!showPopup) return null;

    const isExpired = expiryData?.is_expired === true;
    const isCancelled = expiryData?.is_cancelled === true || expiryData?.status === 'cancelled';
    const daysLeft = expiryData?.days_until_expiry;
    const isExpiringSoon = daysLeft !== null && daysLeft !== undefined && daysLeft <= 7 && !isExpired && !isCancelled;

    // ✅ Use time remaining from state (updated by timer)
    const currentTimeRemaining = timeRemaining !== null ? timeRemaining : expiryData?.time_remaining;
    const displayTimeText = formatTimeRemaining(currentTimeRemaining);

    let icon = '⏰';
    let title = '';
    let message = '';
    let statusText = '';
    let buttonText = 'Upgrade Now';
    let buttonAction = handleUpgrade;

    if (isCancelled) {
        icon = '🚫';
        title = 'Plan Cancelled!';
        message = `Your ${expiryData?.plan_name || 'current'} plan has been cancelled. Reactivate to continue using premium features.`;
        statusText = 'CANCELLED - Premium features disabled';
        buttonText = isProcessing ? 'Reactivating...' : 'Reactivate Plan';
        buttonAction = handleReactivate;
    } else if (isExpired) {
        icon = '⚠️';
        title = 'Your Plan Has Expired!';
        message = `Your ${expiryData?.plan_name || 'current'} plan has expired. You are now on the Free plan with limited features.`;
        statusText = 'EXPIRED - Limited features active';
        buttonText = 'Renew Plan Now';
        buttonAction = handleUpgrade;
    } else if (isExpiringSoon) {
        icon = '⏰';
        title = 'Plan Expiring Soon';
        // ✅ Show detailed time remaining
        message = `Your ${expiryData?.plan_name || 'current'} plan will expire in ${displayTimeText}. Renew now to avoid service interruption.`;
        statusText = `Expires in ${displayTimeText}`;
        buttonText = 'Renew Plan Now';
        buttonAction = handleUpgrade;
    }

    return (
        <div className="plan-expiry-overlay">
            <div className="plan-expiry-modal">
                <div className={`expiry-icon ${isExpired || isCancelled ? 'expired' : 'warning'}`}>
                    {icon}
                </div>

                <h2 className="expiry-title">
                    {title}
                </h2>

                <p className="expiry-message">
                    {message}
                </p>

                <div className="expiry-details">
                    <div className="detail-row">
                        <span>Current Plan:</span>
                        <strong>{expiryData?.plan_name || 'N/A'}</strong>
                    </div>

                    {expiryData?.end_date && (
                        <div className="detail-row">
                            <span>Expiry Date:</span>
                            <strong>{new Date(expiryData.end_date).toLocaleDateString()}</strong>
                        </div>
                    )}

                    <div className="detail-row">
                        <span>Plan Type:</span>
                        <strong>{expiryData?.plan_type || 'Free'}</strong>
                    </div>

                    <div className="detail-row warning-text">
                        <span>Status:</span>
                        <strong style={{
                            color: isCancelled ? '#dc2626' :
                                isExpired ? '#b91c1c' :
                                    '#d97706'
                        }}>
                            {statusText}
                        </strong>
                    </div>
                </div>

                <div className="expiry-actions">
                    <button
                        className="btn-upgrade"
                        onClick={buttonAction}
                        disabled={isProcessing}
                        style={{
                            opacity: isProcessing ? 0.7 : 1,
                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {buttonText}
                    </button>
                    <button className="btn-later" onClick={handleClose}>
                        Later
                    </button>
                </div>

                {isCancelled && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                        Click "Reactivate Plan" to restore all premium features.
                    </p>
                )}
            </div>
        </div>
    );
};