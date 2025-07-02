import axios from "axios";
import api from "./axios.js"; // 리프레시 및 재시도는 이쪽으로
import { attachAuthInterceptor } from "./attachAuthInterceptor.js";

const notificationApi = axios.create({
    baseURL: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

attachAuthInterceptor(notificationApi, api); // retry 시엔 항상 원래 api 사용
export default notificationApi;