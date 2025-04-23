import axios from "axios";
import { store } from "../store";

const API_BASE_URL = "http://localhost:8000/api/v1"; // Replace with your actual API URL

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken = state.auth.accessToken || localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.accessToken = `${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor (Handles Unauthorized Errors)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized! Logging out...");
            store.dispatch({ type: "auth/logout" });
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
