export const approvalsRoutes = [
    {
        path: 'approvals',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/ApprovalList.vue')
    },
];
