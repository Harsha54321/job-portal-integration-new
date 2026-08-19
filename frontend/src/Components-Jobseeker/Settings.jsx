import React, { useState, useEffect } from 'react';
import './Settings.css';
import "../Components-Admin/AdminSecurity.css";
import { Header } from '../Components-LandingPage/Header';
import api from "../api/axios";
import ChangePassword from './ChangePassword';
import TwoFactorAuth from './TwoFactorAuth';
import UpArrow from '../assets/UpArrow.png';

export const Settings = () => {
    const [tab, setTab] = useState('Account');
    const [settings, setSettings] = useState({
        account_type: "",
        email: "",
        phone: "",
        show_online_status: true,
        show_read_receipts: true,
        hide_cv: false,
    });
    const [username, setUsername] = useState('');
    const [online, setOnline] = useState("yes");
    // const [read, setRead] = useState("yes");
    const [activity, setActivity] = useState("yes");
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [phoneError, setPhoneError] = useState('');

    // --- New state for collapsible sections ---
    const [isPasswordChange, setIsPasswordChange] = useState(false);
    const [is2FAOpen, setIs2FAOpen] = useState(false);

    // --- Toggle functions ---
    const togglePasswordChange = () => setIsPasswordChange(!isPasswordChange);
    const toggle2FA = () => setIs2FAOpen(!is2FAOpen);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // 1. Fetch settings
                const settingsRes = await api.get("/settings/");
                setSettings(settingsRes.data);
                setOnline(settingsRes.data.show_online_status ? "yes" : "no");
                setActivity(settingsRes.data.hide_cv ? "no" : "yes");

                // 2. Fetch current user details (includes username)
                const userRes = await api.get("/users/me/");
                setUsername(userRes.data.username || '');
                setSettings(prev => ({
                    ...prev,
                    phone: userRes.data.phone || prev.phone || ''
                }));
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };

        fetchSettings();
    }, []);

    // Track changes locally without API calls
    const handleInputChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
        if (field === 'phone') {
            setPhoneError('');
        }
    };

    const handleCommunicationChange = (field, value) => {
        if (field === 'show_online_status') {
            setOnline(value ? 'yes' : 'no');
            setSettings(prev => ({ ...prev, [field]: value }));
        } else if (field === 'hide_cv') {
            setActivity(value ? 'no' : 'yes');

            setSettings({ ...settings, [field]: value });
        }
    };

    // Save all changes at once
    const saveSettings = async () => {
        const phone = settings.phone?.trim() || '';
        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            setPhoneError('Phone number must be 10 digits and start with 6, 7, 8, or 9.');
            setSaveMessage('');
            setLoading(false);
            return;
        } else {
            setPhoneError('');
        }
        setLoading(true);
        setSaveMessage('');

        try {
            const payload = {
                account_type: settings.account_type,
                phone: settings.phone,
                show_online_status: settings.show_online_status,
                show_read_receipts: settings.show_read_receipts,
                hide_cv: settings.hide_cv,
            };

            await api.patch("/settings/", payload);
            await api.patch("/profile/jobseeker/", { phone: settings.phone });

            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error("Failed to save settings", err);
            setSaveMessage('Failed to save settings. Please try again.');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <Header />
            <div style={{ marginTop: "120px" }} className="JSettings-header-box">
                <h2>{tab === 'Privacy' ? 'Privacy Policy' : tab + ' Settings'}</h2>
            </div>

            <div style={{ marginTop: "50px", padding: "45px" }} className="JSettings-main-layout">
                <aside className="JSettings-sidebar">
                    <button onClick={() => setTab('Account')} className={tab === 'Account' ? 'active' : ''}>Account Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Communication')} className={tab === 'Communication' ? 'active' : ''}>Communication Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Security')} className={tab === 'Security' ? 'active' : ''}>Security Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Privacy')} className={tab === 'Privacy' ? 'active' : ''}>Privacy Policy</button>
                </aside>

                <div className="JSettings-content">
                    {tab === 'Account' && (
                        <div className="JSettings-form">
                            <input
                                placeholder="Account Type"
                                value={settings.account_type || ""}
                                disabled
                                onChange={(e) => handleInputChange('account_type', e.target.value)}
                                className="JSettings-select"
                            />
                            <input placeholder="Username" value={username} disabled />
                            <input placeholder="Email Id" value={settings.email || ""} disabled />
                            <input
                                placeholder="Phone Number"
                                maxLength={10}
                                value={settings.phone || ""}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                            {phoneError && <span className="JSettings-error">{phoneError}</span>}
                        </div>
                    )}

                    {tab === 'Communication' && (
                        <div className="JSettings-list">
                            <div className="JSettings-row">
                                <div className="JSettings-label-group">
                                    <span className="JSettings-label">Show Online Status</span>
                                    <p className="JSettings-desc">
                                        Your online status will be visible to employers during chat.
                                    </p>
                                </div>
                                <div className="JSettings-btn-group">
                                    <button
                                        className={online === 'yes' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => handleCommunicationChange('show_online_status', true)}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className={online === 'no' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => handleCommunicationChange('show_online_status', false)}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                            <div className="JSettings-row">
                                <div className="JSettings-label-group">
                                    <span className="JSettings-label">Show account activity</span>
                                    <p className="JSettings-desc">
                                        When disabled or switched to No, your profile will be hidden from employer searches and views.
                                    </p>
                                </div>
                                <div className="JSettings-btn-group">
                                    <button
                                        className={activity === 'yes' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => handleCommunicationChange('hide_cv', false)}false
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className={activity === 'no' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => handleCommunicationChange('hide_cv', true)}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'Security' && (
                        <div className="list">
                            {/* <div className="box">Security Settings</div> */}


                            <div className="box">
                                <div className="Ad-security-header" onClick={togglePasswordChange} style={{ cursor: 'pointer' }}>
                                    <div className="Ad-security-title-box">
                                        <span className="Ad-security-title">Change Password</span>
                                    </div>
                                    <img
                                        src={UpArrow}
                                        alt="toggle"
                                        width={10}
                                        className={isPasswordChange ? 'Ad-security-up' : 'Ad-security-down'}
                                    />
                                </div>
                                {isPasswordChange && <ChangePassword />}
                            </div>


                            <div className="box">
                                <div className="Ad-security-header" onClick={toggle2FA} style={{ cursor: 'pointer' }}>
                                    <div className="Ad-security-title-box">
                                        <span className="Ad-security-title">Two-Factor Authentication</span>
                                    </div>
                                    <img
                                        src={UpArrow}
                                        alt="toggle"
                                        width={10}
                                        className={is2FAOpen ? 'Ad-security-up' : 'Ad-security-down'}
                                    />
                                </div>
                                {is2FAOpen && <TwoFactorAuth userEmail={settings.email} userPhone={settings.phone} />}
                            </div>
                        </div>
                    )}

                    {tab === 'Privacy' && (
                        <div style={{ borderRadius: "10px" }} className="privacy">
                            <h2>Type Of Data Collected</h2>
                            <p>We collect different types of data depending on how you interact with us. This includes, for example,
                                when you're on our site, responding to our promotional materials, and using our services to help you find a job.
                                For example, we may collect your email address and resume information when you create your account.
                                As another example, we may collect information about your activity on our site, such as the searches you conduct and jobs you apply to.
                                For more information on the types of data we collect, check out the "Data collection and use" section of our Privacy Policy</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>How my data is used and disclosed</h2>
                            <p>Job App uses data to help people get jobs. How we use and disclose your data also depends on how you use our site. We go into much greater detail in the "Data collection and use"
                                and "Who we share your data with" sections of our Privacy Policy explaining our use and disclosure of your data, but this can include to provide our services to you, to protect you when you use our site, and to measure, improve, and promote our services.</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>Cookies</h2>
                            <p>Our Cookie Policy explains how we use cookies, web beacons and similar technologies, including some offered by third-parties, to collect data about you. For more information about our use of these technologies and your ability to opt out of them, please check out our Cookie Policy.</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>Hide My CV</h2>
                            <p>You can also set your Indeed Resume to "not searchable" by visiting your resume privacy settings. For more information on what it means to have a "searchable" or "not searchable" Indeed Resume, please visit the "Data collection and use" section of our Privacy Policy.</p>
                        </div>
                    )}

                    {/* Save Button - visible for Account and Communication tabs */}
                    {(tab === 'Account' || tab === 'Communication') && (
                        <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
                            <button
                                onClick={saveSettings}
                                disabled={loading}
                                style={{
                                    padding: "12px 40px",
                                    backgroundColor: loading ? "#ccc" : "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    fontSize: "16px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "background-color 0.3s"
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#0056b3";
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#007bff";
                                }}
                            >
                                {loading ? "Saving..." : "Save Settings"}
                            </button>
                            {saveMessage && (
                                <span style={{
                                    color: saveMessage.includes('successfully') ? 'green' : 'red',
                                    fontSize: "14px"
                                }}>
                                    {saveMessage}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};