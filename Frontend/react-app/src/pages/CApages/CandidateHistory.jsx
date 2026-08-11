import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import CandidateHistoryView from "./Candidatehistoryview";

/** Company-admin Candidate History page — fetches company endpoints. */
export default function CandidateHistory() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiQuestionScores, setAiQuestionScores] = useState([]);
  const [aiQuestionScoreLoading, setAiQuestionScoreLoading] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const historyRes = await api.get(
          `/company/history/application/${applicationId}`
        );
        if (cancelled) return;
        setHistoryData(historyRes.data);

        if (historyRes.data?.candidateId) {
          const profileRes = await api.get(
            `/company/candidate-profile/${historyRes.data.candidateId}?applicationId=${applicationId}`
          );
          if (!cancelled) setCandidate(profileRes.data);
        }

        if (historyRes.data?.candidateId && historyRes.data?.jobId) {
          setAiQuestionScoreLoading(true);
          try {
            const qsRes = await api.get("/company/ai-question-score", {
              params: {
                candidateId: historyRes.data.candidateId,
                jobId: historyRes.data.jobId,
              },
            });
            if (!cancelled) setAiQuestionScores(qsRes.data || []);
          } catch (qsErr) {
            console.error("Failed to load AI question score history:", qsErr);
            if (!cancelled) setAiQuestionScores([]);
          } finally {
            if (!cancelled) setAiQuestionScoreLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [applicationId]);

  return (
    <DashboardLayout>
      <CandidateHistoryView
        historyData={historyData}
        candidate={candidate}
        loading={loading}
        onBack={() => navigate(-1)}
        aiQuestionScores={aiQuestionScores}
        aiQuestionScoreLoading={aiQuestionScoreLoading}
      />
    </DashboardLayout>
  );
}