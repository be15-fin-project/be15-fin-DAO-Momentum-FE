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
    // {
    //     path: '/announcement/create',
    //     name: 'AnnouncementCreate',
    //     component: () => import('@/views/announcement/AnnouncementCreateView.vue'),
    //     meta: { requiresAuth: true, title: '공지사항 작성' }
    // }

];