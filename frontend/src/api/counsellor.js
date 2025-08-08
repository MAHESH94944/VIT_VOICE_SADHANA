import axios from "axios";

const API_BASE = "http://localhost:3000/api/counsellor";

export async function getCounsellorDashboard() {
  try {
    const res = await axios.get(`${API_BASE}/dashboard`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to fetch dashboard");
  }
}

export async function getCounsillisList() {
  try {
    const res = await axios.get(`${API_BASE}/counsillis`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch counsillis"
    );
  }
}

export async function getCounsilliSadhanaReport(counsilliId) {
  try {
    const res = await axios.get(
      `${API_BASE}/counsilli/${counsilliId}/sadhana`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch sadhana report"
    );
  }
}

export async function getCounsilliMonthlyReport(counsilliId, month) {
  try {
    const res = await axios.get(
      `${API_BASE}/counsilli/${counsilliId}/sadhana/${month}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch monthly report"
    );
  }
}
