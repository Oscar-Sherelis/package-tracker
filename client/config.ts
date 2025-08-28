// Type safe environment variable access
export const API_URL = (import.meta as unknown as { env: { VITE_API_URL: string } }).env.VITE_API_URL;