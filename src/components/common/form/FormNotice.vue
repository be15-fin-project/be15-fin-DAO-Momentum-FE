<template>
  <div class="notice-card" v-if="content">
    <i class="fas fa-info-circle icon" />
    <div class="text" v-html="content" />
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background-color: #fefce8; /* 부드러운 크림톤 */
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid #fef08a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  font-size: 0.95rem;
  color: #374151; /* 다크 그레이 */
}

.icon {
  font-size: 18px;
  color: #fbbf24; /* 밝은 주황 */
  margin-top: 2px;
  flex-shrink: 0;
}

.text {
  line-height: 1.8;
  font-weight: 500;
  white-space: pre-line; /* 줄바꿈 유지 */
}
</style>
