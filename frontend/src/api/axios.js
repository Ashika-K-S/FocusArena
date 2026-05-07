import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) return Promise.reject(error);

    const skipRetry = [
      "auth/refresh",
      "auth/google-login",
      "auth/profile",
      "auth/login"
    ];

    if (skipRetry.some(url => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;