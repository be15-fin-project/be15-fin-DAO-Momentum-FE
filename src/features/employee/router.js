export const employeeRoutes = [
    {
        path: "/employees",
        children: [
            {
                path: '',
                name: 'EmployeeListView',
                component: () => import('@/features/employee/views/EmployeeListView.vue')
            }
        ],
    }
];
