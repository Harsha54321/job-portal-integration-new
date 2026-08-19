import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import './PostJobForm.css';
import { locationsList } from "../Locations";
import api from '../api/axios';

const availableSkills = ["UI & UX", "UI/UX Design", "UI Design", "UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign", "Wireframing", "Prototyping",
  "HTML", "HTML5", "CSS", "CSS3", "JavaScript", "TypeScript", "React", "React Native", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "SASS", "LESS", "Tailwind CSS", "Bootstrap", "Material UI", "Redux", "Webpack", "Babel", "DOM Manipulation", "AJAX", "JSON",
  "Node.js", "Express.js", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Hibernate", "C", "C++", "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Symfony", "Ruby", "Ruby on Rails", "Go", "Rust", "Swift", "Kotlin", "Scala", "Elixir", "Erlang",
  "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Mongoose", "Redis", "Cassandra", "DynamoDB", "Firebase", "Oracle", "Microsoft SQL Server", "GraphQL", "REST API", "Prisma",
  "AWS", "Azure", "Google Cloud Platform (GCP)", "Docker", "Kubernetes", "Linux", "Unix", "Ubuntu", "CentOS", "Jenkins", "Travis CI", "CircleCI", "GitLab CI/CD", "Terraform", "Ansible", "Puppet", "Chef", "Bash", "Shell Scripting", "Nginx", "Apache",
  "Data Analysis", "Data Science", "Machine Learning", "Artificial Intelligence", "Deep Learning", "NLP", "Computer Vision", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-Learn", "TensorFlow", "Keras", "PyTorch", "Tableau", "Power BI", "Excel", "R", "Hadoop", "Spark", "Kafka",
  "Android SDK", "iOS Development", "Flutter", "Dart", "Objective-C", "Xamarin", "Ionic", "Service Now", "Automation Testing", "Manual Testing", "Test Cases", "Test Plans",
  "Agile", "Scrum", "Kanban", "Jira", "Trello", "Asana", "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Swagger",
  "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Cryptography", "Blockchain", "Web3", "Smart Contracts", "Solidity", "QA Testing", "Selenium", "Jest", "Mocha", "Chai", "Cypress", "Puppeteer", "Project Management", "Product Management", "Digital Marketing", "SEO", "SEM", "Content Writing", "Copywriting", "Sales", "Business Development", "Customer Success", "Technical Support"];

export const PostJobForm = ({ onCancel, editJobData }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const isEditMode = Boolean(editJobData?.id);

  // ============================================
  // PLAN ACCESS STATE
  // ============================================
  const [accessState, setAccessState] = useState({
    hasAccess: false,
    isExpired: false,
    isCancelled: false,
    planName: null,
    message: null,
    loading: true
  });

  const [isChecking, setIsChecking] = useState(false);

  // ============================================
  // CHECK PLAN ACCESS - ONLY ONCE ON MOUNT
  // ============================================
  const checkPlanAccess = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      setAccessState(prev => ({ ...prev, loading: true }));

      console.log('🔍 Checking plan access for job posting...');

      const subRes = await api.get('/subscription/');
      const subscription = subRes.data;
      const plan = subscription?.plan;

      console.log('📊 Job posting access:', {
        status: subscription?.status,
        is_expired: subscription?.is_expired,
        plan_name: plan?.name
      });

      const isExpired = subscription?.is_expired === true;
      const isCancelled = subscription?.status === 'cancelled';
      const isActive = subscription?.status === 'active';

      const hasAccess = isActive && !isExpired;

      let message = '';
      if (isCancelled) {
        message = `Your ${plan?.name || 'current'} plan has been cancelled. Please reactivate to post jobs.`;
      } else if (isExpired) {
        message = `Your ${plan?.name || 'current'} plan has expired. Please renew to post jobs.`;
      } else if (!isActive) {
        message = `Your subscription is not active. Please contact support.`;
      }

      setAccessState({
        hasAccess,
        isExpired,
        isCancelled,
        planName: plan?.name,
        message,
        loading: false
      });

    } catch (error) {
      console.error('❌ Error checking plan access:', error);
      setAccessState({
        hasAccess: false,
        isExpired: false,
        isCancelled: false,
        planName: null,
        message: 'Unable to verify access. Please try again.',
        loading: false
      });
    } finally {
      setIsChecking(false);
    }
  };

  // ============================================
  // ONLY ON MOUNT - No intervals, no re-checks
  // ============================================
  useEffect(() => {
    checkPlanAccess();
  }, []);

  // ============================================
  // ORIGINAL FORM STATE
  // ============================================
  const categoryOptions = ["Aerospace & Defense", "Ai/MI", "Analytics", "Artificial Intelligence", "Automotive", "Big Data", "Biotechnology", "Business Consulting", "Business Intelligence", "Cloud Computing", "Cloud Services", "Construction", "Consulting", "Consumer Goods", "Consumer Tech", "Corporate", "Corporate Functions", "Customer Support", "Cybersecurity", "Data Infrastructure", "Data Science", "Design", "Digital Marketing", "Digital Media", "E-Commerce", "Ed-Tech", "Energy", "Enterprise Software", "Entertainment", "Finance", "Financial Services", "Fintech", "Fmcg", "Healthcare", "Hospital", "Hr Services", "Human Resources", "Internet", "It Consulting", "It Networking", "IT Services", "Logistics", "Marketing", "Marketing & Advertising", "Martech", "Mobile App Development", "Mobile Development", "Pharmaceutical", "Pharma", "Product Development", "Project Management", "Real Estate", "Recruitment", "Regional Sales", "Renewable Power", "Research", "Retail", "Retail Tech", "Saas", "Sales", "Site Reliability Engineering", "Software Development", "Software Product", "Software Testing", "Subscription Service", "Supply Chain", "Technology", "Telecommunications"];

  const educationOptions = [
    "BS", "B.A", "CA", "B.Ed", "M.Com", "B.Sc", "MCA", "BCA", "LLM", "MS/M.Sc", "Diploma", "B.Com", "M.Tech", "MBA/PGDM", "PG Diploma", "B.B.A/ B.M.S", "Medical-MS/MD", "B.Tech/B.E.", "Any Graduate", "Other Post Graduate", "ITI Certification", "Any Postgraduate", "Bachelor Of Science", "Business Economics", "Artificial Intelligence (AI)", "Machine Learning", "Data Science",
    "Cyber Security", "Cloud Computing",
  ];

  const departmentOptions = [
    "Engineering", "Marketing", "Sales", "Human Resources", "Finance",
    "Operations", "Product Management", "Customer Success", "Design",
    "Data Science", "Legal", "Information Technology", "Administrative"
  ];

  const [formData, setFormData] = useState({
    job_title: '',
    industry_type: [],
    department: [],
    education: [],
    work_type: '',
    shift: '',
    work_duration: '',
    salary: '',
    fresher: '',
    experience: '',
    location: [],
    openings: '',
    job_category: '',
    key_skills: [],
    job_highlights: [''],
    job_description: '',
    responsibilities: ['']
  });

  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  // ============================================
  // ORIGINAL FORM FUNCTIONS
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.jobpost-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (errors.key_skills) {
      setErrors({ ...errors, key_skills: "" });
    }

    if (value.trim()) {
      const filtered = availableSkills.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !skillsList.some(s => s.toLowerCase() === skill.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  const selectSkill = (skill) => {
    setSkillsList([...skillsList, skill]);
    setSkillInput("");
    setFilteredSkills([]);
    setErrors({ ...errors, keySkills: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const jobTitleRegex = /^[a-zA-Z][a-zA-Z0-9\s&/_@.+()!-]{3,}$/;
    const durationRegex = /^(\d+\s*(month|months|year|years)|permanent)$/i;
    const openingsRegex = /^[1-9][0-9]{0,2}$/;
    const contentRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,-]{5,}$/;
    const expRegex = /^(\d{1,2})(\s*-\s*(\d{1,2}))?$/;

    // Job Title
    const titleTrimmed = formData.job_title.trim();
    if (!titleTrimmed) {
      newErrors.job_title = "Job title is required";
    } else if (titleTrimmed.length > 50) {
      newErrors.job_title = "Job title cannot exceed 50 characters";
    } else if (!jobTitleRegex.test(titleTrimmed)) {
      newErrors.job_title = "Minimum 3 characters; letters, numbers, and common symbols allowed)";
    }

    // Work Duration
    if (!formData.work_duration.trim()) {
      newErrors.work_duration = "Work duration is required";
    } else if (!durationRegex.test(formData.work_duration.trim())) {
      newErrors.work_duration = "Enter e.g. '6 Months' or 'Permanent'";
    }

    // Salary
    const salaryInput = formData.salary.trim();
    const salaryRegex = /^(\d{3,7})(\s?\/-\s?)?\s?(per\s?month|\/month|pm)$|^(\d+(\.\d{1,2})?)\s?(lpa)$|^(\d+(\.\d{1,2})?)\s?(cr|crore)\s?(per\s?year)?$/i;

    if (!salaryInput) {
      newErrors.salary = "Salary is required";
    } else if (!salaryRegex.test(salaryInput)) {
      if (/^\d+$/.test(salaryInput)) {
        newErrors.salary = "Please specify unit (e.g., 'LPA' or 'per month')";
      } else if (/[^\w\s./-]/.test(salaryInput)) {
        newErrors.salary = "Invalid characters not allowed";
      } else if (/lpa/i.test(salaryInput) && /(month|pm)/i.test(salaryInput)) {
        newErrors.salary = "Do not mix LPA with monthly format";
      } else {
        newErrors.salary = "Invalid format (e.g., 15000 per month, 5 LPA, 1 cr per year)";
      }
    }

    // Fresher
    if (!formData.fresher) {
      newErrors.fresher = "Please select whether fresher is allowed or not";
    }

    // Experience
    const expStr = formData.experience.trim();

    if (formData.fresher === 'no') {
      if (!expStr) {
        newErrors.experience = "Experience is required";
      } else if (!expRegex.test(expStr)) {
        newErrors.experience = "Invalid format (e.g., '0', '0-6', '3-12')";
      } else {
        if (expStr.includes('-')) {
          const [start, end] = expStr.split('-').map(num => parseInt(num.trim()));
          if (end <= start) {
            newErrors.experience = "End value must be greater than start value";
          }
          if (start < 0 || end < 0) {
            newErrors.experience = "Experience cannot be negative";
          }
        } else {
          const value = parseInt(expStr);
          if (value < 0) {
            newErrors.experience = "Experience cannot be negative";
          }
        }
      }
    } else if (formData.fresher === 'yes') {
      if (expStr && !expRegex.test(expStr)) {
        newErrors.experience = "Invalid format (e.g., '0', '0-6', '3-12')";
      }
    }

    // Openings
    const openingsStr = String(formData.openings).trim();
    if (!openingsStr || openingsStr === '0') {
      newErrors.openings = "Please enter valid openings in numbers only";
    } else if (!openingsRegex.test(openingsStr)) {
      newErrors.openings = "Enter a valid count (max 999)";
    }

    // Job Highlights
    if (!formData.job_highlights[0]?.trim()) {
      newErrors.job_highlights = "First highlight is required";
    } else if (!contentRegex.test(formData.job_highlights[0])) {
      newErrors.job_highlights = "Must be at least 5 characters";
    }

    // Responsibilities
    if (!formData.responsibilities[0]?.trim()) {
      newErrors.responsibilities = "First responsibility is required";
    } else if (!contentRegex.test(formData.responsibilities[0])) {
      newErrors.responsibilities = "Must be at least 5 characters";
    }

    // Standard checks
    if (formData.industry_type.length === 0) newErrors.industry_type = "Select industrial type";
    if (formData.department.length === 0) newErrors.department = "Select department";
    if (formData.education.length === 0) newErrors.education = "Select education";
    if (locationList.length === 0) newErrors.location = "Select at least one location";
    if (!formData.work_type) newErrors.work_type = "Select work type";
    if (!formData.shift) newErrors.shift = "Select shift";
    if (!formData.job_category) newErrors.job_category = "Select job category";
    if (skillsList.length === 0) newErrors.key_skills = "Add at least one skill";

    if (!formData.job_description.trim() || formData.job_description.length < 50) {
      newErrors.job_description = "Description must be at least 50 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (name, value, allOptions = []) => {
    setErrors({ ...errors, [name]: "" });

    setFormData(prev => {
      const currentList = prev[name] || [];

      if (value === "all") {
        const isAllSelected = currentList.length === allOptions.length;
        return { ...prev, [name]: isAllSelected ? [] : allOptions };
      }
      const newList = currentList.includes(value)
        ? currentList.filter(i => i !== value)
        : [...currentList, value];
      return { ...prev, [name]: newList };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors({ ...errors, [name]: "" });

    if (name === 'work_duration') {
      setFormData((prev) => ({ ...prev, work_duration: value.replace(/\s{2,}/g, ' ') }));
      return;
    }

    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [group, field] = name.split('.');
        setFormData((prev) => ({
          ...prev,
          [group]: { ...prev[group], [field]: checked }
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim();

      if (!newSkill) return;

      if (skillsList.length >= 20) {
        setErrors({ ...errors, key_skills: "You can add a maximum of 20 skills." });
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(newSkill);
      if (!hasLetter) {
        setErrors({ ...errors, key_skills: "Invalid skill name. Must contain at least one alphabetical letter." });
        return;
      }

      if (skillsList.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
        setErrors({ ...errors, key_skills: "This skill has already been added." });
        return;
      }

      setSkillsList([...skillsList, newSkill]);
      setSkillInput('');
      setFilteredSkills([]);
      setErrors({ ...errors, key_skills: "" });
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.job_highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, job_highlights: newHighlights });
    setErrors({ ...errors, job_highlights: "" });
  };

  const addHighlightField = () => {
    setFormData({
      ...formData,
      job_highlights: [...formData.job_highlights, ""]
    });
  };

  const handleResponsibilityChange = (index, value) => {
    const updatedRes = [...formData.responsibilities];
    updatedRes[index] = value;
    setFormData({ ...formData, responsibilities: updatedRes });
    setErrors({ ...errors, responsibilities: "" });
  };

  const removeHighlightField = (index) => {
    if (formData.job_highlights.length > 1) {
      const newHighlights = formData.job_highlights.filter((_, i) => i !== index);
      setFormData({ ...formData, job_highlights: newHighlights });
    }
  };

  const addResponsibilityField = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, ""]
    });
  };

  const removeResponsibilityField = (index) => {
    if (formData.responsibilities.length > 1) {
      const newRes = formData.responsibilities.filter((_, i) => i !== index);
      setFormData({ ...formData, responsibilities: newRes });
    }
  };

  const combineExperienceData = () => {
    const fresherValue = formData.fresher === 'yes' ? 'Fresher' : '';
    const experienceValue = formData.experience.trim();

    if (fresherValue && experienceValue) {
      return `${fresherValue}, ${experienceValue} years`;
    } else if (fresherValue) {
      return fresherValue;
    } else if (experienceValue) {
      return `${experienceValue} years`;
    }
    return '';
  };

  const parseExperienceData = (expStr) => {
    if (!expStr) return { fresher: '', experience: '' };
    const isFresher = /fresher/i.test(expStr);
    const numMatch = expStr.match(/(\d+(?:\s*-\s*\d+)?)\s*years?/i);
    const experience = numMatch ? numMatch[1].replace(/\s+/g, '') : '';
    return { fresher: isFresher ? 'yes' : (experience ? 'no' : ''), experience };
  };

  useEffect(() => {
    if (!editJobData) return;
    const { fresher, experience } = parseExperienceData(editJobData.experience);
    setFormData({
      job_title: editJobData.job_title || '',
      industry_type: editJobData.industry_type || [],
      department: editJobData.department || [],
      education: editJobData.education || [],
      work_type: editJobData.work_type || '',
      shift: Array.isArray(editJobData.shift) ? editJobData.shift[0] : (editJobData.shift || ''),
      work_duration: editJobData.work_duration || '',
      salary: editJobData.salary || '',
      fresher,
      experience,
      location: editJobData.location || [],
      openings: editJobData.openings ?? '',
      job_category: editJobData.job_category || '',
      key_skills: editJobData.key_skills || [],
      job_highlights: editJobData.job_highlights?.length ? editJobData.job_highlights : [''],
      job_description: editJobData.job_description || '',
      responsibilities: editJobData.responsibilities?.length ? editJobData.responsibilities : ['']
    });
    setSkillsList(editJobData.key_skills || []);
    setLocationList(editJobData.location || []);
  }, [editJobData]);

  // ============================================
  // HANDLE SUBMIT WITH PLAN CHECK
  // ============================================
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // ✅ Check if plan is cancelled or expired
    if (!accessState.hasAccess) {
      const isExpired = accessState.isExpired;
      const isCancelled = accessState.isCancelled;

      alert(
        isCancelled
          ? 'Your plan has been cancelled. Please reactivate to post jobs.'
          : isExpired
            ? 'Your plan has expired. Please renew to post jobs.'
            : 'Your subscription is not active. Please contact support.'
      );

      navigate('/Job-portal/Employer/Dashboard', {
        state: { targetTab: 'Billing' }
      });
      return false;
    }

    // Proceed with validation
    if (!validateForm()) {
      return false;
    }

    const submissionData = {
      ...(isEditMode && { id: editJobData.id }),
      job_title: formData.job_title,
      industry_type: formData.industry_type,
      department: formData.department,
      work_type: formData.work_type,
      shift: formData.shift,
      work_duration: formData.work_duration,
      salary: formData.salary || 0,
      experience: combineExperienceData(),
      location: locationList,
      openings: parseInt(formData.openings) || 0,
      job_category: formData.job_category,
      education: formData.education,
      key_skills: skillsList,
      job_highlights: formData.job_highlights.filter(h => h && h.trim()),
      job_description: formData.job_description,
      responsibilities: formData.responsibilities.filter(r => r && r.trim())
    };

    console.log('📤 Submitting job data:', submissionData);
    navigate('/Job-portal/Employer/PostJobpreview', { state: submissionData });
  };

  // ============================================
  // RENDER - LOADING
  // ============================================
  if (accessState.loading) {
    return (
      <div className="jobpost-page-title">
        <main className="jobpost-main-content">
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div className="spinner" style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p style={{ color: "#64748b" }}>Checking plan access...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER - NO ACCESS (LOCK PAGE)
  // ============================================
  if (!accessState.hasAccess) {
    const isExpired = accessState.isExpired;
    const isCancelled = accessState.isCancelled;

    return (
      <div className="jobpost-page-title">
        <main className="jobpost-main-content">
          <header className="jobpost-form-header">
            <h1>Post a Job</h1>

            <p>Complete the steps below to reach thousands of qualified candidates</p>
          </header>

          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            maxWidth: "550px",
            margin: "20px auto",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>
              {isCancelled ? '🚫' : '⏰'}
            </div>
            <h2 style={{ color: "#1e293b", marginBottom: "15px", fontSize: "28px" }}>
              {isCancelled ? 'Plan Cancelled' : 'Access Expired'}
            </h2>
            <p style={{ color: "#64748b", marginBottom: "25px", lineHeight: "1.6", fontSize: "16px" }}>
              {accessState.message}
            </p>

            <div style={{
              background: isCancelled ? "#fee2e2" : "#fee2e2",
              border: isCancelled ? "1px solid #fecaca" : "1px solid #fecaca",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px",
              fontSize: "14px",
              color: "#991b1b",
              textAlign: "left"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <strong style={{ fontSize: "15px" }}>
                  {isCancelled ? 'What you lost:' : 'What you lose:'}
                </strong>
              </div>
              <ul style={{ margin: "10px 0 0 20px", padding: 0 }}>
                <li style={{ marginBottom: "8px" }}>✓ Post new job openings</li>
                <li style={{ marginBottom: "8px" }}>✓ Reach thousands of candidates</li>
                <li style={{ marginBottom: "8px" }}>✓ Manage job applications</li>
                <li style={{ marginBottom: "8px" }}>✓ Track hiring progress</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { targetTab: 'Billing' }
                  });
                }}
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
                {isCancelled ? 'Reactivate Plan Now' : 'Renew Plan Now'}
              </button>
              <button
                onClick={() => {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { targetTab: 'Dashboard' }
                  });
                }}
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
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER - HAS ACCESS (SHOW FORM)
  // ============================================
  return (
    <>
      <div className="jobpost-page-title">
        <main className="jobpost-main-content">
          <header className="jobpost-form-header">
            <h1>Post a Job</h1>
            <p>Complete the steps below to reach thousands of qualified candidates</p>
          </header>

          <div className="jobpost-form-container">
            <form className="jobpost-form" onSubmit={handleSubmit}>
              {/* Job Title */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Job title</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.job_title ? "input-error" : ""}`} type="text" name="job_title" placeholder="e.g., Fullstack Developer" value={formData.job_title} onChange={handleChange} maxLength="50" />
                  {errors.job_title && <span className="error-msg">{errors.job_title}</span>}
                </div>
              </div>

              {/* Industrial Type */}
              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Industrial type</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'industry_type' ? 'jobpost-is-active' : ''} ${errors.industry_type ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('industry_type')}>
                      {formData.industry_type.length > 0 ? formData.industry_type.join(', ') : 'Select'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input type="checkbox" onChange={() => handleCheckboxChange('industry_type', 'all', categoryOptions)}
                          checked={formData.industry_type.length === categoryOptions.length && categoryOptions.length > 0} />
                        <strong>Select all</strong>
                      </label>
                      <div className="jobpost-options-grid">
                        {categoryOptions.map(cat => (
                          <label key={cat} className="jobpost-option-item">
                            <input type="checkbox" checked={formData.industry_type.includes(cat)} onChange={() => handleCheckboxChange('industry_type', cat)} /> {cat}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.industry_type && <span className="error-msg">{errors.industry_type}</span>}
                </div>
              </div>

              {/* Department */}
              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Department</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'department' ? 'jobpost-is-active' : ''} ${errors.department ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('department')}>
                      {formData.department.length > 0 ? formData.department.join(', ') : 'Select'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input
                          type="checkbox"
                          onChange={() => handleCheckboxChange('department', 'all', departmentOptions)}
                          checked={formData.department.length === departmentOptions.length}
                        />
                        <strong>Select all Departments</strong>
                      </label>
                      <div className="jobpost-options-grid">
                        {departmentOptions.map(dept => (
                          <label key={dept} className="jobpost-option-item">
                            <input
                              type="checkbox"
                              checked={formData.department.includes(dept)}
                              onChange={() => handleCheckboxChange('department', dept)}
                            />
                            {dept}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.department && <span className="error-msg">{errors.department}</span>}
                </div>
              </div>

              {/* Work Type */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Work type</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.work_type ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="Hybrid" checked={formData.work_type === 'Hybrid'} onChange={handleChange} /> Hybrid
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="Remote" checked={formData.work_type === 'Remote'} onChange={handleChange} /> Remote
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="On-site" checked={formData.work_type === 'On-site'} onChange={handleChange} /> On-site
                    </label>
                  </div>
                  {errors.work_type && <span className="error-msg">{errors.work_type}</span>}
                </div>
              </div>

              {/* Shift */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Shift</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.shift ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="General" checked={formData.shift === 'General'} onChange={handleChange} /> General
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="Night" checked={formData.shift === 'Night'} onChange={handleChange} /> Night
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="Rotational" checked={formData.shift === 'Rotational'} onChange={handleChange} /> Rotational
                    </label>
                  </div>
                  {errors.shift && <span className="error-msg">{errors.shift}</span>}
                </div>
              </div>

              {/* Work Duration */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Work duration</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.work_duration ? "input-error" : ""}`} type="text" name="work_duration" placeholder='e.g., "3 Months", "6 Months", "permanent"' value={formData.work_duration} onChange={handleChange} />
                  {errors.work_duration && <span className="error-msg">{errors.work_duration}</span>}
                </div>
              </div>

              {/* Salary */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Salary</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.salary ? "input-error" : ""}`} type="text" name="salary" placeholder="Max Annual CTC in LPA" value={formData.salary} onChange={handleChange} />
                  {errors.salary && <span className="error-msg">{errors.salary}</span>}
                </div>
              </div>

              {/* Fresher */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Fresher</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.fresher ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input
                        type="radio"
                        name="fresher"
                        value="yes"
                        checked={formData.fresher === 'yes'}
                        onChange={handleChange}
                      /> Yes
                    </label>
                    <label className="jobpost-radio-label">
                      <input
                        type="radio"
                        name="fresher"
                        value="no"
                        checked={formData.fresher === 'no'}
                        onChange={handleChange}
                      /> No
                    </label>
                  </div>
                  {errors.fresher && <span className="error-msg">{errors.fresher}</span>}
                </div>
              </div>

              {/* Experience */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Experience (in years)</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input
                    className={`jobpost-input ${errors.experience ? "input-error" : ""}`}
                    type="text"
                    name="experience"
                    placeholder="e.g., 0, 0-12, 6-24 (in months)"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                  {errors.experience && <span className="error-msg">{errors.experience}</span>}
                  <small style={{ color: '#666', marginTop: '5px' }}>Enter single value or range (e.g., 0, 0-12, 3-6). Do not include "years" or "months".</small>
                </div>
              </div>

              {/* Location */}
              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Location</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'location' ? 'jobpost-is-active' : ''} ${errors.location ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('location')}>
                      {locationList.length > 0 ? locationList.join(', ') : 'Select Locations'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input
                          type="checkbox"
                          onChange={() => {
                            if (locationList.length === locationsList.length) {
                              setLocationList([]);
                            } else {
                              setLocationList(locationsList);
                            }
                            setErrors({ ...errors, location: "" });
                          }}
                          checked={
                            locationList.length === locationsList.length &&
                            locationsList.length > 0
                          }
                        />
                        <strong>Select all Locations</strong>
                      </label>
                      <div className="jobpost-options-grid">
                        {locationsList.map((loc) => (
                          <label key={loc} className="jobpost-option-item">
                            <input
                              type="checkbox"
                              checked={locationList.includes(loc)}
                              onChange={() => {
                                const updated = locationList.includes(loc)
                                  ? locationList.filter(l => l !== loc)
                                  : [...locationList, loc];
                                setLocationList(updated);
                                setErrors({ ...errors, location: "" });
                              }}
                            />
                            {loc}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.location && <span className="error-msg">{errors.location}</span>}
                </div>
              </div>

              {/* Openings */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Openings</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.openings ? "input-error" : ""}`} type="number" name="openings" placeholder="Total vacant positions" value={formData.openings} onChange={handleChange} min="1" />
                  {errors.openings && <span className="error-msg">{errors.openings}</span>}
                </div>
              </div>

              {/* Job Category */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Job category</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.job_category ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="job_category" value="Full-time" checked={formData.job_category === 'Full-time'} onChange={handleChange} /> Full-time
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="job_category" value="Internship" checked={formData.job_category === 'Internship'} onChange={handleChange} /> Internship
                    </label>
                  </div>
                  {errors.job_category && <span className="error-msg">{errors.job_category}</span>}
                </div>
              </div>

              {/* Education */}
              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Education</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'education' ? 'jobpost-is-active' : ''} ${errors.education ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('education')}>
                      {formData.education.length > 0 ? formData.education.join(', ') : 'Select Education'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <div className="jobpost-options-grid">
                        {educationOptions.map(edu => (
                          <label key={edu} className="jobpost-option-item">
                            <input type="checkbox" checked={formData.education.includes(edu)} onChange={() => handleCheckboxChange('education', edu)} /> {edu}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.education && <span className="error-msg">{errors.education}</span>}
                </div>
              </div>

              {/* Key Skills */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Key skills</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-skills-titile ${errors.key_skills ? "input-error" : ""}`}>
                    <input
                      className="jobpost-input skills-input"
                      style={errors.key_skills ? { borderColor: '#d93025' } : {}}
                      type="text"
                      name="keySkills"
                      placeholder="Press Enter to add skills (e.g., Python, AWS, React etc...)"
                      value={skillInput}
                      onChange={handleSkillChange}
                      onKeyDown={handleKeyDown}
                    />
                    {filteredSkills.length > 0 && (
                      <ul className="skills-suggestions-list">
                        {filteredSkills.map((skill, index) => (
                          <li key={index} onClick={() => selectSkill(skill)}>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="jobpost-tags-area" style={errors.keySkills ? { borderColor: '#d93025' } : {}}>
                      {skillsList.map((skill, index) => (
                        <span key={index} className="jobpost-tag">
                          {skill} <button type="button" onClick={() => removeSkill(skill)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.key_skills && <span className="error-msg">{errors.key_skills}</span>}
                </div>
              </div>

              {/* Job Highlights */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Job highlights</label>
                <div className="highlights-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {formData.job_highlights.map((highlight, index) => (
                    <div key={index} className="jobpost-input-icon-titile">
                      <input
                        className={`jobpost-input ${errors.job_highlights && index === 0 ? "input-error" : ""}`}
                        type="text"
                        placeholder="Add top 3-5 selling points of the role"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                      />
                      {index === 0 ? (
                        <span className="jobpost-plus-icon" onClick={addHighlightField}>+</span>
                      ) : (
                        <span className="jobpost-minus-icon" onClick={() => removeHighlightField(index)}>-</span>
                      )}
                    </div>
                  ))}
                  {errors.job_highlights && <span className="error-msg">{errors.job_highlights}</span>}
                </div>
              </div>

              {/* Job Description */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Job description</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <textarea className={`jobpost-textarea ${errors.job_description ? "input-error" : ""}`} name="job_description" placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity unique.... " value={formData.job_description} onChange={handleChange} rows="6"></textarea>
                  {errors.job_description && <span className="error-msg">{errors.job_description}</span>}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Responsibilities</label>
                <div className="responsibilities-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {formData.responsibilities.map((res, index) => (
                    <div key={index} className="jobpost-input-icon-titile">
                      <input
                        className={`jobpost-input ${errors.responsibilities && index === 0 ? "input-error" : ""}`}
                        type="text"
                        placeholder="Specific day-to-day tasks"
                        value={res}
                        onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      />
                      {index === 0 ? (
                        <span className="jobpost-plus-icon" onClick={addResponsibilityField}>+</span>
                      ) : (
                        <span className="jobpost-minus-icon" onClick={() => removeResponsibilityField(index)}>-</span>
                      )}
                    </div>
                  ))}
                  {errors.responsibilities && <span className="error-msg">{errors.responsibilities}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="jobpost-actions">
                <button type="button" className="jobpost-btn-cancel" onClick={onCancel || (() => navigate(-1))}>Cancel</button>
                {/* <button type="button" className="jobpost-btn-preview" onClick={handleSubmit}>Preview</button> */}
                <button type="button" className="jobpost-btn-preview" onClick={handleSubmit}>{isEditMode ? 'Preview Changes' : 'Preview'}</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};