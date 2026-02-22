
import React, { useState, useEffect } from "react";
import "./JobsThroughCompany.css";
import { useNavigate, useParams } from "react-router-dom";
import { OpportunitiesCard } from './OpportunitiesCard';
import { Footer } from "../Components-LandingPage/Footer";
import starIcon from "../assets/Star_icon.png";
import { Header } from "../Components-LandingPage/Header";
import api from "../api/axios";

export const JobsThroughCompany = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const displayCount = 10;
    // ✅ SINGLE CORRECT API CALL
    const fetchCompanyAndJobs = async () => {
        try {
            const res = await api.get("/jobs/", {
                params: { company: companyId }
            });


            const jobsData = Array.isArray(res.data) ? res.data : [];

            setJobs(jobsData);

            // Extract company from first job
            if (jobsData.length > 0) {
                setCompany(jobsData[0].company);
            } else {
                // fallback: fetch company details
                const companyRes = await api.get(`/companies/${companyId}/`);
                setCompany(companyRes.data);
            }

            setCurrentPage(1);

        } catch (err) {
            console.error(err);
            setError("Failed to load company or jobs");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!companyId) {
            setError("Company ID missing");
            setLoading(false);
            return;
        }
        fetchCompanyAndJobs();
    }, [companyId]);


    /* ---------- PAGINATION ---------- */

    const totalPages = Math.max(1, Math.ceil(jobs.length / displayCount));
    const indexOfLastJob = currentPage * displayCount;
    const indexOfFirstJob = indexOfLastJob - displayCount;
    const currentJobCards = jobs.slice(
        indexOfFirstJob,
        indexOfLastJob
    );

    const HandlePrev = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    const HandleNext = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };

    /* ---------- STATES ---------- */

    if (loading) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center", padding: 40 }}>
                    Loading...
                </p>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <p style={{ color: "red", textAlign: "center" }}>
                    {error}
                </p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </>
        );
    }

    if (!company) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center" }}>
                    Company not found
                </p>
            </>
        );
    }

    /* ---------- UI ---------- */

    return (
        <>
            <Header />

            <div className="job-search-companies">
                <section className="Opportunities-section">
                    <div className="company-header-container">
                        <button
                            className="back-btn"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </button>

                        <div className="company-main-section">
                            <div className="company-logo-container">
                                {company.logo || company.logo_url ? (
                                    <img
                                        className="company-logo"
                                        src={company.logo || company.logo_url}
                                        alt={company.name}
                                    />
                                ) : (
                                    <div className="company-logo-placeholder">
                                        {company.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}



                            </div>

                            <div className="company-info-card">
                                <h2>{company.name}</h2>
                                <div className="company-title-container">
                                    <span className="star">
                                        <img src={starIcon} alt="rating" />{" "}
                                        {company.rating || 0}
                                    </span>
                                    <span className="company-divider">|</span>
                                    <span>{company.review_count || 0} reviews</span>
                                </div>
                            </div>

                            <p className="company-moto">
                                {company.description || "No company description available."}
                            </p>



                        </div>
                    </div>

                    {/* JOB LIST */}
                    <div className="Opportunities-job-list">
                        {currentJobCards.length === 0 ? (
                            <p>No jobs available</p>
                        ) : (
                            currentJobCards.map((job) => (
                                <OpportunitiesCard key={job.id} job={job} />
                            ))

                        )}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="Navigation-job-Tab">
                            <button
                                onClick={HandlePrev}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={HandleNext}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </>
    );
};

