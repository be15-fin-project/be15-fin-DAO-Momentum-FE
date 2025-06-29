<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getKpiStatistics, getKpiTimeseries, getKpiList } from '@/features/performance/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import Chart from 'chart.js/auto';
import BaseTable from "@/components/common/BaseTable.vue";
import { getKpiDetail } from '@/features/performance/api.js';

// Refs
const donutChartRef = ref(null);
const trendChartRef = ref(null);
const currentPage = ref(1);
const isOpen = ref(false);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const selectedKpiId = ref(null); // 선택된 KPI ID
const formSections = ref([]); // 동적으로 변경될 모달 폼 내용


// Chart instance container
const chartRefs = {
  donut: null,
  monthly: null
};

// 필터 옵션
const filterOptions = [
  {
    key: 'deptId',
    label: '부서',
    icon: 'fa-building',
    type: 'select',
    options: ['전체', '인사팀', '재무팀', '프론트엔드팀', '백엔드팀', '데이터팀', '영업팀', '디지털마케팅팀']
  },
  {
    key: 'positionId',
    label: '직위',
    icon: 'fa-user-tie',
    type: 'select',
    options: ['전체', '대표이사', '이사', '부장', '과장', '대리', '사원']
  },
  {
    key: 'empNo',
    label: '사번',
    icon: 'fa-id-badge',
    type: 'input',
    placeholder: '사번 입력'
  },
  {
    key: 'date',
    label: '등록일',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
];

// ✨ 필터 파라미터 정규화
function normalizeFilterParams(values) {
  const normalized = JSON.parse(JSON.stringify(values));

  // 날짜 정규화
  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  // 직위 라벨 → ID 매핑
  const positionMap = {
    '전체': null,
    '대표이사': 1,
    '이사': 2,
    '부장': 3,
    '과장': 4,
    '대리': 5,
    '사원': 6
  };
  if (normalized.positionId) {
    normalized.positionId = positionMap[normalized.positionId] ?? null;
  }

  // 부서 라벨 → ID 매핑
  const deptMap = {
    '전체': null,
    '인사팀': 10,
    '재무팀': 11,
    '프론트엔드팀': 12,
    '백엔드팀': 13,
    '데이터팀': 14,
    '영업팀': 15,
    '디지털마케팅팀': 16
  };
  if (normalized.deptId) {
    normalized.deptId = deptMap[normalized.deptId] ?? null;
  }

  return normalized;
}


// 📊 KPI 통계 차트 렌더링
async function renderCharts() {
  try {
    const rootStyle = getComputedStyle(document.documentElement);
    const blue100 = rootStyle.getPropertyValue('--blue-100').trim();
    const mainColor = rootStyle.getPropertyValue('--main-color').trim();

    const ctx = donutChartRef.value?.getContext('2d');
    if (!ctx) return;

    if (chartRefs.donut) {
      chartRefs.donut.destroy();
      chartRefs.donut = null;
    }

    const stats = await getKpiStatistics(normalizeFilterParams(filterValues.value));
    chartRefs.donut = new Chart(ctx, {
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
          legend: { position: 'bottom' }
        }
      }
    });

    await renderMonthlyTrendChart();
  } catch (e) {
    console.warn('차트 렌더링 실패:', e);
  }
}


// 📈 KPI 월별 추이 차트
async function renderMonthlyTrendChart() {
  const ctx = trendChartRef.value?.getContext('2d');
  if (!ctx) return;

  const data = await getKpiTimeseries(normalizeFilterParams(filterValues.value));
  const monthlyStats = data.monthlyStats;

  // Destroy safely
  if (chartRefs.monthly) {
    chartRefs.monthly.destroy();
    chartRefs.monthly = null;
  }

  chartRefs.monthly = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
      datasets: [{
        label: '월별 KPI 추이',
        data: monthlyStats.map(item => item.averageProgress),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(147,197,253,0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}


// 🔍 KPI 목록 + 통계 동시 조회
async function handleSearch(values) {
  try {
    const normalized = normalizeFilterParams(values);
    const params = {
      ...normalized,
      statusId: 2,
      page: currentPage.value,
      size: 10
    };
    const response = await getKpiList(params);
    const processed = (response.content ?? []).map((item) => ({
      ...item,
      statusName: item.kpiProgress === 100 ? '달성' : '미달성'
    }));

    tableData.value = processed;
    pagination.value = response.pagination ?? { currentPage: 1, totalPage: 1 };

    await renderCharts();
  } catch (err) {
    console.error('KPI 목록 조회 중 오류:', err);
    tableData.value = [];
    pagination.value = { currentPage: 1, totalPage: 1 };
  }
}


// 📌 페이지 변경 감지
watch(currentPage, () => {
  handleSearch(filterValues.value);
});

// 초기 진입
onMounted(() => {
  const init = {};
  filterValues.value = init;
  handleSearch(init);
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  if (chartRefs.donut) chartRefs.donut.resize();
  if (chartRefs.monthly) chartRefs.monthly.resize();
}

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'profile', label: '#' },
  { key: 'employeeName', label: '작성자' },
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' }
];

// KPI 상세 모달
function handleDownload() {
  alert('다운로드');
}
async function openModalHandler(kpiId) {
  isOpen.value = true;
  selectedKpiId.value = kpiId;

  try {
    const detail = await getKpiDetail(kpiId);

    formSections.value = [
      {
        title: 'KPI 정보',
        icon: 'fa-bullseye',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '목표', value: detail.goal },
          { label: '목표 수치', value: `${detail.goalValue}건` },
          { label: '진척도', value: `${detail.kpiProgress}%` },
          { label: '마감일', value: detail.deadline }
        ]
      },
      {
        title: '진척 기준',
        icon: 'fa-chart-bar',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '25% 달성', value: detail.progress25 },
          { label: '50% 달성', value: detail.progress50 },
          { label: '75% 달성', value: detail.progress75 },
          { label: '100% 달성', value: detail.progress100 }
        ]
      },
      {
        title: '작성 정보',
        icon: 'fa-user-edit',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '작성자', value: detail.employeeName },
          { label: '작성일', value: detail.createdAt },
          { label: '부서', value: detail.departmentName },
          { label: '직위', value: detail.positionName }
        ]
      }
    ];
  } catch (err) {
    console.error('KPI 상세 조회 실패:', err);
    isOpen.value = false;
  }
}

</script>


<template>
  <main>
    <!-- 헤더 및 상단 버튼 -->
    <HeaderWithTabs
        :headerItems="[
        { label: '대시보드', to: '/kpi/statics', active: true },
        { label: '사원별 KPI', to: '/kpi/employees', active: false }
      ]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <!-- KPI 통계 차트 영역 -->
    <section class="chart-row">
      <!-- 도넛 차트 -->
      <div class="chart-box">
        <h3 class="chart-title"><i class="fas fa-pie-chart icon-blue" /> 월별 KPI 현황</h3>
        <div class="chart-content donut">
          <canvas ref="donutChartRef"></canvas>
        </div>
      </div>

      <!-- 선형 차트 -->
      <div class="chart-box">
        <div class="chart-header">
          <h3 class="chart-title"><i class="fas fa-chart-line icon-blue" /> 월별 KPI 추이</h3>
        </div>
        <div class="chart-content">
          <canvas ref="trendChartRef"></canvas>
        </div>
      </div>
    </section>

    <!-- 필터 컴포넌트 -->
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />

    <!-- KPI 테이블 -->
    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="(row) => openModalHandler(row.kpiId)"
    />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage"
        :pages="Array.from({ length: pagination.totalPage }, (_, i) => i + 1)"
        v-model="currentPage"
    />



    <!-- KPI 상세 모달 -->
    <SideModal
        :visible="isOpen"
        :title="`KPI 상세 정보`"
        icon="fa-chart-line"
        :sections="formSections"
        :showReject="false"
        :showSubmit="false"
        @close="isOpen = false"
    />

  </main>
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
