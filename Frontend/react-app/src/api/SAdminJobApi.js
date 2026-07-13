import api from "../lib/api";

// Fetch jobs with pagination and filters
export const getJobs = async ({
  page = 0,
  size = 5,
  search = "",
  status = "",
  type = "",
  category = "",
}) => {
  const res = await api.get("/admin/jobs", {
    params: { page, size, search, status, type, category },
  });
  return res.data;
};

// Fetch a single job by ID
export const getJobById = async (id) => {
  const res = await api.get(`/admin/jobs/${id}`);
  return res.data;
};

// Flag a job by ID
export const flagJob = async (id) => {
  const res = await api.put(`/admin/jobs/${id}/flag`);
  return res.data;
};

// Remove flag from a job by ID
export const unflagJob = async (id) => {
  const res = await api.put(`/admin/jobs/${id}/unflag`);
  return res.data;
};

// Suspend a job by ID
export const suspendJob = async (id) => {
  const res = await api.put(`/admin/jobs/${id}/suspend`);
  return res.data;
};

// Restore a suspended job by ID
export const restoreJob = async (id) => {
  const res = await api.put(`/admin/jobs/${id}/restore`);
  return res.data;
};