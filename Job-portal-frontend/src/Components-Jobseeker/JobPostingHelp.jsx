import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import JobPostingImg from "../assets/jobposting.png";
import { FHeader } from './FHeader';

export const JobPostingHelp = () => {
  const employerData = {
    title: "How to post a job",
    updatedDate: "Updated 06 Feb 2026",
    intro: "An effective job posting is the first step in attracting the right talent. Follow these steps to ensure your listing reaches the most qualified candidates.",
    sections: [
      {
        title: "Instructions for job posting",
        list: [
          "Create an Employer Account: Register on the platform (e.g., Indeed.com/hire or LinkedIn) using your company email to gain access to the employer dashboard.",
          "Define the Role and Requirements: Before writing, determine the job title, key responsibilities, and required qualifications (skills, education, years of experience) to avoid mismatched applications.",
          "Draft a Clear, Searchable Job Title: Use standard, industry-recognized titles (e.g., 'Marketing Manager' instead of 'Marketing Ninja') to ensure your job appears in search results.",
          "Write an Engaging Job Description: Create a compelling summary that highlights the role's purpose, followed by 5–8 bullet points detailing daily duties and responsibilities.",
          "List Must-Have vs. Nice-to-Have Skills: Clearly differentiate mandatory qualifications from preferred ones to encourage the right candidates to apply without discouraging them with too many requirements.",
          "Include Salary and Benefits Information: Be transparent about the pay range and company perks, as this increases the likelihood of high-quality applications and builds trust.",
          "Specify Location and Work Type: State whether the position is on-site, remote, or hybrid, including the specific city or postal code.",
          "Add Screening Questions: Utilize screener questions (e.g., 'Do you have 3 years of experience in X?') to automatically filter out unqualified applicants and save time.",
          "Review and Post: Have a colleague review the job description for errors, then click 'Publish' or 'Post' to make the job live.",
          "Sponsor for Visibility (Optional): Consider paying to sponsor or promote your job post to increase its visibility and reach a larger pool of candidates, especially for urgent roles."
        ]
      },
      {
        title: "Additional Tips for Success",
        list: [
          "Keep it Mobile-Friendly: Ensure the description is easy to read on phones, using short paragraphs and bullet points.",
          "Add Company Culture: Briefly describe your company to help candidates visualize working there.",
          "Act Fast: Review applications daily to ensure you don't miss out on top talent to faster-moving competitors."
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="jobemployerhelp-page">
      <div className="jobemployerhelp-container">
        <h1 className="jobemployerhelp-title">{employerData.title}</h1>
        <p className="jobemployerhelp-updated">{employerData.updatedDate}</p>
        <p className="jobemployerhelp-intro">{employerData.intro}</p>

        <div className="jobemployerhelp-hero">
          <img
            src={JobPostingImg}
            alt="Job Posting Instructions"
            className="jobemployerhelp-hero-img"
          />
        </div>

        <div className="jobemployerhelp-content">
          {employerData.sections.map((section, index) => (
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