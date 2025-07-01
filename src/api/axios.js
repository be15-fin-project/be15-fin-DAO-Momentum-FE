import axios from "axios";
import { attachAuthInterceptor } from "./attachAuthInterceptor.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

attachAuthInterceptor(api, api); // self-referential
export default api;