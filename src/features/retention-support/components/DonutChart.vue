<template>
  <div class="chart-box">
    <h3 class="chart-title"><i class="fas fa-pie-chart icon-blue" /> 근속 안정성 분포</h3>
    <div class="chart-content donut">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  labels: Array,
  data: Array,
  colors: Array,
});

const canvasRef = ref(null);
let chartInstance = null;

function renderChart() {
  const ctx = canvasRef.value.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.colors,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

onMounted(renderChart);
onBeforeUnmount(() => chartInstance?.destroy());
watch(() => [props.labels, props.data, props.colors], renderChart, { deep: true });
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
.chart-content.donut {
  margin: 0 auto;
  width: 50%;
  display: flex;
  justify-content: center;
}
.chart-content canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
