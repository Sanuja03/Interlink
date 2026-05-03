import api from "../lib/api";

export const getSettings = async (category) => {
  const res = await api.get(`/admin/settings/${category}`);
  return res.data;
};

export const saveSettings = async (category, data) => {
  const res = await api.post(`/admin/settings/${category}`, data);
  return res.data;
};