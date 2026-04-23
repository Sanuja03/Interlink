import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/admin";

export const fetchActivityLogs = ({
  page = 0,
  size = 10,
  userRole = "",
  search = "",
  fromDate = "",
  toDate = ""
} = {}) => {
  return axios.get(`${API_BASE_URL}/activity-logs`, {
    params: { page, size, userRole: userRole || "", search: search || "", fromDate: fromDate || "", toDate: toDate || "" }
  });
};

export const createActivityLog = (data) => {
  return axios.post(`${API_BASE_URL}/activity-logs`, data);
};
