import "./TodaySchedule.css";

const TodaySchedule = () => {
  // dummy data
  const rows = [
    {
        interviewId: "IN5690",
        candidate: "Amal Dissanayaka",
        jobTitle: "UI/UX Designer",
        time: "10.30 AM",
        mode: "Online",
        action: "View",
      },
      {
        interviewId: "IN5691",
        candidate: "Sumudu Perera",
        jobTitle: "Software Engineer",
        time: "11.00 AM",
        mode: "Physical",
        action: "View",
      },
      {
        interviewId: "IN5692",
        candidate: "Kamal Ranjan",
        jobTitle: "QA",
        time: "11.30 AM",
        mode: "Online",
        action: "View",
      },
      {
        interviewId: "IN5693",
        candidate: "Nilkamal Perera",
        jobTitle: "HR Manager",
        time: "12.00 PM",
        mode: "Physical",
        action: "View",
      },
      
    
  ];

  // if empty show message
  const hasSchedule = rows.length > 0;

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  return (
    <div className="schedule-card">
      <h2 className="schedule-title">Today schedule</h2>

      {hasSchedule ? (
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Interview ID</th>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Time</th>
                <th>Mode</th>
                <th className="align-right"></th>
              </tr>
            </thead>

            <tbody>
               {/* loops to create tr for each interview */} 
              {rows.map((r) => (
                <tr key={r.interviewId}>
                  <td className="bold">{r.interviewId}</td>
                  <td>{r.candidate}</td>
                  <td>{r.jobTitle}</td>
                  <td>{r.time}</td>

                  <td>
                    <div className="mode-cell">
                        {/*dot*/}
                      <span className={`mode-dot ${modeDotClass(r.mode)}`} />
                      <span>{r.mode}</span>
                    </div>
                  </td>

                  <td className="align-right">
                    <button className="view-btn">{r.action}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (
        <div className="schedule-empty">
          <div className="schedule-empty-icon"></div>
          <p className="schedule-empty-title">Enjoy a Calm and Productive Day.</p>
          <p className="schedule-empty-sub">
            There are no interviews scheduled for today.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;






