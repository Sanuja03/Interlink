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
      />
    </DashboardLayout>
  );
}