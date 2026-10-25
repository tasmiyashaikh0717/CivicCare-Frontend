import { requireSupabase } from "./supabase";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function getAccessToken() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again to continue.");
  return token;
}

export async function apiRequest(path, options = {}) {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let payload;
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) {
    if (response.status === 401) {
      await requireSupabase().auth.signOut();
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error(payload.message || `Request failed (${response.status}).`);
  }
  return payload;
}

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error("Backend health check failed.");
  return response.json();
}

export async function uploadComplaintImages(files) {
  if (!files?.length) return [];
  const body = new FormData();
  files.forEach((file) => body.append("images", file));
  const result = await apiRequest("/api/images", { method: "POST", body });
  return (result.data || []).map((image) => image.filename).filter(Boolean);
}

export async function sendComplaint(complaintData) {
  return apiRequest("/api/complaints", {
    method: "POST",
    body: JSON.stringify(complaintData),
  });
}

export async function getComplaints(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const result = await apiRequest(`/api/complaints${suffix}`);
  return result.data || [];
}

export async function getComplaintStats() {
  const result = await apiRequest("/api/complaints/stats");
  return result.data || {};
}

export async function updateComplaintStatus(id, status) {
  return apiRequest(`/api/complaints/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
