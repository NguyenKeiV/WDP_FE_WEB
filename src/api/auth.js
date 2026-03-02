import apiClient from "./client";

export const authApi = {
  login: (email, password) =>
    apiClient.post("/users/login", { email, password }),
};
