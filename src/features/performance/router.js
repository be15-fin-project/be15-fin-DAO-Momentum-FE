import KpiDashboardView from "@/features/performance/views/KpiDashboardView.vue";
import KpiEmployeeListView from "@/features/performance/views/KpiEmployeeListView.vue";
import KpiEmployeeDetailView from "@/features/performance/views/KpiEmployeeDetailView.vue";

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
            { path: 'employee-detail', name: 'KpiEmployeeDetailView',
                component : () => import('@/features/performance/views/KpiEmployeeDetailView.vue')},
            { path: 'list', name: 'MyKpiView',
                component : () => import('@/features/performance/views/MyKpiView.vue')},
            { path: 'requests', name: 'KpiRequestsView',
                component : () => import('@/features/performance/views/KpiRequestsView.vue')},
        ]
    }
];
