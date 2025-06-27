import axios from "axios";

const api = axios.create({
    baseURL: window.env?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    headers : { 'Content-Type' : 'application/json' },
    // HttpOnly Cookie 사용하실 경우
    withCredentials : true
})


export default api;