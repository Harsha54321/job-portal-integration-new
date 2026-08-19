import React, { useState, useEffect } from 'react'
import './SupportHub.css'
import { AdminTickets } from './AdminTickets'
import { Escalation } from './Escalation'
import { Enquiries } from './Enquiries'
// import { Tickets } from './AdminTickets'
// import { Escalation } from './Escalation'
// import { Enquiries } from './Enquiries'

export const SupportHub = () => {
    // If a notification click asked for a specific sub-tab (Tickets /
    // Escalation / Enquiries), open straight into it, then clear the flag
    // so a normal visit to SupportHub still defaults to Tickets.
    const [activeTab, setActiveTab] = useState(() => {
        const requested = sessionStorage.getItem('adminSupportHubTab')
        return requested || "Tickets"
    })

    useEffect(() => {
        sessionStorage.removeItem('adminSupportHubTab')
    }, [])

    return (
        <div className="SupportHub-container">
            <div className="SupportHub-tabs">
                <button className={`Ad-Settings-select ${activeTab === "Tickets" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Tickets")}
                >
                    Tickets
                </button>

                <button className={`Ad-Settings-select ${activeTab === "Escalation" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Escalation")}
                >
                    Reports
                </button>

                <button className={`Ad-Settings-select ${activeTab === "Enquiries" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Enquiries")}
                >
                    Enquiries
                </button>
            </div>

            <div className="SupportHub-content">
                {activeTab === "Tickets" && (<AdminTickets />)}
                {activeTab === "Escalation" && (<Escalation />)}
                {activeTab === "Enquiries" && (<Enquiries />)}
            </div>
        </div>
    )
}
