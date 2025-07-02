<template>
  <section class="score-chart-section">
    <h4 class="chart-title">항목별 점수 시각화</h4>
    <div class="score-bar-list">
      <div
          v-for="item in scores"
          :key="item.label"
          class="score-bar-item"
      >
        <div class="score-label">{{ item.label }}</div>
        <div class="score-bar">
          <div
              class="score-fill"
              :style="{ width: item.score + '%' }"
          ></div>
          <span class="score-value">{{ item.score }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  scores: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<style scoped>
.score-chart-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(--gray-200);
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--font-main);
  margin-bottom: 16px;
}

.score-bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-bar-item {
  display: flex;
  flex-direction: column;
}

.score-label {
  font-size: 0.95rem;
  margin-bottom: 4px;
  color: var(--font-sub);
}

.score-bar {
  position: relative;
  height: 20px;
  background-color: var(--gray-100);
  border-radius: 8px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--icon-gradient);
  border-radius: 8px 0 0 8px;
  transition: width 0.3s ease-in-out;
}

.score-value {
  position: absolute;
  right: 10px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}
</style>
