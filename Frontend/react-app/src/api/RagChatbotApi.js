import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/chat";

export const sendMessage = (message) => {
  return axios.post(API_BASE_URL, {
    message,
  });
};