import { createRouter, createWebHistory } from 'vue-router'
import LayoutDefault from "@/components/layout/LayoutDefault.vue";
import evalRoutes from "@/features/performance/router.js"
import {commonRoutes} from "@/features/common/router.js";
import {worksRoutes} from "@/features/works/router.js";

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
            ]
        },
        ...commonRoutes

    ]
})

export default router

