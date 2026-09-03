import React, { useState, useEffect, useRef } from 'react'
import UsermanageSet from '../assets/AdminAssets/UserManageSetting.png'
import JobManageSetting from '../assets/AdminAssets/JobManageSetting.png'
import ApplicationSet from '../assets/AdminAssets/ApplicationSet.png'
import CompanySetting from '../assets/AdminAssets/CompanySetting.png'
import ReportsandAnalytics from '../assets/AdminAssets/Reports and Analytics.png'
import GeneralSetting from '../assets/AdminAssets/GeneralSetting.png'
import EmailNotif from '../assets/AdminAssets/EmailNotif.png'
import InAppNotify from '../assets/AdminAssets/InAppNotify.png'
import SmsNotify from '../assets/AdminAssets/SmsNotify.png'
import PushNotify from '../assets/AdminAssets/PushNotify.png'
import Clock from '../assets/AdminAssets/Clock.png'
import api from '../api/axios/'

// ─── Exact UI Matched Auto-Flipping Pop-up TimePicker Component ───────────
const TimePicker = ({ value, onChange, disabled, className,title }) => {
  const to12Hour = (time24) => {
    if (!time24) return { hour: 12, minute: '00', ampm: 'AM' }
    const [h, m] = time24.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return { hour: hour12, minute: String(m).padStart(2, '0'), ampm }
  }

  const to24Hour = (hour12, minute, ampm) => {
    let h = Number(hour12) % 12
    if (ampm === 'PM') h += 12
    return `${String(h).padStart(2, '0')}:${minute}`
  }

  const current = to12Hour(value)
  const [isOpen, setIsOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(false)
  const [tempHour, setTempHour] = useState(current.hour)
  const [tempMinute, setTempMinute] = useState(current.minute)
  const [tempAmpm, setTempAmpm] = useState(current.ampm)

  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const cur = to12Hour(value)
    setTempHour(cur.hour)
    setTempMinute(cur.minute)
    setTempAmpm(cur.ampm)
  }, [value])

  // Determine top/bottom flex positioning based on viewport space
  const handleToggle = () => {
    if (disabled) return

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const popupHeight = 230
      const spaceBelow = window.innerHeight - rect.bottom

      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        setOpenUpwards(true)
      } else {
        setOpenUpwards(false)
      }
    }
    setIsOpen((prev) => !prev)
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleApply = () => {
    const time24 = to24Hour(tempHour, tempMinute, tempAmpm)
    onChange(time24)
    setIsOpen(false)
  }

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <div 
      ref={popoverRef}
      className={`Adm-Not-time-select-wrapper ${className || ''}`} 
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Input Display Box (Matches image style) */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title={disabled ? "Enable Quiet Hours to modify time" : (title || "Click to change time")}
        onClick={handleToggle}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 12px 0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '6px',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          position: 'relative',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
      >
        <img 
          src={Clock} 
          alt="" 
          className="Adm-Not-input-icon icon-clock" 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: '17px', 
            height: '17px', 
            pointerEvents: 'none',
            opacity: 0.65
          }} 
        />

        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
          {String(current.hour).padStart(2, '0')}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 1px' }}>
          :{current.minute}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#624bff', marginLeft: 'auto' }}>
          {current.ampm}
        </span>
      </button>

      {/* Auto-Flipping Single Pop-up Modal */}
      {isOpen && (
        <div
           style={{
            position: 'absolute',
            ...(openUpwards
              ? { bottom: 'calc(100% + 8px)', top: 'auto' }
              : { top: 'calc(100% + 8px)', bottom: 'auto' }),
            left: '50%',
            transform: 'translateX(-50%)', // Centers the popup horizontally with the button
            zIndex: 1000,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: openUpwards
              ? '0 -10px 25px -5px rgba(0, 0, 0, 0.15)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            padding: '12px',
            width: '216px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Columns Container */}
          <div style={{ display: 'flex', gap: '8px', height: '145px' }}>
            {/* Hours */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '3px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>HR</div>
              {hourOptions.map((h) => (
                <div
                  key={h}
                  onClick={() => setTempHour(h)}
                  style={{
                    padding: '5px 0',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    background: tempHour === h ? '#624bff' : 'transparent',
                    color: tempHour === h ? '#ffffff' : '#1e293b',
                    fontWeight: tempHour === h ? 600 : 400
                  }}
                >
                  {String(h).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Minutes */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '3px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>MIN</div>
              {minuteOptions.map((m) => (
                <div
                  key={m}
                  onClick={() => setTempMinute(m)}
                  style={{
                    padding: '5px 0',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    background: tempMinute === m ? '#624bff' : 'transparent',
                    color: tempMinute === m ? '#ffffff' : '#1e293b',
                    fontWeight: tempMinute === m ? 600 : 400
                  }}
                >
                  {m}
                </div>
              ))}
            </div>

            {/* AM / PM Toggle buttons */}
            <div style={{ width: '48px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>AM/PM</div>
              {['AM', 'PM'].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setTempAmpm(a)}
                  style={{
                    padding: '10px 0',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: tempAmpm === a ? '1px solid #624bff' : '1px solid #e2e8f0',
                    background: tempAmpm === a ? '#624bff' : '#f8fafc',
                    color: tempAmpm === a ? '#ffffff' : '#475569'
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                background: '#624bff',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                padding: '4px 12px'
              }}
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const AdminNotificationSettings = () => {

  const notificationTypes = [
    { id: 'user_mgmt', title: 'User Management', description: 'New user signups, role changes, user updates and deactivations', iconClass: UsermanageSet },
    { id: 'job_mgmt', title: 'Job Management', description: 'New jobs, job updates, expirations and approval requests', iconClass: JobManageSetting },
    { id: 'apps', title: 'Applications', description: 'New applications, Application update and status changes', iconClass: ApplicationSet },
    { id: 'companies', title: 'Companies', description: 'New Company registration and company updates', iconClass: CompanySetting },
    { id: 'reports', title: 'Reports & Analytics', description: 'Daily/weekly reports and important analytics update', iconClass: ReportsandAnalytics },
    { id: 'general', title: 'General Updates', description: 'Product updates, new features and announcement', iconClass: GeneralSetting }
  ];

  const mainChannels = ['Email', 'In-App', 'SMS', 'Push'];

  const quickChannels = [
    { id: 'email_notif', title: 'Email Notifications', description: 'Receive notification via email', iconClass: EmailNotif, channelName: 'Email' },
    { id: 'inapp_notif', title: 'In-App Notification', description: 'Receive notification in admin panel', iconClass: InAppNotify, channelName: 'In-App' },
    { id: 'sms_notif', title: 'SMS Notification', description: 'Receive important alerts via SMS', iconClass: SmsNotify, channelName: 'SMS' },
    { id: 'push_notif', title: 'Push Notification', description: 'Receive push notification in browser', iconClass: PushNotify, channelName: 'Push' }
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ── State ────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("07:00");
  const [activeDays, setActiveDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [tablePreferences, setTablePreferences] = useState(
    notificationTypes.reduce((acc, type) => {
      acc[type.id] = mainChannels.reduce((chAcc, channel) => {
        chAcc[channel] = false;
        return chAcc;
      }, {});
      return acc;
    }, {})
  );

  const [quickSetup, setQuickSetup] = useState(
    quickChannels.reduce((acc, channel) => {
      acc[channel.id] = false;
      return acc;
    }, {})
  );

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prefsRes, quietRes, channelsRes] = await Promise.all([
        api.get('notification-preferences/'),
        api.get('quiet-hours/'),
        api.get('notification-channels/'),
      ]);

      // ── Table preferences ─────────────────────────────────
      const backendPrefs = prefsRes.data?.table_preferences || {};
      const mapped = notificationTypes.reduce((acc, type) => {
        const fromBackend = backendPrefs[type.id] || {};
        acc[type.id] = {
          Email: fromBackend['Email'] ?? false,
          'In-App': fromBackend['In-App'] ?? false,
          SMS: fromBackend['SMS'] ?? false,
          Push: fromBackend['Push'] ?? false,
        };
        return acc;
      }, {});
      setTablePreferences(mapped);

      // ── Quiet hours ───────────────────────────────────────
      const qh = quietRes.data?.quiet_hours || {};
      if (typeof qh.enabled === 'boolean') setQuietHoursEnabled(qh.enabled);
      if (qh.start_time) setStartTime(qh.start_time.slice(0, 5));
      if (qh.end_time) setEndTime(qh.end_time.slice(0, 5));
      if (qh.timezone) setTimezone(qh.timezone);
      if (qh.active_days) setActiveDays(qh.active_days);

      // ── Channel settings ──────────────────────────────────
      const qs = channelsRes.data?.quick_setup || {};
      setQuickSetup({
        email_notif: qs.email_notif ?? false,
        inapp_notif: qs.inapp_notif ?? false,
        sms_notif: qs.sms_notif ?? false,
        push_notif: qs.push_notif ?? false,
      });

    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        api.patch('notification-preferences/update/', {
          table_preferences: tablePreferences
        }),
        api.patch('quiet-hours/update/', {
          quiet_hours: {
            enabled: quietHoursEnabled,
            start_time: startTime,
            end_time: endTime,
            timezone: timezone,
            active_days: activeDays,
          }
        }),
        api.patch('notification-channels/update/', {
          quick_setup: quickSetup
        }),
      ]);

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save settings.';
      setError(msg);
      alert(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────
  const toggleDay = (day) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // ── Handle Quick Channel Change (Master Switch) ──
  const handleQuickChange = (channelId) => {
    if (channelId === 'sms_notif') {
      return;
    }

    const newValue = !quickSetup[channelId];

    const channelMap = {
      'email_notif': 'Email',
      'inapp_notif': 'In-App',
      'sms_notif': 'SMS',
      'push_notif': 'Push'
    };

    const channelName = channelMap[channelId];

    setQuickSetup(prev => ({
      ...prev,
      [channelId]: newValue
    }));

    setTablePreferences(prev => {
      const updated = { ...prev };
      notificationTypes.forEach(type => {
        updated[type.id] = {
          ...updated[type.id],
          [channelName]: newValue
        };
      });
      return updated;
    });
  };

  // ── Handle Table Change (Individual Row Toggle) ──
  const handleTableChange = (typeId, channelName) => {
    if (channelName === 'SMS') {
      return;
    }

    setTablePreferences(prev => {
      const updated = {
        ...prev,
        [typeId]: {
          ...prev[typeId],
          [channelName]: !prev[typeId]?.[channelName]
        }
      };

      const allRowsForChannel = notificationTypes.every(
        type => updated[type.id]?.[channelName] ?? false
      );

      const channelMapReverse = {
        'Email': 'email_notif',
        'In-App': 'inapp_notif',
        'SMS': 'sms_notif',
        'Push': 'push_notif'
      };

      const quickChannelId = channelMapReverse[channelName];

      if (quickChannelId && quickChannelId !== 'sms_notif') {
        setQuickSetup(prevQuick => ({
          ...prevQuick,
          [quickChannelId]: allRowsForChannel
        }));
      }

      return updated;
    });
  };

  // ── Timezone display helper ───────────────────────────────
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: '(UTC +05:30) Asia/Kolkata' },
    { value: 'America/Los_Angeles', label: '(UTC -08:00) America/Los_Angeles' },
    { value: 'UTC', label: '(UTC +00:00) UTC' },
    { value: 'Europe/London', label: '(UTC +01:00) Europe/London' },
    { value: 'Europe/Berlin', label: '(UTC +02:00) Europe/Berlin' },
  ];

  // ── Helper to check if a channel is globally enabled ──
  const isChannelEnabled = (channelName) => {
    const channelMap = {
      'Email': 'email_notif',
      'In-App': 'inapp_notif',
      'SMS': 'sms_notif',
      'Push': 'push_notif'
    };
    const quickId = channelMap[channelName];
    return quickSetup[quickId] ?? false;
  };

  if (loading) {
    return (
      <div className="Adm-Not-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="Adm-Not-container">
      <header className="Adm-Not-header">
        <div className="Adm-Not-header-text">
          <h1 className="Adm-Not-title">Notification preferences</h1>
          <p className="Adm-Not-subtitle">Choose what notification you want to receive and how.</p>
        </div>
        <button
          className="Adm-Not-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </header>

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: '8px 12px', background: '#fff0f0', borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div className="Adm-Not-main-content">
        {/* ── Notification preferences table ─────────────── */}
        <div className="Adm-Not-table-section">
          <table className="Adm-Not-table">
            <thead>
              <tr>
                <th className="Adm-Not-th-type">Notification type</th>
                {mainChannels.map(channel => (
                  <th key={channel} className="Adm-Not-th-channel">{channel}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notificationTypes.map(type => (
                <tr key={type.id} className="Adm-Not-row">
                  <td className="Adm-Not-td-type">
                    <div style={{ display: "flex", alignItems: "center" }} className="Adm-Not-type-info">
                      <img src={type.iconClass} width={30} height={30} alt="" />
                      <div>
                        <div className="Adm-Not-item-title">{type.title}</div>
                        <div className="Adm-Not-item-desc">{type.description}</div>
                      </div>
                    </div>
                  </td>
                  {mainChannels.map(channel => {
                    const isRowDisabled = type.id === 'general';
                    const isChannelDisabled = channel === 'SMS';
                    const isGloballyEnabled = isChannelEnabled(channel);

                    const shouldDisable = isChannelDisabled || isRowDisabled || !isGloballyEnabled;

                    return (
                      <td key={channel} className="Adm-Not-td-switch">
                        <span title={isChannelDisabled || isRowDisabled ? "Under Implementation" : (!isGloballyEnabled ? "Channel is disabled" : "")}>
                          <label
                            className="Adm-Not-switch"
                            style={{
                              opacity: shouldDisable ? 0.5 : 1,
                              pointerEvents: shouldDisable ? 'none' : 'auto'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={shouldDisable ? false : (tablePreferences[type.id]?.[channel] ?? false)}
                              onChange={() => handleTableChange(type.id, channel)}
                              disabled={shouldDisable}
                            />
                            <span className="Adm-Not-slider"></span>
                          </label>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Sidebar ────────────────────────────────────── */}
        <div className="Adm-Not-sidebar">

          {/* Notification Channels panel */}
          <div className="Adm-Not-panel Adm-Not-channels-panel">
            <h2 className="Adm-Not-panel-title">Notification Channels</h2>
            <p className="Adm-Not-panel-subtitle">Choose your preferred communication channel</p>
            <div className="Adm-Not-channel-list">
              {quickChannels.map(channel => {
                const isDisabled = channel.id === 'sms_notif';

                return (
                  <div key={channel.id} className="Adm-Not-channel-item">
                    <div style={{ display: "flex", alignItems: "center" }} className="Adm-Not-item-info">
                      <img src={channel.iconClass} alt="" width={25} height={25} />
                      <div>
                        <div className="Adm-Not-item-title">{channel.title}</div>
                        <div className="Adm-Not-item-desc">{channel.description}</div>
                      </div>
                    </div>
                    <span title={isDisabled ? "Under Implementation" : ""}>
                      <label className="Adm-Not-switch" style={{ opacity: isDisabled ? 0.5 : 1 }}>
                        <input
                          type="checkbox"
                          checked={quickSetup[channel.id] ?? false}
                          onChange={() => handleQuickChange(channel.id)}
                          disabled={isDisabled}
                        />
                        <span className="Adm-Not-slider"></span>
                      </label>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── QUIET HOURS PANEL ────────────────── */}
          <div className="Adm-Not-panel Adm-Not-quiet-hours-panel">
            {/* Header with title and toggle */}
            <div className="Adm-Not-quiet-header">
              <div className="Adm-Not-quiet-header-text">
                <h2 className="Adm-Not-panel-title">Quiet Hours</h2>
                <p className="Adm-Not-panel-subtitle">
                  Set quiet hours to avoid notification at certain times (only for admin)
                </p>
              </div>
              <label className="Adm-Not-switch Adm-Not-quiet-toggle">
                <input
                  type="checkbox"
                  checked={quietHoursEnabled}
                  onChange={() => setQuietHoursEnabled(prev => !prev)}
                />
                <span className="Adm-Not-slider"></span>
              </label>
            </div>

            {/* Time inputs matching screenshot */}
            <div
              className="Adm-Not-time-inputs"
              style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box',
                opacity: quietHoursEnabled ? 1 : 0.5,
                pointerEvents: quietHoursEnabled ? 'auto' : 'none',
                overflow: 'visible'
              }}
            >
              <div className="Adm-Not-time-group" style={{ flex: '1 1 0%', minWidth: 0, position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>Start time</label>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  disabled={!quietHoursEnabled}
                  title="Click to change quiet hours start time"
                />
              </div>
              <div className="Adm-Not-time-group" style={{ flex: '1 1 0%', minWidth: 0, position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>End time</label>
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  disabled={!quietHoursEnabled}
                  title="Click to change quiet hours end time"
                />
              </div>
            </div>

            {/* Day picker */}
            <div
              className="Adm-Not-day-picker"
              style={{ opacity: quietHoursEnabled ? 1 : 0.5, pointerEvents: quietHoursEnabled ? 'auto' : 'none', marginTop: '16px' }}
            >
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  className={`day-btn ${activeDays.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}
                  disabled={!quietHoursEnabled}
                  title={quietHoursEnabled ? `select to change enabled ${day} or disable ${day}` : "Enable Quiet Hours to modify days"}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Timezone select */}
            <div
              className="Adm-Not-timezone-select-wrapper"
              style={{ opacity: quietHoursEnabled ? 1 : 0.5, pointerEvents: quietHoursEnabled ? 'auto' : 'none' }}
            >
              <select
                className="Adm-Not-timezone-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={!quietHoursEnabled}
              >
                {timezoneOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};