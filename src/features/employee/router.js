export const employeeRoutes = [
    {
        path: "/employees",
        children: [
            {
                path: '',
                name: 'EmployeeListView',
                component: () => import('@/features/employee/views/EmployeeListView.vue')
            },
            {
                path: 'csv',
                name: 'CSVUploadView',
                component: () => import('@/features/employee/views/CSVUploadView.vue')
            },
            {
                path: ':empId',
                name: 'AdminEmployeeProfileView',
                component: () => import('@/features/employee/views/AdminEmployeeProfileView.vue')
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
    },
    {
        path: "/appoints",
        children: [
            {
                path: '',
                name: 'AppointListView',
                component: () => import('@/features/employee/views/AppointListView.vue')
            }
        ],
    }
];
