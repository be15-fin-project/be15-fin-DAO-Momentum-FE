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
import {settingsRoutes} from "@/features/settings/router.js";
import {storeToRefs} from "pinia";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/mypage/dashboard'
        },
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
                ...announcementRoutes,
                ...settingsRoutes
            ]
        },
        ...commonRoutes

    ]
})

//권한별 처리
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const publicPages = ['/login', '/forgot-password', '/password/reset','/password/init', '/intro']

    const requiresAuth = !publicPages.includes(to.path)
    const {userRole} = storeToRefs(authStore)

    //권한 없을 때
    if (requiresAuth && !authStore.accessToken) {
        return next('/login')
    }
    
    //최고 관리자 권한
    if (to.matched.some(record => record.meta.requiresMaster)) {
        if (!userRole.value.includes('MASTER')) {
                return next('/not-authorized'); // 또는 '/' 등 허용된 페이지
        }
    }

    next()
})

export default router

