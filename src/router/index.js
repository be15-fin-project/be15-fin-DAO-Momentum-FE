import { createRouter, createWebHistory } from 'vue-router'
import LayoutDefault from "@/components/layout/LayoutDefault.vue";
import {evalRoutes} from "@/features/performance/router.js"
import {retentionRoutes} from "@/features/retention-support/router.js"
import {commonRoutes} from "@/features/common/router.js";
import {approvalsRoutes} from "@/features/approvals/router.js";
import {worksRoutes} from "@/features/works/router.js";
import {employeeRoutes} from "@/features/employee/router.js";
import {useAuthStore} from "@/stores/auth.js";
import {companyRoutes} from "@/features/company/router.js";
import {myPageRoutes} from "@/features/mypage/router.js";
import {announcementRoutes} from "@/features/announcement/router.js";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        //나중에 다른 기능과 관련된 routes들을 추가하면 된다.
        {
            path: '/',
            component: LayoutDefault,
            children: [
                ...evalRoutes,
                ...worksRoutes,
                ...approvalsRoutes,
                ...companyRoutes,
                ...employeeRoutes,
                ...myPageRoutes,
                ...retentionRoutes,
                ...myPageRoutes,
                ...announcementRoutes
            ]
        },
        ...commonRoutes

    ]
})

//권한 없어도 되는 페이지들
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const publicPages = ['/login', '/forgot-password', '/password/reset','/password/init']

    const requiresAuth = !publicPages.includes(to.path)

    if (requiresAuth && !authStore.accessToken) {
        return next('/login')
    }

    next()
})

export default router

