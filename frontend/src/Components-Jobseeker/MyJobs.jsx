import React, { useState, useEffect } from "react";
import "./MyJobs.css";
import { useLocation } from "react-router-dom";
import { Footer } from "../Components-LandingPage/Footer";
import { SavedJobsCard } from "./SavedJobsCard";
import { AppliedJobCard } from "./AppliedJobCard";
import { Header } from "../Components-LandingPage/Header";
import { useJobs } from '../JobContext';

export const MyJobs = () => {
    const location = useLocation();

    // Initialize tab from location state or sessionStorage
    const [activeTab, setActiveTab] = useState(() => {
        // First check location state (from direct navigation)
        if (location.state?.activeTab) {
            return location.state.activeTab;
        }
        // Then check sessionStorage (from previous session)
        const savedTab = sessionStorage.getItem("myJobs_activeTab");
        if (savedTab && (savedTab === "saved" || savedTab === "applied")) {
            return savedTab;
        }
        // Default to saved
        return "saved";
    });

    const { savedJobs, appliedJobs, loading, unsaveJob, fetchAllJobs } = useJobs();

    // Filter out withdrawn applications
    const activeAppliedJobs = appliedJobs?.filter(
        (application) => application.status?.toLowerCase() !== "withdrawn"
    ) || [];

    const activeSavedJobs = savedJobs?.filter(
        (job) => job?.status?.toLowerCase() !== "withdrawn"
    ) || [];

    // Handle navigation state from login redirect
    useEffect(() => {
        const targetTab = location.state?.activeTab;
        
        if (targetTab && (targetTab === "saved" || targetTab === "applied")) {
            setActiveTab(targetTab);
            sessionStorage.setItem("myJobs_activeTab", targetTab);
        }
    }, [location.state?.activeTab]);

    // Save activeTab to sessionStorage whenever it changes (user clicks tabs)
    useEffect(() => {
        sessionStorage.setItem("myJobs_activeTab", activeTab);
    }, [activeTab]);

    // Fetch jobs on load
    useEffect(() => {
        fetchAllJobs();
    }, []);

    const handleRemoveSavedJob = async (jobId) => {
        await unsaveJob(jobId);
        await fetchAllJobs();
    };

    if (loading) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center", padding: "40px" }}>
                    Loading jobs...
                </p>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main>
                <div className='myjobs-main-info'>
                    <h1>My Jobs</h1>
                    <p>
                        View and manage the jobs you've saved, applied for, or shortlisted—all in one place.
                    </p>
                </div>

                {/* Tabs */}
                <div className="toggle-myjobs-main">
                    <button
                        className={`myjobs-select ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved ({activeSavedJobs?.length || 0})
                    </button>

                    <button
                        className={`myjobs-select ${activeTab === "applied" ? "active" : ""}`}
                        onClick={() => setActiveTab("applied")}
                    >
                        Applied ({activeAppliedJobs?.length || 0})
                    </button>
                </div>

                {/* GRID CONTAINER */}
                <div className="my-jobs-common-container">

                    {/* SAVED TAB */}
                    {activeTab === "saved" && (
                        activeSavedJobs.length > 0 ? (
                            activeSavedJobs.map((job) => (
                                <SavedJobsCard
                                    key={job.id}
                                    job={job}
                                    onRemoved={handleRemoveSavedJob}
                                />
                            ))
                        ) : (
                            <div className="toggle-no-my-jobs">
                                <h2>No jobs saved yet</h2>
                                <p>Jobs you save appear here</p>
                            </div>
                        )
                    )}

                    {/* APPLIED TAB */}
                    {activeTab === "applied" && (
                        activeAppliedJobs.length > 0 ? (
                            activeAppliedJobs.map((application) => (
                                <AppliedJobCard
                                    key={application.id}
                                    appliedJob={application}
                                />
                            ))
                        ) : (
                            <div className="toggle-no-my-jobs">
                                <h2>No jobs applied yet</h2>
                                <p>Jobs you apply appear here</p>
                            </div>
                        )
                    )}

                </div>
            </main>

            <Footer />
        </>
    );
};