const API_BASE = "http://localhost:3000/api";

export async function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  });
}
