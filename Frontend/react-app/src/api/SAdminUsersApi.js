import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/users";

// =========================================
// 🔹 GET ALL USERS (users list page)
//    Optional: search by name/email, filter by role
//    role: "candidate" | "interviewer" | "company_admin" | ""
// =========================================
export const getUsers = async ({ search = "", role = "" } = {}) => {
  const res = await axios.get(BASE_URL, {
    params: { search, role },
  });
  return res.data;
};

// =========================================
// 🔹 GET USER PROFILE (role-specific)
//    Returns different shape based on role:
//    - candidate     → AdminCandidateProfileDto
//    - interviewer   → AdminInterviewerProfileDto
//    - company_admin → AdminCompanyAdminProfileDto
// =========================================
export const getUserProfile = async (userId) => {
  const res = await axios.get(`${BASE_URL}/${userId}`);
  return res.data;
};

// =========================================
// 🔹 USER ACTIONS
// =========================================
export const suspendUser = async (userId) => axios.put(`${BASE_URL}/${userId}/suspend`);
export const restoreUser = async (userId) => axios.put(`${BASE_URL}/${userId}/restore`);
export const flagUser    = async (userId) => axios.put(`${BASE_URL}/${userId}/flag`);