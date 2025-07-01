<script setup>
defineProps({
  message: {
    type: String,
    default: '데이터가 없습니다.'
  }
})
</script>

<template>
  <div class="approval-container">
    <div class="empty-message">
      <i class="fas fa-folder-open icon" aria-hidden="true"></i>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.approval-container {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.empty-message {
  font-size: 1.2rem;
  color: #888;
  padding: 24px;
}

.icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}
</style>
