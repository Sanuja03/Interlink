import api from "../lib/api";

/**
 * Send a user message. userId is resolved server-side from the auth header,
 * so the frontend does not need to pass it explicitly.
 *
 * @param {string} message - The user's input text
 */
export const sendMessage = (message) =>
  api.post("/chat", { message });


// Retrieve today's message history for the logged-in user.
export const getHistory = () =>
  api.get("/chat/history");