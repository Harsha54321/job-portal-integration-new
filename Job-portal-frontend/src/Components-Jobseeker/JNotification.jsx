import React, { useState, useEffect, useRef } from "react";
import './JNotification.css'
import bell from '../assets/header_bell.png'
import bell_dot from '../assets/header_bell_dot.png'
import api from "../api/axios";


export const JNotification = ({
    showNotification,
    setShowNotification
}) => {
    const [activeMenuId, setActiveMenuId] = useState(null);
    const containerRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("notifications/");
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showNotification) {
            setLoading(true);
            fetchNotifications();
        }
    }, [showNotification]);





    const newNotificationsCount = Array.isArray(notifications)
        ? notifications.filter(n => !n.is_read).length
        : 0;

    const toggleMenu = (id, e) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`notifications/${id}/read/`);
            fetchNotifications();

        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
        setActiveMenuId(null);
    };


    const handleMarkAsUnread = async (id) => {
        try {
            await api.patch(`notifications/${id}/unread/`);
            fetchNotifications();

        } catch (err) {
            console.error("Failed to mark notification as unread", err);
        }
        setActiveMenuId(null);
    };


    const handleDelete = async (id) => {
        try {
            await api.delete(`notifications/${id}/delete/`);
            fetchNotifications();

        } catch (err) {
            console.error("Failed to delete notification", err);
        }
        setActiveMenuId(null);
    };


    const handleClearAll = async () => {
        try {
            await api.delete("notifications/clear-all/");
            fetchNotifications();

        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
        setActiveMenuId(null);
    };


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowNotification(false);
            }
        };
        if (showNotification) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showNotification]);


    return (
        <div
            ref={containerRef}
            className={`notifications-container ${showNotification ? "show-notification" : "hide-notification"}`}
        >
            {/* HEADER */}
            <div className="notifications-header">
                <div className="notifications-heading-container">
                    <img
                        className="notification-header-icons"
                        src={newNotificationsCount > 0 ? bell_dot : bell}
                        alt="Notifications"
                    />
                    <h2>Notifications</h2>
                </div>
                <button onClick={() => setShowNotification(false)} className="notifications-close-btn">
                    &times;
                </button>
            </div>

            {/* SUBHEADER */}
            <div className="notifications-subheader">
                <div>
                    <span>Stay Up to Date</span>
                    {newNotificationsCount > 0 && (
                        <span className="new-notifications-count">
                            {newNotificationsCount} New Notifications
                        </span>
                    )}
                </div>

                {notifications.length > 0 && (
                    <button className="clear-all-btn" onClick={handleClearAll}>
                        Clear all
                    </button>
                )}

            </div>
            {loading && (
                <p style={{ padding: "20px", textAlign: "center" }}>
                    Loading notifications...
                </p>
            )}


            {/* NOTIFICATION LIST */}
            <div className="notifications-list">
                {Array.isArray(notifications) && notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={notification.is_read ? "notification-old-item" : "notification-new-item"}
                    >
                        <div className="notification-content">
                            <p className="notification-text">{notification.text}</p>
                            <p className="notification-time">{formatTime(notification.created_at)}</p>
                        </div>

                        <div className="more-options-wrapper">
                            <button
                                className="more-options-btn"
                                onClick={(e) => toggleMenu(notification.id, e)}
                            >
                                ⋮
                            </button>

                            {activeMenuId === notification.id && (
                                <div className="overflow-menu">
                                    {notification.is_read
                                        ? (
                                            <button
                                                className="menu-item"
                                                onClick={() => handleMarkAsUnread(notification.id)}
                                            >
                                                Mark as unread
                                            </button>
                                        ) : (
                                            <button
                                                className="menu-item"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                Mark as read
                                            </button>
                                        )}

                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="menu-item delete-item"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && notifications.length === 0 && (
                    <p style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                        No notifications for you
                    </p>
                )}
            </div>
        </div>
    );
};
