
import React, { useState, useEffect } from 'react';
import './MembershipPlans.css';
import api from '../api/axios';

export const MembershipPlans = ({ onSelectPlan }) => {
    const [activeTab, setActiveTab] = useState('monthly');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const normalizePlanName = (planName) => {
        const upperName = planName.toUpperCase();
        if (upperName.includes('STARTER')) return 'STARTER PLAN';
        if (upperName.includes('BUSINESS')) return 'BUSINESS PLAN';
        if (upperName.includes('ENTERPRISE')) return 'ENTERPRISE PLAN';
        return planName.toUpperCase();
    };

    const getDisplayName = (planName) => {
        const normalizedName = normalizePlanName(planName);
        if (normalizedName === 'STARTER PLAN') return 'STARTER PLAN';
        if (normalizedName === 'BUSINESS PLAN') return 'BUSINESS PLAN';
        if (normalizedName === 'ENTERPRISE PLAN') return 'ENTERPRISE PLAN';
        return planName.toUpperCase();
    };

    useEffect(() => {
        fetchPlans();
    }, [activeTab]);

    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            // Map frontend tab names to backend duration values
            const durationMap = {
                'monthly': 'monthly',
                '6 Months': '6_months',
                'yearly': 'yearly'
            };

            const duration = durationMap[activeTab] || 'monthly';
            const response = await api.get(`/plans/?duration=${duration}`);
            setPlans(response.data);
        } catch (err) {
            console.error('Error fetching plans:', err);
            setError('Failed to load plans. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // const getFeaturesForPlan = (planName) => {
    //     if (planName === 'STARTER PLAN') {
    //         return [
    //             { text: '3 Jobs Posting', isIncluded: true },
    //             { text: 'Basic Employer Profile', isIncluded: true },
    //             { text: 'Standard Support', isIncluded: true },
    //             { text: 'Account Manager', isIncluded: false },
    //             { text: 'Analytics', isIncluded: false },
    //             { text: 'Candidate Search', isIncluded: false },
    //             { text: 'Highlight Your Job Listing', isIncluded: false },
    //         ];
    //     }
    //     if (planName === 'BUSINESS PLAN') {
    //         return [
    //             { text: '30 Jobs Posting', isIncluded: true },
    //             { text: 'Featured Employer Profile', isIncluded: true },
    //             { text: 'Resume Database Access', isIncluded: true },
    //             { text: 'Priority Support', isIncluded: true },
    //             { text: 'Basic Account Manager', isIncluded: true },
    //             { text: 'Basic Analytics', isIncluded: true },
    //             { text: 'Limited Candidate Search', isIncluded: true },
    //             { text: 'Highlight Your Job Listing', isIncluded: false },
    //         ];
    //     }
    //     // ENTERPRISE PLAN
    //     return [
    //         { text: 'Unlimited Jobs Posting', isIncluded: true },
    //         { text: 'Premium Employer Profile', isIncluded: true },
    //         { text: 'Full Resume Database Access', isIncluded: true },
    //         { text: 'Priority Support', isIncluded: true },
    //         { text: 'Dedicated Account Manager', isIncluded: true },
    //         { text: 'Advanced Analytics', isIncluded: true },
    //         { text: 'Unlimited Candidate Search', isIncluded: true },
    //         { text: 'Highlight Your Job Listing', isIncluded: true },
    //     ];
    // };

    const getFeaturesForPlan = (planName) => {
        const normalizedName = normalizePlanName(planName);

        if (normalizedName === 'STARTER PLAN') {
            return [
                { text: '3 Jobs Posting', isIncluded: true },
                { text: 'Basic Employer Profile', isIncluded: true },
                { text: 'Standard Support', isIncluded: true },
                { text: 'Account Manager', isIncluded: false },
                { text: 'Analytics', isIncluded: false },
                { text: 'Candidate Search', isIncluded: false },
                { text: 'Highlight Your Job Listing', isIncluded: false },
            ];
        }
        if (normalizedName === 'BUSINESS PLAN') {
            return [
                { text: '30 Jobs Posting', isIncluded: true },
                { text: 'Featured Employer Profile', isIncluded: true },
                { text: 'Resume Database Access', isIncluded: true },
                { text: 'Priority Support', isIncluded: true },
                { text: 'Basic Account Manager', isIncluded: true },
                { text: 'Basic Analytics', isIncluded: true },
                { text: 'Limited Candidate Search', isIncluded: true },
                { text: 'Highlight Your Job Listing', isIncluded: false },
            ];
        }
        // ENTERPRISE PLAN
        return [
            { text: 'Unlimited Jobs Posting', isIncluded: true },
            { text: 'Premium Employer Profile', isIncluded: true },
            { text: 'Full Resume Database Access', isIncluded: true },
            { text: 'Priority Support', isIncluded: true },
            { text: 'Dedicated Account Manager', isIncluded: true },
            { text: 'Advanced Analytics', isIncluded: true },
            { text: 'Unlimited Candidate Search', isIncluded: true },
            { text: 'Highlight Your Job Listing', isIncluded: true },
        ];
    };

    // const getPlanColor = (planName) => {
    //     if (planName === 'STARTER PLAN') return 'blue';
    //     if (planName === 'BUSINESS PLAN') return 'orange';
    //     return 'purple';
    // };

    const getPlanColor = (planName) => {
        const normalizedName = normalizePlanName(planName);
        if (normalizedName === 'STARTER PLAN') return 'blue';
        if (normalizedName === 'BUSINESS PLAN') return 'orange';
        return 'purple';
    };

    const handleGetStarted = (plan) => {

        const normalizedName = normalizePlanName(plan.name);

        const pricing = plan.pricing;

        const isStarterPlan =
            normalizePlanName(plan.name) === 'STARTER PLAN';

        const planData = {
            id: plan.id,
            name: plan.name,
            price: isStarterPlan ? 1 : pricing.total,
            subtotal: isStarterPlan ? 1 : pricing.subtotal,
            cgst: pricing.cgst,
            sgst: pricing.sgst,
            discount_percent: pricing.discount_percent,
            original_price: pricing.original_price,
            savings: pricing.savings,
            duration: activeTab,
            duration_days: pricing.duration_days
        };

        onSelectPlan(planData, activeTab);
    };

    if (loading) {
        return (
            <div className="MembershipPlans-loading">
                <div className="spinner"></div>
                <p>Loading plans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="MembershipPlans-error">
                <p>{error}</p>
                <button onClick={fetchPlans}>Try Again</button>
            </div>
        );
    }

    // Filter out STARTER PLAN for 6 months and yearly tabs (since it's free only monthly)
    // const displayPlans = plans.filter(plan => {
    //     if (activeTab !== 'monthly' && plan.name === 'STARTER PLAN') {
    //         return false;
    //     }
    //     return true;
    // });

    const displayPlans = plans.filter(plan => {
        if (activeTab !== 'monthly' && normalizePlanName(plan.name) === 'STARTER PLAN') {
            return false;
        }
        return true;
    });

    return (
        <div className="MembershipPlans">
            <div className="MembershipPlans-header-box">
                <h2>Employer Membership Plan</h2>
                <p>Find the best plan to attract top talent</p>
            </div>

            <div className="MembershipPlans-tabs-bar">
                {['monthly', '6 Months', 'yearly'].map((tab) => (
                    <button
                        key={tab}
                        className={`MembershipPlans-tab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'monthly' ? 'Monthly' : tab === '6 Months' ? '6 Months' : 'Yearly'} Plan
                        {/* {tab === '6 Months' && <span className="discount-badge">Save 10%</span>}
                        {tab === 'yearly' && <span className="discount-badge">Save 15%</span>} */}
                    </button>
                ))}
            </div>

            <div className={`MembershipPlans-grid ${displayPlans.length === 2 ? 'two-cols' : ''}`}>
                {displayPlans.map((plan, index) => {
                    const pricing = plan.pricing;
                    // const isPopular = plan.name === 'BUSINESS PLAN' && activeTab !== 'monthly';
                    const isPopular = normalizePlanName(plan.name) === 'BUSINESS PLAN' && activeTab !== 'monthly';

                    return (
                        <div key={plan.id} className={`MembershipPlans-card ${isPopular ? 'popular' : ''}`}>
                            {/* {isPopular && (
                                <div className="popular-badge">MOST POPULAR</div>
                            )} */}
                            <div className={`MembershipPlans-banner ${getPlanColor(plan.name)}`}>
                                {getDisplayName(plan.name)}
                            </div>
                            <div className="MembershipPlans-content">
                                <div className="MembershipPlans-price-box">
                                    <span className="MembershipPlans-amount">
                                        {normalizePlanName(plan.name) === 'STARTER PLAN' ? (
                                            'Free'
                                        ) : (
                                            <>
                                                ₹ {Math.round(pricing.total)}
                                                <small>
                                                    /{activeTab === 'monthly' ? 'month' :
                                                        activeTab === '6 Months' ? '6 months' : 'year'}
                                                </small>
                                            </>
                                        )}
                                    </span>
                                    {/* {pricing.discount_percent > 0 && (
                                        <>
                                            <span className="discount-text">
                                                Save {pricing.discount_percent}%
                                            </span>
                                            <div className="original-price">
                                                Was: ₹ {Math.round(pricing.original_price)}
                                            </div>
                                        </>
                                    )} */}
                                    <span className="MembershipPlans-subtitle">
                                        {normalizePlanName(plan.name) === 'STARTER PLAN' ? 'Limited Access' :
                                            normalizePlanName(plan.name) === 'BUSINESS PLAN' ? 'Basic Plan' : 'Professional Plan'}
                                    </span>
                                </div>
                                <hr className="MembershipPlans-divider" />

                                <ul className="MembershipPlans-features-list">
                                    {getFeaturesForPlan(plan.name).map((feat, i) => (
                                        <li key={i} className={feat.isIncluded ? 'included' : 'excluded'}>
                                            <span className="MembershipPlans-icon">
                                                {feat.isIncluded ? '✔' : '✘'}
                                            </span>
                                            {feat.text}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`MembershipPlans-btn-start ${getPlanColor(plan.name)}`}
                                    onClick={() => handleGetStarted(plan)}
                                    disabled={normalizePlanName(plan.name) === 'STARTER PLAN' && activeTab !== 'monthly'}
                                >
                                    Get started
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};