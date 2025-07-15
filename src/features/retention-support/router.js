export const retentionRoutes = [
    {
        path: 'retention',
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: 'prospect-dash' },
            { path: 'prospect-dash', name: 'ProspectDashboardView', component: () => import('@/features/retention-support/views/ProspectDashboardView.vue') },
            { path: 'prospect-employees', name: 'ProspectEmployeeList', component: () => import('@/features/retention-support/views/ProspectEmployeeListView.vue') },
            { path: 'prospect-rounds', name: 'RetentionRoundView', component: () => import('@/features/retention-support/views/RetentionRoundView.vue') },
            { path: 'my-contacts', name: 'MyRetentionContactView', component: () => import('@/features/retention-support/views/MyRetentionContactView.vue') },
            { path: 'contact-list', name: 'ContactRecordView', component: () => import('@/features/retention-support/views/ContactRecordView.vue') },
        ]
    },
];
