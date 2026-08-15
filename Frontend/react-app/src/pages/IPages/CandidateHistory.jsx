import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import api from "../../lib/api";
import CandidateHistoryView from "../CApages/Candidatehistoryview";
import "./Interviewercandidatehistory.css";

/** Interviewer Candidate History page — panel-gated endpoints by requestId. */
export default function CandidateHistory() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [historyRes, profileRes] = await Promise.allSettled([
          api.get(`/interviewer/interview-requests/${requestId}/history`),
          api.get(`/interviewer/interview-requests/${requestId}/candidate-profile`),
        ]);
        if (cancelled) return;

        if (historyRes.status === "fulfilled") setHistoryData(historyRes.value.data);
        else console.error("Failed to load history:", historyRes.reason);

        if (profileRes.status === "fulfilled") setCandidate(profileRes.value.data);
        else console.error("Failed to load profile:", profileRes.reason);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [requestId]);

  const goBack = () => navigate(-1);

  return (
    <DashboardLayout>
      <div className="ip-history-page">
        <div className="ip-history-header">
          <h1 className="ip-history-title">Candidate History</h1>
          <button className="ip-back-btn" onClick={goBack}>
            ← Back
          </button>
        </div>

        <div className="ip-history-card">
          <CandidateHistoryView
            historyData={historyData}
            candidate={candidate}
            loading={loading}
            onBack={goBack}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}