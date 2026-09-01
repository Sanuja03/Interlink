import "./Dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import interviewscheduled from "../../assets/interviewscheduled.png";
import pendingrequests from "../../assets/pendingrequests.png";
import completedinterviews from "../../assets/completedinterviews.png";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import Card from "../../components/InterviewerPages/Layout/Card";
import TodaySchedule from "../../components/InterviewerPages/Layout/TodaySchedule";
import NextInterviewCard from "../../components/InterviewerPages/Layout/NextInterviewCard";

import api from "../../lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState({ scheduled: 0, pending: 0, completed: 0 });
  const [todayRows, setTodayRows] = useState([]);
  const [nextInterview, setNextInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*array is empty, there's nothing to watch for changes. 
  So this useEffect runs only once — when the component first 
  appears on screen*/
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // baseURL is "/api" — so the path here is "/interviewer/dashboard"
        const { data } = await api.get("/interviewer/dashboard");
        if (cancelled) return;

        // Stats
        setStats({
          scheduled: data?.stats?.scheduled ?? 0,
          pending:   data?.stats?.pending   ?? 0,
          completed: data?.stats?.completed ?? 0,
        });

        // Today's schedule rows — pass through every field SingleView needs
        const rows = (data?.todaySchedule ?? []).map((r) => ({
          // Display fields
          interviewId:      r.interviewId,
          candidate:        r.candidate,
          jobTitle:         r.jobTitle,
          time:             r.time,
          mode:             r.mode,
          requestId:        r.requestId,
          action:           "View",

          // Extra fields needed by SingleView via router state
          scheduledId:      r.scheduledId,
          date:             r.date,
          meetingLink:      r.meetingLink,
          meetingStatus:    r.meetingStatus,
          candidateId:      r.candidateId,
          jobApplicationId: r.jobApplicationId,
          panelMembers:     r.panelMembers,
          adminNote:        r.adminNote,
        }));
        setTodayRows(rows);

        // Next interview
        if (data?.nextInterview) {
          const n = data.nextInterview;
          setNextInterview({
            interviewId:   n.interviewId,
            date:          n.date,
            time:          n.time,
            jobTitle:      n.jobTitle,
            meetingLink:   n.meetingLink,
            meetingStatus: n.meetingStatus,
            candidate: {
              image:       n.candidate?.image || null,   // card falls back to the default avatar
              id:          n.candidate?.id,
              name:        n.candidate?.name,
              cvName:      n.candidate?.cvName,
              profileLink: n.candidate?.profileLink,
              note:        n.candidate?.note,
            },
          });
        } else {
          setNextInterview(null);
        }
      } catch (e) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.error ||
          e?.response?.statusText ||
          e?.message ||
          "Failed to load dashboard";
        setError(`${msg}${e?.response?.status ? ` (${e.response.status})` : ""}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="dash-page">
        <h1 className="dash-title">Dashboard</h1>

        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "10px 14px", borderRadius: 8, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <div className="dash-card">
          <div className="dash-stats-row">
            <Card
              title="Scheduled Interviews"
              value={loading ? "…" : stats.scheduled}
              icon={interviewscheduled}
            />

            <Link to="/interviewer/pending-requests" className="pending-link">
              <Card
                title="Pending Requests"
                value={loading ? "…" : stats.pending}
                icon={pendingrequests}
                variant="danger"
              />
            </Link>

            <Card
              title="Completed Interviews"
              value={loading ? "…" : stats.completed}
              icon={completedinterviews}
            />
          </div>

          <div className="dash-main-row">
            <div className="dash-left">
              <TodaySchedule rows={todayRows} loading={loading} />
            </div>

            <div className="dash-right">
              <NextInterviewCard interview={nextInterview} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;