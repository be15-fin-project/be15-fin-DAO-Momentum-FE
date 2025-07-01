<script setup>
import '@/assets/css/color-style.css';
import '@/assets/css/index.css';

import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 로그인/로그아웃 시 토큰 감지하여 SSE 연결 및 연결 해제
watch(
    () => authStore.accessToken,
    (token) => {
      if (token) {
        notificationStore.connectSSE(token, authStore.userId)
      } else {
        notificationStore.disconnectSSE()
      }
    },
    { immediate: true }
)
</script>

<template>
  <RouterView/>
</template>

<style scoped>

</style>
