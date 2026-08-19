import { useEffect, useState, useMemo, useRef } from 'react'
import './SearchResults.css'
import { SearchResultsCard } from './SearchResultsCard'
import { Footer } from '../Components-LandingPage/Footer'
import { useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { Header } from '../Components-LandingPage/Header'
import { useJobs } from '../JobContext'
import {
    parseSalaryToLPA,
    isSalaryInRange,
    getSalaryDisplay,
    getSalaryPercent,
    MAX_SALARY_LPA
} from '../utils/salaryUtils'

export const SearchResults = () => {
    const { jobs } = useJobs()
    const location = useLocation();
    const isFirstLoad = useRef(true);

    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(MAX_SALARY_LPA);
    const [minExp, setMinExp] = useState(0);
    const [maxExp, setMaxExp] = useState(30);
    const [openSort, setOpenSort] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [hasSearched, setHasSearched] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [searchQuery, setSearchQuery] = useState(location.state?.query || "");
    const [searchLocation, setSearchLocation] = useState(location.state?.location || "");
    const [searchExp, setSearchExp] = useState(location.state?.experience || "");

    const [appliedFilters, setAppliedFilters] = useState({
        query: location.state?.query || "",
        location: location.state?.location || "",
        experience: location.state?.experience || ""
    });

    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedWorkType, setselectedWorkType] = useState([]);
    const [SelectedCompany, setSelectedCompany] = useState([]);
    const [SelectedEducation, setSelectedEducation] = useState([]);
    const [SelectedPostDate, setSelectedPostDate] = useState([]);
    const [SelectedIndustryType, setSelectedIndustryType] = useState([]);

    const [appliedSidebarFilters, setAppliedSidebarFilters] = useState({
        locations: [],
        workType: [],
        company: [],
        education: [],
        postedDate: [],
        industryType: [],
        minSalary: 0,
        maxSalary: MAX_SALARY_LPA,
        minExp: 0,
        maxExp: 30
    });

    const [locationFilters, setLocationFilters] = useState([]);
    const [workTypeFilters, setWorkTypeFilters] = useState([]);
    const [CompanyFilter, setCompanyFilter] = useState([]);
    const [EducationFilter, setEducationFilter] = useState([]);
    const [PostedDateFilter, setPostedDateFilter] = useState([]);
    const [IndustryTypeFilter, setIndustryTypeFilter] = useState([]);

    const [TopCompanyExpanded, setTopCompanyExpanded] = useState(false);
    const [LocationExpanded, setLocationExpanded] = useState(false);
    const [IndustryTypeExpanded, setIndustryTypeExpanded] = useState(false);

    const getPercent = (value) => Math.round(((value - 0) / (30 - 0)) * 100);

    const countPropertyOccurrences = (data, property) => {
        return data.reduce((acc, item) => {
            let value = item[property];
            if (typeof value === "object" && value !== null) {
                value = value.company_name || value.name;
            }
            const key = typeof value === "string"
                ? value.toLowerCase()
                : `Unknown ${property}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const formatPostedDate = (dateString) => {
        const postedDate = new Date(dateString);
        const today = new Date();
        const diffInMs = today - postedDate;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays > 1 && diffInDays <= 7) return `${diffInDays} days ago`;
        if (diffInDays > 8 && diffInDays <= 14) return `1 Week ago`;
        if (diffInDays > 15 && diffInDays <= 21) return `2 Week ago`;
        if (diffInDays > 22 && diffInDays <= 29) return `3 Week ago`;
        if (diffInDays > 30 && diffInDays <= 60) return `1 month ago`;
        return `Long ago`;
    }

    const countPostedDate = (data, property) => {
        return data.reduce((acc, item) => {
            const value = item[property];
            const key = value ? formatPostedDate(value) : `Unknown ${property}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const parseExperience = (expStr) => {
        if (!expStr) return { min: 0, max: 0 };

        const str = expStr.toString().toLowerCase().trim();

        if (str.includes('fresher')) {
            return { min: 0, max: 0 };
        }

        const monthMatch = str.match(/(\d+)\s*months?/i);
        if (monthMatch) {
            const months = parseInt(monthMatch[1]);
            if (months < 6) {
                return { min: 0, max: 0 };
            }
            const years = months / 12;
            return { min: years, max: years };
        }
        const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) {
            return {
                min: parseInt(rangeMatch[1]),
                max: parseInt(rangeMatch[2])
            };
        }
        const plusMatch = str.match(/(\d+)\s*\+/);
        if (plusMatch) {
            return {
                min: parseInt(plusMatch[1]),
                max: 30
            };
        }
        const singleMatch = str.match(/(\d+)/);
        if (singleMatch) {
            const val = parseInt(singleMatch[1]);
            if (str.includes('month')) {
                const years = val / 12;
                return { min: years, max: years };
            }
            return { min: val, max: val };
        }
        return { min: 0, max: 0 };
    };
    const locationCounts = countPropertyOccurrences(
        jobs.flatMap((item) =>
            Array.isArray(item.location)
                ? item.location.map((loc) => ({ ...item, location: loc }))
                : [{ ...item, location: item.location }]
        ),
        'location'
    );

    const educationCounts = jobs.reduce((acc, item) => {
        let educationData = item.education || item.EducationRequired || item.job_category || item.category;

        if (!educationData) return acc;

        let educationArray = Array.isArray(educationData) ? educationData : [educationData];

        educationArray.forEach((edu) => {
            if (edu) {
                const degree = edu.toLowerCase();
                acc[degree] = (acc[degree] || 0) + 1;
            }
        });

        return acc;
    }, {});

    const InduntryCounts = jobs.reduce((acc, item) => {
        let industries = item.industry_type || item.industry || item.IndustryType || item.job_type;

        if (!industries) return acc;

        if (typeof industries === "string" && industries.startsWith("[")) {
            try {
                industries = JSON.parse(industries);
            } catch {
                industries = [industries];
            }
        }

        if (typeof industries === "string") {
            industries = [industries];
        }

        if (Array.isArray(industries)) {
            industries.forEach((int) => {
                if (int && typeof int === 'string') {
                    const val = int.toLowerCase();
                    acc[val] = (acc[val] || 0) + 1;
                }
            });
        }

        return acc;
    }, {});

    const workTypeCounts = countPropertyOccurrences(jobs, 'work_type');
    const CompanyCounts = countPropertyOccurrences(
        jobs.map(job => ({
            ...job,
            company: job.company?.company_name || "unknown"
        })),
        'company'
    );
    const PostedbyCounts = countPropertyOccurrences(jobs, 'PostedBy');
    const PostedDtCounts = countPostedDate(jobs, 'posted_date');

    const locationArray = Object.entries(locationCounts);
    const WorkTypeArray = Object.entries(workTypeCounts);
    const PostedbyArray = Object.entries(PostedbyCounts);
    const TopcompanyArray = Object.entries(CompanyCounts);
    const checkboxList = Object.entries(educationCounts);
    const PostedDateArray = Object.entries(PostedDtCounts);
    const IndustryType = Object.entries(InduntryCounts);

    useEffect(() => {
        if (jobs.length > 0) {
            setLocationFilters(locationArray.slice(0, 5));
            setWorkTypeFilters(WorkTypeArray);
            setCompanyFilter(TopcompanyArray.slice(0, 5));
            setEducationFilter(checkboxList.slice(0, 5));
            setPostedDateFilter(PostedDateArray);
            setIndustryTypeFilter(IndustryType.slice(0, 5));
        }
    }, [jobs]);

    // useEffect(() => {
    //     const saved = sessionStorage.getItem("filters");

    //     if (saved && jobs.length > 0) {
    //         const data = JSON.parse(saved);

    //         setSelectedLocations(data.selectedLocations || []);
    //         setselectedWorkType(data.selectedWorkType || []);
    //         setSelectedCompany(data.SelectedCompany || []);
    //         setSelectedEducation(data.SelectedEducation || []);
    //         setSelectedPostDate(data.SelectedPostDate || []);
    //         setSelectedIndustryType(data.SelectedIndustryType || []);

    //         setMinVal(data.minVal || 0);
    //         setMaxVal(data.maxVal || MAX_SALARY_LPA);
    //         setMinExp(data.minExp || 0);
    //         setMaxExp(data.maxExp || 30);

    //         setAppliedSidebarFilters({
    //             locations: data.selectedLocations || [],
    //             workType: data.selectedWorkType || [],
    //             company: data.SelectedCompany || [],
    //             education: data.SelectedEducation || [],
    //             postedDate: data.SelectedPostDate || [],
    //             industryType: data.SelectedIndustryType || [],
    //             minSalary: data.minVal || 0,
    //             maxSalary: data.maxVal || MAX_SALARY_LPA,
    //             minExp: data.minExp || 0,
    //             maxExp: data.maxExp || 30
    //         });
    //     }
    // }, [jobs]);

    // --- Convert searchExp to min/max and apply filter ---
    useEffect(() => {
        if (searchExp) {
            let min = 0;
            let max = 30;
            if (searchExp === "fresher") {
                min = 0;
                max = 0;
            } else if (searchExp === "1-3") {
                min = 1;
                max = 3;
            } else if (searchExp === "3-5") {
                min = 3;
                max = 5;
            } else if (searchExp === "5+") {
                min = 5;
                max = 30;
            }

            setMinExp(min);
            setMaxExp(max);

            setAppliedSidebarFilters(prev => ({
                ...prev,
                minExp: min,
                maxExp: max
            }));

            setAppliedFilters(prev => ({
                ...prev,
                experience: searchExp
            }));
        }
    }, [searchExp]);

    // --- Handle initial search from location state ---
    useEffect(() => {
        if (location.state?.query || location.state?.location || location.state?.experience) {
            setHasSearched(true);
            handleSearchButtonClick();
            isFirstLoad.current = false;
        }
    }, []);

    useEffect(() => {
        if (searchLocation === "" && !isFirstLoad.current) {
            setSelectedLocations([]);
            setAppliedSidebarFilters(prev => ({
                ...prev,
                locations: []
            }));
            handleSearchButtonClick();
        }
    }, [searchLocation]);

    useEffect(() => {
        if (location.state?.query || location.state?.location) {
            setHasSearched(true);
            handleSearchButtonClick();
            isFirstLoad.current = false;
        }
    }, []);

    useEffect(() => {
        if (location.state?.query || location.state?.location) {
            setHasSearched(true);
        }
    }, []);

    const handleSearchButtonClick = () => {
        setHasSearched(true);

        let min = 0;
        let max = 30;
        if (searchExp === "fresher") {
            min = 0;
            max = 0;
        } else if (searchExp === "1-3") {
            min = 1;
            max = 3;
        } else if (searchExp === "3-5") {
            min = 3;
            max = 5;
        } else if (searchExp === "5+") {
            min = 5;
            max = 30;
        }

        setMinExp(min);
        setMaxExp(max);

        const locationInput = searchLocation.trim();
        let locationsArray = [];
        if (locationInput !== "") {
            locationsArray = locationInput
                .split(',')
                .map(loc => loc.trim().toLowerCase())
                .filter(loc => loc !== "");

            if (locationsArray.length === 0) {
                console.warn("No valid locations found in input");
            }
        }

        setSelectedLocations(locationsArray);
        setAppliedFilters({
            query: searchQuery,
            location: searchLocation,
            experience: searchExp
        });
        setAppliedSidebarFilters(prev => ({
            ...prev,
            minExp: min,
            maxExp: max,
            locations: locationsArray
        }));
    };

    const HandleApplyFilter = () => {
        setAppliedSidebarFilters({
            locations: selectedLocations,
            workType: selectedWorkType,
            company: SelectedCompany,
            education: SelectedEducation,
            postedDate: SelectedPostDate,
            industryType: SelectedIndustryType,
            minSalary: minVal,
            maxSalary: maxVal,
            minExp: minExp,
            maxExp: maxExp
        });
        setSearchLocation("");
        setSearchExp("");

        setAppliedFilters((prev) => ({
            ...prev,
            location: "",
            experience: ""
        }));
        // sessionStorage.setItem("filters", JSON.stringify({
        //     selectedLocations,
        //     selectedWorkType,
        //     SelectedCompany,
        //     SelectedEducation,
        //     SelectedPostDate,
        //     SelectedIndustryType,
        //     minVal,
        //     maxVal,
        //     minExp,
        //     maxExp
        // }));
        setShowFilters(false);
    };

    // --- Clear Filters Handler ---
    const HandleClear = () => {
        // sessionStorage.removeItem("filters");

        setSearchQuery("");
        setSearchLocation("");
        setSearchExp("");

        setAppliedFilters({
            query: "",
            location: "",
            experience: ""
        });

        setSelectedLocations([]);
        setselectedWorkType([]);
        setSelectedCompany([]);
        setSelectedEducation([]);
        setSelectedPostDate([]);
        setSelectedIndustryType([]);
        setMinVal(0);
        setMaxVal(MAX_SALARY_LPA);
        setMinExp(0);
        setMaxExp(30);

        setAppliedSidebarFilters({
            locations: [],
            workType: [],
            postedBy: [],
            company: [],
            education: [],
            postedDate: [],
            industryType: [],
            minSalary: 0,
            maxSalary: MAX_SALARY_LPA,
            minExp: 0,
            maxExp: 30
        });
        setSortBy("recommended");
        setOpenSort(false);
        setHasSearched(false);
    };

    // --- Sort Handlers ---
    const handleSort = (type) => {
        setSortBy(type);
        setOpenSort(false);
    }

    // --- View More Handlers ---
    const handleLocationViewMore = () => {
        if (LocationExpanded) { setLocationFilters(locationArray.slice(0, 5)); }
        else { setLocationFilters(locationArray) } setLocationExpanded(!LocationExpanded);
    }

    const handleCompanyViewMore = () => {
        if (TopCompanyExpanded) { setCompanyFilter(TopcompanyArray.slice(0, 5)); }
        else { setCompanyFilter(TopcompanyArray) } setTopCompanyExpanded(!TopCompanyExpanded);
    }

    const handleIndustryViewMore = () => {
        if (IndustryTypeExpanded) { setIndustryTypeFilter(IndustryType.slice(0, 5)); }
        else { setIndustryTypeFilter(IndustryType) } setIndustryTypeExpanded(!IndustryTypeExpanded);
    }

    // --- Checkbox Handlers ---
    const handleLocationChange = (event) => {
        const val = event.target.value.toLowerCase();
        setSelectedLocations((prev) => event.target.checked ? [...prev, val] : prev.filter((item) => item !== val));
    };

    const HandleWorkType = (event) => {
        const val = event.target.value;
        setselectedWorkType(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    const HandleCompany = (event) => {
        const val = event.target.value;
        setSelectedCompany(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    const HandleEducation = (event) => {
        const val = event.target.value;
        setSelectedEducation(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    const HandlePostedDate = (event) => {
        const val = event.target.value;
        setSelectedPostDate(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    const HandleIndustryType = (event) => {
        const val = event.target.value;
        setSelectedIndustryType(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const sf = appliedSidebarFilters;
            const af = appliedFilters;

            // --- Search Query Filter ---
            const matchesSearch = appliedFilters.query === "" ||
                job.job_title?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.company?.company_name?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.key_skills?.some(skill => skill.toLowerCase().includes(af.query.toLowerCase())) ||
                job.keySkills?.some(skill => skill.toLowerCase().includes(af.query.toLowerCase()));

            // ============================================================
            // ✅ FIXED EXPERIENCE FILTER - Using parseExperience function
            // ============================================================
            const expRange = parseExperience(job.experience);
            const matchesExperience = expRange.max >= sf.minExp && expRange.min <= sf.maxExp;

            // --- Location Filter ---
            const jobLocations = Array.isArray(job.location)
                ? job.location.map(l => l.toLowerCase())
                : [job.location?.toLowerCase() || ""];

            const matchesCombinedLocation = (appliedFilters.location === "" && sf.locations.length === 0) ||
                jobLocations.some(loc => (appliedFilters.location && loc.includes(appliedFilters.location.toLowerCase())) || sf.locations.includes(loc));

            // --- Work Type Filter ---
            const jobWorkType = job.WorkType ? job.WorkType.toLowerCase() : (job.work_type ? job.work_type.toLowerCase() : 'unknown worktype');
            const matchesWorkType = sf.workType.length === 0 || sf.workType.includes(jobWorkType);

            // --- Company Filter ---
            const jobCompanyName = job.company?.company_name?.toLowerCase().trim() || "";
            const matchesCompany = sf.company.length === 0 ||
                sf.company.map(c => c.toLowerCase()).includes(jobCompanyName);

            // --- Posted Date Filter ---
            const JobPosted = job.posted ? formatPostedDate(job.posted) : (job.posted_date ? formatPostedDate(job.posted_date) : "unknown posted");
            const matchesPostedDate = sf.postedDate.length === 0 || sf.postedDate.includes(JobPosted);

            // --- Education Filter ---
            const jobEducation = job.education || job.EducationRequired || job.job_category || [];
            const educationArray = Array.isArray(jobEducation) ? jobEducation : [jobEducation];
            const matchesEducation = sf.education.length === 0 ||
                educationArray.some(edu => edu && sf.education.includes(edu.toLowerCase()));

            // --- Industry Type Filter ---
            const jobIndustry = job.industry_type || job.industry || job.IndustryType || job.job_type || [];
            const industryArray = Array.isArray(jobIndustry) ? jobIndustry : [jobIndustry];
            const matchesIndustryType = sf.industryType.length === 0 ||
                industryArray.some(ind => ind && sf.industryType.includes(ind.toLowerCase()));

            const jobSalary = job.salary || job.salary_range || '';
            const matchesSalary = isSalaryInRange(jobSalary, sf.minSalary, sf.maxSalary);

            // --- Return combined result ---
            return matchesCombinedLocation && matchesWorkType && matchesCompany &&
                matchesEducation && matchesPostedDate && matchesExperience &&
                matchesIndustryType && matchesSalary && matchesSearch;
        });
    }, [jobs, appliedFilters, appliedSidebarFilters]);

    // --- Sort Logic ---
    const sortedJobs = useMemo(() => {
        if (!sortBy || sortBy === "recommended") return filteredJobs;

        const jobsCopy = [...filteredJobs];

        switch (sortBy) {
            case "date_newest":
                jobsCopy.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
                break;
            case "date_oldest":
                jobsCopy.sort((a, b) => new Date(a.posted_date) - new Date(b.posted_date));
                break;
            case "salary_high":
                jobsCopy.sort((a, b) => {
                    const salaryA = parseSalaryToLPA(a.salary || a.salary_range) || 0;
                    const salaryB = parseSalaryToLPA(b.salary || b.salary_range) || 0;
                    return salaryB - salaryA;
                });
                break;
            case "salary_low":
                jobsCopy.sort((a, b) => {
                    const salaryA = parseSalaryToLPA(a.salary || a.salary_range) || 0;
                    const salaryB = parseSalaryToLPA(b.salary || b.salary_range) || 0;
                    return salaryA - salaryB;
                });
                break;
            default:
                break;
        }

        return jobsCopy;
    }, [filteredJobs, sortBy]);

    return (
        <>
            <Header />
            <div className='jobs-tab-search-bar'>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchLocation={searchLocation}
                    setSearchLocation={setSearchLocation}
                    searchExp={searchExp}
                    setSearchExp={setSearchExp}
                    onSearch={handleSearchButtonClick}
                />
            </div>
            <div className='search-result-title'>
                <h1> Jobs Based On Your Search</h1>
            </div>

            <div className='Mainsec-Search-Res'>
                <div className={`Aside ${showFilters ? "show-filters" : ""}`}>
                    <div className='aside-header'>
                        <p onClick={HandleApplyFilter} className='filter-applied' style={{ cursor: 'pointer' }}>Apply Filters</p>
                        <p onClick={HandleClear} className='filter-applied' style={{ cursor: 'pointer' }}>Clear Filters</p>
                    </div>
                    <div className="mobile-filter-header">
                        <h2>Filters</h2>

                        <div className="mobile-filter-actions">
                            <button onClick={HandleClear}>Clear</button>
                            <button onClick={HandleApplyFilter}>Apply</button>
                        </div>

                        <button
                            className="close-filter"
                            onClick={() => setShowFilters(false)}
                        >
                            ✕
                        </button>
                    </div>


                    <div className='Search-Worktype-Container'>
                        <h4>Work Type</h4>
                        {workTypeFilters.map(([work, workc]) => {
                            const WorkType = work.charAt(0).toUpperCase() + work.slice(1);
                            return (
                                <div key={work} className="location-checkbox-container">
                                    <div className="location-checkbox-container-wrapper">
                                        <label htmlFor={`WorkType-${work}`} className="location-checkbox-label">
                                            <input
                                                type="checkbox"
                                                id={`WorkType-${work}`}
                                                name="WorkType"
                                                value={work}
                                                onChange={HandleWorkType}
                                                checked={selectedWorkType.includes(work)}
                                            />
                                            <span className="location-text">{WorkType}</span>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Location</h4>
                        {locationFilters.map(([locationKey, count]) => {
                            const displayLocation = locationKey.charAt(0).toUpperCase() + locationKey.slice(1);
                            return (
                                <div key={locationKey}>
                                    <label htmlFor={`location-${locationKey}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`location-${locationKey}`}
                                            name="location"
                                            value={locationKey.toLowerCase()}
                                            onChange={handleLocationChange}
                                            checked={selectedLocations.includes(locationKey.toLowerCase())}
                                        />
                                        <span className="location-text">{displayLocation}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleLocationViewMore} className='viewmore-btn'>{LocationExpanded ? 'View Less' : 'View More'}</button>
                        </div>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Top Companies</h4>
                        {CompanyFilter.map(([com, count]) => {
                            const Company = com.charAt(0).toUpperCase() + com.slice(1);
                            return (
                                <div key={com}>
                                    <label htmlFor={`Company-${com}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`Company-${com}`}
                                            name="Company"
                                            value={com}
                                            onChange={HandleCompany}
                                            checked={SelectedCompany.includes(com)}
                                        />
                                        <span className="location-text">{Company}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleCompanyViewMore} className='viewmore-btn'>{TopCompanyExpanded ? 'View Less' : 'View More'}</button>
                        </div>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Education</h4>
                        {EducationFilter.map(([edu, count]) => {
                            const Education = edu.charAt(0).toUpperCase() + edu.slice(1);
                            return (
                                <div key={edu}>
                                    <label htmlFor={`Education-${edu}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`Education-${edu}`}
                                            name="Education"
                                            value={edu}
                                            onChange={HandleEducation}
                                            checked={SelectedEducation.includes(edu)}
                                        />
                                        <span className="location-text">{Education} {count > 1 && `(${count})`}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Freshness</h4>
                        {PostedDateFilter.map(([Post, count]) => {
                            return (
                                <div key={Post}>
                                    <label htmlFor={`PostedDate-${Post}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`PostedDate-${Post}`}
                                            name="PostedDate"
                                            value={Post}
                                            onChange={HandlePostedDate}
                                            checked={SelectedPostDate.includes(Post)}
                                        />
                                        <span className="location-text">{Post}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Industry Type</h4>
                        {IndustryTypeFilter.map(([int, count]) => {
                            const IndustryType = int.charAt(0).toUpperCase() + int.slice(1);
                            return (
                                <div key={int}>
                                    <label htmlFor={`IndustryType-${int}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`IndustryType-${int}`}
                                            name="IndustryType"
                                            value={int}
                                            onChange={HandleIndustryType}
                                            checked={SelectedIndustryType.includes(int)}
                                        />
                                        <span className="location-text">{IndustryType}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleIndustryViewMore} className='viewmore-btn'>
                                {IndustryTypeExpanded ? 'View Less' : 'View More'}
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="section-title">Experience</h3>
                        <div className="range-container">
                            <div className="slider-base-track" />
                            <div className="slider-active-range"
                                style={{
                                    left: `${(minExp / 30) * 100}%`,
                                    width: `${((maxExp - minExp) / 30) * 100}%`
                                }}
                            />
                            <input type="range"
                                className="slider multi thumb-left"
                                min="0"
                                max="30"
                                value={minExp}
                                onChange={(e) => setMinExp(Math.min(Number(e.target.value), maxExp - 1))}
                            />
                            <input
                                className="slider multi thumb-right"
                                type="range"
                                min="0"
                                max="30"
                                value={maxExp}
                                onChange={(e) => setMaxExp(Math.max(Number(e.target.value), minExp + 1))}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Min: {minExp} yrs</span>
                            <span>Max: {maxExp} yrs</span>
                        </div>

                        <h3 className="section-title">Salary</h3>
                        <div className="range-container">
                            <div className="slider-base-track" />
                            <div
                                className="slider-active-range"
                                style={{
                                    left: `${getSalaryPercent(minVal)}%`,
                                    width: `${getSalaryPercent(maxVal) - getSalaryPercent(minVal)}%`
                                }}
                            />
                            <input
                                className="slider multi thumb-left"
                                type="range"
                                min="0"
                                max={MAX_SALARY_LPA}
                                value={minVal}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val < maxVal) {
                                        setMinVal(val);
                                    }
                                }}
                            />
                            <input
                                className="slider multi thumb-right"
                                type="range"
                                min="0"
                                max={MAX_SALARY_LPA}
                                value={maxVal}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > minVal) {
                                        setMaxVal(val);
                                    }
                                }}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Min: {getSalaryDisplay(minVal)}</span>
                            <span>Max: {getSalaryDisplay(maxVal)}</span>
                        </div>
                    </div>
                </div>

                <div className='maincontent'>
                    <div className="results-header">

                        <h2 className='NoofJobsCont'>
                            Showing {sortedJobs.length} Jobs
                        </h2>

                        {/* Desktop Sort */}
                        <div className="desktop-sort">
                            {sortedJobs.length > 0 && (
                                <button
                                    className="sort-btn"
                                    onClick={() => setOpenSort(!openSort)}
                                >
                                    Sort By
                                </button>
                            )}


                            {openSort && (
                                <div className="sort-dropdown">
                                    <p onClick={() => handleSort("recommended")}>Recommended</p>
                                    <p onClick={() => handleSort("date_newest")}>Newest</p>
                                    <p onClick={() => handleSort("date_oldest")}>Oldest</p>
                                    <p onClick={() => handleSort("salary_high")}>Salary: High to Low</p>
                                    <p onClick={() => handleSort("salary_low")}>Salary: Low to High</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="mobile-toolbar">

                            <button
                                className="mobile-filter-btn"
                                onClick={() => setShowFilters(true)}
                            >
                                Filter
                            </button>

                            <button
                                className="mobile-sort-btn"
                                onClick={() => setOpenSort(!openSort)}
                            >
                                Sort
                            </button>

                        </div>

                    </div>

                    {sortedJobs.map((jb, index) =>
                        <div key={index} className='jobs-card'>
                            <SearchResultsCard job={jb} />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};