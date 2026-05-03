import api from "../lib/api";

export const fetchDashboardData = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};