import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Donations ──────────────────────────────────────────────

// Get all donations (supports pagination, search, filters)
export const getDonations = (params) => API.get('/donations', { params });

// Get single donation by ID
export const getDonationById = (id) => API.get(`/donations/${id}`);

// Create a new donation
export const createDonation = (data) => API.post('/donations', data);

// Update a donation
export const updateDonation = (id, data) => API.put(`/donations/${id}`, data);

// Delete a donation
export const deleteDonation = (id) => API.delete(`/donations/${id}`);

// ── Dashboard ─────────────────────────────────────────────

// Get aggregated dashboard stats
export const getDashboardStats = () => API.get('/donations/dashboard');

export default API;
