import React, { useState } from 'react'
import { FHeader } from '../Components-Jobseeker/FHeader';
import { Footer } from '../Components-LandingPage/Footer'
import ContactImage from '../assets/Contactus.png'
import './ContactUs.css'

export const ContactUs = () => {
  const initialValues = { name: "", email: "", contact: "", message: "" }
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formValues.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formValues.contact.trim()) {
      newErrors.contact = "Contact number is required"
    }
    if (!formValues.message.trim()) {
      newErrors.message = "Message cannot be empty"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(formData) {
    if (!validateForm()) {
      return false 
    }
    console.log("Submitted successfully", formValues)
  }

  return (
    <div className="contact-page">
      <FHeader />

      <div className="contact-container">
        <div className="contact-left">
          <img src={ContactImage} alt="Contact Us" />
        </div>

        <div className="contact-right">
          <h2>Contact Us</h2>
          <p className="contact-subtitle">Send us messages</p>
          <p className="contact-desc">
            Do you have a question? or need any help
          </p>

          <form action={handleSubmit} className="contact-form">
            <div className="contact-form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter your name" 
                value={formValues.name} 
                onChange={handleForm} 
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="contact-form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email ID" 
                value={formValues.email} 
                onChange={handleForm}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="contact-form-group">
              <label>Contact number</label>
              <input 
                type="text" 
                name="contact"
                placeholder="Enter your number" 
                value={formValues.contact} 
                onChange={handleForm}
                className={errors.contact ? "input-error" : ""}
              />
              {errors.contact && <span className="error-msg">{errors.contact}</span>}
            </div>

            <div className="contact-form-group">
              <label>Message</label>
              <textarea 
                name="message"
                placeholder="Type something..." 
                value={formValues.message} 
                onChange={handleForm}
                className={errors.message ? "input-error" : ""}
              />
              {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <button 
                type="submit" 
                className="contact-submit-btn"
                style={{ width: "100px", padding: "15px" }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}