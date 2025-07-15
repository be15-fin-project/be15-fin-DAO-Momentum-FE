// stores/chatbotStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatbotStore = defineStore('chatbot', () => {
    const messages = ref([]);
    const selectedType = ref(null);
    const lastClosedAt = ref(null);

    function markClosed() {
        lastClosedAt.value = Date.now();
    }

    function shouldRestore() {
        if (!lastClosedAt.value) return false;
        return Date.now() - lastClosedAt.value <= 5 * 60 * 1000; // 5분
    }

    function initSession() {
        messages.value = [];
        selectedType.value = null;
    }

    return {
        messages,
        selectedType,
        markClosed,
        shouldRestore,
        initSession
    };
});
