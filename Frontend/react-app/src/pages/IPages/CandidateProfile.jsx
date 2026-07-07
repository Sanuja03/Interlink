import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import api from "../../lib/api";
import CandidateProfileView from "../CApages/Candidateprofileview";

/**
 * Interviewer Candidate Profile page.
 * Same UI as the company-admin profile (shared component), but data comes from
 * the panel-gated interviewer endpoint keyed by requestId, and it's READ-ONLY:
 * Shortlist + Reject are disabled; History Tracker + CV stay usable.
 */
export default function CandidateProfile() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    api
      .get(`/interviewer/interview-requests/${requestId}/candidate-profile`)
      .then((res) => { if (!cancelled) setProfile(res.data); })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [requestId]);

  return (
    <DashboardLayout>
      <CandidateProfileView
        profile={profile}
        loading={loading}
        readOnly={true}
        onBack={() => navigate(-1)}
        onHistory={() => navigate(`/interviewer/candidate-history/${requestId}`)}
      />
    </DashboardLayout>
  );
}