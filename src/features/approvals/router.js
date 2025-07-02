export const approvalsRoutes = [
    {
        path: 'approval/list',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/ApprovalList.vue')
    },
    {
        path: 'approval/inbox',
        name: 'ApprovalsList',
        component: () => import('@/features/approvals/views/MyApprovalList.vue')
    },
];
