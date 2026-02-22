import React from "react";
import "./ResumeUploadHelp.css";
import { Footer } from "../Components-LandingPage/Footer";
import ResumeHelpImg from "../assets/resume-help.png";
import { FHeader } from "./FHeader";

export const ResumeUploadHelp = () => {

  const resumeHelpData = {
    title: "How to Make a Resume",
    sections: [
      {
        title: "Step 1: Gather Your Information",
        content: [
          "Before you start building your resume, gather all necessary details:"
        ],
        list: [
          "Personal Information: Name, phone number, email, and address (optional)",
          "Work Experience: Job titles, company names, employment dates, and responsibilities",
          "Education: Degrees, institutions, graduation dates, and relevant coursework",
          "Skills: Hard and soft skills related to the job you're targeting",
          "Certifications & Awards: Additional qualifications that set you apart",
          "Volunteer Experience: If applicable, include roles and contributions"
        ]
      },
      {
        title: "Step 2: Choose a Free Online Resume Builder",
        content: [
          "There are many free online resume builders that offer professional templates and easy-to-use interfaces."
        ],
        list: [
          "MyCVCreator.com: Free resume building, cover letter creation, and AI assistant support",
          "Canva: Customizable resume templates with drag-and-drop features",
          "Zety: Resume creation with templates and formatting tools",
          "Google Docs: Free resume templates under Template Gallery"
        ]
      },
      {
        title: "Step 3: Select a Resume Template",
        content: [
          "Choose a template that aligns with your industry and the job you are applying for:"
        ],
        list: [
          "Professional Templates: Ideal for corporate roles",
          "Creative Templates: Suitable for design, marketing, or media roles",
          "Simple Templates: Best for conservative industries like finance or law"
        ]
      },
      {
        title: "Step 4: Input Your Information",
        content: [
          "Most online resume builders offer guided input fields. Here's what to include:"
        ],
        list: [
          "Header: Your name, contact information, LinkedIn profile or personal website",
          "Professional Summary: 2-3 sentences highlighting expertise and career goals",
          "Work Experience: Listed in reverse chronological order focusing on achievements",
          "Education: Include relevant coursework if applicable",
          "Skills: Tailor skills to match the job description",
          "Additional Sections: Certifications, languages, or volunteer work"
        ]
      },
      {
        title: "Step 5: Customize for the Job",
        list: [
          "Tailor your resume content to match job requirements",
          "Use keywords from the job posting to improve ATS compatibility",
          "Quantify achievements (e.g., Increased sales by 30%)"
        ]
      },
      {
        title: "Step 6: Review and Proofread",
        list: [
          "Check spelling, grammar, and punctuation",
          "Ensure consistent font size and formatting",
          "Get feedback from a friend or tools like Grammarly"
        ]
      },
      {
        title: "Step 7: Download or Share Your Resume",
        list: [
          "Download formats: PDF, Word, or shareable links",
          "Test your resume on different devices"
        ]
      },
      {
        title: "Bonus Tips for a Free Online Resume",
        list: [
          "Keep it simple and ATS-friendly",
          "One page is ideal for most professionals",
          "Highlight key skills at the top"
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="resumehelp-page">
      <div className="resumehelp-container">
        <h1 className="resumehelp-title">
          {resumeHelpData.title}
        </h1>

        <div className="resumehelp-hero">
          <img
            src={ResumeHelpImg}
            alt="Resume help"
            className="resumehelp-hero-img"
          />
        </div>

        <div className="resumehelp-content">
          {resumeHelpData.sections.map((section, index) => (
            <div key={index} className="resumehelp-section">
              <h2>{section.title}</h2>

              {section.content &&
                section.content.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}

              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}