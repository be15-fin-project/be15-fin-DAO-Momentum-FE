<template>
  <div class="chart-box">
    <h3 class="chart-title"><i class="fas fa-chart-pie icon-blue" /> 전체 근속 전망 분포</h3>
    <div class="chart-content donut">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
      distribution: {
        type: Object,
        default: () => ({
          stableCount: 0,
          warningCount: 0,
          unstableCount: 0,
          totalCount: 0
        })
      }
    });

const canvasRef = ref(null);
let chartInstance = null;

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderChart() {
  if (!props.distribution || !canvasRef.value) return;

  // 1. StabilityType 매핑
  const labelMap = {
    goodCount: '양호',
    normalCount: '보통',
    warningCount: '주의',
    severeCount: '심각'
  };

  const colorMap = {
    '양호': getCssVar('--blue-200'),
    '보통': getCssVar('--blue-300'),
    '주의': getCssVar('--blue-400'),
    '심각': getCssVar('--blue-500'),
  };

  const orderedKeys = ['goodCount', 'normalCount', 'warningCount', 'severeCount'];

  const entries = orderedKeys.map(key => ({
    label: labelMap[key],
    value: props.distribution[key] ?? 0,
    color: colorMap[labelMap[key]]
  }));

  const data = entries.map(e => e.value);
  const labels = entries.map(e => e.label);
  const colors = entries.map(e => e.color);

  if (chartInstance) chartInstance.destroy();

  const ctx = canvasRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });
}


onMounted(renderChart);
onBeforeUnmount(() => chartInstance?.destroy());
watch(() => props.distribution, renderChart);
</script>

<style scoped>
.chart-box {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 30px;
  background: var(--color-surface);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--chart-shadow);
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  --font-color: var(--color-text-main);
}
.chart-box i.fas {
  color: var(--blue-500);
}

.chart-content {
  margin: auto auto;
  padding: 0;
  display: flex;
  justify-content: center;
  height: auto;
}
.chart-content canvas {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: auto;
}
</style>
