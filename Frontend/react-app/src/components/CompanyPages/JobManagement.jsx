import React, { useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import "./JobManagement.css";

export default function JobManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const rows = useMemo(
    () => [
      { title: "UI/UX Designer", dept: "Design", status: "Active", date: "17.07.2025" },
      { title: "Software Engineer", dept: "IT", status: "Active", date: "11.09.2025" },
      { title: "QA", dept: "QA", status: "Close", date: "12.07.2025" },
      { title: "HR manager", dept: "HR", status: "Active", date: "20.07.2025" },
    ],
    []
  );

  const filtered = rows.filter((r) => {
    const matchesText =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" ? true : r.title === filter;

    return matchesText && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="jm-page">
        <div className="jm-container">
          {/* ❌ Removed Back button + Horizon Global */}

          {/* Search + Filter */}
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
                <option key={r.title} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Table card */}
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
                {filtered.map((r) => (
                  <tr key={r.title}>
                    <td className="jm-td">{r.title}</td>
                    <td className="jm-td">{r.dept}</td>
                    <td className="jm-td">
                      <span className="jm-status">
                        <span
                          className={
                            "jm-dot " +
                            (r.status === "Active" ? "jm-dot--green" : "jm-dot--red")
                          }
                        />
                        {r.status}
                      </span>
                    </td>
                    <td className="jm-td">{r.date}</td>
                    <td className="jm-td">
                      <div className="jm-btns">
                        <button className="jm-btn jm-btn--edit">Edit</button>
                        <button className="jm-btn jm-btn--close">Close</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create button */}
          <div className="jm-createWrap">
            <button
              className="jm-create"
              onClick={() => (window.location.href = "/create-job")}
            >
              Create New Job Post
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}