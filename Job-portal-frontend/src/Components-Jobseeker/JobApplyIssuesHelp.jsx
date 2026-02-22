import React from "react";
import "./JobApplyIssuesHelp.css"; // Consolidated CSS file
import { Footer } from "../Components-LandingPage/Footer";
import JobApplyImg from "../assets/jobapplyissues.png";
import { FHeader } from './FHeader';

export const JobApplyIssuesHelp = () => {
  const applyHelpData = {
    title: "How to Apply for a Job",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Successfully applying for a job requires more than just submitting a document. Following a structured process increases your chances of connecting with the right employer.",
    sections: [
      {
        title: "1. Search for jobs in your field",
        content: [
          "When you look for jobs, consider searching for a variety of roles in your field. The internet is the most popular way to search for jobs, and websites like Indeed can make it easier to connect with employers.",
          "It's common to apply for several roles at once to increase your chances of getting an interview. Review your personal interests, qualifications, and expectations to decide which roles match your preferences."
        ]
      },
      {
        title: "2. Research companies with openings",
        content: [
          "Take time to research each company you are considering to determine if it's the right work environment for you. Start by visiting the company's website or looking for current news, reviews, and social media pages to learn more about the business culture."
        ]
      },
      {
        title: "3. Prepare your resume",
        content: [
          "Ensure your resume is up to date and customized for the specific job. Add your most recent education, skills, and experience in reverse chronological order.",
          "Review the job description and use keywords to highlight relevant skills. Always proofread your final document for any grammatical errors."
        ]
      },
      {
        title: "4. Decide if you need a cover letter",
        content: [
          "A cover letter is often optional unless specified in the job posting. It is particularly helpful for recent graduates or career changers to describe skills in more detail than a resume allows.",
          "If including one, ensure it introduces you well and explains why you are a good fit for the company."
        ]
      },
      {
        title: "5. Submit your resume and online application",
        content: [
          "Complete the online form typically found on the employer's website and attach your documents. Avoid copying and pasting details from your resume directly into the form to prevent formatting issues.",
          "Answer every question carefully and tailor your responses to meet the company's requirements."
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="Jobseekerhelp-page">
      <div className="Jobseekerhelp-container">
        <h1 className="Jobseekerhelp-title">{applyHelpData.title}</h1>
        <p className="Jobseekerhelp-updated">{applyHelpData.updatedDate}</p>
        <p className="Jobseekerhelp-intro">{applyHelpData.intro}</p>

        <div className="Jobseekerhelp-hero">
          <img
            src={JobApplyImg}
            alt="Job application process"
            className="Jobseekerhelp-hero-img"
          />
        </div>

        <div className="Jobseekerhelp-content">
          {applyHelpData.sections.map((section, index) => (
            <div key={index} className="Jobseekerhelp-section">
              <h2>{section.title}</h2>
              {section.content?.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}