import api from "../lib/api";

// Fetch all users with optional search and role filters
export const getUsers = async ({ search = "", role = "" } = {}) => {
  const res = await api.get("/admin/users", {
    params: { search, role },
  });
  return res.data;
};

// Fetch a single user profile by ID
export const getUserProfile = async (userId) => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data;
};

// Suspend a user by ID
export const suspendUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/suspend`);
  return res.data;
};

// Restore a suspended user by ID
export const restoreUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/restore`);
  return res.data;
};

// Flag a user for issues by ID
export const flagUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/flag`);
  return res.data;
};

// Remove flag from a user by ID
export const unflagUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/unflag`);
  return res.data;
};