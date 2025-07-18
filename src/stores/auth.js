import {computed, ref} from "vue";
import {defineStore} from "pinia";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const userRole = ref([]);
    const expirationTime = ref(null);
    const userId = ref(null);

    // 인증 되어 있는지 확인하는 getter 값
    const isAuthenticated = computed(() =>
        !!accessToken.value && Date.now() < (expirationTime.value || 0)
    )

    function setAuth(at) {
        accessToken.value = at;
        try {
            const payload = JSON.parse(atob(at.split('.')[1]));
            userRole.value = Array.isArray(payload.role) ? payload.role : [payload.role];
            expirationTime.value = payload.exp * 1000;
            userId.value = parseInt(payload.sub);
        } catch (e) {
            accessToken.value = null;
            userRole.value = null;
            expirationTime.value = null;
            userId.value = null;
        }
    }

    function clearAuth() {
        accessToken.value = null;
        userRole.value = null;
        expirationTime.value = null;
    }

    function setResetToken(tokenFromUrl){
        accessToken.value = tokenFromUrl;
    }

    return {
        accessToken,
        userRole,
        expirationTime,
        isAuthenticated,
        userId,
        setAuth,
        clearAuth,
        setResetToken
    }

});