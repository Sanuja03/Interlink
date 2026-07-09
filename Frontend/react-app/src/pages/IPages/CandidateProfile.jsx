import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import api from "../../lib/api";
import CandidateProfileView from "../CApages/Candidateprofileview";
import "./InterviewerCandidateProfile.css";

/**
 * Interviewer Candidate Profile page.
 * Reuses the shared CandidateProfileView (same UI as company admin), but:
 *  - wrapped in the app's standard white card container
 *  - adds a page title + Back button that returns to wherever the user came
 *    from (Pending Requests OR a Scheduled interview's SingleView), falling
 *    back to Pending Requests on a direct load / refresh
 *  - READ-ONLY: Shortlist + Reject disabled; History Tracker + CV usable
 *  - data comes from the panel-gated interviewer endpoint (by requestId)
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

  // Go back to wherever we came from. If there's no in-app history
  // (direct link / refresh), fall back to Pending Requests.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/interviewer/pending-requests");
  };

  return (
    <DashboardLayout>
      <div className="ip-profile-page">
        <div className="ip-profile-header">
          <h1 className="ip-profile-title">Candidate Profile</h1>
          <button className="ip-back-btn" onClick={goBack}>
            ← Back
          </button>
        </div>

        <div className="ip-profile-card">
          <CandidateProfileView
            profile={profile}
            loading={loading}
            readOnly={true}
            onBack={goBack}
            onHistory={() =>
              navigate(`/interviewer/candidate-history/${requestId}`)
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}