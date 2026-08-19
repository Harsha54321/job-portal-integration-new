// EducationDegreeDropdown.jsx
// This is a reusable, styled dropdown for the education degree field in MyProfile

import React, { useState, useEffect, useRef } from "react";

// ============================================================
// REFERENCE DEGREE LIST (MATCHES degreeMinYears + Aliases)
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
export const degreeOptions = [...new Set(BASE_DEGREE_OPTIONS)].sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
);

// ============================================================
// COMPONENT
// ============================================================

const EducationDegreeDropdown = ({ 
    value = "", 
    onChange, 
    name = "degree",
    error = false,
    placeholder = "Select or type degree",
    className = "",
    inputClassName = "",
    id = null,
    ...props 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [manualMode, setManualMode] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Check if the current value exists in the options list
    const isValueInOptions = degreeOptions.includes(value);
    
    // If value exists but isn't in options, it was manually entered
    useEffect(() => {
        if (value && !isValueInOptions && value !== "Others") {
            setManualMode(true);
        } else {
            setManualMode(false);
        }
    }, [value, isValueInOptions]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options based on search term
    const filteredOptions = degreeOptions.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (selectedValue) => {
        if (selectedValue === "Others") {
            setManualMode(true);
            setIsOpen(false);
            setSearchTerm("");
            // Clear the value so user can type
            const syntheticEvent = { target: { name, value: "" } };
            onChange(syntheticEvent);
            // Focus the text input after a brief delay
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        } else {
            setManualMode(false);
            setIsOpen(false);
            setSearchTerm("");
            const syntheticEvent = { target: { name, value: selectedValue } };
            onChange(syntheticEvent);
        }
    };

    const handleManualChange = (e) => {
        const newValue = e.target.value;
        const syntheticEvent = { target: { name, value: newValue } };
        onChange(syntheticEvent);
        
        // If the typed value now matches an option, switch back to dropdown mode
        if (degreeOptions.includes(newValue) && newValue !== "") {
            setManualMode(false);
        }
    };

    const handleManualBlur = () => {
        const trimmed = value?.trim() || "";
        // If the value exists and is not empty, keep it
        if (trimmed) {
            // If the value matches an option, switch to dropdown mode
            if (degreeOptions.includes(trimmed)) {
                setManualMode(false);
            }
        } else {
            // If empty, go back to dropdown mode
            setManualMode(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const toggleDropdown = () => {
        if (!manualMode) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm("");
            }
        }
    };

    // CSS Classes
    const containerClass = `education-degree-dropdown ${className}`.trim();
    const triggerClass = `degree-dropdown-trigger ${error ? 'input-error' : ''} ${inputClassName}`.trim();

    // ============================================================
    // MANUAL MODE - Show text input with clear button
    // ============================================================
    if (manualMode) {
        return (
            <div className={containerClass} ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        name={name}
                        value={value || ""}
                        onChange={handleManualChange}
                        onBlur={handleManualBlur}
                        placeholder="Type degree manually..."
                        className={error ? "input-error" : ""}
                        style={{ 
                            flex: 1,
                            padding: '0.75rem',
                            border: error ? '1px solid #FF6F61' : '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            backgroundColor: '#fff',
                            ...(error && { backgroundColor: '#fff8f8' })
                        }}
                        autoFocus
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setManualMode(false);
                            // Clear the value
                            const syntheticEvent = { target: { name, value: "" } };
                            onChange(syntheticEvent);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#FF6F61',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            padding: '0 8px',
                            lineHeight: 1,
                            flexShrink: 0
                        }}
                        title="Select from list"
                    >
                        &times;
                    </button>
                </div>
                {error && <span className="error-message">{error}</span>}
            </div>
        );
    }

    // ============================================================
    // DROPDOWN MODE - Show clickable trigger with panel
    // ============================================================
    return (
        <div className={containerClass} ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            {/* TRIGGER */}
            <div
                className={triggerClass}
                onClick={toggleDropdown}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                style={{
                    height: '44px',
                    border: error ? '1px solid #FF6F61' : '1px solid #E5E7EB',
                    borderRadius: '6px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: error ? '#fff8f8' : '#fff',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    ...(error && { backgroundColor: '#fff8f8' })
                }}
            >
                <span style={{ 
                    color: value ? '#032240' : '#999', 
                    fontSize: '0.95rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {value || placeholder}
                </span>
                
                {/* Chevron Icon */}
                <svg 
                    width="14" 
                    height="8" 
                    viewBox="0 0 14 8" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'none', 
                        transition: 'transform 0.25s ease',
                        flexShrink: 0,
                        marginLeft: '8px'
                    }}
                >
                    <path d="M1 1L7 7L13 1" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* ERROR MESSAGE */}
            {error && <span className="error-message" style={{ display: 'block', marginTop: '4px' }}>{error}</span>}

            {/* DROPDOWN PANEL */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        width: '100%',
                        zIndex: 1000,
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '16px 20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        maxHeight: '340px',
                        overflowY: 'auto',
                        minWidth: '280px',
                    }}
                >
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search degrees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            marginBottom: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                            ...(searchTerm && { borderColor: '#007bff' })
                        }}
                    />

                    {/* Options Grid - 3 columns */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '8px 12px',
                        maxHeight: '220px',
                        overflowY: 'auto'
                    }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <label
                                    key={opt}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        color: '#032240',
                                        padding: '4px 0',
                                        borderRadius: '4px',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f7fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <input
                                        type="checkbox"
                                        checked={value === opt}
                                        onChange={() => handleSelect(opt)}
                                        style={{
                                            cursor: 'pointer',
                                            width: '16px',
                                            height: '16px',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                            accentColor: '#007bff'
                                        }}
                                    />
                                    <span style={{ lineHeight: '20px', wordBreak: 'break-word' }}>{opt}</span>
                                </label>
                            ))
                        ) : (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                textAlign: 'center', 
                                padding: '12px 0',
                                color: '#999',
                                fontSize: '0.9rem'
                            }}>
                                No matching degrees found
                            </div>
                        )}
                    </div>

                    {/* Divider + Others Option */}
                    <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: '#007bff',
                                fontWeight: 500,
                                padding: '4px 12px',
                                borderRadius: '4px',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e7f3ff'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input
                                type="checkbox"
                                checked={value === "Others"}
                                onChange={() => handleSelect("Others")}
                                style={{
                                    cursor: 'pointer',
                                    width: '16px',
                                    height: '16px',
                                    flexShrink: 0,
                                    accentColor: '#007bff'
                                }}
                            />
                            <span>+ Others (Type manually)</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EducationDegreeDropdown;