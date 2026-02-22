import { useEffect, useState, useMemo } from 'react'
import './SearchResults.css'
import { SearchResultsCard } from './SearchResultsCard'
import { Footer } from '../Components-LandingPage/Footer'
import { useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { Header } from '../Components-LandingPage/Header'
import { useJobs } from '../JobContext'

export const SearchResults = () => {
    const { jobs } = useJobs()

    // --- UI STATES (These control the checkboxes visually) ---
    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(100);
    const [Exp, SetExp] = useState(30);
    const location = useLocation();

    // ... [Helper functions remain unchanged] ...
    const getPercent = (value) => Math.round(((value - 0) / (100 - 0)) * 100);
    const countPropertyOccurrences = (data, property) => {
        return data.reduce((acc, item) => {
            let value = item[property];

            // If it's an object (like company), extract name
            if (typeof value === "object" && value !== null) {
                value = value.name;
            }

            // If it's not a string, convert safely
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
    const educationCounts = jobs.reduce((acc, item) => {
        if (Array.isArray(item.education_required)) {
            item.education_required.forEach((edu) => {
                const degree = edu.toLowerCase();
                acc[degree] = (acc[degree] || 0) + 1;
            });
        }
        return acc;
    }, {});

    const InduntryCounts = jobs.reduce((acc, item) => {
        if (Array.isArray(item.industry_type)) {
            item.industry_type.forEach((int) => {
                const val = int.toLowerCase();
                acc[val] = (acc[val] || 0) + 1;
            });
        }
        return acc;
    }, {});

    // ... [Data Prep] ...
    const locationCounts = countPropertyOccurrences(jobs, 'location');
    const workTypeCounts = countPropertyOccurrences(jobs, 'work_type');
    const CompanyCounts = countPropertyOccurrences(jobs, 'company');
    const PostedDtCounts = countPostedDate(jobs, 'posted_date')


    const locationArray = Object.entries(locationCounts);
    const WorkTypeArray = Object.entries(workTypeCounts);
    const TopcompanyArray = Object.entries(CompanyCounts);
    const checkboxList = Object.entries(educationCounts);
    const PostedDateArray = Object.entries(PostedDtCounts);
    const IndustryType = Object.entries(InduntryCounts);

    const [locationFilters, setLocationFilters] = useState(locationArray.slice(0, 5));
    const [workTypeFilters, setWorkTypeFilters] = useState(WorkTypeArray);
    const [CompanyFilter, setCompanyFilter] = useState(TopcompanyArray.slice(0, 5));
    const [EducationFilter, setEducationFilter] = useState(checkboxList.slice(0, 5));
    const [PostedDateFilter, setPostedDateFilter] = useState(PostedDateArray);
    const [IndustryTypeFilter, setIndustryTypeFilter] = useState(IndustryType.slice(0, 5));

    const [TopCompanyExpanded, setTopCompanyExpanded] = useState(false);
    const [LocationExpanded, setLocationExpanded] = useState(false);
    const [IndustryTypeExpanded, setIndustryTypeExpanded] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [sortBy, setSortBy] = useState("");

    const [searchQuery, setSearchQuery] = useState(location.state?.query || "");
    const [searchLocation, setSearchLocation] = useState(location.state?.location || "");
    const [searchExp, setSearchExp] = useState(location.state?.experience || "");

    const [appliedFilters, setAppliedFilters] = useState({
        query: location.state?.query || "",
        location: location.state?.location || "",
        experience: location.state?.experience || ""
    });

    // --- SELECTION STATES (User checks these, but they don't filter immediately) ---
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedWorkType, setselectedWorkType] = useState([]);
    const [SelectedPostedby, setSelectedPostedby] = useState([]);
    const [SelectedCompany, setSelectedCompany] = useState([]);
    const [SelectedEducation, setSelectedEducation] = useState([]);
    const [SelectedPostDate, setSelectedPostDate] = useState([]);
    const [SelectedIndustryType, setSelectedIndustryType] = useState([]);

    // --- APPLIED STATE (This is what actually filters the list) ---
    const [appliedSidebarFilters, setAppliedSidebarFilters] = useState({
        locations: [],
        workType: [],
        postedBy: [],
        company: [],
        education: [],
        postedDate: [],
        industryType: [],
        minSalary: 0,
        maxSalary: 100,
        maxExp: 30
    });

    const handleSearchButtonClick = () => {
        setAppliedFilters({
            query: searchQuery,
            location: searchLocation,
            experience: searchExp
        });
    };

    // --- THE APPLY FUNCTION ---
    const HandleApplyFilter = () => {
        setAppliedSidebarFilters({
            locations: selectedLocations,
            workType: selectedWorkType,
            postedBy: SelectedPostedby,
            company: SelectedCompany,
            education: SelectedEducation,
            postedDate: SelectedPostDate,
            industryType: SelectedIndustryType,
            minSalary: minVal,
            maxSalary: maxVal,
            maxExp: Exp
        });
    };

    const HandleClear = () => {
        // 1. Reset visual checkboxes
        setSelectedLocations([]);
        setselectedWorkType([]);
        setSelectedPostedby([]);
        setSelectedCompany([]);
        setSelectedEducation([]);
        setSelectedPostDate([]);
        setSelectedIndustryType([]);
        setMinVal(0);
        setMaxVal(100);
        SetExp(30);

        // 2. Reset the actual filter logic immediately
        setAppliedSidebarFilters({
            locations: [],
            workType: [],
            postedBy: [],
            company: [],
            education: [],
            postedDate: [],
            industryType: [],
            minSalary: 0,
            maxSalary: 100,
            maxExp: 30
        });
    }

    const handleSort = (type) => {
        setSortBy(type);
        setOpenSort(false);
    }

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

    // --- CHECKBOX HANDLERS (Update UI state only) ---
    const handleLocationChange = (event) => {
        const val = event.target.value;
        setSelectedLocations(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandleWorkType = (event) => {
        const val = event.target.value;
        setselectedWorkType(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandlePostedby = (event) => {
        const val = event.target.value;
        setSelectedPostedby(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
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

    // --- FILTER LOGIC (Listens to 'appliedSidebarFilters') ---
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            // Header Search
            const matchesSearch = appliedFilters.query === "" ||
                job.title?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.company?.name?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.key_skills?.some(skill =>
                    skill.toLowerCase().includes(appliedFilters.query.toLowerCase())
                )

            const matchesSearchBarLocation = appliedFilters.location === "" ||
                job.location?.toLowerCase().includes(appliedFilters.location.toLowerCase());

            const JobExp = job.experience_required
                ? parseInt(job.experience_required.match(/\d+/))
                : 0;
            let matchesSearchExp = true;
            if (appliedFilters.experience === "fresher") matchesSearchExp = JobExp === 0;
            else if (appliedFilters.experience === "1-3") matchesSearchExp = JobExp >= 1 && JobExp <= 3;
            else if (appliedFilters.experience === "3-5") matchesSearchExp = JobExp >= 3 && JobExp <= 5;
            else if (appliedFilters.experience === "5+") matchesSearchExp = JobExp >= 5;

            // Sidebar Filters (Using the Applied State)
            const sf = appliedSidebarFilters;

            const jobLocation = job.location ? job.location.toLowerCase() : 'unknown location';
            const matchesLocation = sf.locations.length === 0 || sf.locations.includes(jobLocation);

            const jobWorkType = job.work_type ? job.work_type.toLowerCase() : 'unknown worktype';
            const matchesWorkType = sf.workType.length === 0 || sf.workType.includes(jobWorkType);

            const JobPostedby = job.PostedBy ? job.PostedBy.toLowerCase() : 'unknown postedby';
            const matchesPostedby = sf.postedBy.length === 0 || sf.postedBy.includes(JobPostedby);

            const JobCompany = job.company?.name
                ? job.company.name.toLowerCase()
                : 'unknown company';

            const matchesCompany = sf.company.length === 0 || sf.company.includes(JobCompany);

            const JobPosted = job.posted_date
                ? formatPostedDate(job.posted_date)
                : "unknown posted";
            const matchesPostedDate = sf.postedDate.length === 0 || sf.postedDate.includes(JobPosted);

            const matchesEducation =
                sf.education.length === 0 ||
                (Array.isArray(job.education_required) &&
                    job.education_required.some(edu =>
                        sf.education.includes(edu.toLowerCase())
                    ));


            const matchesIndustryType =
                sf.industryType.length === 0 ||
                (Array.isArray(job.industry_type) &&
                    job.industry_type.some(type =>
                        sf.industryType.includes(type.toLowerCase())
                    ));


            const matchesExperience = JobExp <= sf.maxExp;

            const jobSalaryNum = job.salary ? parseFloat(job.salary) : 0;
            const isAboveMin = jobSalaryNum >= sf.minSalary;
            const isBelowMax = sf.maxSalary >= 100 ? true : jobSalaryNum <= sf.maxSalary;
            const matchesSalary = isAboveMin && isBelowMax;

            return matchesLocation && matchesWorkType && matchesPostedby && matchesCompany && matchesEducation && matchesPostedDate && matchesExperience && matchesIndustryType && matchesSalary && matchesSearch && matchesSearchBarLocation && matchesSearchExp;
        });
    }, [jobs, appliedFilters, appliedSidebarFilters]); // Depends on Applied Filters

    const sortedJobs = useMemo(() => {
        if (!sortBy) return filteredJobs;
        const jobsWithIndex = filteredJobs.map((job, index) => ({
            job, index
        }));
        if (sortBy === "date") {
            jobsWithIndex.sort((a, b) => new Date(b.job.posted_date) - new Date(a.job.posted_date));
        }
        if (sortBy === "ratings") {
            jobsWithIndex.sort((a, b) =>
                (b.job.company?.rating ?? 0) - (a.job.company?.rating ?? 0)
            );
        }

        return jobsWithIndex.map(item => item.job);
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
                <div className='Aside'>
                    <div className='aside-header'>
                        <p onClick={HandleApplyFilter} className='filter-applied' style={{ cursor: 'pointer' }}>Apply Filters</p>
                        <p onClick={HandleClear} className='filter-applied' style={{ cursor: 'pointer' }}>Clear Filters</p>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Work Type</h4>
                        {workTypeFilters.map(([work, workc]) => {
                            const WorkType = work.charAt(0).toUpperCase() + work.slice(1);
                            return (
                                <div key={work}>
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
                                            value={locationKey}
                                            onChange={handleLocationChange}
                                            checked={selectedLocations.includes(locationKey)}
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
                            <button onClick={handleIndustryViewMore} className='viewmore-btn'>{IndustryTypeExpanded ? 'View Less' : 'View More'}</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="section-title">Experience</h3>
                        {/* SINGLE SLIDER (Experience) */}
                        <div className="range-container single-wrapper">
                            <input
                                type="range"
                                className="slider single-thumb"
                                min="0"
                                max="30"
                                value={Exp}
                                onChange={(e) => SetExp(Math.max(Number(e.target.value)))}
                                style={{
                                    // FIX: Calculate % based on max=30, not 100
                                    background: `linear-gradient(to right, #3b82f6 ${(Exp / 30) * 100}%, #e2e8f0 ${(Exp / 30) * 100}%)`
                                }}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Exp: {Exp} Years</span>
                        </div>

                        <h3 className="section-title">Salary</h3>
                        {/* DOUBLE SLIDER (Salary) */}
                        <div className="range-container">
                            {/* Grey Background Track */}
                            <div className="slider-base-track" />

                            {/* Blue Active Track */}
                            <div
                                className="slider-active-range"
                                style={{
                                    left: `${getPercent(minVal)}%`,
                                    width: `${getPercent(maxVal) - getPercent(minVal)}%`
                                }}
                            />

                            {/* Invisible Inputs with Visible Thumbs */}
                            <input
                                className="slider multi thumb-left"
                                type="range"
                                min="0"
                                max="100"
                                value={minVal}
                                onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
                            />
                            <input
                                className="slider multi thumb-right"
                                type="range"
                                min="0"
                                max="100"
                                value={maxVal}
                                onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Min: {minVal}LPA</span>
                            {maxVal >= 100 ? <span>Max: 1 CPA</span> : <span>Max: {maxVal} LPA</span>}
                        </div>
                    </div>
                </div>

                <div className='maincontent'>
                    <div className='SortbySearch'>
                        <h2 className='NoofJobsCont'>Showing {sortedJobs.length} Jobs</h2>
                        {sortedJobs.length !== 0 && <div className="sort-wrapper">
                            <button className='Sortbutton' onClick={() => setOpenSort(!openSort)}>
                                Sort by ▾
                            </button>
                            {openSort && (
                                <div className="sort-dropdown">
                                    <div onClick={() => handleSort("recommended")}>Recommended</div>
                                    <div onClick={() => handleSort("ratings")}>Ratings</div>
                                    <div onClick={() => handleSort("date")}>Date</div>
                                </div>
                            )}
                        </div>}
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
    )
}