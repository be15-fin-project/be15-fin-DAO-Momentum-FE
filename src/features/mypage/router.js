export const myPageRoutes = [
    {
        path: "/mypage",
        children: [
            {
                path: 'profile',
                name: 'EmployeeProfileView',
                component: () => import('@/features/mypage/views/EmployeeProfileView.vue')
            }
        ]
    }
];
