import React, { useMemo, useEffect, useState, useCallback } from "react";
import "./Analytics.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from "chart.js";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, LabelList } from "recharts";
import { useJobs } from "../JobContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, ChartTooltip);

export const AnalyticsPage = ({ onUpgradeClick }) => {
  const { currentEmployer } = useJobs();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Combined access state
  const [accessState, setAccessState] = useState({
    canAccess: false,
    isExpired: false,
    isCancelled: false,
    isFeatureEnabled: false,
    planName: null,
    message: null,
    subscriptionStatus: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [hasData, setHasData] = useState(false);

  // ============================================
  // 1. CHECK PLAN ACCESS - MAIN FUNCTION
  // ============================================
  const checkPlanAndFeatureAccess = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous checks
    if (isChecking && !forceRefresh) return;

    try {
      setIsChecking(true);
      if (forceRefresh) setLoading(true);

      console.log('🔍 Checking plan access for Analytics...');

      // Get subscription details
      const subRes = await api.get('/subscription/');
      const subscription = subRes.data;
      const plan = subscription?.plan;

      console.log('📊 Subscription data:', {
        status: subscription?.status,
        is_expired: subscription?.is_expired,
        plan_name: plan?.name,
        analytics: plan?.Analytics
      });

      // Check all conditions
      const isExpired = subscription?.is_expired === true;
      const isCancelled = subscription?.status === 'cancelled';
      const isActive = subscription?.status === 'active';
      const isFeatureEnabled = plan?.Analytics === true;

      // ✅ Access ONLY if active AND not expired AND feature enabled
      const canAccess = isActive && !isExpired && isFeatureEnabled;

      let message = '';
      let subscriptionStatus = subscription?.status || 'unknown';

      if (isCancelled) {
        message = `Your ${plan?.name || 'current'} plan has been cancelled. Please reactivate to access Analytics.`;
      } else if (isExpired) {
        message = `Your ${plan?.name || 'current'} plan has expired. Please renew to access Analytics.`;
      } else if (!isFeatureEnabled) {
        message = `Analytics is not included in your ${plan?.name || 'current'} plan. Upgrade to unlock detailed insights.`;
      } else if (!isActive) {
        message = `Your subscription is not active. Please contact support.`;
      }

      // 🔴 If access was revoked, clear the data IMMEDIATELY
      if (accessState.canAccess && !canAccess) {
        console.log('🔴 Access revoked - clearing analytics data');
        setApplications([]);
        setHasData(false);
      }

      setAccessState({
        canAccess,
        isExpired,
        isCancelled,
        isFeatureEnabled,
        planName: plan?.name,
        message,
        subscriptionStatus
      });

      // Only fetch data if can access
      if (canAccess && !hasData) {
        await fetchApplications();
      } else if (!canAccess) {
        setLoading(false);
      } else if (canAccess && hasData) {
        setLoading(false);
      }

    } catch (error) {
      console.error('❌ Error checking access:', error);
      setAccessState({
        canAccess: false,
        isExpired: false,
        isCancelled: false,
        isFeatureEnabled: false,
        planName: null,
        message: 'Unable to verify access. Please try again.',
        subscriptionStatus: 'error'
      });
      setLoading(false);
    } finally {
      setIsChecking(false);
    }
  }, [accessState.canAccess, hasData, isChecking]);

  // ============================================
  // 2. FETCH APPLICATIONS
  // ============================================
  const fetchApplications = async () => {
    try {
      console.log("🔵 Fetching applications for analytics...");
      const response = await api.get('jobs/applications/');
      console.log("✅ Applications fetched:", response.data?.length || 0);
      setApplications(response.data || []);
      setHasData(true);
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      setApplications([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 3. REFRESH ACCESS (called from parent)
  // ============================================
  const refreshAccess = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await checkPlanAndFeatureAccess(true);
  }, [checkPlanAndFeatureAccess]);

  // ============================================
  // 4. HANDLE UPGRADE/REACTIVATE
  // ============================================
  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick(refreshAccess);
    } else {
      navigate('/Job-portal/Employer/Dashboard', {
        state: { targetTab: 'Billing' }
      });
    }
  };

  const handleGoBack = () => {
    navigate('/Job-portal/Employer/Dashboard', {
      state: { targetTab: 'Dashboard' }
    });
  };

  // ============================================
  // 5. EFFECTS - MULTIPLE TRIGGERS
  // ============================================

  // 5a. Initial check on mount
  useEffect(() => {
    checkPlanAndFeatureAccess(true);
  }, []);

  // 5b. Poll every 30 seconds (catches cancellation/expiry)
  useEffect(() => {
    const interval = setInterval(() => {
      checkPlanAndFeatureAccess(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [checkPlanAndFeatureAccess]);

  // 5c. Check on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible - re-checking plan access');
        checkPlanAndFeatureAccess(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkPlanAndFeatureAccess]);

  // 5d. Check on page focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Page focused - re-checking plan access');
      checkPlanAndFeatureAccess(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkPlanAndFeatureAccess]);

  // 5e. Check on navigation
  useEffect(() => {
    const handlePopState = () => {
      console.log('↩️ Navigation - re-checking plan access');
      checkPlanAndFeatureAccess(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [checkPlanAndFeatureAccess]);

  // ============================================
  // 6. CHART DATA COMPUTATIONS (unchanged)
  // ============================================
  const getRecentMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      months.push(monthName);
    }
    return months;
  };

  const monthsMap = {
    jan: "January", feb: "February", mar: "March", apr: "April",
    may: "May", jun: "June", jul: "July", aug: "August",
    sep: "September", oct: "October", nov: "November", dec: "December"
  };

  const months = getRecentMonths();

  const firstMonthFullName = monthsMap[months[0]?.toLowerCase()] || months[0];
  const secondMonthFullName = monthsMap[months[1]?.toLowerCase()] || months[1];
  const thirdMonthFullName = monthsMap[months[2]?.toLowerCase()] || months[2];

  const dynamicLineData = useMemo(() => {
    const stages = [
      { key: "Total applicants", status: ["applied", "resume_screening", "recruiter_review", "shortlisted", "interview_called", "offered", "hired"] },
      { key: "Application reviewed", status: ["resume_screening", "recruiter_review"] },
      { key: "Shortlisted", status: ["shortlisted"] },
      { key: "Interview called", status: ["interview_called"] }
    ];

    if (!applications.length) {
      return stages.map(stage => ({
        stage: stage.key,
        [firstMonthFullName]: 0,
        [secondMonthFullName]: 0,
        [thirdMonthFullName]: 0
      }));
    }

    const employerJobIds = currentEmployer?.jobPosted?.map(job => String(job.id)) || [];
    const currentDate = new Date();
    const targetYears = months.map((_, index) => {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() - (2 - index), 1).getFullYear();
    });

    return stages.map(stage => {
      const row = { stage: stage.key };

      months.forEach((m, index) => {
        const monthLabel = index === 0 ? firstMonthFullName : index === 1 ? secondMonthFullName : thirdMonthFullName;
        const targetYear = targetYears[index];

        let count = 0;
        applications.forEach(app => {
          const isOurJob = employerJobIds.includes(String(app.job?.id));
          const isCorrectStatus = stage.status.some(s =>
            app.status?.toLowerCase() === s.toLowerCase()
          );

          const appDate = new Date(app.applied_date);
          const appMonth = appDate.toLocaleString('default', { month: 'short' });
          const appYear = appDate.getFullYear();
          const isCorrectMonth = appMonth.toLowerCase() === m.toLowerCase() && appYear === targetYear;

          if (isOurJob && isCorrectStatus && isCorrectMonth) {
            count++;
          }
        });

        row[monthLabel] = count;
      });

      return row;
    });
  }, [applications, currentEmployer, months, firstMonthFullName, secondMonthFullName, thirdMonthFullName]);

  const dynamicStatusData = useMemo(() => {
    const counts = { progress: 0, reviewing: 0, done: 0 };
    if (!currentEmployer?.jobPosted) return [0, 0, 0];

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    currentEmployer.jobPosted.forEach(job => {
      const postDate = new Date(job.created_at || job.posted_date);
      const postMonth = postDate.toLocaleString('default', { month: 'long' });
      const postYear = postDate.getFullYear();

      if (postMonth === currentMonth && postYear === currentYear) {
        const jobStatus = (job.job_status || "").toLowerCase();
        if (jobStatus === "hiring in progress") counts.progress++;
        else if (jobStatus === "reviewing application") counts.reviewing++;
        else if (jobStatus === "hiring done") counts.done++;
      }
    });

    return [counts.progress, counts.reviewing, counts.done];
  }, [currentEmployer]);

  const experienceChartData = useMemo(() => {
    if (!applications.length) return [];

    const levels = ["16-20+", "11-15", "6-10", "1-5", "Fresher"];
    const employerJobIds = currentEmployer?.jobPosted?.map(job => String(job.id)) || [];
    const currentDate = new Date();
    const targetYears = months.map((_, index) => {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() - (2 - index), 1).getFullYear();
    });

    return levels.map((level) => {
      const row = { level };

      months.forEach((m, index) => {
        const monthLabel = index === 0 ? firstMonthFullName : index === 1 ? secondMonthFullName : thirdMonthFullName;
        const targetYear = targetYears[index];
        let count = 0;

        applications.forEach(app => {
          const isOurJob = employerJobIds.includes(String(app.job?.id));
          if (!isOurJob) return;

          const appDate = new Date(app.applied_date);
          const appMonth = appDate.toLocaleString('default', { month: 'short' });
          const appYear = appDate.getFullYear();

          if (appMonth.toLowerCase() !== m.toLowerCase() || appYear !== targetYear) return;

          let expYears = app.total_experience_years;
          if (expYears === null || expYears === undefined) {
            expYears = 0;
          } else {
            expYears = parseFloat(expYears);
          }

          let isInRange = false;
          if (level === "Fresher" && expYears === 0) isInRange = true;
          else if (level === "1-5" && expYears >= 1 && expYears <= 5) isInRange = true;
          else if (level === "6-10" && expYears > 5 && expYears <= 10) isInRange = true;
          else if (level === "11-15" && expYears > 10 && expYears <= 15) isInRange = true;
          else if (level === "16-20+" && expYears > 15) isInRange = true;

          if (isInRange) count++;
        });

        row[monthLabel] = count;
      });

      return row;
    });
  }, [applications, currentEmployer, months, firstMonthFullName, secondMonthFullName, thirdMonthFullName]);

  const TriangleDot = (props) => {
    const { cx, cy, stroke } = props;
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20">
        <path d="M 10 2 L 18 16 L 2 16 Z" fill={stroke} fillOpacity={0.2} stroke="none" />
        <path d="M 10 4 L 16 14 L 4 14 Z" fill={stroke} stroke="none" />
      </svg>
    );
  };

  const doughnutData = {
    labels: ["Hiring in progress", "Reviewing application", "Hiring done"],
    datasets: [{
      data: dynamicStatusData,
      backgroundColor: ["#f4c542", "#7b61ff", "#22c55e"],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    cutout: "75%",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '5px 0', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ============================================
  // 7. RENDER LOGIC
  // ============================================

  // Case 1: Loading
  if (loading) {
    return (
      <div className="analytics-page">
        <div className="title-banner">
          <h1 className="page-title">Analytics</h1>
        </div>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="loading-spinner">⏳</div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Case 2: No Access (Plan Expired OR Cancelled OR Feature Disabled) - FULL LOCK PAGE
  if (!accessState.canAccess) {
    const isExpired = accessState.isExpired;
    const isCancelled = accessState.isCancelled;
    const isFeatureDisabled = !accessState.isFeatureEnabled && !isExpired && !isCancelled;

    return (
      <div className="analytics-page">
        <div className="title-banner">
          <h1 className="page-title">Analytics</h1>
        </div>

        {/* FULL LOCK PAGE - No content, only upgrade message */}
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          maxWidth: "550px",
          margin: "40px auto"
        }}>
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>
            {isCancelled ? '🚫' : isExpired ? '⏰' : '🔒'}
          </div>
          <h2 style={{ color: "#1e293b", marginBottom: "15px", fontSize: "28px" }}>
            {isCancelled ? 'Plan Cancelled' : isExpired ? 'Access Expired' : 'Feature Locked'}
          </h2>
          <p style={{ color: "#64748b", marginBottom: "25px", lineHeight: "1.6", fontSize: "16px" }}>
            {accessState.message}
          </p>

          <div style={{
            background: isCancelled ? "#fee2e2" : isExpired ? "#fee2e2" : "#fef9ec",
            border: isCancelled ? "1px solid #fecaca" : isExpired ? "1px solid #fecaca" : "1px solid #fde68a",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            fontSize: "14px",
            color: isCancelled ? "#991b1b" : isExpired ? "#991b1b" : "#92400e",
            textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "20px" }}>
                {isCancelled ? '⚠️' : isExpired ? '⚠️' : '💡'}
              </span>
              <strong style={{ fontSize: "15px" }}>
                {isCancelled ? 'What you lost:' : isExpired ? 'What you lose:' : 'Upgrade to unlock:'}
              </strong>
            </div>
            <ul style={{ margin: "10px 0 0 20px", padding: 0 }}>
              <li style={{ marginBottom: "8px" }}>✓ Applicant tracking and insights</li>
              <li style={{ marginBottom: "8px" }}>✓ Job performance analytics</li>
              <li style={{ marginBottom: "8px" }}>✓ Hiring trends and reports</li>
              <li style={{ marginBottom: "8px" }}>✓ Candidate experience analysis</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleUpgrade}
              style={{
                padding: "12px 30px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {isCancelled ? 'Reactivate Plan Now' : isExpired ? 'Renew Plan Now' : 'Upgrade Plan Now'}
            </button>
            <button
              onClick={handleGoBack}
              style={{
                padding: "12px 30px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Go to Dashboard
            </button>
          </div>

          <p style={{ marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
            {isCancelled
              ? 'Contact support or reactivate your plan to restore access.'
              : isExpired
                ? 'Renew your plan to restore access.'
                : 'Contact your administrator to upgrade your plan.'
            }
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // 8. Case 3: Has Access - Show Full Analytics
  // ============================================
  return (
    <div className="analytics-page">
      <div className="title-banner">
        <h1 className="page-title">Analytics</h1>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
          Plan: {accessState.planName} • Status: Active
        </div>
      </div>

      <div className="analytics-content">
        {/* Dynamic Area Chart */}
        <div className="card line-card">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dynamicLineData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <defs>
                <linearGradient id="colorJan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFeb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="stage" tick={{ fontSize: 13, fill: "#333" }} />
              <YAxis tick={{ fontSize: 13, fill: "#333" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={firstMonthFullName} stroke="#7b61ff" fill="url(#colorJan)" strokeWidth={2} dot={<TriangleDot stroke="#7b61ff" />} />
              <Area type="monotone" dataKey={secondMonthFullName} stroke="#ff6b6b" fill="url(#colorFeb)" strokeWidth={2} dot={<TriangleDot stroke="#ff6b6b" />} />
              <Area type="monotone" dataKey={thirdMonthFullName} stroke="#00bcd4" fill="url(#colorMar)" strokeWidth={2} dot={<TriangleDot stroke="#00bcd4" />} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="custom-legend-horizontal">
            <div className="legend-item"><span className="triangle-legend jan"></span> {months[0]}</div>
            <div className="legend-item"><span className="triangle-legend feb"></span> {months[1]}</div>
            <div className="legend-item"><span className="triangle-legend mar"></span> {months[2]}</div>
          </div>
          <p className="chart-label">Applicants Overview (Last 3 Months)</p>
        </div>

        <div className="bottom-row">
          <div className="card doughnut-card">
            <div className="doughnut-wrapper">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="doughnut-center-text" style={{ fontSize: '1.2rem' }}>{thirdMonthFullName}</div>
            </div>
            <div className="doughnut-legend-container">
              {doughnutData.labels.map((label, i) => (
                <div className="legend-row" key={label}>
                  <span className={`square ${['yellow', 'purple', 'green'][i]}`}></span>
                  <span className="legend-text">{label}: <strong>{dynamicStatusData[i]}</strong></span>
                </div>
              ))}
            </div>
            <p className="chart-label">Posted Job Status - {thirdMonthFullName}</p>
          </div>

          <div className="card bar-card">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart layout="vertical" data={experienceChartData} margin={{ top: 20, right: 40, left: 10, bottom: 5 }} barGap={5}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical stroke="#e0e0e0" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 14, fontWeight: "500" }} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey={firstMonthFullName} fill="#7b61ff" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={firstMonthFullName} position="right" />
                </Bar>
                <Bar dataKey={secondMonthFullName} fill="#ff6b6b" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={secondMonthFullName} position="right" />
                </Bar>
                <Bar dataKey={thirdMonthFullName} fill="#00bcd4" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={thirdMonthFullName} position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="custom-legend-horizontal">
              <div className="legend-item">
                <span className="square" style={{ backgroundColor: "#7b61ff" }}></span>
                {months[0]}
              </div>
              <div className="legend-item">
                <span className="square" style={{ backgroundColor: "#ff6b6b" }}></span>
                {months[1]}
              </div>
              <div className="legend-item">
                <span className="square" style={{ backgroundColor: "#00bcd4" }}></span>
                {months[2]}
              </div>
            </div>
            <p className="chart-label">Experience Levels of Applicants</p>
          </div>
        </div>
      </div>
    </div>
  );
};