import LoginView from "@/features/common/views/LoginView.vue";
import ForgotPasswordView from "@/features/common/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/features/common/views/ResetPasswordView.vue";

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
    },{
        path: '/password/reset',
        name:'ResetPasswordView',
        component: ResetPasswordView
    }
];
