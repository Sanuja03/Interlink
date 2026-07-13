import api from "../lib/api";

export const fetchInterviews = ({ page = 0, size = 10, search = "", status = "" } = {}) => {
  return api.get("/admin/interviews", { params: { page, size, search, status } });
};

export const fetchInterviewCount = () => {
  return api.get("/admin/interviews/count");
};

/**
 * Fetches candidate profile for a given candidateId.
 * @param {string} candidateId - UUID of the candidate
 */
export const fetchCandidateById = (candidateId) =>
  api.get(`/admin/interviews/candidate/${candidateId}`);