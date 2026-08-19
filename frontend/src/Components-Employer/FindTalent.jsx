import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './FindTalent.css';
import { useJobs } from '../JobContext';
import { ProfileCard } from './ProfileCard';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ============================================================
// ✅ SHARED DEGREE OPTIONS - Same as MyProfile
// ============================================================
const BASE_DEGREE_OPTIONS = [
  // ================= ENGINEERING / TECHNOLOGY =================
  "B.E", "B.TECH",
  "M.E", "M.TECH",
  "B.ARCH", "M.ARCH",
  "B.PLAN", "M.PLAN",

  // ================= SCIENCE =================
  "B.SC", "M.SC",
  "BSC(HONS)",
  "B.STAT", "M.STAT",
  "INTEGRATEDM.SC",

  // ================= ARTS / HUMANITIES =================
  "B.A", "M.A",
  "BA(HONS)",

  // ================= COMMERCE / MANAGEMENT =================
  "B.COM", "M.COM",
  "BBA", "MBA", "PGDM",
  "BBM", "BMS",
  "BCA", "MCA",
  "BFIA",

  // ================= COMPUTER SCIENCE / IT =================
  "BSCCS", "BSCIT", "MSCCS", "MSCIT",
  "MSCDATASCIENCE", "PGDCA",

  // ================= MEDICAL - ALLOPATHY =================
  "MBBS",
  "MD", "MS", "DM", "M.CH",
  "DNB",

  // ================= DENTAL =================
  "BDS", "MDS",

  // ================= AYUSH =================
  "BAMS", "BHMS", "BUMS", "BSMS", "BYNS", "BNYS",
  "MDAYURVEDA", "MDHOMEOPATHY",

  // ================= VETERINARY / AGRICULTURE / FORESTRY =================
  "BVSC", "BVSC&AH", "MVSC",
  "BSCAGRICULTURE", "MSCAGRICULTURE",
  "BSCFORESTRY", "BSCHORTICULTURE",
  "B.F.SC",

  // ================= PHARMACY =================
  "D.PHARM",
  "B.PHARM",
  "M.PHARM",
  "PHARM.D", "PHARMD",

  // ================= NURSING / ALLIED HEALTH =================
  "ANM", "GNM",
  "BSCNURSING", "MSCNURSING",
  "BPT", "MPT",
  "BOT", "MOT",
  "BASLP",
  "B.SCMLT",
  "BSCOPTOMETRY",

  // ================= LAW =================
  "LL.B",
  "BALLB", "BA.LLB", "BBALLB", "BBA.LLB", "BCOMLLB",
  "LL.M",

  // ================= EDUCATION =================
  "D.ED",
  "B.ED",
  "M.ED",
  "D.EL.ED",
  "B.P.ED",
  "M.P.ED",

  // ================= DESIGN / FINE ARTS / FASHION =================
  "B.DES",
  "M.DES",
  "BFA", "MFA",
  "BSCFASHIONDESIGN", "MSCFASHIONDESIGN",
  "BID",

  // ================= SOCIAL WORK / JOURNALISM / MEDIA =================
  "BSW", "MSW",
  "BJMC", "MJMC",
  "BJ", "MJ",
  "BLIS", "MLIS",

  // ================= HOTEL MANAGEMENT / AVIATION / VOCATIONAL =================
  "BHM", "BHMCT", "MHM",
  "B.VOC",
  "DIPLOMAINAVIATION",

  // ================= PROFESSIONAL / FINANCE =================
  "C.A",
  "C.S",
  "CMA", "ICWA",
  "CFA",
  "ACCA",
  "ACTUARIALSCIENCE",

  // ================= DIPLOMA / DOCTORATE / OTHER =================
  "DIPLOMA",
  "POLYTECHNIC",
  "ITI",
  "PH.D", "DOCTORATE",
];

// Remove duplicates and sort
const BASE_DEGREE_SET = new Set(BASE_DEGREE_OPTIONS);

export const FindTalent = ({ onUpgradeClick }) => {
  // Get data from JobContext
  const { Alluser, setAlluser } = useJobs();
  const navigate = useNavigate();

  // Combined access state
  const [accessState, setAccessState] = useState({
    canAccess: false,
    isExpired: false,
    isCancelled: false,
    isFeatureEnabled: false,
    planName: null,
    message: null,
    subscriptionStatus: null
  });
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [loadingJobseekers, setLoadingJobseekers] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  // States for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedEdu, setSelectedEdu] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [maxExp, setMaxExp] = useState(10);

  // States for "View More" toggles
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [filterSearch, setFilterSearch] = useState({ lang: '', edu: '', skill: '' });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    languages: [],
    education: [],
    skills: [],
    experience: 10
  });

  // ============================================
  // 1. CHECK ACCESS - MAIN FUNCTION
  // ============================================
  const checkCandidateSearchAccess = useCallback(async (forceRefresh = false) => {
    if (isChecking && !forceRefresh) return;

    try {
      setIsChecking(true);
      if (forceRefresh) setLoadingAccess(true);

      console.log('🔍 Checking Candidate Search access...');

      const subscriptionResponse = await api.get('/subscription/');
      const subscription = subscriptionResponse.data;
      const plan = subscription?.plan;

      console.log('📊 Subscription data:', {
        status: subscription?.status,
        is_expired: subscription?.is_expired,
        plan_name: plan?.name,
        candidate_search: plan?.Candidate_Search
      });

      const isExpired = subscription?.is_expired === true;
      const isCancelled = subscription?.status === 'cancelled';
      const isActive = subscription?.status === 'active';
      const isFeatureEnabled = plan?.Candidate_Search === true;

      const canAccess = isActive && !isExpired && isFeatureEnabled;

      let message = '';
      let subscriptionStatus = subscription?.status || 'unknown';

      if (isCancelled) {
        message = `Your ${plan?.name || 'current'} plan has been cancelled. Please reactivate to access Candidate Search.`;
      } else if (isExpired) {
        message = `Your ${plan?.name || 'current'} plan has expired. Please renew to access Candidate Search.`;
      } else if (!isFeatureEnabled) {
        message = `Candidate Search is not included in your ${plan?.name || 'current'} plan. Upgrade to unlock candidate search.`;
      } else if (!isActive) {
        message = `Your subscription is not active. Please contact support.`;
      }

      if (accessState.canAccess && !canAccess) {
        console.log('🔴 Access revoked - clearing candidate data');
        setAlluser([]);
        setHasData(false);
      }

      setAccessState({
        canAccess,
        isExpired,
        isCancelled,
        isFeatureEnabled,
        planName: plan?.name,
        message,
        subscriptionStatus
      });

      if (canAccess && !hasData) {
        await fetchJobseekers();
      } else if (!canAccess) {
        setLoadingAccess(false);
        setLoadingJobseekers(false);
      } else if (canAccess && hasData) {
        setLoadingAccess(false);
        setLoadingJobseekers(false);
      }

    } catch (error) {
      console.error('❌ Error checking candidate search access:', error);
      setAccessState({
        canAccess: false,
        isExpired: false,
        isCancelled: false,
        isFeatureEnabled: false,
        planName: null,
        message: 'Unable to verify access. Please try again.',
        subscriptionStatus: 'error'
      });
      setLoadingAccess(false);
      setLoadingJobseekers(false);
    } finally {
      setIsChecking(false);
    }
  }, [accessState.canAccess, hasData, isChecking, setAlluser]);

  // ============================================
  // 2. FETCH JOBSEEKERS
  // ============================================
  const fetchJobseekers = async () => {
    try {
      setLoadingJobseekers(true);
      console.log('🔵 Fetching jobseekers...');

      const res = await api.get("/jobseekers/");
      const jobseekersOnly = res.data.filter(
        item => item.user?.user_type === "jobseeker"
      );

      console.log('✅ Jobseekers fetched:', jobseekersOnly.length);
      setAlluser(jobseekersOnly);
      setHasData(true);
    } catch (err) {
      console.error("❌ Error fetching jobseekers:", err);
      setAlluser([]);
      setHasData(false);
    } finally {
      setLoadingJobseekers(false);
      setLoadingAccess(false);
    }
  };

  // ============================================
  // 3. REFRESH DATA
  // ============================================
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing data...');
    await fetchJobseekers();
    setSelectedLanguages([]);
    setSelectedEdu([]);
    setSelectedSkills([]);
    setAppliedFilters({
      search: '',
      languages: [],
      education: [],
      skills: [],
      experience: maxExp
    });
    setVisibleCount(10);
  }, [fetchJobseekers, maxExp]);

  // ============================================
  // 4. HANDLE UPGRADE/REACTIVATE
  // ============================================
  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick(refreshAccess);
    } else {
      navigate('/Job-portal/Employer/Dashboard', {
        state: { targetTab: 'Billing' }
      });
    }
  };

  const handleGoBack = () => {
    navigate('/Job-portal/Employer/Dashboard', {
      state: { targetTab: 'Dashboard' }
    });
  };

  // ============================================
  // 5. EFFECTS
  // ============================================
  useEffect(() => {
    const userType = sessionStorage.getItem('user_type');
    if (userType !== 'employer') {
      navigate('/Job-portal/jobseeker/');
      return;
    }
    checkCandidateSearchAccess(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkCandidateSearchAccess(false);
      if (accessState.canAccess) {
        refreshData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [checkCandidateSearchAccess, accessState.canAccess, refreshData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible - re-checking access and refreshing data');
        checkCandidateSearchAccess(true);
        if (accessState.canAccess) {
          refreshData();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkCandidateSearchAccess, accessState.canAccess, refreshData]);

  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Page focused - re-checking access and refreshing data');
      checkCandidateSearchAccess(true);
      if (accessState.canAccess) {
        refreshData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkCandidateSearchAccess, accessState.canAccess, refreshData]);

  useEffect(() => {
    const handlePopState = () => {
      console.log('↩️ Navigation - re-checking access and refreshing data');
      checkCandidateSearchAccess(true);
      if (accessState.canAccess) {
        refreshData();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [checkCandidateSearchAccess, accessState.canAccess, refreshData]);

  // ============================================
  // 6. FILTER LOGIC - NO NORMALIZATION
  // ============================================

  // ✅ Build dynamic degree options from BASE + degrees from backend
  const dynamicDegreeOptions = useMemo(() => {
    const dynamicSet = new Set(BASE_DEGREE_SET);

    if (Alluser && Alluser.length > 0) {
      Alluser.forEach(user => {
        const educations = user.profile?.educations || user.educations || [];
        if (Array.isArray(educations)) {
          educations.forEach(edu => {
            const degree = edu?.degree || edu?.course || edu?.qualification || edu?.name;
            if (degree && typeof degree === 'string' && degree.trim()) {
              dynamicSet.add(degree.trim());
            }
          });
        }
      });
    }

    return Array.from(dynamicSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [Alluser]);

  const jobseekersOnly = useMemo(() => {
    if (!Alluser || Alluser.length === 0) return [];
    return Alluser.filter(user => {
      const userType = user.user?.user_type ||
        user.user_type ||
        user.role ||
        user.profile?.user_type;
      return userType !== 'employer';
    });
  }, [Alluser]);

  // ✅ EDUCATION FILTER OPTIONS - Direct values from MyProfile
  const filterOptions = useMemo(() => {
    const languages = new Map();
    const education = new Map();
    const skills = new Map();

    // ============================================================
    // STEP 1: Add ALL base degree options
    // ============================================================
    BASE_DEGREE_OPTIONS.forEach(deg => {
      if (deg && deg.trim()) {
        education.set(deg.trim().toLowerCase(), deg.trim());
      }
    });

    // ============================================================
    // STEP 2: Add ALL dynamic degree options from MyProfile
    // ============================================================
    dynamicDegreeOptions.forEach(edu => {
      if (edu && edu.trim()) {
        education.set(edu.trim().toLowerCase(), edu.trim());
      }
    });

    if (!Alluser || Alluser.length === 0) {
      return {
        languages: [],
        education: Array.from(education.values()).sort(),
        skills: [],
      };
    }

    // ============================================================
    // STEP 3: Extract from user data (languages and skills only)
    // ============================================================
    const processArray = (arr, key, map) => {
      if (!Array.isArray(arr)) return;
      arr.forEach(item => {
        const raw = typeof item === 'string' ? item : (item[key] || item.course || item.qualification || item.name);
        if (raw && typeof raw === 'string' && raw.trim()) {
          map.set(raw.trim().toLowerCase(), raw.trim());
        }
      });
    };

    Alluser.forEach(user => {
      processArray(user.profile?.languages, "name", languages);
      processArray(user.profile?.skills, "name", skills);
      processArray(user.languages, "name", languages);
      processArray(user.skills, "name", skills);
    });

    console.log('📚 Education options available (BASE + DYNAMIC):', Array.from(education.values()).sort());

    return {
      languages: Array.from(languages.values()).sort(),
      education: Array.from(education.values()).sort(),
      skills: Array.from(skills.values()).sort(),
    };
  }, [Alluser, dynamicDegreeOptions]);

  const handleFilterChange = (value, state, setState) => {
    setState(
      state.includes(value)
        ? state.filter(i => i !== value)
        : [...state, value]
    );
  };

  const handleApplyFilters = () => {
    const term = searchTerm.toLowerCase().trim();
    let newLangs = [...selectedLanguages];
    let newEdu = [...selectedEdu];
    let newSkills = [...selectedSkills];

    if (term) {
      // Check if search term matches any degree option
      const matchingDegree = dynamicDegreeOptions.find(d =>
        d.toLowerCase() === term
      );

      if (matchingDegree && !newEdu.includes(matchingDegree)) {
        newEdu.push(matchingDegree);
      }

      filterOptions.languages.forEach(l => {
        if (l.toLowerCase() === term && !newLangs.includes(l)) newLangs.push(l);
      });
      filterOptions.skills.forEach(s => {
        if (s.toLowerCase() === term && !newSkills.includes(s)) newSkills.push(s);
      });
    }

    setSelectedLanguages(newLangs);
    setSelectedEdu(newEdu);
    setSelectedSkills(newSkills);
    setAppliedFilters({
      search: term,
      languages: newLangs,
      education: newEdu,
      skills: newSkills,
      experience: maxExp
    });
    setVisibleCount(10);
  };

  const handleSearchClick = () => handleApplyFilters();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleApplyFilters();
  };

  const getVisibleItemsWithSearch = (items, showAll, searchKey, limit = 5) => {
    if (!items || items.length === 0) return [];
    const filtered = items.filter(item =>
      item.toLowerCase().includes(filterSearch[searchKey].toLowerCase())
    );
    return (showAll || filterSearch[searchKey]) ? filtered : filtered.slice(0, limit);
  };

  // ✅ Filtered talent with direct comparison (no normalization)
  const filteredTalent = useMemo(() => {
    if (!Alluser || Alluser.length === 0) return [];
    return Alluser.filter((user) => {
      const userType = user.user?.user_type || user.user_type || user.role || user.profile?.user_type;
      if (userType === 'employer') return false;

      // if (user.settings?.hide_cv || user.hide_cv) return false;
      // if (user.profile?.hide_cv || user.hide_cv) return false;
      if (user.hide_cv) return false;

      const extractText = (data) => {
        if (!data) return [];
        const arr = Array.isArray(data) ? data : [data];
        return arr.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object') return Object.values(item).filter(v => typeof v === 'string').join(' ');
          return '';
        }).filter(Boolean);
      };

      // Extract education with all possible field names
      const userEducationRaw = user.profile?.educations || user.educations || user.profile?.education || user.education || [];
      const userEducation = extractText(userEducationRaw);

      // Extract degree specifically
      const userDegrees = (user.profile?.educations || user.educations || [])
        .map(edu => edu?.degree || edu?.course || edu?.qualification || edu?.name || '')
        .filter(Boolean);

      const userSkills = extractText(user.profile?.skills || user.skills);
      const userLanguages = extractText(user.profile?.languages || user.languages);

      const searchLower = appliedFilters.search.toLowerCase().trim();
      let matchesSearch = true;
      if (searchLower) {
        const searchableText = [
          user.full_name || '',
          user.current_job_title || user.profile?.current_job_title || '',
          user.current_company || user.profile?.current_company || '',
          user.current_location || user.profile?.current_location || '',
          user.city || user.profile?.city || '',
          user.state || user.profile?.state || '',
          ...userSkills,
          ...userEducation,
          ...userDegrees
        ].join(' ').toLowerCase();
        matchesSearch = searchableText.includes(searchLower);
      }

      const matchesLanguage =
        appliedFilters.languages.length === 0 ||
        appliedFilters.languages.some(appLang =>
          userLanguages.some(lang => lang.toLowerCase().includes(appLang.toLowerCase().trim()))
        );

      // ✅ Direct education matching - no normalization
      const matchesEducation =
        appliedFilters.education.length === 0 ||
        appliedFilters.education.some(appEdu => {
          const searchEdu = appEdu.toLowerCase().trim();
          // Check in education objects
          const matchesInEducation = userEducation.some(edu =>
            edu.toLowerCase().includes(searchEdu)
          );
          // Check in degree fields specifically
          const matchesInDegree = userDegrees.some(deg =>
            deg.toLowerCase().includes(searchEdu)
          );
          return matchesInEducation || matchesInDegree;
        });

      const matchesSkills =
        appliedFilters.skills.length === 0 ||
        appliedFilters.skills.every(appSkill =>
          userSkills.some(skill => skill.toLowerCase().includes(appSkill.toLowerCase().trim()))
        );

      let expNumber = 0;
      if (user.total_experience_years !== undefined) {
        expNumber = parseFloat(user.total_experience_years) || 0;
      } else if (user.profile?.total_experience_years) {
        expNumber = parseFloat(user.profile.total_experience_years) || 0;
      }

      const matchesExperience = expNumber <= appliedFilters.experience;

      return matchesSearch && matchesLanguage && matchesEducation && matchesSkills && matchesExperience;
    });
  }, [appliedFilters, Alluser]);

  const clearFilters = () => {
    setSelectedLanguages([]);
    setSelectedEdu([]);
    setSelectedSkills([]);
    setMaxExp(10);
    setSearchTerm('');
    setShowAllLangs(false);
    setShowAllEdu(false);
    setShowAllSkills(false);
    setFilterSearch({ lang: '', edu: '', skill: '' });
    setAppliedFilters({
      search: '',
      languages: [],
      education: [],
      skills: [],
      experience: 10
    });
    setVisibleCount(10);
  };

  // ============================================
  // 7. RENDER LOGIC
  // ============================================

  if (loadingAccess || loadingJobseekers) {
    return (
      <div className="talent-page-container">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #007bff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{ color: "#64748b" }}>
            {loadingAccess ? 'Checking access permissions...' : 'Loading jobseekers...'}
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!accessState.canAccess) {
    const isExpired = accessState.isExpired;
    const isCancelled = accessState.isCancelled;
    const isFeatureDisabled = !accessState.isFeatureEnabled && !isExpired && !isCancelled;

    return (
      <div className="talent-page-container">
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          maxWidth: "550px",
          margin: "40px auto"
        }}>
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>
            {isCancelled ? '🚫' : isExpired ? '⏰' : '🔒'}
          </div>
          <h2 style={{ color: "#1e293b", marginBottom: "15px", fontSize: "28px" }}>
            {isCancelled ? 'Plan Cancelled' : isExpired ? 'Access Expired' : 'Feature Locked'}
          </h2>
          <p style={{ color: "#64748b", marginBottom: "25px", lineHeight: "1.6", fontSize: "16px" }}>
            {accessState.message}
          </p>

          <div style={{
            background: isCancelled ? "#fee2e2" : isExpired ? "#fee2e2" : "#fef9ec",
            border: isCancelled ? "1px solid #fecaca" : isExpired ? "1px solid #fecaca" : "1px solid #fde68a",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            fontSize: "14px",
            color: isCancelled ? "#991b1b" : isExpired ? "#991b1b" : "#92400e",
            textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "20px" }}>
                {isCancelled ? '⚠️' : isExpired ? '⚠️' : '💡'}
              </span>
              <strong style={{ fontSize: "15px" }}>
                {isCancelled ? 'What you lost:' : isExpired ? 'What you lose:' : 'Upgrade to unlock:'}
              </strong>
            </div>
            <ul style={{ margin: "10px 0 0 20px", padding: 0 }}>
              <li style={{ marginBottom: "8px" }}>✓ Search and filter through 1000+ jobseekers</li>
              <li style={{ marginBottom: "8px" }}>✓ Directly contact potential candidates</li>
              <li style={{ marginBottom: "8px" }}>✓ Advanced filtering by skills, experience, and education</li>
              <li style={{ marginBottom: "8px" }}>✓ Save candidate searches and get alerts</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleUpgrade}
              style={{
                padding: "12px 30px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {isCancelled ? 'Reactivate Plan Now' : isExpired ? 'Renew Plan Now' : 'Upgrade Plan Now'}
            </button>
            <button
              onClick={handleGoBack}
              style={{
                padding: "12px 30px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Go to Dashboard
            </button>
          </div>

          <p style={{ marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
            {isCancelled
              ? 'Contact support or reactivate your plan to restore access.'
              : isExpired
                ? 'Renew your plan to restore access.'
                : 'Contact your administrator to upgrade your plan.'
            }
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // 8. HAS ACCESS - SHOW FULL CONTENT
  // ============================================
  return (
    <div className="talent-page-container">
      <div style={{
        textAlign: "right",
        padding: "10px 20px",
        fontSize: "12px",
        color: "#64748b",
        borderBottom: "1px solid #e2e8f0"
      }}>
        Plan: {accessState.planName} • Status: Active
        <button
          onClick={refreshData}
          style={{
            marginLeft: '15px',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#64748b'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <section className="FindTalent-search-section">
        <div className="FindTalent-search-wrapper">
          <input
            type="text"
            placeholder="Search by Skills, Education, or Job Title"
            className="FindTalent-search-input"
            value={searchTerm}
            onChange={(e) => {
              const newValue = e.target.value;
              setSearchTerm(newValue);
              if (newValue.trim() === '') {
                setSelectedLanguages([]);
                setSelectedEdu([]);
                setSelectedSkills([]);
                setAppliedFilters({
                  search: '',
                  languages: [],
                  education: [],
                  skills: [],
                  experience: maxExp
                });
              }
            }}
            onKeyPress={handleKeyPress}
          />
          <button
            className="FindTalent-search-button"
            onClick={handleSearchClick}
          >
            Search
          </button>
        </div>
        <h1 style={{ marginTop: "40px" }} className="FindTalent-results-title">
          {loadingJobseekers
            ? "Loading jobseekers..."
            : `Jobseekers based on your search (${filteredTalent.length})`
          }
        </h1>
      </section>

      <div className="FindTalent-layout-body">
        <div className="FindTalent-filters-sidebar">
          <div className="FindTalent-filter-top">
            <button className="FindTalent-filter-label" onClick={handleApplyFilters}>Apply filters</button>
            <span className="FindTalent-clear-btn" onClick={clearFilters}>
              Clear all
            </span>
          </div>

          {/* Languages Filter */}
          {filterOptions.languages.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Languages</h3>
              <input
                type="text"
                placeholder="Search languages..."
                className="FindTalent-filter-search-input"
                value={filterSearch.lang}
                onChange={(e) => setFilterSearch({ ...filterSearch, lang: e.target.value })}
                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
              {getVisibleItemsWithSearch(filterOptions.languages, showAllLangs, 'lang').map(lang => (
                <div key={lang} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => handleFilterChange(lang, selectedLanguages, setSelectedLanguages)}
                  />
                  <label htmlFor={`lang-${lang}`}>{lang}</label>
                </div>
              ))}
              {filterOptions.languages.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllLangs(!showAllLangs)}>
                  {showAllLangs ? "View Less" : `View More (${filterOptions.languages.length - 5}+)`}
                </span>
              )}
            </div>
          )}

          {/* Experience Filter */}
          <div className="FindTalent-filter-category">
            <h3>Experience (Max: {maxExp} years)</h3>
            <input
              type="range"
              min="0"
              max="20"
              value={maxExp}
              className="FindTalent-exp-slider"
              onChange={(e) => setMaxExp(parseInt(e.target.value))}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px'
            }}>
              <span>0 yrs</span>
              <span>20 yrs</span>
            </div>
          </div>

          {/* ✅ Education Filter - Shows ALL degrees from MyProfile (no normalization) */}
          {filterOptions.education.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Education</h3>
              <input
                type="text"
                placeholder="Search education..."
                className="FindTalent-filter-search-input"
                value={filterSearch.edu}
                onChange={(e) => setFilterSearch({ ...filterSearch, edu: e.target.value })}
                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
              {getVisibleItemsWithSearch(filterOptions.education, showAllEdu, 'edu', 5).map(edu => (
                <div key={edu} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`edu-${edu}`}
                    checked={selectedEdu.includes(edu)}
                    onChange={() => handleFilterChange(edu, selectedEdu, setSelectedEdu)}
                  />
                  <label htmlFor={`edu-${edu}`}>{edu}</label>
                </div>
              ))}
              {filterOptions.education.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllEdu(!showAllEdu)}>
                  {showAllEdu ? "View Less" : `View More (${filterOptions.education.length - 5}+)`}
                </span>
              )}
            </div>
          )}

          {/* Skills Filter */}
          {filterOptions.skills.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Skills</h3>
              <input
                type="text"
                placeholder="Search skills..."
                className="FindTalent-filter-search-input"
                value={filterSearch.skill}
                onChange={(e) => setFilterSearch({ ...filterSearch, skill: e.target.value })}
                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
              {getVisibleItemsWithSearch(filterOptions.skills, showAllSkills, 'skill').map(skill => (
                <div key={skill} className="FindTalent-checkbox-item">
                  <input
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleFilterChange(skill, selectedSkills, setSelectedSkills)}
                  />
                  <label htmlFor={`skill-${skill}`}>{skill}</label>
                </div>
              ))}
              {filterOptions.skills.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllSkills(!showAllSkills)}>
                  {showAllSkills ? "View Less" : `View More (${filterOptions.skills.length - 5}+)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Talent List */}
        <div className="FindTalent-talent-list">
          {loadingJobseekers ? (
            <div className="FindTalent-no-results">
              <h3>Loading jobseekers...</h3>
              <p>Please wait while we fetch the data</p>
            </div>
          ) : filteredTalent.length > 0 ? (
            filteredTalent.slice(0, visibleCount).map((user, index) => (
              <ProfileCard
                key={user.id || index}
                user={user}
                showActions={true}
              />
            ))
          ) : (
            <div className="FindTalent-no-results">
              <h3>No job seekers found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="FindTalent-clear-filters-btn" onClick={clearFilters}>
                Clear all filters
              </button>
              <button
                onClick={refreshData}
                style={{
                  marginTop: '10px',
                  padding: '8px 20px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh Data
              </button>
            </div>
          )}

          {filteredTalent.length > visibleCount && (
            <button
              className="FindTalent-load-more-btn"
              onClick={() => setVisibleCount(prev => prev + 10)}
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};