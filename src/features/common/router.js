import LoginView from "@/features/common/views/LoginView.vue";
import ForgotPasswordView from "@/features/common/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/features/common/views/ResetPasswordView.vue";
import InitialPasswordView from "@/features/common/views/InitialPasswordView.vue";
import IntroView from "@/features/common/views/IntroView.vue";
import NotAuthorized from "@/features/common/views/NotAuthorized.vue";

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
    },{
        path:'/password/init',
        name:'InitialPasswordView',
        component: InitialPasswordView
    },{
        path:'/intro',
        name:'IntroView',
        component: IntroView
    },{
        path:'/not-authorized',
        name:'NotAuthorized',
        component: NotAuthorized
    }
];
