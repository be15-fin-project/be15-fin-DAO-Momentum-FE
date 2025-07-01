import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import {createPinia} from "pinia";
import {useAuthStore} from "@/stores/auth.js";
import {refreshUserToken} from "@/features/common/api.js";
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

async function bootstrap() {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)

    const authStore = useAuthStore()


    try {
        const resp = await refreshUserToken()
        authStore.setAuth(resp.data.data.accessToken)
    } catch (e) {
        authStore.clearAuth()
    }

    app.use(router)
        .use(Toast, {
            position: 'top-right',
            timeout: 3000,
        })
    app.mount('#app')
}


bootstrap()

