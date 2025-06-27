import axios from "axios";

const api = axios.create({
    baseURL: window.env?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        ...(import.meta.env.VITE_API_TOKEN && {
            'Authorization': import.meta.env.VITE_API_TOKEN
        })
    },
    withCredentials: true
});


export default api;