import api from "../lib/api";

export const getNotifications = async () => (await api.get("/notifications")).data;
export const getUnreadCount = async () => (await api.get("/notifications/unread-count")).data.count;
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put("/notifications/read-all");