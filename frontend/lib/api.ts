// frontend/lib/api.ts
import axios, { AxiosError } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// DEBUG: reveal runtime base URL (remove later)
if (typeof window !== 'undefined') {
  console.log('API_BASE at runtime ->', API_BASE);
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  // withCredentials: true, // enable if your backend uses cookies/sessions
});

type APIResponse<T = any> = T;

/** Extract a safe error message from unknown. Uses Axios error shape when available. */
const safeErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    // AxiosError may contain response data with a message
    const axiosErr = err as AxiosError & { response?: any };
    return axiosErr.response?.data?.message ?? axiosErr.message ?? 'Request failed (AxiosError)';
  }
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

// Generic fetcher that returns the response payload (or throws)
const fetcher = async <T = any>(url: string): Promise<APIResponse<T>> => {
  try {
    const res = await api.get<APIResponse<T>>(url);
    return res.data;
  } catch (err: unknown) {
    const msg = safeErrorMessage(err);
    console.error(`Error fetching ${url}:`, msg, err);
    throw new Error(msg);
  }
};

export const getMatches = () => fetcher<any[]>('/api/matches');

export const getMatchById = (id: string) => {
  if (!id) return Promise.reject(new Error('getMatchById requires a non-empty id'));
  return fetcher<any>(`/api/matches/${encodeURIComponent(id)}`);
};

export const getNews = () => fetcher<any[]>('/api/news');
export const getSeries = () => fetcher<any[]>('/api/series');
export const getRankings = () => fetcher<any>('/api/rankings');
export const searchMatches = (query: string) => fetcher<any>(`/api/search?q=${encodeURIComponent(query)}`);

const post = async <T = any, R = any>(url: string, payload?: T): Promise<R> => {
  try {
    const res = await api.post<R>(url, payload);
    return res.data;
  } catch (err: unknown) {
    const msg = safeErrorMessage(err);
    console.error(`POST ${url} failed:`, msg, err);
    throw new Error(msg);
  }
};

export const updateScore = (payload: any) => post('/api/admin/score', payload);
export const updateToss = (payload: any) => post('/api/admin/toss', payload);
export const changeInnings = (payload: any) => post('/api/admin/change-innings', payload);
export const createMatch = (payload: any) => post('/api/admin/create-match', payload);
export const updateRankings = (category: string, players: any[]) => post('/api/admin/rankings', { category, players });
