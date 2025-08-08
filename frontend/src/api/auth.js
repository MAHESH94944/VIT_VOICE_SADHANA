import axios from "axios";

const API_BASE = "http://localhost:3000/api/auth";

export async function registerUser(data) {
  try {
    const res = await axios.post(`${API_BASE}/register`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
}

export async function verifyOtp(email, otp) {
  try {
    const res = await axios.post(
      `${API_BASE}/verify-otp`,
      { email, otp },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "OTP verification failed");
  }
}

export async function loginUser(data) {
  try {
    const res = await axios.post(`${API_BASE}/login`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
}

export async function logoutUser() {
  try {
    const res = await axios.post(
      `${API_BASE}/logout`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Logout failed");
  }
}

export async function getMe() {
  try {
    const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
    return res.data;
  } catch (err) {
    // Don't throw error if 401, just return null
    if (err.response?.status === 401) return null;
    throw new Error(err.response?.data?.message || "Failed to fetch user");
  }
}
