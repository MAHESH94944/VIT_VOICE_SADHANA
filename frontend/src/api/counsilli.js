import api from "./axios";

export async function getCounsilliDashboard() {
  const res = await api.get("/counsilli/dashboard");
  return res.data;
}

export async function addSadhana(sadhanaData) {
  const res = await api.post("/counsilli/sadhana/add", sadhanaData);
  return res.data;
}

export async function getMonthlyReport(month) {
  const res = await api.get(`/counsilli/sadhana/monthly/${month}`);
  return res.data;
}
