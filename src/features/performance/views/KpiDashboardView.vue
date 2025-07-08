<template>
  <main>
    <!-- 헤더 및 상단 버튼 -->
    <HeaderWithTabs
        :headerItems="[
        { label: '대시보드', to: '/kpi/statics', active: true },
        { label: '사원별 KPI', to: '/kpi/employee-kpis', active: false }
      ]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <!-- KPI 통계 차트 영역 -->
    <section class="chart-row">
      <!-- 도넛 차트 -->
      <DonutChart
          :labels="donutChartData.labels"
          :data="donutChartData.data"
          :colors="donutChartData.colors"
      />

      <!-- 선형 차트 -->
      <LineChart
          :labels="lineChartData.labels"
          :datasets="lineChartData.datasets"
      />

    </section>

    <!-- 필터 컴포넌트 -->
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- KPI 테이블 -->
    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="(row) => openDetailModal(row.kpiId)"
    />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
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

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// ────────── API ──────────
import {
  getKpiStatistics,
  getKpiTimeseries,
  getKpiList,
  getKpiExcelDownload,
  getKpiDetail,
} from '@/features/performance/api.js';
import { getDepartments, getPositions } from '@/features/works/api.js';

// ────────── Components ──────────
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import DonutChart from '@/features/performance/components/DonutChart.vue';
import LineChart from '@/features/performance/components/LineChart.vue';
import { useToast } from 'vue-toastification';

const toast = useToast()

// ──────────  Refs & Reactive State ──────────
// 페이지네이션 및 필터 상태
const currentPage = ref(1);
const filterValues = ref({});
const pagination = ref({ currentPage: 1, totalPage: 1 });

// 테이블 및 차트 데이터
const tableData = ref([]);
const donutChartData = ref({ labels: [], data: [], colors: [] });
const lineChartData = ref({ labels: [], datasets: [] });
const chartRefs = {
  donut: null,
  monthly: null
}

// 필터 옵션, 조직 구조
const departmentTree = ref([]);
const positionList = ref([]);
const filterOptions = ref([]);

// 모달 상태
const isOpen = ref(false);
const formSections = ref([]);

// 테이블 컬럼
const tableColumns = [
  { key: 'profile', label: '#' },
  { key: 'empNo', label: '사번' },
  { key: 'employeeName', label: '작성자' },
  { key: 'departmentName', label: '부서' },
  { key: 'positionName', label: '직위' },
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' },
];


// ────────── Lifecycle Hooks ──────────
onMounted(async () => {
  try {
    await loadInitialData();   // 부서, 직위, 필터 초기화
    await loadTableData();     // KPI 목록 조회
    await loadChartData();     // 차트 렌더링
  } catch (e) {
    toast.error('초기화 중 오류가 발생했습니다.');
  }

  window.addEventListener('resize', resizeAllCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAllCharts);
});


// ────────── Methods ──────────
function initFilters() {
  filterOptions.value = [
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value,
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positionList.value.map(pos => pos.name)],
    },
    {
      key: 'empNo',
      label: '사번',
      icon: 'fa-id-badge',
      type: 'input',
      placeholder: '사번 입력',
    },
    {
      key: 'date',
      label: '등록일',
      icon: 'fa-calendar-day',
      type: 'date-range',
    },
  ];
}

async function loadInitialData() {
  const deptRes = await getDepartments();
  departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
  positionList.value = await getPositions();

  initFilters();
  filterValues.value = {}; // 초기화
}


// ────────── 유틸 함수 ──────────
// 필터
function normalizeFilterParams(values) {
  const normalized = { ...values };

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  if (normalized.positionId && normalized.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === normalized.positionId);
    normalized.positionId = match?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  return normalized;
}

function resizeAllCharts() {
  if (chartRefs.donut) chartRefs.donut.resize();
  if (chartRefs.monthly) chartRefs.monthly.resize();
}

// 검색 및 조회
async function loadTableData() {
  try {
    const params = {
      ...normalizeFilterParams(filterValues.value, positionList.value),
      statusId: 2,
      isDeleted: 'N',
      page: currentPage.value,
      size: 10,
    };

    const res = await getKpiList(params);

    tableData.value = (res.content ?? []).map(item => {
      const now = new Date();
      const deadline = new Date(item.deadline);
      const progress = item.kpiProgress;

      let statusName = '진행중';

      if (deadline >= now) {
        statusName = progress === 0 ? '준비 중' : '수행 중';
      } else {
        statusName = progress === 100 ? '달성' : '기한 초과';
      }

      return {
        ...item,
        statusName,
      };
    });


    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage > 0 ? res.pagination.totalPage : 1;
    pagination.value = { currentPage: current, totalPage: total };

  } catch (err) {
    toast.error('KPI 목록 조회에 실패했습니다.');
    tableData.value = [];
    pagination.value = { currentPage: 1, totalPage: 1 };
  }
}

const handleSearch = async (values) => {
  filterValues.value = values;
  currentPage.value = 1;
  await loadTableData();
  await loadChartData();
};

// KPI 상세 모달
const openDetailModal = async (kpiId) => {
  isOpen.value = true;

  try {
    const detail = await getKpiDetail(kpiId);

    formSections.value = [
      {
        title: 'KPI 정보',
        icon: 'fa-bullseye',
        layout: 'two-column',
        fields: [
          { label: '목표', value: detail.goal, type: 'input', editable: false },
          { label: '목표 수치', value: detail.goalValue, type: 'input', editable: false },
          { label: '진척도', value: detail.kpiProgress, type: 'input', editable: false },
          { label: '마감일', value: detail.deadline, type: 'input', editable: false },
        ],
      },
      {
        title: '진척 기준',
        icon: 'fa-chart-bar',
        layout: 'one-column',
        fields: [
          {
            label: '진척도 타임라인',
            type: 'progressTimeline',
            key: 'timeline',
            editable: false,
            value: {
              kpiProgress: detail.kpiProgress,
              progress25: detail.progress25,
              progress50: detail.progress50,
              progress75: detail.progress75,
              progress100: detail.progress100
            }
          }
        ]
      },
      {
        title: '작성 정보',
        icon: 'fa-user-edit',
        layout: 'two-column',
        fields: [
          { label: '작성자', value: detail.employeeName, type: 'input', editable: false },
          { label: '작성일', value: detail.createdAt, type: 'input', editable: false },
          { label: '부서', value: detail.departmentName, type: 'input', editable: false },
          { label: '직위', value: detail.positionName, type: 'input', editable: false },
        ],
      },
      {
        title: '처리 사유',
        icon: 'fa-comment-dots',
        layout: 'one-column',
        outerClass: 'kpi-detail-section',
        fields: [
          ...(detail.reason ? [{ label: '처리 사유', value: detail.reason, type: 'input', editable: false }] : []),
          ...(detail.cancelReason ? [{ label: '취소 사유', value: detail.cancelReason, type: 'input', editable: false }] : []),
        ],
      },
    ].filter(section => section.fields.length > 0);

  } catch (err) {
    toast.error('KPI 상세 정보를 불러오지 못했습니다.');
    isOpen.value = false;
  }
};

// EXCEL 다운로드
const handleDownload = async () => {
  try {
    toast.success('엑셀 다운로드가 시작되었습니다.');
    const params = {
      ...normalizeFilterParams(filterValues.value, positionList.value),
      statusId: 2,
    };

    const blob = await getKpiExcelDownload(params);
    const url = window.URL.createObjectURL(new Blob([blob]));

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kpi-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('엑셀 다운로드에 실패했습니다.');
  }
};

// ────────── Chart 렌더링 ──────────
async function loadChartData() {
  try {
    const params = normalizeFilterParams(filterValues.value, positionList.value);

    const rootStyle = getComputedStyle(document.documentElement);
    const blue200 = rootStyle.getPropertyValue('--blue-200').trim();
    const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
    const blue500 = rootStyle.getPropertyValue('--blue-500').trim();

    // ─ 도넛 차트 데이터
    const stats = await getKpiStatistics(params);
    donutChartData.value = {
      labels: ['진행중', '완료'],
      data: [stats.totalKpiCount - stats.completedKpiCount, stats.completedKpiCount],
      colors: [blue200, blue400],
    };

    // ─ 선형 차트 데이터
    const { monthlyStats } = await getKpiTimeseries(params);
    const fullMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyMap = Object.fromEntries(monthlyStats.map(d => [d.month, d]));

    lineChartData.value = {
      labels: fullMonths.map(m => `${m}월`),
      datasets: [
        {
          label: '전체 KPI 수',
          data: fullMonths.map(m => monthlyMap[m]?.totalKpiCount ?? 0),
          color: blue400,
          type: 'bar',
          yAxisID: 'y',
        },
        {
          label: '완료 KPI 수',
          data: fullMonths.map(m => monthlyMap[m]?.completedKpiCount ?? 0),
          color: blue500,
          type: 'bar',
          yAxisID: 'y',
        },
        {
          label: '평균 진척률 (%)',
          data: fullMonths.map(m => monthlyMap[m]?.averageProgress ?? 0),
          color: blue200,
          type: 'line',
          borderWidth: 2,
          yAxisID: 'y2',
        },
      ],
    };

  } catch (e) {
    console.warn('차트 데이터 로드 실패:', e);
  }
}

// ────────── Watchers ──────────
watch(currentPage, () => {
  loadTableData();
});

</script>


<style scoped>
.chart-row {
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

</style>
