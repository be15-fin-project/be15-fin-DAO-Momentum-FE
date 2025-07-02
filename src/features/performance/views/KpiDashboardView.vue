<script setup>
import {ref, onMounted, onBeforeUnmount, watch} from 'vue';
import {
  getKpiStatistics,
  getKpiTimeseries,
  getKpiList,
  getKpiExcelDownload,
  getKpiDetail,
} from '@/features/performance/api.js';
import { getDepartments, getPositions  } from '@/features/works/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseTable from "@/components/common/BaseTable.vue";
import DoughnutChart from '@/features/performance/components/DoughnutChart.vue';
import LineChart from '@/features/performance/components/LineChart.vue';


// Refs
const currentPage = ref(1);
const isOpen = ref(false);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({currentPage: 1, totalPage: 1});
const selectedKpiId = ref(null); // 선택된 KPI ID
const formSections = ref([]); // 동적으로 변경될 모달 폼 내용
const departmentTree = ref([]);
const filterOptions = ref([]);
const positionList = ref([]);


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
function initFilters() {
  filterOptions.value = [
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value, // 부서 트리 반영
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: [
        '전체',
        ...positionList.value.map(pos => pos.name)
      ]
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
}

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
  if (normalized.positionId && normalized.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === normalized.positionId);
    normalized.positionId = match?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  // 부서 라벨 → ID 매핑
  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
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

    const stats = await getKpiStatistics(normalizeFilterParams(filterValues.value));
    donutChartData.value = {
      labels: ['진행중', '완료'],
      data: [
        stats.totalKpiCount - stats.completedKpiCount,
        stats.completedKpiCount,
      ],
      colors: [blue200, blue400],
    };

    const {monthlyStats} = await getKpiTimeseries(normalizeFilterParams(filterValues.value));
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
      statusId: 2,
      isDeleted: 'N',
      page: currentPage.value,
      size: 10
    };
    const res = await getKpiList(params);
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
    pagination.value = {currentPage: 1, totalPage: 1};
  }
}


// 📌 페이지 변경 감지
watch(currentPage, () => {
  handleSearch(filterValues.value);
});

// 초기 진입
onMounted(async () => {
  try {
    const response = await getDepartments();
    departmentTree.value = response.data?.departmentInfoDTOList || [];
    positionList.value = await getPositions();
    initFilters(); // 부서 데이터 기반 필터 초기화
  } catch (e) {
    console.error('부서 정보 조회 실패:', e);
  }

  const init = {};
  filterValues.value = init;
  await handleSearch(init);

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
  {key: 'profile', label: '#'},
  {key: 'employeeName', label: '작성자'},
  {key: 'goal', label: '목표'},
  {key: 'goalValue', label: '목표 수치'},
  {key: 'kpiProgress', label: '진척도 (%)'},
  {key: 'statusName', label: '달성 여부'},
  {key: 'createdAt', label: '작성일'},
  {key: 'action', label: '상세'}
];

// 엑셀 다운로드
async function handleDownload() {
  try {
    const normalized = normalizeFilterParams(filterValues.value);

    const blob = await getKpiExcelDownload({
      ...normalized,
      statusId: 2
    });

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kpi-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('엑셀 다운로드 오류:', err);
    alert('엑셀 다운로드 실패');
  }
}

// KPI 상세 모달
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
        fields: [
          { label: '목표', key: 'goal', value: detail.goal, editable: false, type: 'input' },
          { label: '목표 수치', key: 'goalValue', value: detail.goalValue, editable: false, type: 'input' },
          { label: '진척도', key: 'kpiProgress', value: detail.kpiProgress, editable: false, type: 'input' },
          { label: '마감일', key: 'deadline', value: detail.deadline, editable: false, type: 'input' }
        ]
      },
      {
        title: '진척 기준',
        icon: 'fa-chart-bar',
        layout: 'one-column',
        fields: [
          { label: '25% 달성', key: 'progress25', value: detail.progress25, editable: false, type: 'input' },
          { label: '50% 달성', key: 'progress50', value: detail.progress50, editable: false, type: 'input' },
          { label: '75% 달성', key: 'progress75', value: detail.progress75, editable: false, type: 'input' },
          { label: '100% 달성', key: 'progress100', value: detail.progress100, editable: false, type: 'input' }
        ]
      },
      {
        title: '작성 정보',
        icon: 'fa-user-edit',
        layout: 'two-column',
        fields: [
          { label: '작성자', key: 'employeeName', value: detail.employeeName, editable: false, type: 'input' },
          { label: '작성일', key: 'createdAt', value: detail.createdAt, editable: false, type: 'input' },
          { label: '부서', key: 'departmentName', value: detail.departmentName, editable: false, type: 'input' },
          { label: '직위', key: 'positionName', value: detail.positionName, editable: false, type: 'input' }
        ]
      },
      {
        title: '처리 사유',
        icon: 'fa-comment-dots',
        layout: 'one-column',
        outerClass: 'kpi-detail-section',
        fields: [
          ...(detail.reason ? [{
            label: '처리 사유',
            value: detail.reason,
            editable: false,
            type: 'input'
          }] : []),

          ...(detail.cancelReason ? [{
            label: '취소 사유',
            value: detail.cancelReason,
            editable: false,
            type: 'input'
          }] : [])
        ]
      }
    ].filter(section => section.fields.length > 0); // 빈 필드 그룹 제거

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
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- KPI 테이블 -->
    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="(row) => openModalHandler(row.kpiId)"
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


<style scoped>
.chart-row {
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

</style>
