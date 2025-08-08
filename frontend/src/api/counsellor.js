import api from './axios';

export async function getCounsellorDashboard() {
  const res = await api.get('/counsellor/dashboard');
  return res.data;
}

export async function getCounsillisList() {
  const res = await api.get('/counsellor/counsillis');
  return res.data;
}

export async function getCounsilliMonthlyReport(counsilliId, month) {
  const res = await api.get(`/counsellor/counsilli/${counsilliId}/sadhana/${month}`);
  return res.data;
}
  