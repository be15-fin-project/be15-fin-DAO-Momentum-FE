export const approvalsRoutes = [
    {
        path: 'approvals',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/ApprovalList.vue')
    },
    {
        path: 'approvals/inbox',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/MyApprovalList.vue')
    },
];
