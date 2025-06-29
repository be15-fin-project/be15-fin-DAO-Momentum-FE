import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import {createPinia} from "pinia";
import {useAuthStore} from "@/stores/auth.js";
import {refreshUserToken} from "@/features/common/api.js";

async function bootstrap() {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)

    const authStore = useAuthStore()

    let shouldRedirectToLogin = false

    try {
        const resp = await refreshUserToken()
        authStore.setAuth(resp.data.data.accessToken)
    } catch (e) {
        authStore.clearAuth()
        shouldRedirectToLogin = true
    }

    app.use(router)

    //마운트 후에 redirect
    app.mount('#app')

    if (shouldRedirectToLogin) {
        router.push('/login')
    }
}


bootstrap()

