export const employeeRoutes = [
    {
        path: "/employees",
        children: [
            {
                path: '',
                name: 'EmployeeListView',
                component: () => import('@/features/employee/views/EmployeeListView.vue')
            }
        ]
    },
    {
        path: "/contracts",
        children: [
            {
                path: '',
                name: 'ContractListView',
                component: () => import('@/features/employee/views/ContractListView.vue')
            }
        ],
    }
];
