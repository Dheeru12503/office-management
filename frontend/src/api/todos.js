import api from "./axios";

export const getMyTodos = () => api.get("/todos/my");
export const createTodo = (data) => api.post("/todos", data);
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);
export const getEmployeeTodos = (employeeId) => api.get(`/todos/employee/${employeeId}`);
