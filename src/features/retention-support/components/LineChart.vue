<template>
  <div class="chart-box">
    <div class="chart-header">
      <h3 class="chart-title"><i class="fas fa-chart-bar icon-blue" /> 부서별 근속 지수</h3>
    </div>
    <div class="chart-content">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  labels: Array,     // 부서명 리스트
  datasets: Array,   // [{ label, data, color, type }]
});

const canvasRef = ref(null);
let chartInstance = null;

function renderChart() {
  const ctx = canvasRef.value.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: props.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        type: ds.type || 'bar',
        backgroundColor: ds.color,
        borderColor: ds.color,
        borderWidth: ds.type === 'line' ? 2 : 0,
        tension: 0,
        yAxisID: ds.yAxisID || 'y',
      })),
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: false,
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
    },
  });
}

onMounted(renderChart);
onBeforeUnmount(() => chartInstance?.destroy());
watch(() => props.datasets, renderChart, { deep: true });
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
.chart-content canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
