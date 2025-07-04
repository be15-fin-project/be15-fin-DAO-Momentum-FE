<template>
  <div class="chart-box full">
    <h3 class="chart-title"><i class="fas fa-bar-chart icon-blue" /> 부서별 안정성 분포</h3>
    <div class="chart-content">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: Array,
});

const canvasRef = ref(null);
let chartInstance = null;

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderChart() {
  if (!props.data || !canvasRef.value) return;

  const colors = [
    getCssVar('--blue-100'),
    getCssVar('--blue-200'),
    getCssVar('--blue-400'),
    getCssVar('--blue-500'),
    getCssVar('--main-color'),
  ];

  const labels = props.data.map(d => d.deptName);

  const datasets = [20, 40, 60, 80, 100].map((level, idx) => ({
    label: `${level}%`,
    data: props.data.map(d => d[`progress${level}`] ?? 0),
    backgroundColor: colors[idx],
    stack: 'stability',
  }));

  if (chartInstance) chartInstance.destroy();
  const ctx = canvasRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

onMounted(renderChart);
onBeforeUnmount(() => chartInstance?.destroy());
watch(() => props.data, renderChart);
</script>

<style scoped>
.chart-box {
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
  position: relative;
}
.chart-content canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
