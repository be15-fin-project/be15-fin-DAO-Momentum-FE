<template>
  <div class="chart-box">
    <h3 class="chart-title"><i class="fas fa-chart-pie icon-blue" /> 전체 안정성 비율</h3>
    <div class="chart-content donut">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  distribution: Object,
});

const canvasRef = ref(null);
let chartInstance = null;

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderChart() {
  if (!props.distribution || !canvasRef.value) return;

  const { progress20, progress40, progress60, progress80, progress100 } = props.distribution;
  const data = [progress20, progress40, progress60, progress80, progress100];

  const colors = [
    getCssVar('--blue-100'),
    getCssVar('--blue-200'),
    getCssVar('--blue-400'),
    getCssVar('--blue-500'),
    getCssVar('--main-color'),
  ];

  if (chartInstance) chartInstance.destroy();
  const ctx = canvasRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['20%', '40%', '60%', '80%', '100%'],
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
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
  flex-direction: column;
  gap: 30px;
  width: 540px;
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
  margin: 0 auto;
  padding: 0;
  display: flex;
  justify-content: center;
}
.chart-content canvas {
  width: auto !important;
  height: 100% !important;
}
</style>
