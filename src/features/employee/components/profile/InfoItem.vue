<template>
  <div class="info-item">
    <div class="info-item-content">
      <i :class="icon"></i>
      <div>
        <p class="info-item-label">{{ label }}</p>
        <p class="info-item-value">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: String,
  label: String,
  value: String
});
</script>

<style scoped>
.info-item {
  background: white;
  border: 2px solid #f3f4f6;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-item:hover {
  border-color: #e5e7eb;
  transform: translateX(5px);
}

.info-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item i {
  color: var(--blue-400);
  opacity: 0.8;
}

.info-item-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.info-item-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

</style>