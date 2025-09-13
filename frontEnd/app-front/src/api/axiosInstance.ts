import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
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
