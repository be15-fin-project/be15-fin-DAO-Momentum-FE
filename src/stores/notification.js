import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import {useToast} from "vue-toastification";
import notificationApi from "@/api/notificationApi.js";

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([])
    const unreadCount = computed(() => notifications.value.filter(n => n.isRead === 'N').length)
    const readCount = computed(() => notifications.value.filter(n => n.isRead === 'Y').length)
    const totalCount = computed(() => notifications.value.length)

    const toast = useToast()
    let eventSource = null

    function addNotification(notification) {
        notifications.value.unshift(notification)

        toast.info(notification.content, {
            timeout: 5000,
            onClick: async () => {
                if (notification.isRead === 'N') {
                    notification.isRead = 'Y'
                    await markAsRead(notification.id)
                }
                if (notification.url) {
                    router.push(notification.url)
                }
            }
        })
    }

    async function fetchNotifications() {
        try {
            const { data } = await notificationApi.get(`/api/notifications`)
            notifications.value = data
        } catch (err) {
            toast.error('알림 목록을 가져오는 데 실패했습니다.')
        }
    }

    async function markAsRead(id) {
        try {
            await notificationApi.patch(`/api/notifications/${id}/read`)

            const target = notifications.value.find(n => n.notificationId === id)
            if (target) target.isRead = 'Y'
        } catch (err) {
            toast.error('알림 읽음 처리에 실패했습니다.')
        }
    }

    function markAllRead() {
        notifications.value.forEach(n => (n.isRead = 'Y'))
        markAllAsRead()
    }

    async function markAllAsRead() {
        try {
            await notificationApi.patch(`/api/notifications/read/all`)
        } catch (err) {
            toast.error('모든 알림 읽음 처리에 실패했습니다.')
        }
    }

    function connectSSE(token, userId) {
        if (!token || eventSource) return
        const baseUrl = import.meta.env.VITE_NOTIFICATION_API_BASE_URL
        const url = `${baseUrl}/sse/subscribe/${userId}`

        eventSource = new EventSourcePolyfill(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            heartbeatTimeout: 60000,
        })

        eventSource.onopen = () => {
            fetchNotifications()
        }

        eventSource.addEventListener('notification', async (event) => {
            const notification = JSON.parse(event.data)
            addNotification(notification)
            await fetchNotifications()
        })

        eventSource.onerror = (err) => {
            toast.error('알림 서버와 연결이 끊어졌습니다. 재연결을 시도합니다.')
            disconnectSSE()

            // 재연결 시도
            setTimeout(() => {
                connectSSE(token, userId)
            }, 5000)
        }
    }


    function disconnectSSE() {
        if (eventSource) {
            eventSource.close()
            eventSource = null
        }
    }

    return {
        notifications,
        unreadCount,
        readCount,
        totalCount,
        addNotification,
        fetchNotifications,
        markAllRead,
        connectSSE,
        disconnectSSE,
        markAsRead
    }
})
