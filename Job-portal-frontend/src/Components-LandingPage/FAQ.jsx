import React from "react";
import "./FAQ.css";
import { Header } from "../Components-LandingPage/Header";
import faqsImage from "../assets/FAQ.png";
import searchicon from "../assets/icon_search.png";
import { Footer } from "../Components-LandingPage/Footer";
import Backicon from "../assets/BackICON.png"
import { useNavigate } from "react-router-dom";

 
const faqs = [
  "Who can use your platform?",
  "How do I create an account?",
  "Who can use your platform?",
  "What if I forget my password?",
  "Can I update my profile?",
  "How do I search for jobs?",
  "How do I know if my application was received?",
  "Can I upload multiple versions of my resume?"
];
 
export const FAQ = () => {
    const navigate = useNavigate();
  return (
    <>
      <Header />
      <section
        className="faq-hero"
        style={{ backgroundImage: `url(${faqsImage})` }}
      >
        <div className="faq-hero-overlay">
          <h1>Hello, how can we support you?</h1>
          <div className="faq-search">
            <input type="text" placeholder="Enter a keyword search"/>
            <button><img src={searchicon} alt="search" /></button>
          </div>
        </div>
      </section>
 
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-info">
            <img src={Backicon} width={20} className="faq-back-icon" onClick={() => navigate(-1)} /> 
            <span className="faq-tag">Support</span>
            <h2>FAQS</h2>
            <p>Have any questions? We've got answers! Check out our Frequently Asked Questions (FAQs) to find out quick solutions to common queries. Save time and get the information you need right here.
            </p>
          </div>
 
          <div className="faq-list">
            {faqs.map((item, index) => (
              <div className="faq-row" key={index}>
                <p>{item}</p>
                <span className="faq-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      <Footer/>
    </>
  );
};
 
