import React, { useState, useEffect } from 'react';
import SixDots from '../assets/AdminAssets/SixDots.png';
import Save from '../assets/AdminAssets/SaveDraft.png';
import Tick from '../assets/AdminAssets/GreenTick.png';
import RedCross from '../assets/AdminAssets/RedCross.png';
import './PublishedPlan.css';
import './Membership.css';
import { useJobs } from '../JobContext';
import api from '../api/axios';

// Simple Watermark Tooltip Component
const WatermarkTooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          background: '#1e293b',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderTopColor: '#1e293b'
          }}></div>
        </div>
      )}
    </div>
  );
};

export const PublishedPlans = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [allPlans, setAllPlans] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tempInputValues, setTempInputValues] = useState({});

  const isStarterPlan = editPlan?.name?.toUpperCase() === 'STARTER PLAN';

  const getAdminToken = () => {
    return (
      sessionStorage.getItem("access") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("admin_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("admin_token")
    );
  };

  useEffect(() => {
    fetchAllPlans();
  }, []);

  // Notification click deep-link: open the specific plan's preview once
  // the plans list has loaded.
  useEffect(() => {
    if (!allPlans || allPlans.length === 0) return;

    const highlightType = sessionStorage.getItem('adminNotifHighlightType');
    const highlightId = sessionStorage.getItem('adminNotifHighlightId');

    if (highlightType === 'plan' && highlightId) {
      const match = allPlans.find(p => String(p.id) === String(highlightId));
      if (match) {
        fetchSelectedPlanDetails(highlightId).then(() => setShowPreviewModal(true));
      }
      sessionStorage.removeItem('adminNotifHighlightType');
      sessionStorage.removeItem('adminNotifHighlightId');
    }
  }, [allPlans]);

  const fetchAllPlans = async () => {
    try {
      const token = getAdminToken();
      const response = await api.get('plans/', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      setAllPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchSelectedPlanDetails = async (planId) => {
    try {
      const token = getAdminToken();
      const response = await api.get(`plans/${planId}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      const planData = response.data;

      const normalizedPlan = {
        ...planData,
        monthly_price: planData.monthly_price ?? 0,
        discount_halfyear: planData.discount_halfyear ?? 0,
        discount_annual: planData.discount_annual ?? 0,
        tax: planData.tax ?? 0,
        trial_duration: planData.trial_duration ?? 0,
        grace_time: planData.grace_time ?? 0,
        is_trial_enabled: planData.is_trial_enabled ?? false,
        is_auto_renewal: planData.is_auto_renewal ?? false,
        color: planData.color ?? '#1E88E5',
        features: planData.features?.map(feature => ({
          ...feature,
          // For numeric features, ensure they're numbers
          value: feature.text === 'Jobs Posting' || feature.text === 'Highlight Your Job Listing'
            ? (feature.value !== undefined && feature.value !== null && feature.value !== ''
              ? parseInt(feature.value, 10) || 0
              : 0)
            : (feature.value ?? (feature.text === 'Jobs Posting' || feature.text === 'Highlight Your Job Listing' ? 0 : "false"))
        })) || []
      };

      setEditPlan(normalizedPlan);
      setPreviewPlan(normalizedPlan);
      setErrors({});
      setFieldErrors({});
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const calculateTotalPayable = (basePrice, tax) => {
    let price = parseFloat(basePrice) || 0;
    if (price === 0) return "0.00";
    const taxAmt = price * (tax / 100);
    const finalTotal = price + taxAmt;
    return finalTotal.toFixed(2);
  };

  const handleFeatureValueChange = (featureIdx, value) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        // Ensure value is a number for numeric features
        const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
        return {
          ...feature,
          value: isNaN(numericValue) ? 0 : numericValue
        };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    setErrors({});
    setFieldErrors({});
    fetchSelectedPlanDetails(plan.id);
  };

  const validatePriceInput = (value, field) => {
    let cleanedValue = value.replace(/[^0-9.]/g, '');

    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    cleanedValue = cleanedValue.replace(/-/g, '');

    if (cleanedValue.length > 1 && cleanedValue.startsWith('0') && !cleanedValue.startsWith('0.')) {
      cleanedValue = cleanedValue.replace(/^0+/, '');
      if (cleanedValue === '') cleanedValue = '0';
    }

    if (cleanedValue.includes('.')) {
      const [integerPart, decimalPart] = cleanedValue.split('.');
      if (integerPart.length > 5) {
        cleanedValue = integerPart.slice(0, 5) + '.' + decimalPart;
      }
      if (decimalPart && decimalPart.length > 2) {
        cleanedValue = integerPart.slice(0, 5) + '.' + decimalPart.slice(0, 2);
      }
    } else {
      if (cleanedValue.length > 5) {
        cleanedValue = cleanedValue.slice(0, 5);
      }
    }

    return cleanedValue;
  };

  const validateFeatureNumber = (value) => {
    // Remove all non-numeric characters
    let cleanedValue = value.replace(/[^0-9]/g, '');

    // Get the current length
    const currentLength = cleanedValue.length;

    console.log(`Feature number input: "${value}" -> Cleaned: "${cleanedValue}" (Length: ${currentLength})`);

    // If empty, return 0
    if (cleanedValue === '') {
      return {
        value: '0',
        error: null,
        length: 0
      };
    }

    // Remove leading zeros
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '');
      if (cleanedValue === '') cleanedValue = '0';
    }

    // Parse the numeric value
    const numericValue = parseInt(cleanedValue, 10);

    // Check if value exceeds maximum (100)
    if (numericValue > 100) {
      // Important: Show the actual numeric value, not the original input
      return {
        value: cleanedValue,
        error: `Value cannot exceed 100 (Current: ${numericValue})`,
        length: currentLength
      };
    }

    // Success
    return {
      value: cleanedValue,
      error: null,
      length: currentLength
    };
  };

  const handleInputChange = (field, value) => {
    const priceFields = ['monthly_price', 'tax', 'discount_halfyear', 'discount_annual'];

    if (isStarterPlan && priceFields.includes(field)) {
      console.log("Starter Plan: Price fields cannot be edited");
      return;
    }

    if (field === "name") {
      if (/[^a-zA-Z\s]/.test(value)) return;
      if (value.length > 50) {
        setFieldErrors(prev => ({
          ...prev,
          name: "Plan name cannot exceed 50 characters"
        }));
        return; // Don't update the state
      } else {
        setFieldErrors(prev => ({
          ...prev,
          name: null
        }));
      }

      // Update state
      setEditPlan(prev => ({ ...prev, [field]: value }));

      // Clear general error
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }

    if (field === "summary") {
      // if (/[^a-zA-Z\s.,!?\-]/.test(value)) return;
      if (value.length > 100) {
        setFieldErrors(prev => ({
          ...prev,
          summary: "Summary cannot exceed 100 characters"
        }));
        return; // Don't update the state
      }

      // Check if value contains at least one alphabet character
      const hasAlphabet = /[a-zA-Z]/.test(value);

      // Store validation state
      setFieldErrors(prev => ({
        ...prev,
        summary: !hasAlphabet && value.length > 0 ? "Summary must contain at least one letter" : null
      }));

      setEditPlan(prev => {
        const updated = { ...prev, [field]: value };
        console.log(`Updated ${field} to:`, value);
        return updated;
      });

      // Clear general error for this field if it exists
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }

    if (priceFields.includes(field)) {
      const cleanedValue = validatePriceInput(value, field);

      let error = null;
      let maxValue = null;

      switch (field) {
        case 'monthly_price':
          maxValue = 99999.99;
          break;
        case 'discount_halfyear':
        case 'discount_annual':
          maxValue = 100;
          break;
        case 'tax':
          maxValue = 100;
          break;
        default:
          break;
      }

      if (cleanedValue !== '' && maxValue !== null) {
        const numValue = parseFloat(cleanedValue);
        if (numValue > maxValue) {
          error = `Value cannot exceed ${maxValue}`;
        }
        if (numValue < 0) {
          error = 'Value cannot be negative';
        }
      }

      setFieldErrors(prev => ({
        ...prev,
        [field]: error
      }));

      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      setEditPlan(prev => ({ ...prev, [field]: cleanedValue }));
      return;
    }

    // For all other fields (including summary)
    setEditPlan(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Updated ${field} to:`, value);
      return updated;
    });

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleToggleFeature = (featureIdx) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        const currentValue = feature.value;
        const newValue = (currentValue === "true" || currentValue === true) ? "false" : "true";
        return { ...feature, value: newValue };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleTriggerPreview = () => {
    setPreviewPlan({ ...editPlan });
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
  };

  const handleTrailToggle = () => {
    setEditPlan(prev => ({
      ...prev,
      is_trial_enabled: !prev.is_trial_enabled,
      trial_duration: !prev.is_trial_enabled ? 7 : 0
    }));
  };

  const handleSavePlan = async () => {
    if (isSaving) return;

    const hasFieldErrors = Object.values(fieldErrors).some(error => error !== null);
    if (hasFieldErrors) {
      alert('Please fill all required field.');
      return;
    }

    const newErrors = {};

    // Debug log to see what's in editPlan
    console.log("Current editPlan:", editPlan);
    console.log("Summary value:", editPlan?.summary);
    console.log("Name value:", editPlan?.name);

    // Validate name
    if (!editPlan?.name?.trim()) {
      newErrors.name = "Plan name is required.";
    }

    // Validate summary
    if (!editPlan?.summary?.trim()) {
      newErrors.summary = "Summary is required.";
    } else if (!/[a-zA-Z]/.test(editPlan?.summary)) {
      // Check if summary contains at least one alphabet character
      newErrors.summary = "Summary must contain at least one letter.";
    } else {
      console.log("Summary is valid:", editPlan.summary);
    }

    if (!isStarterPlan) {
      if (editPlan?.monthly_price === '' || editPlan?.monthly_price === null || editPlan?.monthly_price === undefined)
        newErrors.monthly_price = "Price is required.";
      else if (parseFloat(editPlan?.monthly_price) < 0)
        newErrors.monthly_price = "Price cannot be negative.";
      else if (parseFloat(editPlan?.monthly_price) > 99999.99)
        newErrors.monthly_price = "Price cannot exceed ₹99,999.99.";

      if (editPlan?.discount_halfyear === '' || editPlan?.discount_halfyear === null || editPlan?.discount_halfyear === undefined)
        newErrors.discount_halfyear = "Discount is required.";
      else if (parseFloat(editPlan?.discount_halfyear) < 0)
        newErrors.discount_halfyear = "Discount cannot be negative.";
      else if (parseFloat(editPlan?.discount_halfyear) > 999.99)
        newErrors.discount_halfyear = "Discount cannot exceed 999.99%.";

      if (editPlan?.discount_annual === '' || editPlan?.discount_annual === null || editPlan?.discount_annual === undefined)
        newErrors.discount_annual = "Discount is required.";
      else if (parseFloat(editPlan?.discount_annual) < 0)
        newErrors.discount_annual = "Discount cannot be negative.";
      else if (parseFloat(editPlan?.discount_annual) > 999.99)
        newErrors.discount_annual = "Discount cannot exceed 999.99%.";

      if (editPlan?.tax === '' || editPlan?.tax === null || editPlan?.tax === undefined)
        newErrors.tax = "Tax is required.";
      else if (parseFloat(editPlan?.tax) < 0)
        newErrors.tax = "Tax cannot be negative.";
      else if (parseFloat(editPlan?.tax) > 100)
        newErrors.tax = "Tax cannot exceed 100%.";
    }

    // Update errors state
    setErrors(newErrors);

    console.log("Validation errors:", newErrors);

    // If there are errors, scroll to the first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      } else {
        // If no element found with that name, try to find by id or class
        const fallbackElement = document.querySelector(`#${firstErrorField}`);
        if (fallbackElement) {
          fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      const token = getAdminToken();

      const planData = {
        name: editPlan?.name,
        summary: editPlan?.summary,
        color: editPlan?.color,
        monthly_price: isStarterPlan ? 0 : (parseFloat(editPlan?.monthly_price) || 0),
        tax: isStarterPlan ? 0 : (parseFloat(editPlan?.tax) || 0),
        discount_halfyear: isStarterPlan ? 0 : (parseFloat(editPlan?.discount_halfyear) || 0),
        discount_annual: isStarterPlan ? 0 : (parseFloat(editPlan?.discount_annual) || 0),
        duration_days: editPlan?.duration_days ?? 30,
        is_trial_enabled: editPlan?.is_trial_enabled ?? false,
        trial_duration: editPlan?.trial_duration ?? 0,
        is_auto_renewal: editPlan?.is_auto_renewal ?? false,
        grace_time: editPlan?.grace_time ?? 0,
        Analytics: editPlan?.Analytics ?? false,
        Candidate_Search: editPlan?.Candidate_Search ?? false,
        Premium_Support: editPlan?.Premium_Support ?? false,
        Account_Manager: editPlan?.Account_Manager ?? false,
        features: editPlan?.features
      };

      console.log("Saving plan data:", planData);

      const response = await api.patch(`plans/${selectedPlanId}/`, planData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });

      console.log('Plan updated successfully:', response.data);

      setAllPlans(prevPlans =>
        prevPlans.map(plan => plan.id === selectedPlanId ? response.data : plan)
      );

      setErrors({});
      setFieldErrors({});

      alert("Plan changes saved successfully");

      await fetchSelectedPlanDetails(selectedPlanId);
      await fetchAllPlans();

    } catch (error) {
      console.error('Error saving plan:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        if (error.response.data) {
          const apiErrors = {};
          Object.keys(error.response.data).forEach(key => {
            apiErrors[key] = Array.isArray(error.response.data[key])
              ? error.response.data[key][0]
              : error.response.data[key];
          });
          setErrors(apiErrors);
        }
        alert(`Error saving plan: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Error saving plan. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };


  const handleFeatureNumberInput = (i, value) => {
    // Store the raw input temporarily
    setTempInputValues(prev => ({
      ...prev,
      [i]: value
    }));

    // Remove all non-numeric characters
    let cleanedValue = value.replace(/[^0-9]/g, '');

    // If empty, set to 0 for display
    if (cleanedValue === '') {
      // Don't update feature value yet - user is still typing
      // Just clear the error
      const featureErrorKey = `feature_${i}`;
      setFieldErrors(prev => ({
        ...prev,
        [featureErrorKey]: null
      }));
      return;
    }

    // Remove leading zeros but keep single zero
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '');
      if (cleanedValue === '') cleanedValue = '0';
    }

    // Parse numeric value
    const numericValue = parseInt(cleanedValue, 10);

    // Validate max (100)
    let error = null;
    if (numericValue > 100) {
      error = `Value cannot exceed 100 (Current: ${numericValue})`;
    }

    // Store error
    const featureErrorKey = `feature_${i}`;
    setFieldErrors(prev => ({
      ...prev,
      [featureErrorKey]: error
    }));

    // If no error, update the feature value
    if (!error) {
      handleFeatureValueChange(i, numericValue);
    } else {
      // Still update but with error state
      handleFeatureValueChange(i, numericValue);
    }
  };

  const getFeatureError = (i) => {
    const featureErrorKey = `feature_${i}`;
    return fieldErrors[featureErrorKey];
  };

  const getPriceFieldError = (field) => {
    return fieldErrors[field];
  };

  // Preview Card Component
  const PreviewCard = ({ plan, isStarterPlan }) => (
    <div className="published-plan-preview-card">
      <div className="published-plan-badge" style={{ backgroundColor: plan.color || '#1E88E5' }}>
        {plan.name}
      </div>

      <div className="published-plan-content">
        <div className="published-plan-price-section">
          <h2 className="published-plan-price">
            {isStarterPlan ? "Free Plan" : `₹ ${calculateTotalPayable(plan.monthly_price ?? 0, plan.tax ?? 0)}`}
          </h2>
          {!isStarterPlan && <small style={{ color: '#555' }}>For a Month</small>}
          <p className="published-plan-sub-badge">{plan.summary}</p>
        </div>

        <div className="published-plan-divider"></div>
        <ul className="published-plan-features">
          {plan.features?.map((feature, i) => {
            // Handle Jobs Posting
            if (feature.text === 'Jobs Posting') {
              const numericValue = feature.value !== undefined && feature.value !== null && feature.value !== ''
                ? parseInt(feature.value, 10)
                : 0;
              const displayValue = isNaN(numericValue) ? 0 : numericValue;
              return (
                <li key={i} className="published-plan-feature-item included">
                  <span className="published-plan-icon">
                    <img src={Tick} alt="yes" width={15} />
                  </span>
                  Max Job Posts: {displayValue}
                </li>
              );
            }

            // Handle Highlight Your Job Listing
            if (feature.text === 'Highlight Your Job Listing') {
              const numericValue = feature.value !== undefined && feature.value !== null && feature.value !== ''
                ? parseInt(feature.value, 10)
                : 0;
              const displayValue = isNaN(numericValue) ? 0 : numericValue;

              if (displayValue > 0) {
                return (
                  <li key={i} className="published-plan-feature-item included">
                    <span className="published-plan-icon">
                      <img src={Tick} alt="yes" width={15} />
                    </span>
                    {displayValue} Highlight Your Job Listing
                  </li>
                );
              } else {
                return (
                  <li key={i} className="published-plan-feature-item excluded">
                    <span className="published-plan-icon">
                      <img src={RedCross} alt="no" width={15} />
                    </span>
                    <span className="published-plan-feature-text">
                      Highlight Your Job Listing
                    </span>
                  </li>
                );
              }
            }

            const isEnabled = feature.value === "true" || feature.value === true;
            return (
              <li
                key={i}
                className={`published-plan-feature-item ${isEnabled ? 'included' : 'excluded'}`}
              >
                <span className="published-plan-icon">
                  <img src={isEnabled ? Tick : RedCross} alt={isEnabled ? "yes" : "no"} width={15} />
                </span>
                <span className="published-plan-feature-text">
                  {feature.text}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          className="published-plan-btn-get-started"
          style={{ backgroundColor: plan.color || '#1E88E5' }}
        >
          {isStarterPlan ? "Get Started For Free" : "Get started"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {!selectedPlanId ? (
        <>
          <div style={{ margin: "25px 0px", padding: "15px 0", border: "1px solid #afaaaa", borderRadius: "10px" }}>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-Note'>Published Plans</p>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-para'>View or Edit Published plans</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px solid #afaaaa", borderRadius: "10px", gap: "35px", padding: "45px 0" }}>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-para'>Select a plan to View or Edit</p>
            {allPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                style={{
                  padding: "20px 10px",
                  border: "1px solid #afaaaa",
                  width: "35%",
                  borderRadius: "10px",
                  background: plan.color || '#1E88E5',
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                {plan.name}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="membership-cr-membership-container">
          <div style={{ display: "flex", alignItems: "center", padding: "10px 15px", margin: "10px 0", gap: "10px" }} >
            <button onClick={() => { setSelectedPlanId(null); setEditPlan(null); setPreviewPlan(null); setErrors({}); setFieldErrors({}); }}
              style={{ padding: "7px 10px", cursor: 'pointer', fontSize: '14px', backgroundColor: '#1E88E5', color: 'white', border: 'none', borderRadius: "5px" }}>
              Back to plans
            </button>
            <div className="membership-cr-membership-header">
              <h1 style={{ padding: "10px 20px", flex: "1", fontSize: "18px" }}>
                Plan Name: {editPlan?.name} {isStarterPlan && "⚠️ (PRICE FIELDS READ-ONLY)"}
              </h1>
            </div>
          </div>

          {isStarterPlan && (
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '12px 20px', borderRadius: '6px', margin: '10px 15px', fontWeight: '500', fontSize: '14px', textAlign: 'start' }}>
              <strong>Notice:</strong> This is the default system Starter Plan (Free Tier). Price fields are read-only, but features can be customized.
            </div>
          )}

          <div className="membership-cr-membership-content">
            <div className="membership-cr-form-sections">

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">1</span> Basic plan details
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Plan name</label>
                    <input
                      type="text"
                      name="name"
                      maxLength={50}
                      value={editPlan?.name ?? ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={false}
                      style={{
                        borderColor: errors.name ? '#ff0000' : '#ddd',
                        ...(errors.name ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Summary</label>
                    <input
                      type="text"
                      name="summary"
                      maxLength={100}
                      value={editPlan?.summary ?? ''}
                      onChange={(e) => {
                        console.log("Summary input changed:", e.target.value);
                        handleInputChange('summary', e.target.value);
                      }}
                      disabled={false}
                      style={{
                        borderColor: (fieldErrors.summary || errors.summary) ? '#ff0000' : '#ddd',
                        ...((fieldErrors.summary || errors.summary) ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {(fieldErrors.summary || errors.summary) && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                        {fieldErrors.summary || errors.summary}
                      </span>
                    )}
                  </div>
                </div>

                <div className="membership-cr-row" style={{ marginTop: '15px' }}>
                  <div className="membership-cr-input-group" style={{ width: '50%' }}>
                    <label>Card Color / Badge Visual Theme Code</label>
                    <input
                      type="text"
                      value={editPlan?.color ?? '#1E88E5'}
                      readOnly
                      placeholder="e.g. #1E88E5 or green"
                      style={{ flex: 1, backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                    <input
                      type="color"
                      value={editPlan?.color?.startsWith('#') && editPlan?.color?.length === 7 ? editPlan.color : '#1E88E5'}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">2</span> Pricing & Duration
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Price (₹) for a month {isStarterPlan && ""}</label>
                    <input
                      type="text"
                      name="monthly_price"
                      value={editPlan?.monthly_price ?? ''}
                      onChange={(e) => handleInputChange('monthly_price', e.target.value)}
                      disabled={isStarterPlan}
                      placeholder="0.00"
                      style={{
                        backgroundColor: isStarterPlan ? '#e9ecef' : '#fff',
                        borderColor: (getPriceFieldError('monthly_price') || errors.monthly_price) ? '#ff0000' : '#ddd',
                        ...((getPriceFieldError('monthly_price') || errors.monthly_price) ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {(getPriceFieldError('monthly_price') || errors.monthly_price) && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                        {getPriceFieldError('monthly_price') || errors.monthly_price}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#666' }}>Max: ₹99,999.99</span>
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Discount (%) for 6 month plan {isStarterPlan && ""}</label>
                    <input
                      type="text"
                      name="discount_halfyear"
                      value={editPlan?.discount_halfyear ?? ''}
                      onChange={(e) => handleInputChange('discount_halfyear', e.target.value)}
                      disabled={isStarterPlan}
                      placeholder="0.00"
                      style={{
                        backgroundColor: isStarterPlan ? '#e9ecef' : '#fff',
                        borderColor: (getPriceFieldError('discount_halfyear') || errors.discount_halfyear) ? '#ff0000' : '#ddd',
                        ...((getPriceFieldError('discount_halfyear') || errors.discount_halfyear) ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {(getPriceFieldError('discount_halfyear') || errors.discount_halfyear) && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                        {getPriceFieldError('discount_halfyear') || errors.discount_halfyear}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#666' }}>Max: 100%</span>
                  </div>
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Discount (%) for Annual plan {isStarterPlan && ""}</label>
                    <input
                      type="text"
                      name="discount_annual"
                      value={editPlan?.discount_annual ?? ''}
                      onChange={(e) => handleInputChange('discount_annual', e.target.value)}
                      disabled={isStarterPlan}
                      placeholder="0.00"
                      style={{
                        backgroundColor: isStarterPlan ? '#e9ecef' : '#fff',
                        borderColor: (getPriceFieldError('discount_annual') || errors.discount_annual) ? '#ff0000' : '#ddd',
                        ...((getPriceFieldError('discount_annual') || errors.discount_annual) ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {(getPriceFieldError('discount_annual') || errors.discount_annual) && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                        {getPriceFieldError('discount_annual') || errors.discount_annual}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#666' }}>Max: 100%</span>
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Tax (%) {isStarterPlan && ""}</label>
                    <input
                      type="text"
                      name="tax"
                      value={editPlan?.tax ?? ''}
                      onChange={(e) => handleInputChange('tax', e.target.value)}
                      disabled={isStarterPlan}
                      placeholder="0.00"
                      style={{
                        backgroundColor: isStarterPlan ? '#e9ecef' : '#fff',
                        borderColor: (getPriceFieldError('tax') || errors.tax) ? '#ff0000' : '#ddd',
                        ...((getPriceFieldError('tax') || errors.tax) ? { border: '1px solid #ff0000' } : {})
                      }}
                    />
                    {(getPriceFieldError('tax') || errors.tax) && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                        {getPriceFieldError('tax') || errors.tax}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#666' }}>Max: 100%</span>
                  </div>

                  <div className="membership-cr-total-payable">
                    <p style={{ textAlign: "start", margin: "5px 0", fontWeight: "600" }}>Total Payable</p>
                    <h3 style={{ textAlign: "start", fontSize: "24px" }}>
                      {isStarterPlan ? "Free Plan" : `₹ ${calculateTotalPayable(editPlan?.monthly_price ?? 0, editPlan?.tax ?? 0)}`}
                      {!isStarterPlan && (
                        <span style={{ fontSize: "16px", fontWeight: "normal", color: "#555" }}>
                          / for a Month
                        </span>
                      )}
                    </h3>
                    <p style={{ textAlign: "start", margin: "5px 0", fontSize: "12px" }}>(incl. tax after discount)</p>
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">3</span> Features & Limits
                </div>
                <table className="membership-cr-features-table">
                  <thead>
                    <tr >
                      <th style={{ textAlign: 'left', padding: '10px' }}>Feature</th>
                      <th style={{ textAlign: 'center', padding: '10px' }}>Limit / Inclusion</th>
                    </tr>
                  </thead>
                  <tbody style={{ border: "1px solid #f0f0ff" }}>
                    {editPlan?.features?.map((item, i) => {
                      if (item.text === 'Jobs Posting') {
                        const featureError = getFeatureError(i);
                        // Get raw input value if exists, otherwise use actual value
                        const rawValue = tempInputValues[i];
                        const actualValue = item.value !== undefined && item.value !== null && item.value !== ''
                          ? parseInt(item.value, 10)
                          : 0;
                        const displayValue = rawValue !== undefined ? rawValue : (isNaN(actualValue) ? 0 : actualValue);

                        return (
                          <tr key={i}>
                            <td style={{ padding: '20px' }} title="Maximum number of job posts allowed for this plan.">
                              Max Job Posts ⓘ
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                              <div>
                                <input
                                  type="text"
                                  value={String(displayValue)}
                                  onChange={(e) => handleFeatureNumberInput(i, e.target.value)}
                                  onBlur={() => {
                                    // On blur, clear temp value and use actual
                                    setTempInputValues(prev => {
                                      const newState = { ...prev };
                                      delete newState[i];
                                      return newState;
                                    });
                                  }}
                                  disabled={false}
                                  placeholder="0"
                                  style={{
                                    width: '80px',
                                    padding: '8px',
                                    textAlign: 'center',
                                    border: `1px solid ${featureError ? '#ff0000' : '#ddd'}`,
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                  title="Enter the number of job posts (max 100)"
                                />
                                {featureError && (
                                  <div style={{ color: 'red', fontSize: '11px', marginTop: '4px' }}>
                                    {featureError}
                                  </div>
                                )}
                                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                  Max: 100
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      if (item.text === 'Highlight Your Job Listing') {
                        const featureError = getFeatureError(i);
                        // Get raw input value if exists, otherwise use actual value
                        const rawValue = tempInputValues[i];
                        const actualValue = item.value !== undefined && item.value !== null && item.value !== ''
                          ? parseInt(item.value, 10)
                          : 0;
                        const displayValue = rawValue !== undefined ? rawValue : (isNaN(actualValue) ? 0 : actualValue);

                        return (
                          <tr key={i}>
                            <td style={{ padding: '20px' }} title="Number of job highlights available per billing cycle. Highlighted jobs appear at top of search results.">
                              {item.text} ⓘ
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                              <div>
                                <input
                                  type="text"
                                  value={String(displayValue)}
                                  onChange={(e) => handleFeatureNumberInput(i, e.target.value)}
                                  onBlur={() => {
                                    // On blur, clear temp value and use actual
                                    setTempInputValues(prev => {
                                      const newState = { ...prev };
                                      delete newState[i];
                                      return newState;
                                    });
                                  }}
                                  disabled={false}
                                  placeholder="0"
                                  style={{
                                    width: '80px',
                                    padding: '8px',
                                    textAlign: 'center',
                                    border: `1px solid ${featureError ? '#ff0000' : '#ddd'}`,
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                  title="Set how many job posts can be highlighted (max 100)"
                                />
                                {featureError && (
                                  <div style={{ color: 'red', fontSize: '11px', marginTop: '4px' }}>
                                    {featureError}
                                  </div>
                                )}
                                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                  Max: 100
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      const featureHints = {
                        'Analytics ': 'Access to detailed job performance analytics and reports',
                        'Candidate Search': 'Ability to search and filter candidate in findtalent only',
                        'Premium Support': 'Priority customer support with faster response times',
                        'Account Manager': 'Dedicated account manager for personalized assistance'
                      };

                      return (
                        <tr key={i}>
                          <td
                            style={{ padding: '20px' }}
                            title={featureHints[item.text] || `Enable or disable ${item.text} feature`}
                          >
                            {item.text} ⓘ
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px' }}>
                            <div
                              style={{ display: 'flex', justifyContent: 'center' }}
                              title={`Click to ${item.value === "true" || item.value === true ? 'disable' : 'enable'} ${item.text}`}
                            >
                              <div
                                className={`membership-cr-toggle-switch ${item.value === "true" || item.value === true ? "membership-cr-active" : ""}`}
                                onClick={() => handleToggleFeature(i)}
                                style={{ cursor: 'pointer' }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="membership-cr-form-card membership-cr-mini-section">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">4</span> Trial Settings
                  <span
                    style={{
                      marginLeft: '10px',
                      fontSize: '12px',
                      color: '#ff9800',
                      backgroundColor: '#fff3e0',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                    title="Will be implemented after Razorpay gateway integration"
                  >
                  </span>
                </div>
                <div className="membership-cr-row membership-cr-align-center">
                  <div
                    className="membership-cr-toggle-group"
                    style={{ pointerEvents: 'auto', opacity: '0.5', cursor: 'not-allowed' }}
                    title="Will be implemented after Razorpay gateway integration"
                  >
                    <span>Free trial option</span>
                    <div
                      className="membership-cr-toggle-switch"
                      style={{ cursor: 'not-allowed', opacity: '0.5' }}
                    ></div>
                  </div>
                  <div
                    className="membership-cr-input-group"
                    title="Will be implemented after Razorpay gateway integration"
                  >
                    <label>Total Duration (Days)</label>
                    <input
                      type="text"
                      name="TrailDuration"
                      value={editPlan?.trial_duration ?? 0}
                      disabled={true}
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      title="Will be implemented after Razorpay gateway integration"
                    />
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">5</span> Advanced Settings
                </div>
                <div className="membership-cr-row membership-cr-align-center">
                  <div
                    className="membership-cr-toggle-group"
                    style={{ pointerEvents: 'auto', opacity: '0.5', cursor: 'not-allowed' }}
                    title="Will be implemented after Razorpay gateway integration"
                  >
                    <span>Auto Renewal</span>
                    <div
                      className="membership-cr-toggle-switch"
                      style={{ cursor: 'not-allowed', opacity: '0.5' }}
                    ></div>
                  </div>
                  <div
                    className="membership-cr-input-group"
                    title="Will be implemented after Razorpay gateway integration"
                  >
                    <label>Grace Period (Days)</label>
                    <input
                      type="text"
                      name="GraceTime"
                      value={editPlan?.grace_time ?? 0}
                      disabled={true}
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      title="Will be implemented after Razorpay gateway integration"
                    />
                  </div>
                </div>
              </div>

              <div className="membership-cr-action-buttons" style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  className="membership-cr-btn-preview"
                  onClick={handleTriggerPreview}
                  style={{
                    padding: "12px 24px",
                    background: "#5c6bc0",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Preview Changes
                </button>

                <button
                  type="button"
                  className="membership-cr-btn-save"
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  style={{ opacity: isSaving ? 0.7 : 1 }}
                >
                  {Save && <img src={Save} alt="" className="membership-cr-btn-icon" />} {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="membership-cr-preview-sidebar">
              {previewPlan && (
                <PreviewCard plan={previewPlan} isStarterPlan={isStarterPlan} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewPlan && (
        <div className="published-plans-preview-modal-overlay" onClick={handleClosePreviewModal}>
          <div className="published-plans-preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="published-plans-preview-modal-close"
              onClick={handleClosePreviewModal}
            >
              ×
            </button>

            <div className="published-plans-preview-modal-header">
              <h3>Preview Plan</h3>
              <p>This is how your plan will appear to users</p>
            </div>

            <div className="published-plans-preview-modal-body">
              <PreviewCard plan={previewPlan} isStarterPlan={isStarterPlan} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};