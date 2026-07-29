import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import CandidateProfileView from "./Candidateprofileview";


export default function CandidateProfile() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const url = applicationId
      ? `/company/candidate-profile/${candidateId}?applicationId=${applicationId}`
      : `/company/candidate-profile/${candidateId}`;

    api
      .get(url)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, [candidateId, applicationId]);

  const handleReject = async () => {
    if (!window.confirm("Reject this candidate?")) return;
    try {
      const companyId = localStorage.getItem("companyId");
      await api.post("/company/shortlist/reject", {
        candidateId,
        companyId,
        jobId: profile?.jobId,
        jobApplicationId: Number(applicationId),
        manualDecision: "Reject",
        manualNotes: "",
      });
      alert("Candidate rejected.");
      navigate(-1);
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject candidate");
    }
  };

  return (
    <DashboardLayout>
      <CandidateProfileView
        profile={profile}
        loading={loading}
        readOnly={false}
        onBack={() => navigate(-1)}
        onShortlist={
          applicationId
            ? () => navigate(`/company/shortlist/${applicationId}`)
            : undefined
        }
        onHistory={
          applicationId
            ? () => navigate(`/company/candidate-history/${applicationId}`)
            : undefined
        }
        onReject={applicationId ? handleReject : undefined}
      />
    </DashboardLayout>
  );
}