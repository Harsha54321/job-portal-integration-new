import React, { useState, useEffect } from 'react'
import './SupportHub.css'
import { PublishedPlans } from './PublishedPlans'
import { MembershipBilling } from './MembershipBilling'

// Wraps the Membership tab with Plans / Billing sub-tabs. Billing combines
// Orders (payments) and Subscriptions (access) into one screen so admin
// doesn't have to cross-check two separate places. Lets subscription_order_created
// and subscription_cancelled notifications deep-link into Billing.
export const MembershipHub = () => {
    const [activeTab, setActiveTab] = useState(() => {
        const requested = sessionStorage.getItem('adminMembershipTab')
        return requested || "Plans"
    })

    useEffect(() => {
        sessionStorage.removeItem('adminMembershipTab')
    }, [])

    return (
        <div className="SupportHub-container">
            <div className="SupportHub-tabs">
                <button className={`Ad-Settings-select ${activeTab === "Plans" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Plans")}
                >
                    Plans
                </button>

                <button className={`Ad-Settings-select ${activeTab === "Billing" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Billing")}
                >
                    Billing
                </button>
            </div>

            <div className="SupportHub-content">
                {activeTab === "Plans" && (<PublishedPlans />)}
                {activeTab === "Billing" && (<MembershipBilling />)}
            </div>
        </div>
    )
}
