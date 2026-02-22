import React, { useEffect, useState } from 'react'
import './JHeader.css'
import { Link, NavLink, useLocation } from 'react-router-dom';
import breifcase from '../assets/header_case.png'
import chat from '../assets/header_message.png'
import bell from '../assets/header_bell.png'
import { JNotification } from './JNotification';
import bell_dot from '../assets/header_bell_dot.png'
import { AvatarMenu } from './AvatarMenu';
import api from "../api/axios";


export const JHeader = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationsData, setNotificationsData] = useState([]);
    const newNotificationsCount = Array.isArray(notificationsData)
        ? notificationsData.filter(n => !n.is_read).length
        : 0;

    const Location = useLocation();
    const NavLinks = [
        { name: 'Home', path: '/Job-portal/jobseeker/' },
        { name: 'Jobs', path: '/Job-portal/jobseeker/jobs' },
        { name: 'Companies', path: '/Job-portal/jobseeker/companies' },
    ];
    const NavIcons = [
        { image: breifcase, path: "/Job-portal/jobseeker/myjobs" },
        { image: chat, path: "" }
    ]
    const refreshNotifications = async () => {
        try {
            const res = await api.get("notifications/");
            setNotificationsData(
                res.data.map(n => ({
                    id: n.id,
                    message: n.message,
                    created_at: n.created_at,
                    is_read: n.is_read,
                }))
            );
        } catch (err) {
            console.error("Failed to refresh notifications", err);
        }
    };

    useEffect(() => {
        refreshNotifications();
    }, []);
    ///const handleNavClick = (e) => {
    ///    setActiveItem(e);
    //}


    return (
        <header className="header">
            <div className="logo">job portal</div>
            <nav className="jheader-nav-links">
                {NavLinks.map((n) => {
                    const isActive = Location.pathname === n.path
                    return (
                        <NavLink key={n.name} to={n.path} className={isActive ? 'jheader-nav-active' : 'jheader-nav-items'}>{n.name}</NavLink >)
                })}
            </nav>

            <div className="auth-links">
                {NavIcons.map((n, index) => {
                    const isActive = Location.pathname === n.path
                    return (
                        <Link key={index} className='nav-icons' to={n.path}><img className={isActive ? 'jheader-icons-active' : 'jheader-icons'} src={n.image} alt='My Jobs' /></Link>
                    )
                })}
                <div
                    onClick={() => setShowNotification(!showNotification)}
                ><img className='jheader-icons' src={newNotificationsCount > 0 ? bell_dot : bell} alt='Notifications' /></div>
                <AvatarMenu />
            </div>
            <JNotification
                notificationsData={notificationsData.map(n => ({
                    id: n.id,
                    text: n.message,
                    time: new Date(n.created_at).toLocaleString(),
                    isRead: n.is_read,
                }))}
                showNotification={showNotification}
                setShowNotification={setShowNotification}
                refreshNotifications={refreshNotifications}
            />

        </header>
    )
}
