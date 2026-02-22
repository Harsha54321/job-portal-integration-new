import React, { useState } from 'react'
import './JobsTab.css'
import { Footer } from '../Components-LandingPage/Footer'
import { useEffect } from 'react';
import { OpportunitiesCard } from './OpportunitiesCard';
import { Header } from "../Components-LandingPage/Header";
import { useNavigate } from "react-router-dom"
import { SearchBar } from './SearchBar'
import api from '../api/axios'


export const JobsTab = () => {

    const displayCount = 10;
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [query, setQuery] = useState('');
    const [jobLocation, setJobLocation] = useState(''); 
    const [experience, setExperience] = useState('');

    const navigate = useNavigate();


    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get("/jobs/");
                setJobs(Array.isArray(res.data) ? res.data : []);
                setCurrentPage(1);
            } catch (err) {
                console.error(
                    "Failed to load jobs:",
                    err.response?.data || err.message
                );
            }
        };
        fetchJobs();
    }, []);



    const totalPages = Math.max(1, Math.ceil(jobs.length / displayCount));
    const indexOfLast = currentPage * displayCount;
    const indexOfFirst = indexOfLast - displayCount;
    const currentJobCards = jobs.slice(indexOfFirst, indexOfLast);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const siblingCount = 1;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - siblingCount);
            let end = Math.min(totalPages - 1, currentPage + siblingCount);

            if (currentPage <= 3) end = 4;
            if (currentPage >= totalPages - 2) start = totalPages - 3;

            if (start > 2) pages.push("...");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages.map((p, i) =>
            p === "..." ? (
                <span key={i} className="dots">...</span>
            ) : (
                <button
                    key={p}
                    className={`page-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                >
                    {p}
                </button>
            )
        );
    };


    const handleInitialSearch = () => {
        navigate('/Job-portal/jobseeker/searchresults', {
            state: {
                query,
                location: jobLocation, // Fixed: using jobLocation instead of location
                experience
            }
        });
    };

    return (
        <>
            <Header />
            <div className='jobs-tab-search-bar'>
                <SearchBar
                    searchQuery={query}
                    setSearchQuery={setQuery}
                    searchLocation={jobLocation} // Fixed: using jobLocation instead of location
                    setSearchLocation={setJobLocation} // Fixed: using setJobLocation instead of setLocation
                    searchExp={experience}
                    setSearchExp={setExperience}
                    onSearch={handleInitialSearch}
                />
            </div>

            <section className='Opportunities-section'>
                <h2 className='Opportunities-title'>Jobs For You</h2>

                <div className="Opportunities-job-list">
                    {currentJobCards.length > 0 ? (
                        currentJobCards.map((job) => (
                            <OpportunitiesCard key={job.id} job={job} />
                        ))
                    ) : (
                        <p>No jobs available at the moment.</p>
                    )}
                </div>
            </section>


            <div className="Navigation-job-Tab">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className='Navigation-btn'
                >
                    Previous
                </button>

                <div className="page-numbers">
                    {renderPageNumbers()}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className='Navigation-btn'
                >
                    Next
                </button>
            </div>

            <Footer />
        </>
    )
}