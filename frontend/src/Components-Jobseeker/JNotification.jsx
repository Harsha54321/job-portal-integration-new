import React, { useState, useEffect, useRef } from "react";
import './JNotification.css'
import bell from '../assets/header_bell.png'
import bell_dot from '../assets/header_bell_dot.png'
import { useJobs } from "../JobContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { getNotificationRoute } from "../utils/notificationRoutes";

export const JNotification = ({ }) => {

    const {
        notificationsData,
        setNotificationsData,
        showNotification,
        setShowNotification,
        activeMenuId,
        setActiveMenuId,
        currentUserId,
        fetchNotifications
    } = useJobs()

    const navigate = useNavigate();
    const containerRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);

    const newNotificationsCount = notificationsData.filter(n => !n.isRead).length;

    const toggleMenu = (id, event) => {
        event.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // ================= API FUNCTIONS =================

    // MARK AS READ
    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as read:", err);
            setNotificationsData(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        }
        setActiveMenuId(null);
    };

    // MARK AS UNREAD
    const handleMarkAsUnread = async (id) => {
        try {
            await api.patch(`/notifications/${id}/unread/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as unread:", err);
            setNotificationsData(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false } : n)
            );
        }
        setActiveMenuId(null);
    };

    // DELETE ONE
    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}/delete/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
            setNotificationsData(prev => prev.filter(n => n.id !== id));
        }
        setActiveMenuId(null);
    };

    // CLEAR ALL
    const handleClearAll = async () => {
        try {
            await api.delete("/notifications/clear-all/");
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error clearing notifications:", err);
            setNotificationsData([]);
        }
        setActiveMenuId(null);
    };

    // Focus trap and ESC key handler
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Close on ESC key
            if (event.key === 'Escape') {
                setShowNotification(false);
                setActiveMenuId(null);
                return;
            }

            // Focus trap for Tab key
            if (event.key === 'Tab' && showNotification) {
                const focusableElements = containerRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                // If Shift+Tab on first element, move to last
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
                // If Tab on last element, move to first
                else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        // Add event listener when notification is shown
        if (showNotification) {
            document.addEventListener('keydown', handleKeyDown);

            // Focus the first focusable element after a small delay
            setTimeout(() => {
                const firstFocusable = containerRef.current?.querySelector(
                    'button:not(.more-options-btn), .clear-all-btn, .notifications-close-btn'
                );
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showNotification, setShowNotification, setActiveMenuId]);

    // Handle menu keyboard navigation
    useEffect(() => {
        if (activeMenuId) {
            const handleMenuKeyDown = (event) => {
                if (event.key === 'Escape') {
                    setActiveMenuId(null);
                }
            };
            document.addEventListener('keydown', handleMenuKeyDown);
            return () => {
                document.removeEventListener('keydown', handleMenuKeyDown);
            };
        }
    }, [activeMenuId, setActiveMenuId]);

    // CLOSE ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setShowNotification(false);
                setActiveMenuId(null);
            }
        };

        if (showNotification) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotification, setShowNotification, setActiveMenuId]);

    // CLOSE MENU ON OUTSIDE CLICK (Add this new useEffect)
    useEffect(() => {
        const handleMenuClickOutside = (event) => {
            // Check if the click is outside any menu
            const menus = document.querySelectorAll('.overflow-menu');
            const buttons = document.querySelectorAll('.more-options-btn');

            let clickedOnMenu = false;
            let clickedOnButton = false;

            menus.forEach(menu => {
                if (menu.contains(event.target)) {
                    clickedOnMenu = true;
                }
            });

            buttons.forEach(button => {
                if (button.contains(event.target)) {
                    clickedOnButton = true;
                }
            });

            // If click is NOT on menu AND NOT on the three dots button, close all menus
            if (!clickedOnMenu && !clickedOnButton) {
                setActiveMenuId(null);
            }
        };

        if (showNotification) {
            document.addEventListener("mousedown", handleMenuClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleMenuClickOutside);
        };
    }, [showNotification, setActiveMenuId]);

    return (
        <div
            ref={containerRef}
            className={`notifications-container ${showNotification ? "show-notification" : "hide-notification"}`}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
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
                <button
                    onClick={() => setShowNotification(false)}
                    className="notifications-close-btn"
                    aria-label="Close notifications"
                >
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
                <button
                    className="clear-all-btn"
                    onClick={handleClearAll}
                    aria-label="Clear all notifications"
                >
                    Clear all
                </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="notifications-list">
                {/* {notificationsData.map((notification) => (
                    <div
                        key={notification.id}
                        className={notification.isRead ? "notification-old-item" : "notification-new-item"}
                    >
                        <div className="notification-content">
                            <p className="notification-text">{notification.text}</p>
                            <p className="notification-time">{notification.time}</p>
                        </div>
 
                        <div className="more-options-wrapper">
                            <button
                                className="more-options-btn"
                                onClick={(e) => toggleMenu(notification.id, e)}
                                aria-label="More options"
                                aria-expanded={activeMenuId === notification.id}
                            >
                                ⋮
                            </button>
 
                            {activeMenuId === notification.id && (
                                <div
                                    className="overflow-menu"
                                    role="menu"
                                    aria-label="Notification options"
                                >
                                    {notification.isRead ? (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsUnread(notification.id)}
                                            role="menuitem"
                                        >
                                            Mark as unread
                                        </button>
                                    ) : (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            role="menuitem"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="menu-item delete-item"
                                        role="menuitem"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))} */}

                {notificationsData.map((notification) => (
                    <div
                        key={notification.id}
                        className={notification.isRead ? "notification-old-item" : "notification-new-item"}
                    >
                        <button
                            type="button"
                            className="notification-content"
                           onClick={async () => {
                            if (!notification.isRead) {
                                handleMarkAsRead(notification.id);
                            }
                            console.log(notification.related_obj_id)
                            const route = await getNotificationRoute(notification, "jobseeker");
                            if (route) {
                                setShowNotification(false);
                                navigate(route.path, route.state ? { state: route.state } : undefined);
                            }
                        }}
                            aria-label={
                                notification.isRead
                                    ? notification.text
                                    : `${notification.text}. Unread. Press to mark as read.`
                            }
                        >
                            <p className="notification-text">{notification.text}</p>
                            <p className="notification-time">{notification.time}</p>
                        </button>

                        <div
                            className="more-options-wrapper"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="more-options-btn"
                                onClick={(e) => toggleMenu(notification.id, e)}
                                aria-label="More options"
                                aria-expanded={activeMenuId === notification.id}
                            >
                                ⋮
                            </button>

                            {activeMenuId === notification.id && (
                                <div
                                    className="overflow-menu"
                                    role="menu"
                                    aria-label="Notification options"
                                >
                                    {notification.isRead ? (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsUnread(notification.id)}
                                            role="menuitem"
                                        >
                                            Mark as unread
                                        </button>
                                    ) : (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            role="menuitem"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="menu-item delete-item"
                                        role="menuitem"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {notificationsData.length === 0 && (
                    <p style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                        No notifications for you
                    </p>
                )}
            </div>
        </div>
    );
};