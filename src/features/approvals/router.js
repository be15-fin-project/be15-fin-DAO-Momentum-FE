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
        component: () => import('@/features/approvals/views/ApproveDetailActionView.vue')
    },
    {
        path: '/approval/write',
        name: 'ApprovalWrite',
        component: () => import('@/features/approvals/views/ApproveEditCreateView.vue')
    },
    {
        path: '/approval/edit/:documentId',
        name: 'ApprovalEdit',
        component: () => import('@/features/approvals/views/ApproveEditCreateView.vue')
    }

];
