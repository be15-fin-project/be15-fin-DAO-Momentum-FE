import KpiDashboardView from "@/features/performance/views/KpiDashboardView.vue";
import KpiEmployeeListView from "@/features/performance/views/KpiEmployeeListView.vue";
import KpiEmployeeDetailView from "@/features/performance/views/KpiEmployeeDetailView.vue";

export default [
    {
        path: '/kpi',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'statics'},
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
    },
    {
        path: '/eval',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'manage'},
            { path: 'manage', name: 'EvaluationPeerView',
                component : () => import('@/features/performance/views/EvaluationPeerView.vue')},
            { path: 'manage-org', name: 'EvaluationOrgView',
                component : () => import('@/features/performance/views/EvaluationOrgView.vue')},
            { path: 'manage-self', name: 'EvaluationSelfView',
                component : () => import('@/features/performance/views/EvaluationSelfView.vue')},
            { path: 'round', name: 'EvaluationRoundView',
                component : () => import('@/features/performance/views/EvaluationRoundView.vue')},
            { path: 'submit', name: 'SubmitEvaluationTasks',
                component : () => import('@/features/performance/views/SubmitEvaluationTasks.vue')},

        ]
    }
];
