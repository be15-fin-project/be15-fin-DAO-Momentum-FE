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
            console.error('[알림 조회 실패]', err)
        }
    }

    async function markAsRead(id) {
        try {
            await notificationApi.patch(`/api/notifications/${id}/read`)

            const target = notifications.value.find(n => n.notificationId === id)
            if (target) target.isRead = 'Y'
        } catch (err) {
            console.error(`[알림 ${id} 읽음 처리 실패]`, err)
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
            console.error('[모두 읽음 처리 실패]', err)
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
            console.log('[SSE] 연결 성공')
            fetchNotifications()
        }

        eventSource.addEventListener('notification', async (event) => {
            const notification = JSON.parse(event.data)
            addNotification(notification)
            await fetchNotifications()
        })

        eventSource.onerror = (err) => {
            console.error('[SSE] 오류 발생, 5초 후 재연결 시도:', err)
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
            console.log('[SSE] 연결 해제')
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
