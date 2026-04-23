import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/companies";

export const getPendingCompanies = async () => {
  const res = await axios.get(`${BASE_URL}/pending`);
  return res.data;
};

export const getApprovedCompanies = async () => {
  const res = await axios.get(`${BASE_URL}/approved`);
  return res.data;
};

export const getCompanyById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const approveCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/approve`);
  return res.data;
};

export const rejectCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/reject`);
  return res.data;
};

export const suspendCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/suspend`);
  return res.data;
};

export const restoreCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/restore`);
  return res.data;
};

export const flagCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/flag`);
  return res.data;
};

export const unflagCompany = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/unflag`);
  return res.data;
};

export const searchCompanies = async (search, status) => {
  const res = await axios.get(`${BASE_URL}/search`, {
    params: { search, status },
  });
  return res.data;
};