import React, { useState, useEffect } from "react";
import CalendarWidget from "../../CandidatePages/CandidateCalendar/CalendarWidget";
import api from "../../../lib/api";
import { getCompanyId } from "../../../lib/getCompanyId";
import "./CalendarSection.css";

export default function CalendarSection({ companyId: propCompanyId }) {
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        const companyId = propCompanyId || (await getCompanyId());
        if (!companyId) return;

        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        const end = new Date();
        end.setMonth(end.getMonth() + 6);
        const startDate = start.toISOString().split("T")[0];
        const endDate = end.toISOString().split("T")[0];

        const response = await api.get(
          `/calendar/company?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`
        );

        if (response.status === 200) {
          const data = response.data;
          const map = {};
          data.forEach((ev) => {
            if (!map[ev.date]) {
              map[ev.date] = [];
            }
            const candidateDisplay = ev.candidateName || "Candidate";
            map[ev.date].push({
              title: `${ev.jobTitle} – ${candidateDisplay}`,
              time: `${ev.time} – ${ev.endTime}`,
              mode: ev.mode,
              candidate: { name: candidateDisplay, role: ev.jobTitle },
              job: { title: ev.jobTitle, company: ev.companyName },
              meetingLink: ev.meetingLink,
              ...ev,
            });
          });
          setInterviews(map);
        }
      } catch (error) {
        console.error("Error fetching company calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [propCompanyId]);

  return (
    <div className="cal-section">
      <h2 className="cal-title">Interview Calendar</h2>

      <div className="cal-card">
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>Loading Calendar...</div>
        ) : (
          <CalendarWidget
            interviews={interviews}
            showJoinButton={true}
            showGenerateButton={false}
            defaultView="Month"
            onJoinInterview={(iv) => {
              if (iv.meetingLink) {
                window.open(iv.meetingLink, "_blank");
              } else {
                console.log("Join:", iv.title);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}