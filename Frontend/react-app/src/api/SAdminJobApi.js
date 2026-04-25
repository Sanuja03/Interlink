import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/jobs";

export const getJobs = async ({ page = 0, size = 5, search = "", status = "", type = "", category = "" }) => {
  const res = await axios.get(BASE_URL, {
    params: { page, size, search, status, type, category },
  });
  return res.data;
};

export const getJobById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const flagJob    = async (id) => axios.put(`${BASE_URL}/${id}/flag`);
export const unflagJob  = async (id) => axios.put(`${BASE_URL}/${id}/unflag`);
export const suspendJob = async (id) => axios.put(`${BASE_URL}/${id}/suspend`);
export const restoreJob = async (id) => axios.put(`${BASE_URL}/${id}/restore`);