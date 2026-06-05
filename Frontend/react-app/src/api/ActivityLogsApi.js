import api from "../lib/api";

export const fetchActivityLogs = ({
  page = 0,
  size = 5,
  userRole = ""
} = {}) => {
  return api.get("/admin/activity-logs", {
    params: { page, size, userRole }
  });
};