import React, { useState } from "react";
import "./AdminNotification.css";
import bell from "../assets/header_bell.png"; // ⚠️ adjust this relative path if AdminNotification.jsx lives in a different folder than AdminHeader.jsx
import bell_dot from "../assets/header_bell_dot.png"
const AdminNotification = ({
    showNotification,
    setShowNotification,
    notifications,
    loading,
    error,
    onRetry,
    onMarkAsRead,
    onMarkAsUnread,
    onDelete,
    onClearAll,
    onNavigate,
}) => {

    const [activeMenuId, setActiveMenuId] = useState(null);

    const newNotificationsCount = notifications.filter(
        notification => !notification.isRead
    ).length;

    // Toggle three-dot menu
    const toggleMenu = (id, event) => {
        event.stopPropagation();

        setActiveMenuId(
            activeMenuId === id ? null : id
        );
    };

    const handleMarkAsRead = (id) => {
        setActiveMenuId(null);
        onMarkAsRead(id);
    };

    const handleMarkAsUnread = (id) => {
        setActiveMenuId(null);
        onMarkAsUnread(id);
    };

    const handleDelete = (id) => {
        setActiveMenuId(null);
        onDelete(id);
    };

    const handleClearAll = () => {
        setActiveMenuId(null);
        onClearAll();
    };

    return (
        <>
            {showNotification && (
                <div
                    className="admin-notification-overlay"
                    onClick={() => setShowNotification(false)}
                />
            )}

            <div
                className={`admin-notifications-container ${
                    showNotification
                        ? "admin-show-notification"
                        : "admin-hide-notification"
                }`}
            >

                {/* HEADER */}
                <div className="admin-notifications-header">

                    <div className="admin-notifications-heading-container">

 <img
                        className="notification-header-icons"
                        src={newNotificationsCount > 0 ? bell_dot : bell}
                        alt="Notifications"
                    />

                        <h2>Notifications</h2>

                    </div>

                    <button
                        className="admin-notifications-close-btn"
                        onClick={() => setShowNotification(false)}
                        aria-label="Close notifications"
                    >
                        &times;
                    </button>

                </div>


                {/* SUB HEADER */}
                <div className="admin-notifications-subheader">

                    <div>
                        <span>Stay Up to Date</span>

                        {newNotificationsCount > 0 && (
                            <span className="admin-new-notifications-count">
                                {newNotificationsCount} New Notifications
                            </span>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <button
                            className="admin-clear-all-btn"
                            onClick={handleClearAll}
                        >
                            Clear all
                        </button>
                    )}

                </div>


                {/* NOTIFICATION LIST */}
                <div className="admin-notifications-list">

                    {loading && (
                        <div className="admin-no-notifications">
                            <p>Loading notifications...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="admin-no-notifications">
                            <p>{error}</p>
                            <span>
                                <button
                                    className="admin-clear-all-btn"
                                    onClick={onRetry}
                                >
                                    Retry
                                </button>
                            </span>
                        </div>
                    )}

                    {!loading && !error && notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className={
                                notification.isRead
                                    ? "admin-notification-old-item"
                                    : "admin-notification-new-item"
                            }
                        >

                            {/* CONTENT */}
                            <button
                                type="button"
                                className="admin-notification-content"
                                onClick={() => {
                                    if (!notification.isRead) {
                                        handleMarkAsRead(notification.id);
                                    }
                                    if (onNavigate) {
                                        onNavigate(notification);
                                    }
                                }}
                            >

                                <p className="admin-notification-text">
                                    {notification.text}
                                </p>

                                <p className="admin-notification-time">
                                    {notification.time}
                                </p>

                            </button>


                            {/* THREE DOT MENU */}
                            <div
                                className="admin-more-options-wrapper"
                                onClick={(e) => e.stopPropagation()}
                            >

                                <button
                                    className="admin-more-options-btn"
                                    onClick={(e) =>
                                        toggleMenu(notification.id, e)
                                    }
                                >
                                    ⋮
                                </button>


                                {activeMenuId === notification.id && (

                                    <div className="admin-overflow-menu">

                                        {notification.isRead ? (

                                            <button
                                                className="admin-menu-item"
                                                onClick={() =>
                                                    handleMarkAsUnread(
                                                        notification.id
                                                    )
                                                }
                                            >
                                                Mark as unread
                                            </button>

                                        ) : (

                                            <button
                                                className="admin-menu-item"
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notification.id
                                                    )
                                                }
                                            >
                                                Mark as read
                                            </button>

                                        )}

                                        <button
                                            className="admin-menu-item admin-delete-item"
                                            onClick={() =>
                                                handleDelete(
                                                    notification.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                    ))}


                    {/* EMPTY STATE */}
                    {!loading && !error && notifications.length === 0 && (
                        <div className="admin-no-notifications">
                            <div className="admin-empty-bell">
                                🔔
                            </div>

                            <p>No notifications</p>

                            <span>
                                You're all caught up!
                            </span>
                        </div>
                    )}

                </div>

            </div>
        </>
    );
};

export default AdminNotification;