// filepath: frontend/lib/api.ts
import axios from 'axios';

// Helper to get the correct Base URL
const getBaseUrl = () => {
  // If we are in the browser (client-side)
  if (typeof window !== 'undefined') {
    return 'http://localhost:4000'; 
  }
  // If we are on the server (server-side rendering inside Docker)
  // We use the internal container name 'backend'
  return 'http://backend:4000';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
});

// Helper wrapper to handle errors gracefully
const fetcher = async (url: string) => {
  try {
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return []; // Return empty array/object to prevent page crash
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