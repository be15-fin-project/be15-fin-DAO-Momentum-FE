export const announcementRoutes = [
    {
        path: '/announcement',
        name: 'AnnouncementList',
        component: () => import('@/features/announcement/views/AnnouncementListView.vue'),
        meta: { requiresAuth: true, title: '공지사항 목록' }
    },
    {
        path: '/announcement/:announcementId',
        name: 'AnnouncementDetail',
        component: () => import('@/features/announcement/views/AnnouncementDetailView.vue'),
        props: true,
        meta: { requiresAuth: true, title: '공지사항 상세' }
    },
    {
        path: '/announcement/create',
        name: 'AnnouncementCreate',
        component: () => import('@/features/announcement/views/AnnouncementCreateView.vue'),
        meta: { requiresAuth: true, title: '공지사항 작성' }
    },
    {
        path: '/announcement/edit/:announcementId',
        name: 'AnnouncementEdit',
        component: () => import('@/features/announcement/views/AnnouncementEditView.vue'),
        meta: { requiresAuth: true, title: '공지사항 수정' }
    }
];