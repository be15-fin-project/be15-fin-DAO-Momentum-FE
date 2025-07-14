<template>
  <div class="card notice-card">
    <div class="notice-header">
      <span class="material-icons">campaign</span>
      공지사항
    </div>
    <div class="notice-list">
      <div
          v-for="(notice, idx) in notices"
          :key="idx"
          class="notice-item"
          @click="goToDetail(notice.id)"
      >
        <strong>{{ notice.title }}</strong>
        <div class="notice-meta">{{ notice.meta }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  notices: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const goToDetail = (id) => {
  if (id) router.push(`/announcement/${id}`)
}
</script>

<style scoped>
.notice-card {
  padding: 20px;
  border: 1px solid var(--gray-100);
  border-radius: var(--card-radius);
  background-color: #ffffff;
}

.notice-header {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--blue-500);
  padding-bottom: 10px;
  margin-bottom: 14px;
  gap: 6px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  cursor: pointer;
  padding: 6px 4px;
  transition: background 0.2s;
  border-radius: 6px;
}

.notice-item:hover {
  background-color: var(--gray-50);
}

.notice-item strong {
  font-size: 14.5px;
  color: var(--main-color);
  display: block;
  line-height: 1.3;
}

.notice-meta {
  font-size: 12px;
  color: var(--gray-400);
  margin-top: 2px;
}
</style>
