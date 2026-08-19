import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./TechnicalIssues.css";
import PageErrorImg from "../assets/Pageerror.png";
import { FHeader } from "./FHeader";

export const PageErrorsHelp = () => {
  const pageErrorData = {
    title: "Common Page Errors & Root Causes",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Encountering an error while navigating the portal? Most page errors are temporary and can be resolved by understanding their underlying causes. Review the list below for troubleshooting guidance.",

    summary: [
      "<strong>Refresh the Page:</strong> Many errors resolve with a simple page refresh (F5 or Ctrl+R).",
      "<strong>Check Internet Connection:</strong> Ensure you have a stable network connection.",
      "<strong>Clear Browser Cache:</strong> Clear cached files and cookies to fix loading issues.",
      "<strong>Try Different Browser:</strong> Switch to Chrome or Firefox for better compatibility.",
      "<strong>Disable Ad-Blockers:</strong> Some extensions may block page functionality.",
      "<strong>Check Session Status:</strong> You may need to log in again if your session expired.",
      "<strong>Update Your Browser:</strong> Ensure you're using the latest browser version.",
      "<strong>Contact Support:</strong> If issues persist, reach out to our help team."
    ],

    issues: [
      {
        problem: "Job Not Found",
        why: "The job you are trying to view is no longer available.",
        rootCause: "The employer may have removed the job, the job posting may have expired, or the link is outdated."
      },
      {
        problem: "Page Not Loading",
        why: "The page takes too long to load or does not open.",
        rootCause: "Slow internet connection, temporary server issue, or high traffic on the platform."
      },
      {
        problem: "Blank Screen After Login",
        why: "The dashboard or profile page appears empty.",
        rootCause: "Temporary system issue, incomplete page loading, or session interruption."
      },
      {
        problem: "Search Results Not Showing",
        why: "No jobs appear after performing a search.",
        rootCause: "Filters may be too restrictive, no jobs match your criteria, or a temporary search system issue."
      },
      {
        problem: "Apply Button Not Responding",
        why: "Clicking the Apply button does nothing or does not proceed.",
        rootCause: "You may not be logged in, your session may have expired, or the job is no longer accepting applications."
      },
      {
        problem: "Profile Changes Not Saving",
        why: "Updates made to your profile do not reflect after saving.",
        rootCause: "Temporary system delay, internet disruption during saving, or incomplete required fields."
      },
      {
        problem: "Access Denied Message",
        why: "You are unable to access a specific page.",
        rootCause: "You may not have permission to view that page or your login session has expired."
      },
      {
        problem: "Session Expired",
        why: "You are automatically logged out while browsing.",
        rootCause: "Sessions expire after a period of inactivity for security reasons."
      },
      {
        problem: "Something Went Wrong Message",
        why: "A general error message appears without details.",
        rootCause: "Temporary technical issue within the platform requiring a refresh or retry."
      },
      {
        problem: "File or Image Not Displaying",
        why: "Profile pictures, logos, or documents are not visible.",
        rootCause: "Temporary loading issue, browser cache problem, or unsupported file format."
      }
    ]
  };

  return (
    <>
      <FHeader />
      <div className="technicalhelp-page">
        <p className="technicalhelp-updated">{pageErrorData.updatedDate}</p>

        <div className="technicalhelp-container">
          <h1 className="technicalhelp-title">{pageErrorData.title}</h1>
          <p className="technicalhelp-intro">{pageErrorData.intro}</p>

          {/* Centered Hero Image Section */}
          <div className="technicalhelp-hero">
            <img
              src={PageErrorImg}
              alt="Page Error Troubleshooting Illustration"
              className="technicalhelp-hero-img"
            />
          </div>

          {/* Quick Summary - Now moved down */}
          <div className="technicalhelp-summary-section">
            <div className="technicalhelp-summary-container">
              <h2 className="technicalhelp-summary-title">Quick Troubleshooting Summary</h2>
              <ul className="technicalhelp-summary-list">
                {pageErrorData.summary.map((item, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Issues List - One by One */}
          <div className="technicalhelp-content">
            <h2 className="technicalhelp-issues-title">Detailed Error Breakdown</h2>
            <div className="technicalissue-list">
              {pageErrorData.issues.map((item, index) => (
                <div key={index} className="technicalissue-item">
                  <div className="technicalissue-number">{index + 1}</div>
                  <div className="technicalissue-details">
                    <h3>{item.problem}</h3>
                    <p><strong>Why this error appears:</strong> {item.why}</p>
                    <p><strong>Root Cause:</strong> {item.rootCause}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};