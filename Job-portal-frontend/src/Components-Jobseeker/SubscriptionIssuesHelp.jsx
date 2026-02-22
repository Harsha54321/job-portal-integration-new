import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import SubscriptionImg from "../assets/subscriptionissues.png";
import { FHeader } from "./FHeader";

export const SubscriptionIssuesHelp = () => {
  const subscriptionData = {
    title: "How to resolve subscription issues",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Managing your membership effectively is key to avoiding unwanted charges. Follow this guide to locate, manage, or cancel your active subscriptions.",
    sections: [
      {
        title: "Instructions for Subscription Issues",
        list: [
          "Locate the Correct Subscription Method: Determine if you subscribed through the app directly (via website/credit card) or via the Apple App Store or Google Play Store, as the cancellation process differs.",
          "Log In and Check Settings: Sign in to your account, go to your profile, and check the 'Settings,' 'Billing,' or 'Subscription' section to view the status of your membership.",
          "Cancel the Subscription Immediately: If you wish to stop charges, locate the 'Cancel' or 'Cancel Subscription' button within the app settings or your app store's subscription manager.",
          "Confirm Cancellation via Email: Ensure you receive a confirmation email from the service confirming the cancellation to act as proof if charges continue.",
          "Verify Payment Method Status: If the subscription is failing, check that your credit card or bank account has sufficient funds and is authorized for recurring payments.",
          "Contact Support Directly: If you cannot cancel within the app, immediately contact customer support via email or their official contact form to request cancellation.",
          "Gather Proof of Cancellation: Keep all emails, receipts, and take screenshots of your 'cancelled' status within the app to use as evidence for any refund disputes.",
          "Request a Refund (If Applicable): If you were charged after cancelling or if the subscription was not clearly advertised, request a refund immediately, citing specific dates.",
          "Block Further Charges with Your Bank: If charges continue despite cancellation, contact your bank to block further transactions or initiate a chargeback.",
          "File a Complaint on Consumer Platforms: If the service remains unresponsive, file a complaint on consumer protection sites to enforce your rights."
        ]
      },
      {
        title: "Important Tips for Job Seeker Apps",
        list: [
          "Trial Terms: Many job apps offer a low-cost trial ($0.01) that automatically converts to a full, high-cost monthly subscription if not canceled.",
          "No Refunds Policy: Some apps have a 'no refund' policy for changes of mind, making timely cancellation critical.",
          "App Deletion Isn't Cancellation: Uninstalling the app from your phone does not cancel the subscription. You must cancel through settings."
        ]
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="jobemployerhelp-page">
      <div className="jobemployerhelp-container">
        <h1 className="jobemployerhelp-title">{subscriptionData.title}</h1>
        <p className="jobemployerhelp-updated">{subscriptionData.updatedDate}</p>
        <p className="jobemployerhelp-intro">{subscriptionData.intro}</p>

        <div className="jobemployerhelp-hero">
          <img
            src={SubscriptionImg}
            alt="Subscription Management Illustration"
            className="jobemployerhelp-hero-img"
          />
        </div>

        <div className="jobemployerhelp-content">
          {subscriptionData.sections.map((section, index) => (
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