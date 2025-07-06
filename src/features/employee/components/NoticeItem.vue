<template>
  <div :class="['notice-item', `notice-${color}`]">

    <i :class="['notice-icon', 'fas', icon]"></i>
    <div class="notice-text">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon:  { type: String, required: true },
  text:  { type: String, required: true },
  color: { type: String, default: 'green', validator: v => ['green','blue','slate'].includes(v) }
})
</script>

<style scoped>
.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-left-width: 4px;
  border-left-style: solid;
  border-radius: 0 6px 6px 0;
  margin-bottom: 8px;
}

.notice-icon {
  margin-right: 12px;
  margin-top: 2px;
  font-size: 1.25rem; /* 아이콘 크기 */
}

/* 공통 텍스트 스타일 */
.notice-text {
  font-weight: 500;
  color: #1f2937; /* gray-800 */
}

/* color variants */
.notice-green {
  background-color: #ecfdf5; /* green-50 */
  border-color:     #4ade80; /* green-400 */
}
.notice-green .notice-icon {
  color: #22c55e; /* green-500 */
}

.notice-blue {
  background-color: #eff6ff; /* blue-50 */
  border-color:     #60a5fa; /* blue-400 */
}
.notice-blue .notice-icon {
  color: #3b82f6; /* blue-500 */
}

.notice-slate {
  background-color: #f1f5f9; /* slate-50 */
  border-color:     #94a3b8; /* slate-400 */
}
.notice-slate .notice-icon {
  color: #64748b; /* slate-500 */
}
</style>
