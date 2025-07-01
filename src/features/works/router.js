export const worksRoutes = [
    {
        path: "/works",
        children: [
            {
                path: '',
                name: 'WorkListView',
                component: () => import('@/features/works/views/WorkListView.vue')
            }
        ],
    }
];
