<template>
  <div class="card">
    <div class="side-section-title">
      <span class="material-icons" style="color:var(--blue-400);">campaign</span>
      공지사항
    </div>
    <div class="notice-list">
      <div v-for="(notice, idx) in notices" :key="idx">
        <strong>{{ notice.title }}</strong><br />
        <small>{{ notice.meta }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  notices: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notice-list strong {
  color: var(--blue-400);
  font-size: 15px;
  font-weight: 600;
}

.notice-list small {
  color: var(--gray-400);
  font-size: 12.5px;
  font-weight: 500;
}

.side-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--blue-400);
  font-size: 1.06rem;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 0;
}
</style>
