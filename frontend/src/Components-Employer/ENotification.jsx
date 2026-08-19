import React, { useState, useEffect, useRef } from "react";
import '../Components-Jobseeker/JNotification.css'
import bell from '../assets/header_bell.png'
import bell_dot from '../assets/header_bell_dot.png'
import { useJobs } from "../JobContext";
import api from "../api/axios";  // ← ఈ line add
import { useNavigate } from "react-router-dom";
import { getNotificationRoute } from "../utils/notificationRoutes";

export const ENotification = ({ }) => {

    const {
        employerNotifications,
        setEmployerNotifications,
        employeractiveMenuId,
        setEmployerActiveMenuId,
        employershowNotification,
        setEmployerShowNotification,
        fetchNotifications  // ← Add this
    } = useJobs();

    const navigate = useNavigate();
    const containerRef = useRef(null);

    const newNotificationsCount = employerNotifications.filter(n => !n.isRead).length;

    // const DASHBOARD_PATH = '/Job-portal/Employer/Dashboard';

    // // Figures out where a notification should navigate to when clicked.
    // // NOTE: the notifications in employerNotifications only have
    // // { id, isRead, targetId, text, time } — there is no notification_type
    // // field, so type has to be inferred from the text itself.
    // // Returns { path, state } or null (no redirect for this notification).
    // const getNotificationRoute = (n) => {
    //     const refId = n.targetId ?? n.related_obj_id ?? n.referenceId;
    //     const message = n.text || n.message || "";

    //     // Direct message -> open the conversation
    //     if (/new message from/i.test(message) && refId) {
    //         return { path: `/Job-portal/employer-chat/${refId}` };
    //     }

    //     // New application received -> open that job's applicants tab on the Dashboard
    //     if (/new application received/i.test(message) && refId) {
    //         return { path: DASHBOARD_PATH, state: { targetTab: "ViewApplicants", targetJobId: refId } };
    //     }

    //     if (/permanently deleted/i.test(message)) {
    //         return null; // job no longer exists, nothing to open
    //     }
    //     if (/approved and is now live|pending admin approval/i.test(message) && refId) {
    //         return { path: DASHBOARD_PATH, state: { targetTab: "My job post", targetJobId: refId } };
    //     }
    //     if (/payment method/i.test(message) || /subscription.*cancelled/i.test(message)) {
    //         return { path: DASHBOARD_PATH, state: { targetTab: "Billing" } };
    //     }
    //     if (/assigned to your account|removed from your account/i.test(message)) {
    //         return { path: DASHBOARD_PATH, state: { targetTab: "AccountManager" } };
    //     }
    //     if (/weekly employer summary/i.test(message)) {
    //         return { path: DASHBOARD_PATH, state: { targetTab: "Dashboard" } };
    //     }

    //     return null;
    // };

    const toggleMenu = (id, event) => {
        event.stopPropagation();
        setEmployerActiveMenuId(employeractiveMenuId === id ? null : id);
    };

    // ================= API FUNCTIONS =================

    // MARK AS READ
    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as read:", err);
            setEmployerNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        }
        setEmployerActiveMenuId(null);
    };

    // MARK AS UNREAD
    const handleMarkAsUnread = async (id) => {
        try {
            await api.patch(`/notifications/${id}/unread/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as unread:", err);
            setEmployerNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false } : n)
            );
        }
        setEmployerActiveMenuId(null);
    };

    // DELETE ONE
    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}/delete/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
            setEmployerNotifications(prev => prev.filter(n => n.id !== id));
        }
        setEmployerActiveMenuId(null);
    };

    // CLEAR ALL
    const handleClearAll = async () => {
        try {
            await api.delete("/notifications/clear-all/");
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error clearing notifications:", err);
            setEmployerNotifications([]);
        }
        setEmployerActiveMenuId(null);
    };

    // CLOSE ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setEmployerShowNotification(false);
            }
        };

        if (employershowNotification) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [employershowNotification, setEmployerShowNotification]);

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
                setEmployerActiveMenuId(null);
            }
        };

        if (employershowNotification) {
            document.addEventListener("mousedown", handleMenuClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleMenuClickOutside);
        };
    }, [employershowNotification, setEmployerActiveMenuId]);

    return (
        <div
            ref={containerRef}
            className={`notifications-container ${employershowNotification ? "show-notification" : "hide-notification"}`}
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
                <button onClick={() => setEmployerShowNotification(false)} className="notifications-close-btn">
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
                <button className="clear-all-btn" onClick={handleClearAll}>
                    Clear all
                </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="notifications-list">
                {/* {employerNotifications.map((notification) => (
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
                            >
                                ⋮
                            </button>

                            {employeractiveMenuId === notification.id && (
                                <div className="overflow-menu">
                                    {notification.isRead ? (
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
                ))} */}

                {employerNotifications.map((notification) => (
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
                                console.log(notification.event_type)
                                const route = await getNotificationRoute(notification, "employer");
                                if (route) {
                                    setEmployerShowNotification(false);
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
                            >
                                ⋮
                            </button>

                            {employeractiveMenuId === notification.id && (
                                <div className="overflow-menu">
                                    {notification.isRead ? (
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

                {employerNotifications.length === 0 && (
                    <p style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                        No notifications for you
                    </p>
                )}
            </div>
        </div>
    );
};