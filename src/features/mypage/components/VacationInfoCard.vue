<template>
  <div class="card leave-info">
    <div class="side-section-title">
      <span class="material-icons" style="color:var(--warning);">beach_access</span>
      잔여 연차
    </div>
    <p><strong>남은 일수:</strong>
      <span class="remaining-days">{{ remainingDays }}일</span>
    </p>

    <div class="leave-subtitle">이번달 연차/외근 일정</div>
    <ul class="leave-list">
      <li v-for="(item, idx) in vacations" :key="idx">
        {{ item.date }} - <span :style="item.colorStyle">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  remainingDays: Number,
  vacations: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.leave-info p {
  margin: 0 0 7px 0;
  font-size: 14.4px;
  color: var(--font-main);
}

.leave-info strong {
  color: var(--blue-400);
  font-weight: 600;
}

.remaining-days {
  color: var(--warning);
  font-weight: 600;
}

.leave-subtitle {
  font-size: 13.3px;
  margin-top: 12px;
  color: var(--blue-400);
  font-weight: 600;
}

.leave-list {
  padding-left: 18px;
  font-size: 13.8px;
  color: var(--font-sub);
  margin: 10px 0 0 0;
}

.leave-list li {
  margin-bottom: 2px;
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
