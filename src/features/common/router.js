import LoginView from "@/features/common/views/LoginView.vue";
import ForgotPasswordView from "@/features/common/views/ForgotPasswordView.vue";

export const commonRoutes = [
    {
        path: '/login',
        name: 'LoginView',
        component: LoginView
    },
    {
        path: '/forgot-password',
        name: 'ForgotPasswordView',
        component: ForgotPasswordView
    }
];
