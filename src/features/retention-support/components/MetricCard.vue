<template>
  <div class="metric-card">
    <div class="metric-content">
      <div :class="['metric-icon', bgClass]">
        <i :class="icon"></i>
      </div>
      <div class="card-content">
        <p class="metric-label">{{ label }}</p>
        <p :class="['metric-value', colorClass]">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
  icon: String,
  bgClass: String,
  colorClass: String
});
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: 3rem 4rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}
.metric-content {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.metric-label {
  font-size: 23px;
  color: var(--font-sub);
  margin-bottom: 4px;
}
.metric-value {
  font-size: 38px;
  font-weight: bold;
  color: var(--label-color);
}
.metric-icon {
  padding: 12px;
  border-radius: var(--radius-full);
  font-size: 40px;
}
.bg-blue { background-color: #dbeafe; color: var(--blue-450); }
.bg-green { background-color: #d1fae5; color: var(--green-250); }
.bg-red { background-color: #fee2e2; color: var(--error-500); }
.blue { color: var(--blue-450); }
.green { color: var(--green-250); }
.red { color: var(--error-500); }
</style>
