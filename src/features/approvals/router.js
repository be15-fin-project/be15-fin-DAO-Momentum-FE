export const approvalsRoutes = [
    {
        path: '/approvals',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/ApprovalList.vue')
    },
    {
        path: '/approval/inbox',
        name: 'MyApprovalsList',
        component: () => import('@/features/approvals/views/MyApprovalList.vue')
    },
    {
        path: '/approval/detail/:documentId',
        name: 'ApprovalDetail',
        component: () => import('@/features/approvals/views/ApprovalDetail.vue')
    }
];
