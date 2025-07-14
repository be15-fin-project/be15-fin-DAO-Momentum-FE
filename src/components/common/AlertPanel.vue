<template>
  <div class="alert-modal" v-show="visible">
    <div class="alert-header">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="header-title">알림</div>
        </div>
        <button @click="$emit('close')" style="background: none; border: none; font-size: 1.25rem; color: #6b7280; cursor: pointer;">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="tab-menu">
        <button :class="{ 'tab-active': selectedTab === 'new' }" @click="selectedTab = 'new'">
          읽지 않음 <span class="badge">{{ unreadCount }}</span>
        </button>
        <button :class="{ 'tab-active': selectedTab === 'read' }" @click="selectedTab = 'read'">
          읽음 <span class="badge">{{ readCount }}</span>
        </button>
        <button :class="{ 'tab-active': selectedTab === 'all' }" @click="selectedTab = 'all'">
          전체 <span class="badge">{{ totalCount }}</span>
        </button>
      </div>

    </div>

    <div class="alert-list scrollbar-hide">
      <div class="alert-section" v-for="(alert, idx) in alerts" :key="idx" @click="goTo(alert.url, alert.notificationId)">
        <div class="section-title">
          <div class="notification-dot" v-if="alert.isRead === 'N'"></div>
          <span>알림</span>
        </div>
        <div class="alert-item">
          <div class="alert-icon blue">
            <i class="fas fa-bell"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">
              <h4>{{ getTitle(alert.type) }}</h4>
              <span>{{ timeSince(alert.createdAt) }}</span>
            </div>
            <p>{{ alert.content }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="alert-footer">
      <button @click="markAllRead">모두 읽음 처리</button>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useNotificationStore} from "@/stores/notification.js";

defineProps({ visible: Boolean })
defineEmits(['close'])

const store = useNotificationStore()
const selectedTab = ref('new')
const unreadCount = computed(() => store.unreadCount)
const readCount = computed(() => store.readCount)
const totalCount = computed(() => store.totalCount)

// 현재 탭에 따라 필터링된 알림 리스트
const alerts = computed(() => {
  if (selectedTab.value === 'new') {
    return store.notifications.filter(n => n.isRead === 'N')
  }
  if (selectedTab.value === 'read') {
    return store.notifications.filter(n => n.isRead === 'Y')
  }
  return store.notifications
})

function markAllRead() {
  store.markAllRead()
}

function getTitle(type) {
  switch (type) {
    case 'APPROVAL_REQUEST':
      return '결재 요청';
    case 'APPROVAL_COMPLETED':
      return '결재 완료';
    case 'APPROVAL_REJECTED':
      return '결재 반려';
    case 'EVALUATION_START':
      return '평가 시작';
    case 'EVALUATION_END':
      return '평가 종료';
    default:
      return '알림';
  }
}

function timeSince(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const min = Math.floor(diff / 1000 / 60)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  return hour < 24 ? `${hour}시간 전` : new Date(dateStr).toLocaleDateString()
}

async function goTo(url, id) {
  try {
    await store.markAsRead(id)
  } catch (e) {
    console.error(`[알림 ${id} 읽음 처리 실패]`, e)
  } finally {
    if (url) window.location.href = url
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css');

.alert-modal {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 23rem;
  width: 25rem;
  height: 100%;
  background-color: #ffffff;
  z-index: 9999;
  box-shadow: -2px 0 10px rgba(0,0,0,0.05);
}
.alert-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 32px;
  height: 32px;
  background: var(--icon-gradient);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--font-main);
}
.tab-menu {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}
.tab-menu button {
  all: unset;
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab-active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}
.alert-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 4rem;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.alert-section {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.notification-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ef4444;
  border-radius: 9999px;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.alert-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #ffffff;
  transition: background-color 0.2s ease;
}
.alert-item:hover {
  background-color: #f9fafb;
}
.alert-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;
}
.alert-icon.blue { background-color: #dbeafe; color: #2563eb; }
.alert-icon.green { background-color: #d1fae5; color: #059669; }
.alert-icon.yellow { background-color: #fef9c3; color: #ca8a04; }
.alert-content {
  flex: 1;
}
.alert-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}
.alert-title h4 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}
.alert-title span {
  font-size: 0.75rem;
  color: #6b7280;
}
.alert-content p {
  font-size: 0.875rem;
  color: #4b5563;
}
.alert-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
.alert-footer {
  position: sticky;
  bottom: 0;
  background-color: #f3f4f6;
  padding: 0.5rem 1rem;
}
.alert-footer button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}
.alert-footer button:hover {
  background-color: #d1d5db;
}

.badge {
  display: inline-block;
  min-width: 1.5rem;
  padding: 2px 8px;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;           /* 파란 글자색 */
  background-color: #e0edff; /* 연한 파란 배경 */
  border-radius: 9999px;     /* pill 모양 */
  text-align: center;
  vertical-align: middle;
}
</style>