export const retentionRoutes = [
    {
        path: 'retention',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'prospect-dash' },
            { path: 'prospect-dash', name: 'ProspectDashboardView', component: () => import('@/features/retention-support/views/ProspectDashboardView.vue') },
            { path: 'prospect-employees', name: 'ProspectEmployeeList', component: () => import('@/features/retention-support/views/ProspectEmployeeList.vue') },
        ]
    },
];
