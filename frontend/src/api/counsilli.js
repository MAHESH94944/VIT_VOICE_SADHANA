import axios from "axios";

const API_BASE = "http://localhost:3000/api/counsilli";

export async function getCounsilliDashboard() {
  try {
    const res = await axios.get(`${API_BASE}/dashboard`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to fetch dashboard");
  }
}

export async function addSadhanaCard(data) {
  try {
    const res = await axios.post(`${API_BASE}/sadhana/add`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to add sadhana card"
    );
  }
}

export async function getMonthlyReport(month) {
  try {
    const res = await axios.get(`${API_BASE}/sadhana/monthly/${month}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch monthly report"
    );
  }
}
