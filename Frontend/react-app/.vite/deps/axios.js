import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./JobManagement.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function JobManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const token = localStorage.getItem("token");

      if (!companyId) {
        console.error("companyId not found");
        return;
      }

      const res = await axios.get(
        `http://localhost:8080/api/jobs/company/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("RAW API DATA:", res.data);

      const formatted = res.data.map((job) => ({
        id: job.id,
        title: job.jobTitle || "No Title",
        dept: job.department || "No Dept",
        status: job.status ? job.status.toUpperCase() : "OPEN",
        date: job.createdAt
          ? new Date(job.createdAt).toLocaleDateString("en-GB")
          : "-",
      }));

      console.log("FORMATTED:", formatted);

      setRows(formatted);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/jobs/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchJobs();
    } catch (err) {
      console.error("TOGGLE ERROR:", err.response?.data || err.message);
    }
  };

  const rowsMemo = useMemo(() => rows, [rows]);

  const filtered = rowsMemo.filter((r) => {
    return (
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.dept?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <DashboardLayout>
      <div className="jm-page">
        <div className="jm-container">
          <div className="jm-tools">
            <div className="jm-searchWrap">
              <input
                className="jm-search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="jm-searchIcon">🔍</span>
            </div>

            <select
              className="jm-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Filter by Job Title</option>
              {rows.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="jm-card">
            <h2 className="jm-cardTitle">Job Management</h2>

            <table className="jm-table">
              <thead>
                <tr>
                  <th className="jm-th">Job Title</th>
                  <th className="jm-th">Department</th>
                  <th className="jm-th">Status</th>
                  <th className="jm-th">Date posted</th>
                  <th className="jm-th"></th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="jm-td">{r.title}</td>
                      <td className="jm-td">{r.dept}</td>

                      <td className="jm-td">
                        <span className="jm-status">
                          <span
                            className={
                              "jm-dot " +
                              (r.status === "OPEN"
                                ? "jm-dot--green"
                                : "jm-dot--red")
                            }
                          />
                          {r.status}
                        </span>
                      </td>

                      <td className="jm-td">{r.date}</td>

                      <td className="jm-td">
                        <div className="jm-btns">
                          <button
                            className="jm-btn jm-btn--edit"
                            onClick={() => navigate(`/edit-job/${r.id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className={
                              "jm-btn " +
                              (r.status === "OPEN"
                                ? "jm-btn--close"
                                : "jm-btn--active")
                            }
                            onClick={() => handleToggle(r.id)}
                          >
                            {r.status === "OPEN" ? "Close" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="jm-createWrap">
            <button
              className="jm-create"
              onClick={() => navigate("/create-job")}
            >
              Create New Job Post
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}