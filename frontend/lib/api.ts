// filepath: frontend/lib/api.ts
import axios from 'axios';

// Helper to get the correct Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
// TEMP: reveal the runtime API base (remove after debugging)
if (typeof window !== 'undefined') {
  console.log('API_BASE at runtime ->', API_BASE);
}
export const api = axios.create({
  baseURL: API_BASE,
});

// Helper wrapper to handle errors gracefully
const fetcher = async (url: string) => {
  try {
    const { data } = await api.get(url);
    return data;
  } catch (error: any) {
    // Log full error object so you can inspect network/axios problems
    console.error(`Error fetching ${url}:`, error);
    // Re-throw so caller can show an error, or return null to indicate failure
    throw error;
  }
};

export const getMatches = () => fetcher('/api/matches');
export const getMatchById = (id: string) => fetcher(`/api/matches/${id}`);
export const getNews = () => fetcher('/api/news');
export const getSeries = () => fetcher('/api/series');
export const getRankings = () => fetcher('/api/rankings');
export const searchMatches = (query: string) => fetcher(`/api/search?q=${encodeURIComponent(query)}`);

// Admin Functions (POST requests)
export const updateScore = async (payload: any) => (await api.post('/api/admin/score', payload)).data;
export const updateToss = async (payload: any) => (await api.post('/api/admin/toss', payload)).data;
export const changeInnings = async (payload: any) => (await api.post('/api/admin/change-innings', payload)).data;
export const createMatch = async (payload: any) => (await api.post('/api/admin/create-match', payload)).data;
export const updateRankings = async (category: string, players: any[]) => (await api.post('/api/admin/rankings', { category, players })).data;