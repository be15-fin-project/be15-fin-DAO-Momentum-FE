<template>
  <div class="card attendance-info">
    <div class="side-section-title">
      <span class="material-icons">schedule</span>출퇴근 정보
    </div>
    <p><strong>출근 시간:</strong> {{ startTime }}</p>
    <p>
      <strong>예상 퇴근 시간:</strong> {{ endTime }}
      <span v-if="note" class="highlight-note">({{ note }})</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  startTime: String,
  endTime: String,
  note: String
})
</script>

<style scoped>
.attendance-info p {
  margin: 0 0 7px 0;
  font-size: 14.4px;
  color: var(--font-main);
}

.attendance-info strong {
  color: var(--blue-400);
  font-weight: 600;
}

.highlight-note {
  color: var(--success);
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
