import api from "./axios";

export async function registerUser(userData) {
  const res = await api.post("/auth/register", userData);
  return res.data;
}

export async function verifyOtp(email, otp) {
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
}

export async function loginUser(credentials) {
  const res = await api.post("/auth/login", credentials);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function getMe() {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (err) {
    // Don't treat a 401 as a critical error for session checks
    if (err.response?.status === 401) return null;
    throw err;
  }
}
