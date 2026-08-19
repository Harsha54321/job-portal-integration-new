import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import avatarIcon from "../assets/header_profile.png";
import profileIcon from "../assets/icon_profile.png";
import reviewIcon from "../assets/icon_reviews.png";
import settingsIcon from "../assets/icon_settings.png";
import helpIcon from "../assets/icon_help.png";
import "./AvatarMenu.css";
import api from "../api/axios";
import { LogoutModal } from "./LogoutModal";

export const AvatarMenu = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const lastMenuItemRef = useRef(null);

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      const refresh = sessionStorage.getItem("refresh");

      if (!refresh) {
        throw new Error("No refresh token");
      }

      await api.post("logout/", {
        refresh: refresh,
      });

    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("userRole");
      setOpen(false);
      navigate("/");
    }
  };

  // Handle keyboard events for avatar toggle
  const handleAvatarKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    }
    // Close menu on Escape key
    if (e.key === 'Escape' && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Handle keyboard navigation within menu
  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    }

    // Trap focus within menu
    if (e.key === 'Tab') {
      const menuItems = menuRef.current?.querySelectorAll('a, button');
      if (!menuItems || menuItems.length === 0) return;

      const firstItem = menuItems[0];
      const lastItem = menuItems[menuItems.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus first item when menu opens
  useEffect(() => {
    if (open && firstMenuItemRef.current) {
      setTimeout(() => firstMenuItemRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div className="avatar-container" ref={menuRef}>
      {/* Avatar button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        onKeyDown={handleAvatarKeyDown}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="avatar-button"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center'
        }}
        type="button"
      >
        <img
          src={avatarIcon}
          alt="User avatar"
          className="avatar-icon"
          title="Menu"
        />
      </button>

      {open && (
        <div
          className="avatar-menu"
          role="menu"
          aria-label="User menu options"
          onKeyDown={handleMenuKeyDown}
        >
          <Link
            to="/Job-portal/jobseeker/myprofile"
            className="menu-items"
            role="menuitem"
            ref={firstMenuItemRef}
            onClick={() => setOpen(false)}
          // Remove the onKeyDown handler - let Link handle it naturally
          >
            <img src={profileIcon} className="menu-icon" alt="profile" />
            Profile
          </Link>

          <Link
            to="/Job-portal/jobseeker/Settings"
            className="menu-items"
            role="menuitem"
            onClick={() => setOpen(false)}
          // Remove the onKeyDown handler - let Link handle it naturally
          >
            <img src={settingsIcon} className="menu-icon" alt="settings" />
            Settings
          </Link>

          <Link
            to="/Job-portal/jobseeker/help-center"
            className="menu-items"
            role="menuitem"
            ref={lastMenuItemRef}
            onClick={() => setOpen(false)}
          // Remove the onKeyDown handler - let Link handle it naturally
          >
            <img src={helpIcon} className="menu-icon" alt="help" />
            Help Centre
          </Link>

          <Link
            to="/Job-portal/jobseeker/mytickets"
            className="menu-items"
            role="menuitem"
            ref={lastMenuItemRef}
            onClick={() => setOpen(false)}
          >
            <img src={reviewIcon} className="menu-icon" alt="my tickets" />
            My Tickets
          </Link>

          <div className="menu-divider" role="separator"></div>

          <button
            role="menuitem"
            onClick={() => {
              setShowLogoutModal(true);
              setOpen(false);
            }}
            className="avatar-logout-btn"
          >
            Logout
          </button>
        </div>
      )}

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};