import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "./RaisedTickets.css";
import { Header } from "../Components-LandingPage/Header";
import { Footer } from "../Components-LandingPage/Footer";

/**
 * RaisedTickets
 * Shared "my tickets / my reported jobs" screen for both roles.
 *
 * Usage:
 *   <RaisedTickets role="jobseeker" />
 *     -> standalone routed page, shows "Raised Tickets" + "Reported Jobs" tabs,
 *        reads targetTicketId/targetReportId from location.state (notification deep link)
 *
 *   <RaisedTickets role="employer" onBack={...} targetTicketId={...} />
 *     -> embedded as a tab inside EmployerDashboard (no "Reported Jobs" tab,
 *        employers don't file job reports). onBack switches the parent's tab
 *        instead of navigating the browser. targetTicketId is passed as a prop
 *        (not read from location.state) because the Dashboard's own tab-switch
 *        effect clears location.state before this component would get to read it.
 *
 * Backend endpoints expected (see backend snippet):
 *   GET /my-tickets/      -> { status, count, data: [ ...RaiseTicket rows ] }
 *   GET /my-complaints/   -> { status, count, data: [ ...Complaint rows ] }  (jobseeker only)
 */

const TICKET_STATUS_STYLES = {
    Pending: { bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B" },
    "In Progress": { bg: "#DBEAFE", fg: "#1D4ED8", dot: "#3B82F6" },
    Hold: { bg: "#E5E7EB", fg: "#374151", dot: "#6B7280" },
    Resolved: { bg: "#DCFCE7", fg: "#15803D", dot: "#22C55E" },
};

const REPORT_STATUS_STYLES = {
    Pending: { bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B" },
    "In Progress": { bg: "#DBEAFE", fg: "#1D4ED8", dot: "#3B82F6" },
    Resolved: { bg: "#DCFCE7", fg: "#15803D", dot: "#22C55E" },
    Rejected: { bg: "#FEE2E2", fg: "#B91C1C", dot: "#EF4444" },
};

function StatusBadge({ status, kind }) {
    const styles = kind === "report" ? REPORT_STATUS_STYLES : TICKET_STATUS_STYLES;
    const s = styles[status] || { bg: "#E5E7EB", fg: "#374151", dot: "#6B7280" };
    return (
        <span className="rt-badge" style={{ background: s.bg, color: s.fg }}>
            <span className="rt-badge-dot" style={{ background: s.dot }} />
            {status || "Unknown"}
        </span>
    );
}

function normalizeTicket(t) {
    return {
        kind: "ticket",
        id: t.id,
        displayId: `TCK-${String(t.id).padStart(4, "0")}`,
        title: t.subject,
        subtitle: t.category,
        priority: t.priority,
        status: t.status,
        date: t.date,
        resolvedon: t.resolvedon,
        raw: t,
    };
}

function normalizeReport(c) {
    return {
        kind: "report",
        id: c.id,
        displayId: c.RepId || `REP-${String(c.id).padStart(4, "0")}`,
        title: c.reason,
        subtitle: c.jobId ? `Job #${c.jobId}` : "Job report",
        priority: c.priority,
        status: c.status,
        date: c.date,
        resolvedon: c.resolvedon,
        raw: c,
    };
}

export default function RaisedTickets({
    role = "jobseeker",
    onBack: onBackProp,
    targetTicketId: targetTicketIdProp,
    targetReportId: targetReportIdProp,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const showReportsTab = role === "jobseeker";
    const deepLinkAppliedRef = useRef(false);

    const [activeTab, setActiveTab] = useState("tickets"); // 'tickets' | 'reports'
    const [tickets, setTickets] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [selected, setSelected] = useState(null); // normalized item or null

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setErrorMsg("");
            try {
                const requests = [api.get("/my-tickets/")];
                if (showReportsTab) requests.push(api.get("/my-complaints/"));

                const results = await Promise.all(requests);

                if (cancelled) return;

                const ticketRows = results[0]?.data?.data || [];
                setTickets(ticketRows.map(normalizeTicket));

                if (showReportsTab) {
                    const reportRows = results[1]?.data?.data || [];
                    setReports(reportRows.map(normalizeReport));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading tickets:", err);
                    setErrorMsg("Couldn't load your tickets right now. Please try again.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [showReportsTab]);

    // Open a specific ticket/report when arriving from a notification.
    // Props take priority (tab-embedded usage, e.g. inside EmployerDashboard);
    // falls back to location.state (standalone routed usage, e.g. the
    // jobseeker's own /mytickets page).
    useEffect(() => {
        if (deepLinkAppliedRef.current || loading) return;

        const targetTicketId = targetTicketIdProp ?? location.state?.targetTicketId;
        const targetReportId = targetReportIdProp ?? location.state?.targetReportId;
        if (!targetTicketId && !targetReportId) return;

        if (targetTicketId) {
            const match = tickets.find((t) => String(t.id) === String(targetTicketId));
            if (match) setSelected(match);
        } else if (targetReportId) {
            const match = reports.find((r) => String(r.id) === String(targetReportId));
            if (match) {
                setActiveTab("reports");
                setSelected(match);
            }
        }

        deepLinkAppliedRef.current = true;

        // Only clear location.state if we actually read from it (standalone route
        // usage) — nothing to clear when the ids came in as props.
        if (location.state?.targetTicketId || location.state?.targetReportId) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [
        loading,
        tickets,
        reports,
        targetTicketIdProp,
        targetReportIdProp,
        location.state,
        navigate,
        location.pathname,
    ]);

    const listForActiveTab = useMemo(
        () => (activeTab === "tickets" ? tickets : reports),
        [activeTab, tickets, reports]
    );

    const handleBack = () => {
        if (selected) {
            setSelected(null);
        } else if (onBackProp) {
            onBackProp();
        } else {
            navigate(-1);
        }
    };

    return (
        <div>
            {/* <Header /> */}
            <div className="rt-page">
                
                <div className="rt-topbar">
                    <button
                        className="rt-back-btn"
                        onClick={handleBack}
                        aria-label="Go back"
                        type="button"
                    >
                        ‹
                    </button>
                    <h1 className="rt-title">
                        {selected ? "Ticket Details" : "My Tickets"}
                    </h1>
                    <span className="rt-topbar-spacer" />
                </div>

                {!selected && (
                    <>
                        {showReportsTab && (
                            <div className="rt-tabs">
                                <button
                                    type="button"
                                    className={`rt-tab ${activeTab === "tickets" ? "active" : ""}`}
                                    onClick={() => setActiveTab("tickets")}
                                >
                                    Raised Tickets
                                    {tickets.length > 0 && <span className="rt-tab-count">{tickets.length}</span>}
                                </button>
                                <button
                                    type="button"
                                    className={`rt-tab ${activeTab === "reports" ? "active" : ""}`}
                                    onClick={() => setActiveTab("reports")}
                                >
                                    Reported Jobs
                                    {reports.length > 0 && <span className="rt-tab-count">{reports.length}</span>}
                                </button>
                            </div>
                        )}

                        <div className="rt-list">
                            {loading && (
                                <div className="rt-state-msg">Loading your tickets…</div>
                            )}

                            {!loading && errorMsg && (
                                <div className="rt-state-msg rt-error">{errorMsg}</div>
                            )}

                            {!loading && !errorMsg && listForActiveTab.length === 0 && (
                                <div className="rt-empty">
                                    <p className="rt-empty-title">
                                        {activeTab === "tickets"
                                            ? "No tickets raised yet"
                                            : "No jobs reported yet"}
                                    </p>
                                    <p className="rt-empty-sub">
                                        {activeTab === "tickets"
                                            ? "Support tickets you raise will show up here."
                                            : "Jobs you report will show up here."}
                                    </p>
                                </div>
                            )}

                            {!loading &&
                                !errorMsg &&
                                listForActiveTab.map((item) => (
                                    <button
                                        type="button"
                                        key={`${item.kind}-${item.id}`}
                                        className="rt-card"
                                        onClick={() => setSelected(item)}
                                    >
                                        <div className="rt-card-main">
                                            <div className="rt-card-id">{item.displayId}</div>
                                            <div className="rt-card-title">{item.title}</div>
                                            <div className="rt-card-meta">
                                                {item.subtitle && <span>{item.subtitle}</span>}
                                                {item.date && <span>&middot; {item.date}</span>}
                                            </div>
                                        </div>
                                        <div className="rt-card-side">
                                            <StatusBadge status={item.status} kind={item.kind} />
                                            <span className="rt-chevron">›</span>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </>
                )}

                {selected && <TicketDetail item={selected} />}
            </div>
            {/* <Footer/> */}
        </div>

    );
}

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="rt-detail-row">
            <span className="rt-detail-label">{label}</span>
            <span className="rt-detail-value">{value}</span>
        </div>
    );
}

function TicketDetail({ item }) {
    const r = item.raw;
    const isTicket = item.kind === "ticket";

    return (
        <div className="rt-detail">
            <div className="rt-detail-header">
                <div>
                    <div className="rt-detail-id">{item.displayId}</div>
                    <h2 className="rt-detail-title">{item.title}</h2>
                </div>
                <StatusBadge status={item.status} kind={item.kind} />
            </div>

            <div className="rt-detail-card">
                <DetailRow label="Category" value={isTicket ? r.category : "Job Report"} />
                <DetailRow label="Priority" value={item.priority} />
                <DetailRow label="Submitted on" value={item.date} />
                <DetailRow label="Resolved on" value={item.resolvedon} />
                {!isTicket && <DetailRow label="Job ID" value={r.jobId ? `#${r.jobId}` : null} />}
                <DetailRow label="Name" value={isTicket ? r.name : `${r.firstName || ""} ${r.lastName || ""}`.trim()} />
                <DetailRow label="Email" value={r.email} />
                <DetailRow label="Mobile" value={r.mobile} />
            </div>

            <div className="rt-detail-card">
                <span className="rt-detail-label">{isTicket ? "Message" : "Explanation"}</span>
                <p className="rt-detail-message">{isTicket ? r.message : r.explanation}</p>
            </div>

            {isTicket && r.attachment && (
                <a
                    className="rt-attachment-link"
                    href={r.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View attachment
                </a>
            )}
        </div>
    );
}