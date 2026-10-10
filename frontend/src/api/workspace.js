import api from "./axios";

export const getWorkspace = () => api.get("/workspaces/me");
export const createWorkspace = (data) => api.post("/workspaces", data);
export const updateWorkspace = (id, data) => api.put(`/workspaces/${id}`, data);
export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`);
