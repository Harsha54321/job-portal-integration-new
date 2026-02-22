import React, { useState, useEffect } from "react";
import api from '../api/axios'
import "./MyJobs.css";
import { Footer } from "../Components-LandingPage/Footer";
import { SavedJobsCard } from "./SavedJobsCard";
import { AppliedJobCard } from "./AppliedJobCard";
import { Header } from "../Components-LandingPage/Header";

export const MyJobs = () => {
    const [activeTab, setActiveTab] = useState("saved");
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const [savedRes, appliedRes] = await Promise.all([
                    api.get("/jobs/saved/"),
                    api.get("/jobs/applied/"),
                ]);

                setSavedJobs(Array.isArray(savedRes.data) ? savedRes.data : []);
                setAppliedJobs(Array.isArray(appliedRes.data) ? appliedRes.data : []);

            } catch (error) {
                console.error(
                    "❌ Error fetching jobs:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

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
                <div className="myjobs-main-info">
                    <h1>My Jobs</h1>
                    <p>
                        View and manage the jobs you've saved and applied for—all in one place.
                    </p>
                </div>

                <div className="toggle-myjobs-main">
                    <button
                        className={`myjobs-select ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved ({savedJobs.length})
                    </button>

                    <button
                        className={`myjobs-select ${activeTab === "applied" ? "active" : ""}`}
                        onClick={() => setActiveTab("applied")}
                    >
                        Applied ({appliedJobs.length})
                    </button>

                </div>

                <div className="my-jobs-common-container">
                    {activeTab === "saved" ? (
                        savedJobs.length ? (
                            savedJobs.map((item) => (
                                <SavedJobsCard
                                    key={item.id || item.job.id}
                                    job={item.job}
                                    onRemoved={(jobId) =>
                                        setSavedJobs(prev =>
                                            prev.filter(j => j.job.id !== jobId)
                                        )
                                    }
                                />
                            ))
                        ) : (
                            <div className="toggle-no-my-jobs">
                                <h2>No jobs saved yet</h2>
                                <p>Jobs you save appear here</p>
                            </div>
                        )
                    ) : appliedJobs.length ? (
                        appliedJobs.map((item) => (
                            <AppliedJobCard key={item.id} appliedJob={item} />


                        ))
                    ) : (
                        <div className="toggle-no-my-jobs">
                            <h2>No jobs applied yet</h2>
                            <p>Jobs you apply appear here</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};
