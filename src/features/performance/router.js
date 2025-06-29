import KpiDashboardView from "@/features/performance/views/KpiDashboardView.vue";
import KpiEmployeeListView from "@/features/performance/views/KpiEmployeeListView.vue";
import KpiEmployeeDetail from "@/features/performance/views/KpiEmployeeDetail.vue";

export default [
    {
        path: '/kpi',
        meta: { requiresAuth: true },
        children: [
            { path: 'main', redirect: 'statics'},
            { path: 'statics', name: 'KpiDashboardView',
                component : () => import('@/features/performance/views/KpiDashboardView.vue')},
            { path: 'employees', name: 'KpiEmployeeListView',
                component : () => import('@/features/performance/views/KpiEmployeeListView.vue')},
            { path: 'employee-detail', name: 'KpiEmployeeDetail',
                component : () => import('@/features/performance/views/KpiEmployeeDetail.vue')},
        ]
    }
];
