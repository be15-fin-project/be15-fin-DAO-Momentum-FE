export const myPageRoutes = [
    {
        path: "/mypage",
        children: [
            {
                path: 'dashboard',
                name: 'DashBoardView',
                component: () => import('@/features/mypage/views/DashBoardView.vue')
            }
        ]
    },
];
