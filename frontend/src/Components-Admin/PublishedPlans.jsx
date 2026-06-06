import React, { useState } from 'react';
import SixDots from '../assets/AdminAssets/SixDots.png';
import Save from '../assets/AdminAssets/SaveDraft.png';
import Tick from '../assets/AdminAssets/Greentick.png';
import RedCross from '../assets/AdminAssets/RedCross.png';
import './PublishedPlan.css';
import { useJobs } from '../JobContext';

export const PublishedPlans = () => {
  const {allPlans,setAllPlans}=useJobs()
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Helper function to calculate total payable amount
  const calculateTotalPayable = (basePrice, discountPercent, taxPercent, billingCycle) => {
    let price = parseFloat(basePrice) || 0;

    if (billingCycle === '6 Months') {
      price = price * 6;
    } else if (billingCycle === 'Yearly') {
      price = price * 12;
    }

    const hasDiscount = billingCycle === '6 months' || billingCycle === 'Yearly';
    const activeDiscountPercent = hasDiscount ? (parseFloat(discountPercent) || 0) : 0;

    const discountAmt = price * (activeDiscountPercent / 100);
    const priceAfterDiscount = price - discountAmt;
    
    const taxAmt = priceAfterDiscount * ((parseFloat(taxPercent) || 0) / 100);
    const finalTotal = priceAfterDiscount + taxAmt;

    return finalTotal.toFixed(2);
  };

  const handleFeatureValueChange = (featureIdx, value) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        return { ...feature, value: value };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    const CopiedPlan = JSON.parse(JSON.stringify(plan));
    setEditPlan(CopiedPlan);
    setPreviewPlan(CopiedPlan);
  };

  // const handleInputChange = (field, value) => {
  //   setEditPlan(prev => {
  //     const updated = { ...prev, [field]: value };
  //     if (field === 'billingCycle') {
  //       updated.duration = value === 'Monthly'&& 30 ;
  //       updated.duration = value === '6 months'&& 180;
  //       updated.duration = value === 'yearly'&& 365;
  //     }
  //     return updated;
  //   });
  // };

  const handleInputChange = (field, value) => {
  setEditPlan(prev => {
    const updated = { ...prev, [field]: value };

    if (field === 'billingCycle') {
      const durationMap = {
        'Monthly': 30,
        '6 Months': 180,
        'Yearly': 365
      };
      
      if (durationMap[value] !== undefined) {
        updated.duration = durationMap[value];
      }
    }

    return updated;
  });
};

  const handleToggleFeature = (featureIdx) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        return { ...feature, isInclude: !feature.isInclude };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleFeatureTextChange = (featureIdx, textValue) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        return { ...feature, text: textValue };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleAutoRenewalToggle = () => {
  setEditPlan(prev => ({ ...prev, isAutoRenewal: !prev.isAutoRenewal }));
  };

  const handleTriggerPreview = () => {
  setPreviewPlan({ ...editPlan });
  };
  const handleAddTag = (e) => {
    const value = e.target.value.trim();
    if (value && !editPlan.planTags.includes(value)) {
      setEditPlan({
        ...editPlan,
        planTags: [...editPlan.planTags, value]
      });
    }
    setIsAdding(false);
  };

  const removeTag = (tagToRemove) => {
    setEditPlan((prevData) => ({
      ...prevData,
      planTags: prevData.planTags.filter(tag => tag !== tagToRemove),
    }));
  };
  
  const handleTrailToggle = () => {
  setEditPlan(prev => ({ 
    ...prev, 
    isTrialEnabled: !prev.isTrialEnabled,
    TrailDuration: !prev.isTrialEnabled ? "7" : "0" 
  }));
  };
   
  const handleSavePlan = () => {
    setAllPlans(prevPlans =>
      prevPlans.map(plan => plan.id === selectedPlanId ? { ...editPlan } : plan)
    );
    alert("Changes saved successfully to the plan database!");
  };

  const handleDeleteFeature = (featureIdx) => {
    const updatedFeatures = editPlan.features.filter((_, i) => i !== featureIdx);
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

 

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
                  background: plan.color,
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                {plan.PlanName}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="membership-cr-membership-container">
          <div style={{display:"flex",alignItems:"center",padding:"10px 15px",margin:"10px 0",gap:"10px"}} >
          <button onClick={() => {setSelectedPlanId(null); setEditPlan(null); setPreviewPlan(null);}}
            style={{padding: "5px 5px",cursor: "pointer",borderRadius: "5px",border: "1px solid #a2a2a2",fontWeight: "500"}}>
            Back to Plans</button>
          <div className="membership-cr-membership-header">
            <h1 style={{padding: "10px 20px",flex:"1",fontSize:"18px"}}>Edit Plan: {editPlan?.PlanName}</h1>
          </div>
        </div>
          <div className="membership-cr-membership-content">
            <div className="membership-cr-form-sections">

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">1</span> Basic plan details
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Plan name*</label>
                    <input
                      type="text"
                      value={editPlan?.PlanName || ''}
                      onChange={(e) => handleInputChange('PlanName', e.target.value)}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Plan type*</label>
                    <input
                      type="text"
                      value={editPlan?.badge || ''}
                      onChange={(e) => handleInputChange('badge', e.target.value)}
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
                    <label>Price (₹)*</label>
                    <input
                      type="number"
                      value={editPlan?.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Billing Cycle*</label>
                    <input 
                      value={editPlan?.billingCycle || 'Monthly'} 
                      onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                      readOnly
                    >
                    </input>
                    </div>
                      {/* <option value="Monthly">Monthly</option> */}
                     
                    
                    {/* <div className="membership-cr-input-group">
                      <label>Billing Cycle*</label>
                    <select name="Billing cycle" value={editPlan?.billingCycle || 'Monthly'} 
                      onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                      readOnly>
                      <option value="Monthly">Monthly</option>
                      <option value="6 Months">6 Months</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div> */}
                  <div className="membership-cr-input-group">
                    <label>Duration (Days)*</label>
                    <input 
                      type="number" 
                      value={editPlan?.duration || 30} 
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                    />
                  </div>
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Discount (%)</label>
                    <input 
                      type="number" 
                      value={editPlan.billingCycle === 'Yearly' ? editPlan.discount : 0 || editPlan.billingCycle ==="6 Months" ? editPlan.discount : 0} 
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Tax (%)</label>
                    <input 
                      type="number" 
                      value={editPlan?.tax ?? 18} 
                      onChange={(e) => handleInputChange('tax', e.target.value)}
                    />
                  </div>
                  
                  <div className="membership-cr-total-payable">
                    <p style={{ textAlign: "start", margin: "5px 0", fontWeight: "600" }}>Total Payable</p>
                    <h3 style={{ textAlign: "start", fontSize: "24px" }}>
                      ₹ {calculateTotalPayable(editPlan?.price, editPlan?.discount, editPlan?.tax,editPlan.billingCycle)}{" "}
                      <span style={{ fontSize: "16px", fontWeight: "normal", color: "#555" }}>
                        / {editPlan?.billingCycle === 'Monthly' ? 'Month' : 'Yearly'}
                      </span>
                    </h3>
                    <p style={{ textAlign: "start", margin: "5px 0", fontSize: "12px" }}>(incl. tax after discount)</p>
                  </div>
                </div>
              </div>

              {/* <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">3</span> Features & Limits
                </div>
                <table className="membership-cr-features-table">
                  <thead>
                    <tr>
                      <th>Feature Name</th>
                      <th>Included</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editPlan?.features.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={SixDots} alt="" className="membership-cr-drag-dots" />
                            <input
                              type="text"
                              value={item.text}
                              className="membership-cr-feature-label-input"
                              onChange={(e) => handleFeatureTextChange(i, e.target.value)}
                              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
                            />
                          </div>
                        </td>
                        <td>
                          <div
                            className={`membership-cr-toggle-switch ${item.isInclude ? "membership-cr-active" : ""}`}
                            onClick={() => handleToggleFeature(i)}
                          ></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}
              <div className="membership-cr-form-card">
              <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">3</span> Features & Limits
                </div>
              <table className="membership-cr-features-table">
  <thead>
    <tr >
      <th style={{ textAlign: 'left', padding: '10px' }}>Feature Name</th>
      <th style={{ textAlign: 'center', padding: '10px' }}>Value / Limit</th>
      <th style={{ textAlign: 'center', padding: '10px' }}>Included</th>
      <th style={{ textAlign: 'center', padding: '10px' }}>Action</th>
    </tr>
  </thead>
  <tbody style={{border:"1px solid #f0f0ff"}}>
    {editPlan?.features.map((item, i) => (
      <tr key={i}>
        {/* Feature Name */}
        <td style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <img src={SixDots} alt="" className="membership-cr-drag-dots" width="12" />
            <input
              type="text"
              value={item.text}
              className="membership-cr-feature-label-input"
              onChange={(e) => handleFeatureTextChange(i, e.target.value)}
              style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px', width: '90%', outline: 'none' }}
            />
          </div>
        </td>
        <td style={{ textAlign: 'center', padding: '10px' }}>
          {item.isInclude ? (
            <input
              type="text"
              value={item.value || ''}
              onChange={(e) => handleFeatureValueChange(i, e.target.value)}
              placeholder="e.g. 30"
              style={{ width: '60px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          ) : (
            <span style={{ color: '#aaa', fontSize: '12px' }}>-</span>
          )}
        </td>

        <td style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className={`membership-cr-toggle-switch ${item.isInclude ? "membership-cr-active" : ""}`}
              onClick={() => handleToggleFeature(i)}
            ></div>
          </div>
        </td>

        {/* Action / Delete Button */}
        <td style={{ textAlign: 'center', padding: '10px' }}>
          <button 
            onClick={() => handleDeleteFeature(i)}
            style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' }}
            title="Delete Feature"
          >
           Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>
{/* Add Feature Button */}
{/* <div style={{ padding: '10px', textAlign: 'left' }}>
  <button 
    onClick={handleAddFeature}
    style={{ background: '#eef2ff', color: '#5c6bc0', border: '1px solid #5c6bc0', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
  >
    + Add New Feature
  </button>
</div> */}

              <div className="membership-cr-form-card membership-cr-mini-section">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">4</span> Trial Settings</div>
            <div className="membership-cr-row membership-cr-align-center">
              <div className="membership-cr-toggle-group" >
                <span>Free Trial Available</span>
                <div onClick={handleTrailToggle} className={`membership-cr-toggle-switch  ${editPlan.isTrialEnabled ? "membership-cr-active" : ""}` }></div>
              </div>
              <div className="membership-cr-input-group">
                <label>Total Duration (Days)</label>
                <input type="number" name="TrailDuration" value={editPlan.TrailDuration}  disabled={!editPlan.isTrialEnabled} />
              </div>
            </div>
              </div>

              <div className="membership-cr-form-card">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">5</span> Advanced Settings</div>
            <div className="membership-cr-row membership-cr-align-center">
              <div className="membership-cr-toggle-group" onClick={handleAutoRenewalToggle}>
                <span>Auto Renewal</span>
                <div className={`membership-cr-toggle-switch ${editPlan.isAutoRenewal ? 'membership-cr-active' : ''}`}></div>
              </div>
              <div className="membership-cr-input-group">
                <label>Grace Period (Days)</label>
                <input type="number" name="GraceTime" value={editPlan.GraceTime} onChange={handleInputChange} disabled={!editPlan.isAutoRenewal} />
              </div>

              <div className="membership-cr-input-group">
                <label>Plan Tags</label>
                <div className="membership-cr-tags-input">
                  {editPlan.planTags.map((tag, index) => (
                    <span key={index} className="membership-cr-tag">
                      {tag}
                      <span
                        onClick={() => removeTag(tag)}
                        style={{ cursor: 'pointer', marginLeft: '8px' }}
                      >
                        ✕
                      </span>
                    </span>
                  ))}

                  {isAdding ? (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter tag..."
                      className="membership-cr-tag-input-field"
                      onBlur={handleAddTag}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTag(e);
                        if (e.key === 'Escape') setIsAdding(false);
                      }}
                    />
                  ) : (
                    <span
                      className="membership-cr-add-tag"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setIsAdding(true)}
                    >
                      +
                    </span>
                  )}
                </div>
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
                >
                  {Save && <img src={Save} alt="" className="membership-cr-btn-icon" />} Save
                </button>
              </div>
            </div>

            <div className="membership-cr-preview-sidebar">
              {previewPlan && (
                <div className="published-plan-preview-card">
                  <div className="published-plan-badge" style={{ backgroundColor: previewPlan.color }}>
                    {previewPlan.PlanName}
                  </div>
                  

                  <div className="published-plan-content">
                    <div className="published-plan-price-section">
                      <h2 className="published-plan-price">
                        ₹ {calculateTotalPayable(previewPlan.price, previewPlan.discount, previewPlan.tax,previewPlan.billingCycle)}
                      </h2>
                      <small style={{ color: '#555' }}>
                        ({previewPlan.billingCycle})
                      </small>
                      <p className="published-plan-sub-badge">{previewPlan.badge}</p>
                      {/* <small style={{ color: '#555' }}>
                        Base: ₹{previewPlan.price} | Disc: {previewPlan.discount}% | Tax: {previewPlan.tax}%
                      </small> */}
                    </div>

                    <div className="published-plan-divider"></div>
                    <ul className="published-plan-features">
                      {previewPlan.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`published-plan-feature-item ${feature.isInclude ? 'included' : 'excluded'}`}
                        >
                          <span className="published-plan-icon">
                            <img src={feature.isInclude ? Tick : RedCross} alt={feature.isInclude ? "yes" : "no"} width={15} />
                          </span>
                          <span className="published-plan-feature-text">
  {feature.value && feature.isInclude ? <strong style={{marginRight: '5px'}}>{feature.value}</strong> : null}
  {feature.text}
</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="published-plan-btn-get-started"
                      style={{ backgroundColor: previewPlan.color }}
                    >
                      Get started
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};