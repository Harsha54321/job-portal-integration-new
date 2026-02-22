import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reportsubmitted from '../assets/Report_Submitted.png'
import './RaiseTicket.css';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from './FHeader';


export const RaiseTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [step, setStep] = useState('form');
    const [showCategory, setShowCategory] = useState(false);
    const [showSubject, setShowSubject] = useState(false);

    const subjects = [
        "Broken 'Apply' Button/Application Failure",
        "File Upload/Resume Parsing Errors",
        "Outdated or Ghost Job Listings",
        "Incorrect/Irrelevant Search Results & Filters",
        "Profile Update/Saved Data Not Saving",
        "Application Status Unchanged/Limbo",
        "Broken Job Alerts & Notifications",
        "Login/Registration Issues (Social Login Bugs)",
        "Site Incompatibility/Non-Responsive Mobile Layout",
        "Duplicate Job Listings (Spam)",
        "Others"
    ];

    const handleSubmitClick = (e) => {
        e.preventDefault();
        setStep('confirming');
    };

    const handleConfirm = () => {
        setStep('loading');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                navigate('/Job-portal/jobseeker/help-center');
            }, 2000);
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div>
                <FHeader />
                <div className="Raiseticket-status-container">
                    {step === 'loading' ? (
                        <div className="Raiseticket-loader"></div>
                    ) : (
                        <div className="Raiseticket-success-msg">
                            <img src={Reportsubmitted} alt="ReportSubmitted" />
                            <h2> Report Submitted Successfully</h2>

                        </div>
                    )}
                </div>
                <Footer />
            </div>

        );
    }

    return (
        <>
            <FHeader />
            <div className="Raiseticket-main-wrapper">

                <div className="Raiseticket-page">
                    <div className="Raiseticket-header">
                        <h1>Ticket Raise</h1>
                        <p>We're here to help.</p>
                        <p>Raise a ticket and we'll get back to you soon</p>
                    </div>

                    <div className="Raiseticket-card">
                        <form onSubmit={handleSubmitClick}>

                            <div className="Raiseticket-form-group">
                                <label>Category*</label>
                                <div className={`Raiseticket-custom-select ${showCategory ? 'open' : ''}`} onClick={() => setShowCategory(!showCategory)}>
                                    {formData.category || "Select type"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showCategory && (
                                        <ul className="Raiseticket-options">
                                            <li onClick={() => setFormData({ ...formData, category: 'Jobseeker' })}>Jobseeker</li>
                                            <li onClick={() => setFormData({ ...formData, category: 'Employer' })}>Employer</li>
                                        </ul>
                                    )}
                                </div>
                            </div>


                            <div className="Raiseticket-form-group">
                                <label>Subject*</label>
                                <div className={`Raiseticket-custom-select ${showSubject ? 'open' : ''}`} onClick={() => setShowSubject(!showSubject)}>
                                    {formData.subject || "Select an issue"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showSubject && (
                                        <ul className="Raiseticket-options scrollable">
                                            {subjects.map(s => (
                                                <li key={s} onClick={() => setFormData({ ...formData, subject: s })}>{s}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Name*</label>
                                <input type="text" placeholder="Enter full name" required
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Email*</label>
                                <input type="email" placeholder="Enter email ID" required
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Phone number*</label>
                                <input type="tel" placeholder="Enter phone number" required
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Message</label>
                                <textarea placeholder="Describe the issue here..." rows="4"
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Attachment</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                <div
                                    className="Raiseticket-file-input"
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    {formData.attachment ? (
                                        <span style={{ color: '#2563eb', fontWeight: '500' }}>
                                            {formData.attachment.name}
                                        </span>
                                    ) : (
                                        "Click to attach a file"
                                    )}
                                </div>
                                <small className="file-info">Accepted formats: PDF, DOC, DOCX, TXT, PNG, JPG (Max 10MB)</small>
                            </div>

                            <div className="Raiseticket-form-actions">
                                <button type="button" className="Raiseticket-btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                                <button type="submit" className="Raiseticket-btn-submit">Submit</button>
                            </div>
                        </form>
                    </div>

                    {step === 'confirming' && (
                        <div className="Raiseticket-modal-overlay">
                            <div className="Raiseticket-modal">
                                <h3>Please confirm before submit</h3>
                                <div className="Raiseticket-modal-buttons">
                                    <button className="Raiseticket-btn-yes" onClick={handleConfirm}>Yes</button>
                                    <button className="Raiseticket-btn-no" onClick={() => setStep('form')}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </>
    );
};