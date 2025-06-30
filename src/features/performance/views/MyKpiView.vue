<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getMyKpiStatistics, getMyKpiTimeseries, getMyKpiList } from '@/features/performance/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseTable from "@/components/common/BaseTable.vue";
import { getKpiDetail } from '@/features/performance/api.js';
import {useRoute, useRouter} from 'vue-router';
import DoughnutChart from '@/features/performance/components/DoughnutChart.vue';
import LineChart from '@/features/performance/components/LineChart.vue';

// Refs
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const isOpen = ref(false);
const filterValues = ref({
  status: '전체'
});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const selectedKpiId = ref(null); // 선택된 KPI ID
const formSections = ref([]); // 동적으로 변경될 모달 폼 내용


// Chart instance container
const donutChartData = ref({
  labels: [],
  data: [],
  colors: [],
});

const lineChartData = ref({
  labels: [],
  datasets: [],
});


// 필터 옵션
const filterOptions = [
  {
    key: 'statusName',
    label: '상태',
    icon: 'fa-spinner',
    type: 'select',
    options: ['전체', '대기', '승인', '반려', '취소']
  },
  {
    key: 'date',
    label: '등록일',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
];
// 필터 탭 옵션
const tabOpstions = [
  { key: 'status', label: '전체', value: '전체' },
  { key: 'status', label: '승인', value: '승인' },
  { key: 'status', label: '반려', value: '반려' }
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
    const blue200 = rootStyle.getPropertyValue('--blue-200').trim();
    const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
    const blue500 = rootStyle.getPropertyValue('--blue-500').trim();

    const stats = await getMyKpiStatistics(normalizeFilterParams(filterValues.value));
    donutChartData.value = {
      labels: ['진행중', '완료'],
      data: [
        stats.totalKpiCount - stats.completedKpiCount,
        stats.completedKpiCount,
      ],
      colors: [blue200, blue400],
    };

    const {monthlyStats} = await getMyKpiTimeseries(normalizeFilterParams(filterValues.value));
    const fullMonths = Array.from({length: 12}, (_, i) => i + 1); // 1~12
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
          type: 'line',
          color: blue200,
          borderWidth: 2,
          yAxisID: 'y2',
        },
      ],
    };
  } catch (e) {
    console.warn('차트 데이터 로드 실패:', e);
  }
}

// 🔍 KPI 목록 + 통계 동시 조회
async function handleSearch(values) {
  try {
    const normalized = normalizeFilterParams(values);
    const params = {
      ...normalized,
      empNo: route.query.empNo,
      page: currentPage.value,
      size: 10
    };
    const res = await getMyKpiList(params);
    const processed = (res.content ?? []).map((item) => ({
      ...item,
      statusName: item.kpiProgress === 100 ? '달성' : '미달성'
    }));

    tableData.value = processed;
    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage > 0 ? res.pagination.totalPage : 1;
    pagination.value = { currentPage: current, totalPage: total };

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
  handleSearch(filterValues.value); // 초기값 그대로 사용
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
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' }
];

// KPI 상세 모달
function handleBack() {
  router.push({ path: `../kpi/employees` });
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
        { label: 'KPI 조회', href: '#', active: true },
      ]"
        :submitButtons="[{ label: 'KPI 등록', icon: 'fa-file-signature', event: 'download', variant: 'blue' }]"
        :showTabs="false"
        @download="handleSubmit"
        @back="handleBack"
    />

    <!-- KPI 통계 차트 영역 -->
    <section class="chart-row">
      <!-- 도넛 차트 -->
      <DoughnutChart
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
    <EmployeeFilter :filters="filterOptions" :tabs="tabOpstions" v-model="filterValues" @search="handleSearch" />

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

</style>
