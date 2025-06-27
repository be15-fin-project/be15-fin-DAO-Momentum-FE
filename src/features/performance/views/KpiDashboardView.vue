<script setup>
import { ref, onMounted } from 'vue';
import Chatbot from '@/components/common/Chatbot.vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagenation from '@/components/common/Pagenation.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import Chart from 'chart.js/auto';
import BaseTable from "@/components/common/BaseTable.vue";

const donutChartRef = ref(null);
const trendChartRef = ref(null);
const year = ref('2024');
const currentPage = ref(1);
const isOpen = ref(false);
const filterValues = ref({});
const kpiList = ref([]);
let monthlyChart = null;

const filterOptions = [
  { key: 'dept', label: '부서', icon: 'fa-building', type: 'select', options: ['전체', '개발팀', '디자인팀', '영업팀', '인사팀'] },
  { key: 'position', label: '직위', icon: 'fa-user-tie', type: 'select', options: ['전체', '사원', '대리', '과장', '차장', '부장'] },
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



function handleSearch(values) {
  console.log('검색 요청:', values);
}

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

function renderCharts() {
  const rootStyle = getComputedStyle(document.documentElement);
  const blue100 = rootStyle.getPropertyValue('--blue-100').trim();
  const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
  const mainColor = rootStyle.getPropertyValue('--main-color').trim();

  new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['진행중', '완료', '마감'],
      datasets: [{
        data: [65.2, 22.5, 12.3],
        backgroundColor: [blue100, blue400, mainColor],
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

function renderMonthlyTrendChart() {
  const dataMap = {
    '2024': [75.2, 76.8, 78.1, 79.3, 78.5, 77.9, 78.8, 79.5, 80.1, 78.7, 79.2, 78.5],
    '2023': [72.1, 73.5, 74.8, 75.2, 76.1, 75.8, 76.4, 77.2, 76.9, 77.5, 76.8, 75.9]
  };
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
        label: `${year.value}년 KPI 추이`,
        data: dataMap[year.value],
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
      plugins: {
        legend: { display: true, position: 'top' }
      },
      scales: {
        y: { min: 60, max: 85, grid: { color: '#f3f4f6' } },
        x: { grid: { color: '#f3f4f6' } }
      }
    }
  });
}

const tableColumns = [
  { key: 'id', label: '#' },
  { key: 'writer', label: '작성자' },
  { key: 'goal', label: '목표' },
  { key: 'target', label: '목표 수치' },
  { key: 'progress', label: '진척도 (%)' },
  { key: 'status', label: '달성 여부' },
  { key: 'date', label: '작성일' },
  { key: 'action', label: '상세' }
];

const tableData = ref([
  {
    id: 1,
    writer: '김태훈',
    goal: '월간 리드 확보',
    target: 100,
    progress: 85,
    status: '달성',
    date: '2024-06-10'
  },
  {
    id: 2,
    writer: '이하나',
    goal: '디자인 QA 피드백 완료',
    target: 20,
    progress: 20,
    status: '달성',
    date: '2024-06-12'
  },
  {
    id: 3,
    writer: '박지민',
    goal: '영업 미팅 건수',
    target: 50,
    progress: 32,
    status: '미달성',
    date: '2024-06-05'
  }
]);


onMounted(() => {
  renderCharts();
});
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
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  padding: 0 25%;
}
</style>
