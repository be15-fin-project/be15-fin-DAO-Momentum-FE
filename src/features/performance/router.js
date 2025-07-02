export default [
    {
        path: '/kpi',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'statics'},
            { path: 'statics', name: 'KpiDashboardView',
                component : () => import('@/features/performance/views/KpiDashboardView.vue')},
            { path: 'employee-kpis', name: 'KpiEmployeeListView',
                component : () => import('@/features/performance/views/KpiEmployeeListView.vue')},
            { path: 'employee-detail', name: 'KpiEmployeeDetailView',
                component : () => import('@/features/performance/views/KpiEmployeeDetailView.vue')},
            { path: 'kpi-list', name: 'MyKpiView',
                component : () => import('@/features/performance/views/MyKpiView.vue')},
            { path: 'requests', name: 'KpiRequestsView',
                component : () => import('@/features/performance/views/KpiRequestsView.vue')},
        ]
    },
    {
        path: '/eval',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'manage-peer'},
            { path: 'manage-peer', name: 'EvaluationPeerView',
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
    },
    {
        path: '/hr',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'hr-list'},
            { path: 'hr-list', name: 'EvaluationPeerView',
                component : () => import('@/features/performance/views/MyHrEvaluationView.vue')},
        ]
    }
];
