// axios 공통 로직(request, response) 분리
import { useAuthStore } from "@/stores/auth.js";
import { refreshUserToken } from "@/features/common/api.js";

/**
 * @param {AxiosInstance} targetInstance - 인터셉터를 붙일 axios 인스턴스 (api 또는 notificationApi)
 * @param {AxiosInstance} baseApiForRetry - 원래 백엔드 서버용 api 인스턴스 (refresh 요청 및 retry용)
 */
export function attachAuthInterceptor(targetInstance, baseApiForRetry) {
    targetInstance.interceptors.request.use(config => {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
        return config;
    });

    targetInstance.interceptors.response.use(
        res => res,
        async err => {
            const authStore = useAuthStore();
            const { config, response } = err;

            if (config.url.includes('/employees/refresh')) {
                await authStore.clearAuth();
                return Promise.reject(err);
            }

            if (response?.status === 401) {
                if (config._retry) {
                    await authStore.clearAuth();
                    return Promise.reject(err);
                }
                config._retry = true;

                try {
                    const refreshRes = await refreshUserToken();
                    const newToken = refreshRes.data.data.accessToken;
                    authStore.setAuth(newToken);

                    config.headers.Authorization = `Bearer ${newToken}`;
                    // retry는 원래 백엔드 서버에 요청
                    return baseApiForRetry(config);
                } catch (refreshErr) {
                    await authStore.clearAuth();
                    return Promise.reject(refreshErr);
                }
            }

            return Promise.reject(err);
        }
    );
}