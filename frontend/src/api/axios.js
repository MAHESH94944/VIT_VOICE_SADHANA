import axios from "axios";

// Use the production URL when the app is built, otherwise use the local proxy
const API_BASE_URL = import.meta.env.PROD
  ? "https://vit-voice-sadhana.onrender.com/api"
  : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach a user-friendly message to the error object
    error.message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    return Promise.reject(error);
  }
);

export default api;
