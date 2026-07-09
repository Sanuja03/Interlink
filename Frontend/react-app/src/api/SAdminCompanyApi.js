import api from "../lib/api";

// Fetch all pending companies
export const getPendingCompanies = async () => {
  const res = await api.get("/admin/companies/pending");
  return res.data;
};

// Fetch all approved companies
export const getApprovedCompanies = async () => {
  const res = await api.get("/admin/companies/approved");
  return res.data;
};

// Fetch a single company by ID
export const getCompanyById = async (id) => {
  const res = await api.get(`/admin/companies/${id}`);
  return res.data;
};

// Approve a company by ID
export const approveCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/approve`);
  return res.data;
};

// Reject a company by ID
export const rejectCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/reject`);
  return res.data;
};

// Suspend a company by ID
export const suspendCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/suspend`);
  return res.data;
};

// Restore a suspended company by ID
export const restoreCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/restore`);
  return res.data;
};

// Flag a company for issues by ID
export const flagCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/flag`);
  return res.data;
};

// Remove flag from a company by ID
export const unflagCompany = async (id) => {
  const res = await api.put(`/admin/companies/${id}/unflag`);
  return res.data;
};

// Search companies by keyword and status
export const searchCompanies = async (search, status) => {
  const res = await api.get("/admin/companies/search", {
    params: { search, status },
  });
  return res.data;
};