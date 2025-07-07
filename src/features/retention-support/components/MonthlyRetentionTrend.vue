<template>
  <div class="chart-box full">
    <h3 class="chart-title">
      <i class="fas fa-chart-line icon-blue" /> 근속 지수 월별 추이
    </h3>
    <div class="chart-content">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const canvasRef = ref(null);
let chartInstance = null;

// Function to get CSS variables (for consistent theming)
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Function to render the chart
function renderChart() {
  if (!props.data || !canvasRef.value) return;

  const labels = props.data.map(item => `${item.month}월`);
  const averageScores = props.data.map(item => item.averageScore);
  const stdDeviations = props.data.map(item => item.stdDeviation);

  const color = getCssVar('--main-color');
  const bgColor = getCssVar('--main-color-light') || '#cfe2ff';

  if (chartInstance) chartInstance.destroy();

  const ctx = canvasRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: '평균 근속 지수',
          data: averageScores,
          borderColor: color,
          backgroundColor: color,
          tension: 0.3,
          fill: false,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: '월별 표준편차',
          data: stdDeviations,
          backgroundColor: bgColor,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: '월',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '근속 지수',
          },
        },
      },
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

onMounted(renderChart);
onBeforeUnmount(() => chartInstance?.destroy());

// Watch for data changes to update the chart
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
