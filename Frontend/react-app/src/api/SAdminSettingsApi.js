import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/settings";

// GET settings by category
export const getSettings = (category) => {
  return axios.get(`${BASE_URL}/${category}`);
};

// SAVE settings
export const saveSettings = (category, data) => {
  return axios.post(`${BASE_URL}/${category}`, data);
};