// ============================================================
// FILE: src/hooks/useInactivityLogout.js
// ============================================================

import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ----- CONFIG ------------------------------------------------
const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 minutes
const WARNING_TIME = 55 * 60 * 1000; // warn at 55 minutes

const LOGOUT_URL = "http://127.0.0.1:8000/api/logout/";
const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";
// -------------------------------------------------------------

// ── Show warning banner (no click needed) ─────────────────
const showWarningBanner = () => {
    // Avoid duplicate banners
    if (document.getElementById("inactivity-warning")) return;

    const banner = document.createElement("div");
    banner.id = "inactivity-warning";
    banner.innerHTML = `
<div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff9800;
      color: #fff;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
    ">
      ⚠️ You have been inactive for 55 minutes.<br/>
      You will be <strong>logged out in 5 minutes</strong> automatically.
</div>
  `;
    document.body.appendChild(banner);
};

// ── Remove warning banner ──────────────────────────────────
const removeWarningBanner = () => {
    const banner = document.getElementById("inactivity-warning");
    if (banner) banner.remove();
};

// ── Main Hook ─────────────────────────────────────────────
const useInactivityLogout = () => {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const warningRef = useRef(null);

    // ── Logout ──────────────────────────────────────────────
    const logoutUser = useCallback(async () => {
        removeWarningBanner();

        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        try {
            if (accessToken && refreshToken) {
                await fetch(LOGOUT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
            }
        } catch (err) {
            console.warn("Logout request failed:", err);
        } finally {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            navigate("/", {
                state: { message: "You were logged out due to inactivity." }
            });
        }
    }, [navigate]);

    // ── Reset both timers on any activity ───────────────────
    const resetTimer = useCallback(() => {
        // Clear existing timers and remove banner if user becomes active
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        removeWarningBanner();

        // Show banner at 55 minutes (no click needed)
        warningRef.current = setTimeout(() => {
            showWarningBanner();
        }, WARNING_TIME);

        // Auto logout at 60 minutes
        timerRef.current = setTimeout(logoutUser, TIMEOUT_DURATION);

    }, [logoutUser]);

    // ── Attach / detach event listeners ─────────────────────
    useEffect(() => {
        const events = [
            "mousemove",
            "mousedown",
            "keypress",
            "keydown",
            "scroll",
            "touchstart",
            "click",
            "wheel",
        ];

        events.forEach((e) =>
            window.addEventListener(e, resetTimer, { passive: true })
        );

        resetTimer(); // Start timer on mount

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
            removeWarningBanner();
        };
    }, [resetTimer]);
};

export default useInactivityLogout;