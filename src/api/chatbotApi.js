import axios from "axios";

const chatbotApi = axios.create({
    baseURL: import.meta.env.VITE_CHATBOT_API_BASE_URL,
});

export default chatbotApi;