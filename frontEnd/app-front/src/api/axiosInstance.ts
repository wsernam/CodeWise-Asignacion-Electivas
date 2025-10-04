import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8001/api",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    // You can add authorization tokens or other headers here if needed JWT
    return config;
}, (error) => {
    return Promise.reject(error);
});


export default axiosInstance;
