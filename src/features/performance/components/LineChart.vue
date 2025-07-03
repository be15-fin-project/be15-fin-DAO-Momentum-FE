<template>
  <div class="chart-box">
    <div class="chart-header">
      <h3 class="chart-title"><i class="fas fa-chart-line icon-blue" /> 월별 KPI 추이</h3>
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
  labels: Array,     // ['1월', '2월', ..., '12월']
  datasets: Array,   // [{ label, data, color, fill, type, yAxisID }]
});

const canvasRef = ref(null);
let chartInstance = null;

function renderChart() {
  const ctx = canvasRef.value.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar', // 기본 타입은 bar (혼합형 가능)
    data: {
      labels: props.labels,
      datasets: props.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        type: ds.type || 'bar',
        backgroundColor: ds.type === 'line' ? 'transparent' : ds.color,
        borderColor: ds.color,
        borderWidth: ds.type === 'line' ? 2 : 0,
        tension: 0,
        fill: false,
        yAxisID: ds.yAxisID || 'y',
        order: ds.yAxisID === 'y2' ? 0 : 1
      })),
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
        },
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
            text: 'KPI 수',
          },
        },
        y2: {
          beginAtZero: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: '진척률 (%)',
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

<style>
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

.chart-content canvas {
  width: 100% !important;
  height: auto !important;
}
.year-selector select{
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 300;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-ss);
  background-color: var(--color-surface);
  color: var(--font-main);
  cursor: pointer;
}

</style>