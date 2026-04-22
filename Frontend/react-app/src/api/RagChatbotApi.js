import api from "../lib/api";

export const sendMessage = (message) => {
  return api.post("/chat", {
    message,
  });
};