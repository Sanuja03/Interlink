import api from "../lib/api";

export const fetchActivityLogs = ({
  page = 0,
  size = 10,
  userRole = "",
  search = "",
  fromDate = "",
  toDate = ""
} = {}) => {
  return api.get("/admin/activity-logs", {
    params: { page, size, userRole, search, fromDate, toDate }
  });
};

export const createActivityLog = (data) => {
  return api.post("/activity-logs", data);
};