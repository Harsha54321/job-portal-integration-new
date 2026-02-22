import React from 'react'
import { Header } from '../Components-LandingPage/Header'
import { Footer } from '../Components-LandingPage/Footer'
import ContactImage from '../assets/Contactus.png'
import './ContactUs.css'
export const ContactUs = () => {
  return (
    <div className="contact-page">
      <Header />
 
      <div className="contact-container">
       
        <div className="contact-left">
          <img src={ContactImage} alt="Contact Us" />
        </div>

        <div className="contact-right" >
            
          <h2>Contact Us</h2>
          <p className="contact-subtitle">Send us messages</p>
          <p className="contact-desc">
            Do you have a question? or need any help
          </p>
          
          <form className="contact-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>
 
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email ID" />
            </div>
 
            <div className="form-group">
              <label>Contact number</label>
              <input type="text" placeholder="Enter your number" />
            </div>
 
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Type something..." />
            </div>
            
          </form>
          
        </div>
        
      </div>
      <div style={{display:"flex", justifyContent:"center"}}>
        <button style={{display:"flex", justifyContent:"center",textAlign:"center", width:"100px",padding:"15px"}} type="submit" className="submit-btn">
              Submit
            </button>
            </div>
      
 
      <Footer />
    </div>
  )
}
 