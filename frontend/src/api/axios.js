import axios from "axios";

// Default to the hosted backend. You can override locally by creating
// a `.env` and setting VITE_API_BASE (e.g. VITE_API_BASE=http://localhost:3000/api).
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "https://vit-voice-sadhana.onrender.com/api";

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
