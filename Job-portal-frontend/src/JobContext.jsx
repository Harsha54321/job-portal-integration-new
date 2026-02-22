import React, { createContext, useState, useContext, useEffect } from "react";
import api from "./api/axios";

const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Load everything from backend
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const jobsRes = await api.get("/jobs/");
                const savedRes = await api.get("/jobs/saved/");
                const appliedRes = await api.get("/jobs/applied/");

                setJobs(jobsRes.data);
                setSavedJobs(savedRes.data);     // backend saved objects
                setAppliedJobs(appliedRes.data); // backend applied objects
            } catch (err) {
                console.error("Error loading jobs data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // 🔹 Check if job saved
    const isJobSaved = (jobId) => {
        return savedJobs.some(item => item.job.id === jobId);
    };

    // 🔹 Save job (Backend integrated)
    const saveJob = async (jobId) => {
        try {
            await api.post("/jobs/save/", { job_id: jobId });

            const savedRes = await api.get("/jobs/saved/");
            setSavedJobs(savedRes.data);

            return true;
        } catch (err) {
            if (err.response?.status === 400) {
                return "already";
            }
            throw err;
        }
    };

    // 🔹 Apply job (Backend integrated)
    const applyForJob = async (jobId, formData) => {
        try {
            await api.post("/jobs/apply/", formData);

            const appliedRes = await api.get("/jobs/applied/");
            setAppliedJobs(appliedRes.data);

            return true;
        } catch (err) {
            if (err.response?.status === 409) {
                return "already";
            }
            throw err;
        }
    };

    return (
        <JobContext.Provider
            value={{
                jobs,
                savedJobs,
                appliedJobs,
                loading,
                isJobSaved,
                saveJob,
                applyForJob
            }}
        >
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => useContext(JobContext);
