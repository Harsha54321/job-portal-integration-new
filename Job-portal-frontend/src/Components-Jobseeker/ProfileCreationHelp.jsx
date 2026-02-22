import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./ProfileCreationHelp.css";
import ProfileHelp from '../assets/profile-help.png'
import { FHeader } from "./FHeader";

export const ProfileCreationHelp = () => {

  const profileHelpData = {
    updatedDate: "Updated 13 Aug 2025",
    intro:
      "An online job profile is a powerful way to tell employers about yourself by highlighting your skills and experience.",
    sections: [
      {
        title: "Getting started",
        content: [
          "An online job profile is like your own shop window. You can show employers what you have to offer, and make it easy for them to find you.",
          "Employers often check online profiles when deciding who to interview, so keep it smart and professional."
        ],
        list: [
          "Make a profile on a networking site like LinkedIn",
          "Make a profile on a job ad website like SEEK",
          "Create your own website",
          "Make a creative portfolio",
          "Create an account on a company career hub"
        ]
      },
      {
        title: "Tips for creating an online job profile",
        content: [
          "Think of your job profile as an online CV. Here are some tips for creating your profile."
        ],
        list: [
          "Highlight the skills you have to offer at the top - even in your headline",
          "List your skills, experience and qualifications",
          "Include your contact information and location",
          "Use a headshot photo that looks professional",
          "Use a professional email address like sam.long@website.com",
          "If you need to create a username make it professional",
          "Upload a video CV if you have one",
          "Check it for spelling and other errors",
          "Always keep it up to date"
        ]
      },
      {
        title: "Getting started on LinkedIn and other job websites",
        content: [
          "People doing all types of mahi use LinkedIn to find new jobs and connect with others.",
          "LinkedIn is a useful social media network that you can use to tell others about your skills and experience.",
          "You can connect with past and current colleagues, people who work in your industry and employers."
        ],
        list: [
          "use a great photo",
          "have a strong headline and smart summary",
          "share your interests and personality",
          "highlight relevant experience",
          "use keywords, like job titles and skills, for good search results"
        ]
      },
      {
        title: "Start your own website",
        content: [
          "Setting up your own website is another way to create an online job profile that showcases your skills and experience.",
          "With your own website you can decide what information to put on it and how you want it to look."
        ]
      },
      {
        title: "Creative portfolios",
        content: [
          "If you're trying to get started or already work in a creative visual industry, having an online portfolio means you can easily show off your work.",
          "You can include a creative portfolio on your own website or use portfolio-hosting websites.",
          "Include a link to your creative portfolio in your CV, cover letter and online profile."
        ]
      },
      {
        title: "Company career hubs",
        content: [
          "Many large employers have career hubs you can sign up for.",
          "When jobs become available that match what you're looking for, you'll get an email with details on how to apply.",
          "If there's a company youd like to work for, visit their website and sign up."
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="profilehelp-page">
      <div className="profilehelp-container">
        <h1 className="profilehelp-title">
          How to create an online job profile
        </h1>

        <p className="profilehelp-updated">
          {profileHelpData.updatedDate}
        </p>

        <p className="profilehelp-intro">
          {profileHelpData.intro}
        </p>

        <div className="profilehelp-hero">
          <img
            src={ProfileHelp}
            alt="Profile help"
            className="profilehelp-hero-img"
          />
        </div>

        <div className="profilehelp-content">
          {profileHelpData.sections.map((section, index) => (
            <div key={index} className="profilehelp-section">
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