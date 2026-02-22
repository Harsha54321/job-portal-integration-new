import React from "react";
import "./JobApplyIssuesHelp.css"; 
import { Footer } from "../Components-LandingPage/Footer";
import InterviewImg from "../assets/interviewschedule.png";
import { FHeader } from './FHeader';

export const InterviewSchedulingHelp = () => {
  const interviewData = {
    title: "The Basic Steps for Interview Scheduling",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Scheduling is the first official step in the interview process. Handling this professionally sets a positive tone for your upcoming meeting with the employer.",
    sections: [
      {
        title: "1. Receive and Review the Invitation",
        content: [
          "Employers usually reach out via email or through platforms like Indeed to invite you to an interview.",
        ],
        list: [
          "Check for Details: Ensure the invitation specifies the job title, format (phone, video, or in-person), and duration.",
          "Identify the Interviewers: Look for names and titles to research them on LinkedIn beforehand."
        ]
      },
      {
        title: "2. Confirm or Select a Time Slot",
        content: [
          "You will typically pick a time from a provided list or suggest your own availability."
        ],
        list: [
          "Use Self-Scheduling Tools: Many companies use tools like Calendly or Jobvite to allow direct slot selection.",
          "Propose Multiple Options: If replying manually, suggest 2–3 specific windows to reduce back-and-forth communication.",
          "Optimal Timing: Mid-morning (9:00 AM – 11:00 AM) Tuesday through Thursday is often considered best for engagement."
        ]
      },
      {
        title: "3. Finalize Logistics and Confirmation",
        content: [
          "Once a time is agreed upon, ensure you have all necessary 'joining' information."
        ],
        list: [
          "Get the Link or Address: Confirm you have the virtual meeting link or the physical office floor and parking instructions.",
          "Sync to Your Calendar: Use the calendar invite sent by the recruiter to prevent double-bookings.",
          "Confirm Requirements: Check if you need to prepare specific documents (ID, portfolio) or complete assessments."
        ]
      },
      {
        title: "4. Manage Rescheduling (If Necessary)",
        content: [
          "Only reschedule if absolutely necessary, such as for illness or an emergency."
        ],
        list: [
          "Act Fast: Notify the recruiter as soon as you know you cannot attend.",
          "Offer Solutions: Suggest alternative times immediately and apologize for the inconvenience."
        ]
      },
      {
        title: "5. Follow-up and Reminders",
        list: [
          "Acknowledgment: Send a brief 'thank you' email once the interview is booked to confirm you are all set.",
          "Check Reminders: Watch for automated reminders, often sent 24 hours before the meeting."
        ]
      }
    ]
  };

  return (
    <>
    
      <FHeader />
      <div className="Jobseekerhelp-page">
      <div className="Jobseekerhelp-container">
        <h1 className="Jobseekerhelp-title">{interviewData.title}</h1>
        <p className="Jobseekerhelp-updated">{interviewData.updatedDate}</p>
        <p className="Jobseekerhelp-intro">{interviewData.intro}</p>

        <div className="Jobseekerhelp-hero">
          <img
            src={InterviewImg}
            alt="Interview scheduling guide"
            className="Jobseekerhelp-hero-img"
          />
        </div>

        <div className="Jobseekerhelp-content">
          {interviewData.sections.map((section, index) => (
            <div key={index} className="Jobseekerhelp-section">
              <h2>{section.title}</h2>
              {section.content?.map((text, i) => (
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