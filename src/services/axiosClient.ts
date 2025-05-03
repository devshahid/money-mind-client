import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; // Replace with your actual API URL

// const API_BASE_URL = "https://tl72h2gk-8000.inc1.devtunnels.ms/api/v1";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) config.headers.accessToken = `${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

// Response Interceptor (Handles Unauthorized Errors)
axiosClient.interceptors.response.use(
    (response) => response,
    (error: import("axios").AxiosError) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized! Logging out...");
            localStorage.removeItem("accessToken");
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
