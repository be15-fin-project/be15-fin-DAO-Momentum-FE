<template>
  <div class="radar-chart-wrapper">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import { nextTick } from 'vue';

const props = defineProps({
  labels: Array,
  values: Array,
  editable: Boolean,
  readonly: Boolean,
});

const chartRef = ref();
let chartInstance = null;

function convertLevelsToScores(levels) {
  const levelMap = {
    '탁월': 95,
    '우수': 85,
    '양호': 70,
    '주의': 60,
    '위험': 50,
  };
  return levels.map(level => levelMap[level] ?? 0);
}


onMounted(async () => {
  await nextTick(); // DOM 반영 기다림
  requestAnimationFrame(() => {
    if (props.labels && props.values) {
      createChart(convertLevelsToScores(props.values));
    }
  });
});

watch(
    () => [...props.values], // shallow copy로 값 변화 감지
    (newVal, oldVal) => {
      if (!chartInstance || JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
      chartInstance.data.datasets[0].data = convertLevelsToScores(newVal);
      chartInstance.update();
    },
    { immediate: false }
);


function createChart(data) {
  chartInstance = new Chart(chartRef.value, {
    type: 'radar',
    data: {
      labels: props.labels,
      datasets: [{
        label: '평가 점수',
        data, // 변환된 숫자 점수
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

</script>

<style scoped>
.radar-chart-wrapper {
  width: 100%;
  height: 300px;
  position: relative;
  margin : 2rem 0;
}
</style>
