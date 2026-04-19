import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/admin";

export const fetchActivityLogs = ({
  page = 0,
  size = 5,
  userRole = ""
} = {}) => {
  return axios.get(`${API_BASE_URL}/activity-logs`, {
    params: { page, size, userRole }
  });
};
