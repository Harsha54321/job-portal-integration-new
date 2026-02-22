import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import InvoiceImg from "../assets/Invoicepayment.png";
import { FHeader } from './FHeader';

export const InvoicePaymentHelp = () => {
  const paymentData = {
    title: "How to manage invoices and payments",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Timely and accurate payment processing ensures uninterrupted access to your hiring tools. Use this guide to navigate our billing and reconciliation process.",
    sections: [
      {
        title: "Key Steps for Invoice & Payment Processing",
        list: [
          "Receive Invoice: Obtain the invoice from the vendor via email or document submission.",
          "Verify Vendor Details: Ensure the vendor profile, including PAN and bank details, is updated and correct.",
          "Match with PO/Receipts: Match the invoice against the Purchase Order (PO) and goods receipt note to ensure accuracy.",
          "Validate Data: Check invoice numbers, dates, amounts, and tax details (GST) for correctness.",
          "Get Approvals: Route the invoice through necessary internal authorization channels.",
          "Record Invoice: Enter the invoice into the Accounting/ERP system (e.g., SAP).",
          "Schedule Payment: Set up the payment date based on agreed terms (e.g., Net 30).",
          "Process Payment: Execute payment via electronic transfer (ACH or wire).",
          "Resolve Disputes: Handle any discrepancies, rejected invoices, or duplicate queries.",
          "Reconcile Records: Perform vendor reconciliation and update payment records."
        ]
      },
      {
        title: "Financial Best Practices",
        list: [
          "Automate Notifications: Enable billing alerts to receive an email as soon as a new invoice is generated.",
          "Downloadable Receipts: Always download and save a PDF copy of your transaction for your tax records.",
          "Maintain Updated Credit Info: Ensure your primary credit card is valid to prevent service interruptions due to failed recurring payments."
        ]
      }
    ]
  };

  return (
    <>
    <FHeader />
    <div className="jobemployerhelp-page">
      
      <div className="jobemployerhelp-container">
        <h1 className="jobemployerhelp-title">{paymentData.title}</h1>
        <p className="jobemployerhelp-updated">{paymentData.updatedDate}</p>
        <p className="jobemployerhelp-intro">{paymentData.intro}</p>

        <div className="jobemployerhelp-hero">
          <img
            src={InvoiceImg}
            alt="Invoice and Payment Processing Illustration"
            className="jobemployerhelp-hero-img"
          />
        </div>

        <div className="jobemployerhelp-content">
          {paymentData.sections.map((section, index) => (
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