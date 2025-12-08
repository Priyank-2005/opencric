// frontend/lib/api.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// DEBUG: reveal runtime base URL (remove later)
if (typeof window !== 'undefined') {
  console.log('API_BASE at runtime ->', API_BASE);
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Do not swallow errors silently — let caller handle or inspect error
const fetcher = async (url: string) => {
  try {
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    // More informative logging for debugging deployments
    console.error(`Error fetching ${url}:`, error?.message ?? error, error);
    // rethrow so UI can show an error instead of silently returning []
    throw error;
  }
};

export const getMatches = () => fetcher('/api/matches');
export const getMatchById = (id: string) => fetcher(`/api/matches/${id}`);
export const getNews = () => fetcher('/api/news');
export const getSeries = () => fetcher('/api/series');
export const getRankings = () => fetcher('/api/rankings');
export const searchMatches = (query: string) => fetcher(`/api/search?q=${encodeURIComponent(query)}`);

export const updateScore = async (payload: any) => (await api.post('/api/admin/score', payload)).data;
export const updateToss = async (payload: any) => (await api.post('/api/admin/toss', payload)).data;
export const changeInnings = async (payload: any) => (await api.post('/api/admin/change-innings', payload)).data;
export const createMatch = async (payload: any) => (await api.post('/api/admin/create-match', payload)).data;
export const updateRankings = async (category: string, players: any[]) => (await api.post('/api/admin/rankings', { category, players })).data;
