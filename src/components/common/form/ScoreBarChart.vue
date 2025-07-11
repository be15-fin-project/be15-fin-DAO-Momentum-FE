<template>
  <section class="score-chart-section">
    <div class="score-bar-list">
      <div
          v-for="(item, index) in scores"
          :key="item.propertyId || item.label"
          class="score-bar-item"
      >
        <div class="score-label">
          {{ item.label }}
        </div>

        <!-- editable 상태 -->
        <div v-if="editable" class="score-editable-row">
          <input
              type="range"
              v-model.number="scores[index].score"
              min="0"
              max="100"
              class="score-slider"
              :style="sliderStyle(scores[index].score)"
          />
          <input
              type="number"
              v-model.number="scores[index].score"
              min="0"
              max="100"
              class="score-input"
          />
        </div>

        <!-- readonly 상태 -->
        <div v-else class="score-bar-wrapper">
          <div class="score-bar">
            <div
                class="score-fill"
                :style="{ width: parseScore(item.score) + '%' }"
            ></div>
          </div>
          <span class="score-value-out">{{ item.score }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const scores = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const parseScore = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
};

const sliderStyle = (score) => {
  const percent = parseScore(score);
  return {
    backgroundImage: `linear-gradient(to right, #4f46e5 ${percent}%, var(--gray-200) ${percent}%)`,
  };
};
</script>

<style scoped>
.score-bar-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
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

.score-editable-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 슬라이더 커스텀 */
.score-slider {
  flex: 1;
  height: 10px;
  border-radius: var(--radius-xl);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}

/* WebKit */
.score-slider::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: var(--radius-xl);
  background: transparent;
}

.score-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 2px solid var(--purple-500);
  margin-top: -6px;
  cursor: pointer;
}

/* Firefox */
.score-slider::-moz-range-track {
  height: 8px;
  border-radius: var(--radius-xl);
  background: transparent;
}
.score-slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 2px solid var(--purple-500);
  cursor: pointer;
}

.score-input {
  width: 60px;
  padding: 4px 8px;
  font-size: 0.85rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-ss);
}

.score-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-bar {
  position: relative;
  height: 30px;
  width: 100%;
  background-color: var(--gray-100);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--icon-gradient, linear-gradient(to right, #4f46e5, #6366f1));
  border-radius: 8px 0 0 8px;
  transition: width 0.3s ease-in-out;
}

.score-value-out {
  min-width: 36px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
  text-align: right;
}
</style>
