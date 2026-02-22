import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import CandidateSearchImg from "../assets/candidatesearch.png";
import { FHeader } from './FHeader';

export const CandidateSearchHelp = () => {
  const candidateData = {
    title: "How to use candidate search",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Finding the right talent requires a strategic approach. Use our search tools to identify, engage, and secure high-quality candidates for your team.",
    sections: [
      {
        title: "Instructions for the candidate search",
        list: [
          "Define Hiring Needs and Job Requirements: Clearly outline the job title, responsibilities, necessary skills, and mandatory qualifications.",
          "Draft an Impactful Job Description (JD): Create a clear, compelling, and realistic JD that highlights the role's impact, growth opportunities, and company culture.",
          "Develop an Employer Brand/EVP: Define your Employer Value Proposition (EVP)—what makes your company a great place to work—to attract passive candidates.",
          "Determine Sourcing Strategy: Identify the best channels for the role, such as niche job boards, LinkedIn, social media, or campus hiring.",
          "Utilize Employee Referrals: Leverage your team's network by implementing a referral program, as referred candidates often fit better and hire faster.",
          "Search for Passive Talent: Actively look for high-skilled candidates who are not actively searching for jobs, using LinkedIn Recruiter or niche databases.",
          "Optimize the Application Process: Make the application mobile-friendly and simple to reduce candidate drop-off rates.",
          "Screen and Shortlist Candidates: Review resumes for key qualifications and use Applicant Tracking Systems (ATS) or initial screening calls to filter top applicants.",
          "Conduct Structured Interviews: Use a standardized set of behavioral and competency-based questions for all candidates to ensure fairness and reduce bias.",
          "Engage and Secure Talent: Offer a great candidate experience through quick, transparent communication, and move quickly to make a competitive, detailed offer."
        ]
      },
      {
        title: "Key Tips for Success",
        list: [
          "Prioritize Diversity (DEI): Actively search diverse talent pools and use inclusive language in job descriptions.",
          "Use Data-Driven Decisions: Track metrics like time-to-fill and source-of-hire to see which platforms work best.",
          "Invest in Relationships: Build a 'warm bench' of potential candidates even when you don't have an open role."
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="jobemployerhelp-page">
      <div className="jobemployerhelp-container">
        <h1 className="jobemployerhelp-title">{candidateData.title}</h1>
        <p className="jobemployerhelp-updated">{candidateData.updatedDate}</p>
        <p className="jobemployerhelp-intro">{candidateData.intro}</p>

        <div className="jobemployerhelp-hero">
          <img
            src={CandidateSearchImg}
            alt="Candidate Search Illustration"
            className="jobemployerhelp-hero-img"
          />
        </div>

        <div className="jobemployerhelp-content">
          {candidateData.sections.map((section, index) => (
            <div key={index} className="jobemployerhelp-section">
              <h2>{section.title}</h2>
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