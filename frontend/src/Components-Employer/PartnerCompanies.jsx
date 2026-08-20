import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EHeader } from "./EHeader";
import { Footer } from "../Components-LandingPage/Footer";
import api from "../api/axios";

export const PartnerCompanies = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/company/partners/");
      setPartners(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load partner companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPartners(); }, []);

  const reviewPartner = async (verificationId, status) => {
    try {
      await api.patch(`/company/parent-verification/${verificationId}/`, { status });
      await loadPartners();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update partner approval.");
    }
  };

  const removePartner = async (partnerId) => {
    if (!window.confirm("Remove this partner company and stop its access?")) return;
    try {
      await api.delete(`/company/partners/${partnerId}/`);
      await loadPartners();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to remove partner company.");
    }
  };

  return (
    <>
      <EHeader />
      <main style={{ maxWidth: 1100, margin: "32px auto", padding: "0 20px" }}>
        <button type="button" onClick={() => navigate("/Job-portal/Employer/Dashboard")} style={{ marginBottom: 18 }}>
          Back to Dashboard
        </button>
        <h1>Partner Companies</h1>
        <p>Review, approve, and control companies connected to your organization.</p>
        {error && <div style={{ color: "#b42318", background: "#fff1f0", padding: 12, margin: "16px 0" }}>{error}</div>}
        {loading ? <p>Loading partner companies...</p> : partners.length === 0 ? <p>No partner companies are connected yet.</p> : (
          <div style={{ display: "grid", gap: 16 }}>
            {partners.map((partner) => (
              <section key={partner.id} style={{ border: "1px solid #d9e0ea", borderRadius: 8, padding: 20, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{partner.company_name}</h2>
                    <p>{partner.partner_category || "Partner company"} | {partner.company_email}</p>
                    <p><strong>Services:</strong> {partner.services_offered || "Not provided"}</p>
                    <p><strong>Authorization:</strong> {partner.authorization_contact || "Not provided"}</p>
                    <p><strong>Employers:</strong> {partner.employers?.map((employer) => employer.email).join(", ") || "None"}</p>
                  </div>
                  <div>
                    <p>Parent approval: <strong>{partner.parent_approval_status}</strong></p>
                    <p>Admin approval: <strong>{partner.admin_status}</strong></p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {partner.verification_id && partner.parent_approval_status !== "Verified" && (
                    <button type="button" onClick={() => reviewPartner(partner.verification_id, "Verified")}>Approve for Admin</button>
                  )}
                  {partner.verification_id && partner.parent_approval_status === "Pending" && (
                    <button type="button" onClick={() => reviewPartner(partner.verification_id, "Reject")}>Reject</button>
                  )}
                  <button type="button" onClick={() => removePartner(partner.id)}>Remove Access</button>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};
