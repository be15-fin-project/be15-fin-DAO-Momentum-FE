<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getKpiStatistics, getKpiTimeseries, getKpiList } from '@/features/performance/api.js';
import Chatbot from '@/components/common/Chatbot.vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagenation from '@/components/common/Pagenation.vue';
import SideModal from '@/components/common/SideModal.vue';
import Chart from 'chart.js/auto';
import BaseTable from "@/components/common/BaseTable.vue";

const donutChartRef = ref(null);
const trendChartRef = ref(null);
const year = ref('2024');
const currentPage = ref(1);
const isOpen = ref(false);
const filterValues = ref({});
const kpiList = ref([]);
const tableData = ref([]);
let monthlyChart = null;

const filterOptions = [
  { key: 'deptId', label: '부서', icon: 'fa-building', type: 'select', options: ['전체', '개발팀', '디자인팀', '영업팀', '인사팀'] },
  { key: 'positionId', label: '직위', icon: 'fa-user-tie', type: 'select', options: ['전체', '사원', '대리', '과장', '차장', '부장'] },
  { key: 'empId', label: '사번', icon: 'fa-id-badge', type: 'input', placeholder: '사번 입력' },
  { key: 'date', label: '등록일', icon: 'fa-calendar-day', type: 'date-range' }
];

const formSections = [
  {
    title: 'KPI 정보',
    icon: 'fa-bullseye',
    layout: 'two-column',
    outerClass: 'kpi-detail-section',
    fields: [
      { label: '목표', value: '월간 리드 확보' },
      { label: '목표 수치', value: '100건' }
    ]
  },
  {
    title: '작성 정보',
    icon: 'fa-user-edit',
    layout: 'two-column',
    outerClass: 'kpi-detail-section',
    fields: [
      { label: '작성자', value: '김태훈' },
      { label: '작성일', value: '2024-06-10' }
    ]
  }
];

function handleSubmit() {
  alert('해당 KPI가 승인되었습니다');
}

function handleDownload() {
  alert('다운로드');
}

function openModalHandler() {
  isOpen.value = true;
}

function rejectHandler() {
  alert('반려 처리');
}


async function renderCharts() {
  const rootStyle = getComputedStyle(document.documentElement);
  const blue100 = rootStyle.getPropertyValue('--blue-100').trim();
  const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
  const mainColor = rootStyle.getPropertyValue('--main-color').trim();

  const stats = await getKpiStatistics({ year: year.value });

  new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['진행중', '완료'],
      datasets: [{
        data: [
          stats.totalKpiCount - stats.completedKpiCount,
          stats.completedKpiCount
        ],
        backgroundColor: [blue100, mainColor],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 20 } }
      }
    }
  });

  renderMonthlyTrendChart();
}

async function renderMonthlyTrendChart() {
  const data = await getKpiTimeseries({ year: year.value });
  const monthlyStats = data.monthlyStats;

  const rootStyle = getComputedStyle(document.documentElement);
  const blue200 = rootStyle.getPropertyValue('--blue-200').trim();
  const blue100 = rootStyle.getPropertyValue('--blue-100').trim();
  const rgba = 'rgba(147,197,253,0.2)';

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(trendChartRef.value, {
    type: 'line',
    data: {
      labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
      datasets: [{
        label: `${data.year}년 KPI 추이`,
        data: monthlyStats.map(item => item.averageProgress),
        borderColor: blue200,
        backgroundColor: rgba,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: blue100,
        pointBorderWidth: 1,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' }
      },
      scales: {
        y: { min: 0, max: 100, grid: { color: '#f3f4f6' } },
        x: { grid: { color: '#f3f4f6' } }
      }
    }
  });
}

async function handleSearch(values) {
  const params = {
    ...values,
    page: currentPage.value,
    size: 10
  };

  const response = await getKpiList(params);
  tableData.value = response.content;
}

watch(currentPage, () => {
  handleSearch(filterValues.value);
});

onMounted(() => {
  renderCharts();
  handleSearch({});
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

let chartInstance = null;
function handleResize() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

const tableColumns = [
  { key: 'kpiId', label: '#' },
  { key: 'employeeName', label: '작성자' },
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' }
];
</script>


<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: 'KPI 대시보드', href: '#', active: true }]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <section class="chart-row">
      <div class="chart-box">
        <h3 class="chart-title"><i class="fas fa-pie-chart icon-blue" /> 월별 KPI 현황</h3>
        <div class="chart-content donut">
          <canvas ref="donutChartRef"></canvas>
        </div>
      </div>

      <div class="chart-box">
        <div class="chart-header">
          <h3 class="chart-title"><i class="fas fa-chart-line icon-blue" /> 월별 KPI 추이</h3>
          <div class="year-selector">
            <select v-model="year" @change="renderMonthlyTrendChart">
              <option value="2024">2024년</option>
              <option value="2023">2023년</option>
            </select>
          </div>
        </div>
        <div class="chart-content">
          <canvas ref="trendChartRef"></canvas>
        </div>
      </div>
    </section>

    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />
    <base-table
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="openModalHandler"
    />
    <Pagenation :pages="[1,2,3,4]" v-model="currentPage" />

    <SideModal
        :visible="isOpen"
        title="KPI 상세 정보"
        icon="fa-chart-line"
        :sections="formSections"
        :showCancel="true"
        :cancelText="'닫기'"
        :showSubmit="true"
        :submitText="'승인'"
        @close="isOpen = false"
        @submit="handleSubmit"
    />
  </main>

  <Chatbot />
</template>

<style scoped>
.chart-row {
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.chart-box {
  background: var(--basic);
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
.chart-content.donut {
  margin: 0 auto;
  padding: 0;
  width: 55%;
  display: flex;
  justify-content: center;
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
  background-color: var(--basic);
  color: var(--font-main);
  cursor: pointer;
}

</style>
