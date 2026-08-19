import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import JobPostingImg from "../assets/employer-job-post.png";
import { FHeader } from './FHeader';

export const JobPostingHelp = () => {
  const employerData = {
    title: "How to Post a Job: Employer Guide",
    updatedDate: "Updated 27 Feb 2026",
    intro: "Attracting the right talent starts with a clear and structured job posting. Follow these steps to navigate the employer dashboard and publish your vacancy effectively.",

    summary: [
      "<strong>Access Dashboard:</strong> Sign in and navigate to the Employer console.",
      "<strong>Initiate Post:</strong> Click the 'Post a Job' button on the top-right.",
      "<strong>Job Details:</strong> Enter the Job Title, Department, and Employment Type.",
      "<strong>Description:</strong> Provide a clear summary of roles and responsibilities.",
      "<strong>Requirements:</strong> List mandatory skills, experience, and education.",
      "<strong>Location & Salary:</strong> Set the work location and salary range.",
      "<strong>Screening Questions:</strong> Add 'Knock-out' questions to filter candidates.",
      "<strong>Review & Publish:</strong> Preview the post and click 'Publish' to go live.",
      "<strong>Manage Apps:</strong> Monitor incoming applications from your 'Active Jobs' tab."
    ],

    sections: [
      {
        title: "1. Access & Initiation",
        list: [
          "<strong>Dashboard Entry:</strong> Sign in using your registered company credentials. Once in the Employer Console, take a moment to ensure your company profile is up to date; a complete profile acts as the foundation for candidate trust.",
          "<strong>Starting the Process:</strong> Locate and click the <strong>'Post a Job'</strong> button, usually found prominently on the top-right of your main dashboard."
        ]
      },
      {
        title: "2. Defining the Role (Job Details)",
        list: [
          "<strong>Job Title:</strong> Accuracy is king. Use industry-recognized titles (e.g., 'React Developer') rather than internal jargon like 'Code Ninja' to ensure your post appears in search results.",
          "<strong>Department & Type:</strong> Select the correct category and Employment Type (Full-time, Part-time, etc.). This helps our algorithm categorize your post and manages candidate expectations regarding benefits and stability."
        ]
      },
      {
        title: "3. Crafting the Description & Requirements",
        list: [
          "<strong>The 'Day in the Life':</strong> Don't just list tasks; explain the impact. Instead of 'Writes code,' try 'Collaborates with the design team to build user-facing features for 1 million monthly users.'",
          "<strong>Defining Must-Haves:</strong> List mandatory skills, experience levels (e.g., 2+ years), and education clearly. Distinguishing between <strong>Required</strong> and <strong>Preferred</strong> skills prevents overwhelming potential applicants.",
          "<strong>Keywords:</strong> Include specific tech stacks or tools (e.g., 'Python,' 'Django') within the description to improve your matching score."
        ]
      },
      {
        title: "4. Logistics (Location & Salary)",
        list: [
          "<strong>Work Model:</strong> Clearly define if the role is Remote (specify time zones if applicable), Hybrid, or strictly On-site.",
          "<strong>Salary Transparency:</strong> Transparency is the modern gold standard. Including a salary range leads to significantly higher engagement and ensures financial alignment before the first interview."
        ]
      },
      {
        title: "5. Filtering & Finalizing",
        list: [
          "<strong>Screening Questions:</strong> Use 'Knock-out' questions for non-negotiables (e.g., 'Do you have a valid work permit?'). The system will automatically filter unqualified candidates, saving you hours of manual review.",
          "<strong>Mobile-Friendly Check:</strong> Always check the mobile preview. Most candidates apply via mobile; if the text is a 'wall of bricks,' they will likely swipe past it.",
          "<strong>Publishing:</strong> Review for typos, confirm details, and click 'Publish' to make the listing live instantly."
        ]
      },
      {
        title: "6. Managing Applications",
        list: [
          "<strong>Active Tracking:</strong> Once live, monitor incoming resumes and track candidate progress from your 'Active Jobs' tab.",
          "<strong>The Need for Speed:</strong> Review applications daily. In a competitive market, top talent often receives multiple offers within 48 hours; aim for a quick turnaround for initial outreach."
        ]
      },
      {
        title: "💡 Pro-Tips for Maximum Impact",
        list: [
          "<strong>Optimized Searchability:</strong> Use terms a candidate would actually type into a search bar in both the title and the first paragraph.",
          "<strong>Define Your Culture:</strong> Briefly describe your company 'vibe'—whether it's a fast-paced startup or a stable, balance-focused environment—to help candidates visualize themselves in your team.",
          "<strong>Clear Formatting:</strong> Use bolding for headers and bullet points for responsibilities to make the post scannable on small screens."
        ]
      }
    ]
  };

  return (
    <>
      <FHeader />
      <div className="jobemployerhelp-page">
        <p className="jobemployerhelp-updated">{employerData.updatedDate}</p>

        <div className="jobemployerhelp-container">
          <h1 className="jobemployerhelp-title">{employerData.title}</h1>
          <p className="jobemployerhelp-intro">{employerData.intro}</p>

          {/* Centered Hero Image Section */}
          <div className="jobemployerhelp-hero-section">
            <img
              src={JobPostingImg}
              alt="Job Posting Process"
              className="jobemployerhelp-hero-img"
            />
          </div>

          {/* Posting Summary - Now moved down */}
          <div className="jobemployerhelp-summary-section">
            <div className="jobemployerhelp-steps-container">
              <h2 className="jobemployerhelp-summary-title">Posting Summary</h2>
              <ul className="jobemployerhelp-steps-list">
                {employerData.summary.map((item, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="jobemployerhelp-detailed-steps">
            <h2>Step-by-Step Job Posting Guide:</h2>

            {employerData.sections.map((section, index) => (
              <div key={index} className="jobemployerhelp-detailed-step">
                <h3>{section.title}</h3>
                {section.list && (
                  <ul>
                    {section.list.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
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
};