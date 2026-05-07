import axios from "axios";

// Default to the hosted backend. You can override locally by creating
// a `.env` and setting VITE_API_BASE (e.g. VITE_API_BASE=http://localhost:3000).
let API_BASE_URL =
  import.meta.env.VITE_API_BASE;
// If the dev-provided VITE_API_BASE does not include the `/api` prefix, append it.
if (import.meta.env.VITE_API_BASE) {
  API_BASE_URL = String(import.meta.env.VITE_API_BASE).replace(/\/+$/g, "");
  if (!API_BASE_URL.endsWith("/api")) API_BASE_URL = API_BASE_URL + "/api";
}

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
  },
);

export default api;
