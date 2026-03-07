// In development, this is empty — Vite's proxy forwards /api to localhost:3001
// In production (Render), set VITE_API_BASE_URL to your backend service URL
// e.g. https://nineteen06-backend.onrender.com
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function apiUrl(path: string): string {
    return `${API_BASE}${path}`;
}
