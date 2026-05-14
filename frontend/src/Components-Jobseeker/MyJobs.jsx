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
    const [activeTab, setActiveTab] = useState("saved");
    const { savedJobs, appliedJobs, loading, unsaveJob, fetchAllJobs } = useJobs();
 
    // Preserve tab state from navigation
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);
 
    // Fetch jobs on load ✅ (important)
    useEffect(() => {
        fetchAllJobs();
    }, []);
 
    // Debug logging
    useEffect(() => {
        console.log("=== MyJobs Data Debug ===");
        console.log("Saved Jobs Array:", savedJobs);
        console.log("Applied Jobs Array:", appliedJobs);
        console.log("Saved Jobs Count:", savedJobs?.length);
        console.log("Applied Jobs Count:", appliedJobs?.length);
        console.log("Active Tab:", activeTab);
    }, [savedJobs, appliedJobs, activeTab]);
 
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
                {/* Top Section */}
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
                        Saved ({savedJobs?.length || 0})
                    </button>
 
                    <button
                        className={`myjobs-select ${activeTab === "applied" ? "active" : ""}`}
                        onClick={() => setActiveTab("applied")}
                    >
                        Applied ({appliedJobs?.length || 0})
                    </button>
                </div>
 
                {/* GRID CONTAINER */}
                <div className="my-jobs-common-container">
 
                    {/* SAVED TAB */}
                    {activeTab === "saved" && (
                        savedJobs && savedJobs.length > 0 ? (
                            savedJobs.map((job) => (
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
                        appliedJobs && appliedJobs.length > 0 ? (
                            appliedJobs.map((application) => (
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
 

 