import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reportsubmitted from '../assets/Report_Submitted.png'
import './RaiseTicket.css';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from '../Components-Jobseeker/FHeader';
import axios from 'axios';
import api from '../api/axios';
 
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
    const [errors, setErrors] = useState({});
 
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
 
    const validateForm = () => {
        const errors = {};
       
        if (!formData.message.trim()) {
            errors.message = "Message is required";
        }
 
        if (!formData.category) {
            errors.category = "Category is required";
        }
 
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            errors.name = "Name should contain only letters";
        }
 
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail|fabaos)\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
 
        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
            errors.phone = "Phone must be exactly 10 digits";
        } else if (/^(\d)\1{9}$/.test(formData.phone)) {
            errors.phone = "Phone cannot be all same digits";
        }
 
        if (!formData.subject) {
            errors.subject = "Subject is required";
        }
 
        return errors;
    };
 
    const handleSubmitClick = (e) => {
        e.preventDefault();
        const errors = validateForm();
 
        if (Object.keys(errors).length > 0) {
            console.log(errors);
            setErrors(errors);
            return;
        }
 
        setStep('confirming');
    };
 
    const handleConfirm = async () => {
        try {
            setStep('loading');
            const data = new FormData();
            data.append("category", formData.category);
            data.append("subject", formData.subject);
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("message", formData.message || '');
            if (formData.attachment) {
                data.append("attachment", formData.attachment);
            }
            const response = await api.post(
                "raise-ticket/", data
                // "http://127.0.0.1:8000/api/raise-ticket/",data,{
                //     headers:{
                //         "Content-Type":"mulitipart/form-data",
                //     },
 
                // }
            );
            console.log("SUCCESS:", response.data);
            setTimeout(() => {
                setStep('success');
                setTimeout(() => {
                    navigate('/Job-portal/jobseeker/help-center');
                }, 2000);
            }, 1500);
        } catch (error) {
            console.error("ERROR:", error.response?.data || error);
            alert("Ticket submission failed");
            setStep('form');
        }
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
                                <div className={`Raiseticket-custom-select ${showCategory ? 'open' : ''} ${errors.category? 'Raiseticket-custom-select-err':''}`} onClick={() => setShowCategory(!showCategory)}>
                                    {formData.category || "Select type"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showCategory && (
                                        <ul className="Raiseticket-options">
                                            <li onClick={() => setFormData({ ...formData, category: 'Jobseeker' })}>Jobseeker</li>
                                            <li onClick={() => setFormData({ ...formData, category: 'Employer' })}> Employer</li>
                                        </ul>
                                    )}
                                </div>
                                {errors.category && <span className='form-group-err'>{errors.category}</span>}
                            </div>
 
 
                            <div className="Raiseticket-form-group">
                                <label>Subject*</label>
                                <div className={`Raiseticket-custom-select ${showSubject ? 'open' : ''} ${errors.subject? 'Raiseticket-form-group-err':''}`} onClick={() => setShowSubject(!showSubject)}>
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
                                {errors.subject && <span className='form-group-err'>{errors.subject}</span>}
                            </div>
 
                            <div className={`Raiseticket-form-group`}>
                                <label>Name*</label>
                                <input
                                className={`${errors.name? 'Raiseticket-form-group-err':''}`}
                                type="text" placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(value)) {
                                        setFormData({ ...formData, name: value });
                                        }
                                    }} />
                                    {errors.name && <span className='form-group-err'>{errors.name}</span>}
                            </div>
 
                            <div className="Raiseticket-form-group">
                                <label>Email*</label>
                                <input type="email" placeholder="Enter email ID"
                                    className={`${errors.email? 'Raiseticket-form-group-err':''}`}
                                    value={formData.email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, email: value });
                                    }} />
                                    {errors.email && <span className='form-group-err'>{errors.email}</span>}
                            </div>
 
                            <div className="Raiseticket-form-group">
                                <label>Phone number*</label>
                                <input type='tel' placeholder="Enter phone number"
                                    className={`${errors.phone? 'Raiseticket-form-group-err':''}`}
                                    value={formData.phone}
                                    maxLength={10}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "");
 
                                        if (value.length === 0) {
                                            setFormData({ ...formData, phone: "" });
                                            return;
                                        }
 
                                        if (!/^[6-9]/.test(value)) {
                                            return;
                                        }
 
                                        if (value.length <= 10) {
                                            setFormData({ ...formData, phone: value });
                                        }
                                    }} />
                                    {errors.phone && <span className='form-group-err'>{errors.phone}</span>}
                            </div>
 
                            <div className="Raiseticket-form-group">
                                <label>Message</label>
                                <textarea placeholder="Describe the issue here..." rows="4"
                                    className={`${errors.message? 'Raiseticket-form-group-err':''}`}
                                    maxLength={500}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
                                    {errors.message && <span className='form-group-err'>{errors.message}</span>}
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