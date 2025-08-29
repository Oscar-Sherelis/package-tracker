import axios from "axios";
import { API_URL } from "../../config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth tokens here if needed
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("API Error Response:", error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error("API Network Error:", error.request);
    } else {
      // Something else happened
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
)

export default api;