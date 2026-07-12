import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh_token = localStorage.getItem("refresh_token");
                if (!refresh_token) {
                    throw new Error("No refresh token");
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refresh_token,
                });

                localStorage.setItem("access_token", response.data.access);
                api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;