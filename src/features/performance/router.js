import KpiDashboardView from "@/features/performance/views/KpiDashboardView.vue";

export default [
    {
        path: '/kpi',
        meta: { requiresAuth: true },
        children: [
            { path: 'main', redirect: 'statics'},
            { path: 'statics', name: 'KpiDashboardView', component: KpiDashboardView },
        ]
    }
];
