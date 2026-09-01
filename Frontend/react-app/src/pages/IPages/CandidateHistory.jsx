import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import api from "../../lib/api";
import CandidateHistoryView from "../CApages/Candidatehistoryview";
import "./InterviewerCandidateHistory.css";

/** Interviewer Candidate History page — panel-gated endpoints by requestId. */
export default function CandidateHistory() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiQuestionScores, setAiQuestionScores] = useState([]);
  const [aiQuestionScoreLoading, setAiQuestionScoreLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setAiQuestionScoreLoading(true);
        // Panel-gated interviewer endpoints — the company-admin
        // /company/ai-question-score route is closed to interviewers.
        const [historyRes, profileRes, qsRes] = await Promise.allSettled([
          api.get(`/interviewer/interview-requests/${requestId}/history`),
          api.get(`/interviewer/interview-requests/${requestId}/candidate-profile`),
          api.get(`/interviewer/interview-requests/${requestId}/ai-question-score`),
        ]);
        if (cancelled) return;

        if (historyRes.status === "fulfilled") setHistoryData(historyRes.value.data);
        else console.error("Failed to load history:", historyRes.reason);

        if (profileRes.status === "fulfilled") setCandidate(profileRes.value.data);
        else console.error("Failed to load profile:", profileRes.reason);

        if (qsRes.status === "fulfilled") setAiQuestionScores(qsRes.value.data || []);
        else {
          console.error("Failed to load AI question score history:", qsRes.reason);
          setAiQuestionScores([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAiQuestionScoreLoading(false);
        }
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
            aiQuestionScores={aiQuestionScores}
            aiQuestionScoreLoading={aiQuestionScoreLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}