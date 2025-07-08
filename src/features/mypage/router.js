export const myPageRoutes = [
    {
        path: "/mypage",
        children: [
            {
                path: 'dashboard',
                name: 'DashBoardView',
                component: () => import('@/features/mypage/views/DashBoardView.vue')
            },
            {
                path: 'profile',
                name: 'EmployeeProfileView',
                component: () => import('@/features/mypage/views/EmployeeProfileView.vue')
            },
            {
                path: 'contracts',
                name: 'MyContractsView',
                component: () => import('@/features/mypage/views/MyContractsView.vue')
            }
        ]
    },





];
