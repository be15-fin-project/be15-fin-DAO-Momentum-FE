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
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  LineWithErrorBarsController,
  PointWithErrorBar,
} from 'chartjs-chart-error-bars';

// Chart.js + error bar 플러그인 등록
Chart.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineWithErrorBarsController,
    PointWithErrorBar
);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const canvasRef = ref(null);
let chartInstance = null;

// CSS 변수 가져오기
function getCssVar(name) {
  return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
}

// 차트 렌더링 함수
function renderChart() {
  if (!canvasRef.value) return;

  const fullMonths = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
  const monthDataMap = new Map(props.data.map((item) => [item.month, item]));

  const averageScores = [];
  const errorBarData = [];

  for (let i = 1; i <= 12; i++) {
    const item = monthDataMap.get(i);

    if (
        item &&
        Number.isFinite(item.averageScore) &&
        Number.isFinite(item.stdDeviation)
    ) {
      averageScores.push(item.averageScore);
      errorBarData.push({
        y: item.averageScore,
        yMin: item.averageScore - item.stdDeviation,
        yMax: item.averageScore + item.stdDeviation,
      });
    } else {
      averageScores.push(null);
      errorBarData.push({
        y: null,
        yMin: null,
        yMax: null,
      });
    }
  }

  const mainColor = getCssVar('--main-color') || '#4e79a7';
  const errorBarColor = '#888';

  if (chartInstance) chartInstance.destroy();

  const ctx = canvasRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fullMonths,
      datasets: [
        {
          type: 'line',
          label: '평균 근속 지수',
          data: averageScores,
          borderColor: mainColor,
          backgroundColor: mainColor,
          tension: 0.3,
          fill: false,
          pointRadius: 3,
          yAxisID: 'y',
        },
        {
          type: 'lineWithErrorBars',
          label: '표준편차',
          data: errorBarData,
          borderColor: errorBarColor,
          errorBarColor: errorBarColor,
          errorBarWhiskerColor: errorBarColor,
          errorBarLineWidth: 1.5,
          errorBarWhiskerLineWidth: 1.5,
          pointRadius: 0,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: '월' },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: '근속 지수' },
        },
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) =>
                ctx.raw != null
                    ? `${ctx.dataset.label}: ${ctx.formattedValue}`
                    : null,
          },
        },
      },
    },
  });
}

// 생명주기 + watch
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
