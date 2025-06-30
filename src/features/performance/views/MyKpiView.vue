<script setup>
// Import
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getMyKpiStatistics,
  getMyKpiTimeseries,
  getMyKpiList,
  createMyKpi,
  getKpiDetail,
  updateKpiProgress,
  deleteKpi
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import DoughnutChart from '@/features/performance/components/DoughnutChart.vue';
import LineChart from '@/features/performance/components/LineChart.vue';


// Route & Router
const route = useRoute();
const router = useRouter();


// 상태 정의
const currentPage = ref(1);
const isOpen = ref(false);
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const selectedKpiId = ref(null);

const filterValues = ref({ status: '승인' });
const pagination = ref({ currentPage: 1, totalPage: 1 });
const tableData = ref([]);

const formSections = ref([]);
const createFormSections = ref([]);
const createForm = ref({
  goal: '',
  goalValue: '',
  kpiProgress: 0,
  progress25: '',
  progress50: '',
  progress75: '',
  progress100: '',
  deadline: '',
});

const editMode = ref(null); // 'progress' | 'cancel' | null
const cancelReason = ref('');
const rejectText = computed(() => {
  if (editMode.value === 'cancel') return '신청 취소';
  if (editMode.value === 'progress') return '최신화 취소';
  return '취소 신청'; // 기본
});

const submitText = computed(() => {
  if (editMode.value === 'cancel') return '신청 제출';
  if (editMode.value === 'progress') return '진척도 제출';
  return '최신화'; // 기본
});


// 차트 데이터
const donutChartData = ref({ labels: [], data: [], colors: [] });
const lineChartData = ref({ labels: [], datasets: [] });


// 필터/탭 정의
const filterOptions = [
  { key: 'date', label: '등록일', icon: 'fa-calendar-day', type: 'date-range' }
];

const tabOpstions = [
  { key: 'status', label: '승인', value: '승인' },
  { key: 'status', label: '대기', value: '대기' },
  { key: 'status', label: '반려', value: '반려' },
  { key: 'status', label: '취소', value: '취소' }
];

const tableColumns = [
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' }
];


// 필터 정규화
function normalizeFilterParams(values) {
  const normalized = { ...values };

  // 날짜
  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  // 직위 & 부서 매핑
  const positionMap = { '전체': null, '대표이사': 1, '이사': 2, '부장': 3, '과장': 4, '대리': 5, '사원': 6 };
  const deptMap = {
    '전체': null, '인사팀': 10, '재무팀': 11, '프론트엔드팀': 12,
    '백엔드팀': 13, '데이터팀': 14, '영업팀': 15, '디지털마케팅팀': 16
  };
  normalized.positionId = positionMap[normalized.positionId] ?? normalized.positionId;
  normalized.deptId = deptMap[normalized.deptId] ?? normalized.deptId;

  // 상태 처리
  switch (values.status) {
    case '대기':
      normalized.statusId = 1;
      break;
    case '반려':
      normalized.statusId = 3;
      normalized.isDeleted = 'N';
      break;
    case '취소':
      normalized.statusId = 2;
      normalized.isDeleted = 'Y';
      break;
    default:
      normalized.statusId = 2;
      normalized.isDeleted = 'N';
      break;
  }

  return normalized;
}


// KPI 통계 차트 렌더링
async function renderCharts() {
  try {
    const rootStyle = getComputedStyle(document.documentElement);
    const blue200 = rootStyle.getPropertyValue('--blue-200').trim();
    const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
    const blue500 = rootStyle.getPropertyValue('--blue-500').trim();

    const stats = await getMyKpiStatistics(normalizeFilterParams(filterValues.value));
    donutChartData.value = {
      labels: ['진행중', '완료'],
      data: [stats.totalKpiCount - stats.completedKpiCount, stats.completedKpiCount],
      colors: [blue200, blue400],
    };

    const { monthlyStats } = await getMyKpiTimeseries(normalizeFilterParams(filterValues.value));
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
        }
      ]
    };
  } catch (e) {
    console.warn('차트 데이터 로드 실패:', e);
  }
}


// KPI 목록 조회
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
    tableData.value = (res.content ?? []).map(item => ({
      ...item,
      statusName: item.kpiProgress === 100 ? '달성' : '미달성'
    }));

    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage > 0 ? res.pagination.totalPage : 1;
    pagination.value = { currentPage: current, totalPage: total };

    await renderCharts();
  } catch (err) {
    console.error('KPI 목록 조회 오류:', err);
    tableData.value = [];
    pagination.value = { currentPage: 1, totalPage: 1 };
  }
}


// KPI 상세 모달 열기
async function openModalHandler(kpiId) {
  isOpen.value = true;
  selectedKpiId.value = kpiId;

  try {
    const detail = await getKpiDetail(kpiId);
    createForm.value.kpiProgress = detail.kpiProgress;

    formSections.value = [
      {
        title: 'KPI 정보',
        icon: 'fa-bullseye',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '목표', value: detail.goal, editable: false, type: 'input'  },
          { label: '목표 수치', value: `${detail.goalValue}건`, editable: false, type: 'number' },
          { label: '진척도', key: 'kpiProgress', editable: false, type: 'number' },
          { label: '마감일', value: detail.deadline, editable: false, type: 'input'  }
        ]
      },
      {
        title: '진척 기준',
        icon: 'fa-chart-bar',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '25% 달성', value: detail.progress25, editable: false, type: 'input'  },
          { label: '50% 달성', value: detail.progress50, editable: false, type: 'input'  },
          { label: '75% 달성', value: detail.progress75, editable: false, type: 'input'  },
          { label: '100% 달성', value: detail.progress100, editable: false, type: 'input'  }
        ]
      }
    ];
  } catch (err) {
    console.error('KPI 상세 조회 실패:', err);
    isOpen.value = false;
  }
}


// KPI 등록 모달 열기
function handleSubmitModal() {
  createForm.value.kpiProgress = 0;
  createFormSections.value = [
    {
      title: 'KPI 정보',
      icon: 'fa-bullseye',
      layout: 'two-column',
      fields: [
        { label: '목표', key: 'goal', editable: true, type: 'input' },
        { label: '목표 수치', key: 'goalValue', editable: true, type: 'number' },
        { label: '진척도', key: 'kpiProgress', editable: false, type: 'number' },
        { label: '마감일', key: 'deadline', editable: true, type: 'date' }
      ]
    },
    {
      title: '진척 기준',
      icon: 'fa-chart-line',
      layout: 'two-column',
      fields: [
        { label: '25% 달성', key: 'progress25', editable: true, type: 'input' },
        { label: '50% 달성', key: 'progress50', editable: true, type: 'input' },
        { label: '75% 달성', key: 'progress75', editable: true, type: 'input' },
        { label: '100% 달성', key: 'progress100', editable: true, type: 'input' }
      ]
    }
  ];
  isCreateModalOpen.value = true;
}


// KPI 등록 유효성 검사 및 제출
async function submitKpiForm() {
  if (isSubmitting.value) return;

  const required = ['goal', 'goalValue', 'progress25', 'progress50', 'progress75', 'progress100', 'deadline'];
  const missing = required.some(field => !createForm.value[field]?.toString().trim());

  if (missing) {
    alert('필수 정보를 모두 입력해주세요.');
    return;
  }

  try {
    isSubmitting.value = true;
    const payload = { ...createForm.value, kpiProgress: 0 };
    const result = await createMyKpi(payload);
    alert(result.message || 'KPI가 성공적으로 생성되었습니다.');
    isCreateModalOpen.value = false;
    handleSearch(filterValues.value);
  } catch (e) {
    console.error('KPI 생성 실패:', e);
    alert('KPI 생성 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

//  진척도 최신화 시작 함수
function startEditProgress() {
  editMode.value = 'progress';

  // KPI 정보 필드 중 '진척도' 항목만 editable 처리
  const progressField = formSections.value
      .flatMap(section => section.fields)
      .find(f => f.key === 'kpiProgress');

  if (progressField) {
    progressField.editable = true;
  }
}

// KPI 취소 요청 시작 함수
function startCancelRequest() {
  editMode.value = 'cancel';
  cancelReason.value = '';

  formSections.value.push({
    title: '취소 요청 사유',
    icon: 'fa-comment-dots',
    layout: 'one-column',
    fields: [
      {
        label: '취소 사유',
        key: 'cancelReason',
        type: 'textarea',
        editable: true,
        value: ''
      }
    ]
  });
}

// 모달 제출 처리 함수
function handleDetailModalReject() {
  if (editMode.value === 'cancel' || editMode.value === 'progress') {
    // 편집모드 취소
    editMode.value = null;
    cancelReason.value = '';
    createForm.value.cancelReason = '';
    // 사유 필드 제거
    formSections.value = formSections.value.filter(s => s.title !== '취소 요청 사유');
    // 진척도 필드 read-only 복구
    const progressField = formSections.value
        .flatMap(section => section.fields)
        .find(f => f.key === 'kpiProgress');
    if (progressField) progressField.editable = false;
  } else {
    // 기본 상태 → 취소 신청 시작
    startCancelRequest();
  }
}

async function handleDetailModalSubmit() {
  // 진짜 편집 상태이면 → 제출
  if (editMode.value === 'progress' || editMode.value === 'cancel') {
    await submitEditOrCancel();
    return;
  }

  // 아직 편집 모드 아니면 → 편집 모드 진입만
  editMode.value = 'progress';

  // 진척도 필드 editable 켜기
  const progressField = formSections.value
      .flatMap(section => section.fields)
      .find(f => f.key === 'kpiProgress');

  if (progressField) progressField.editable = true;
}



async function submitEditOrCancel() {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    if (editMode.value === 'progress') {
      const payload = { progress: createForm.value.kpiProgress };
      const res = await updateKpiProgress(selectedKpiId.value, payload);
      alert(res.data?.message || 'KPI 진척도가 성공적으로 업데이트되었습니다.');
    } else if (editMode.value === 'cancel') {
      const reason = createForm.value.cancelReason?.trim();
      if (!reason) {
        alert('취소 사유를 입력해주세요.');
        return;
      }
      const res = await deleteKpi(selectedKpiId.value, { reason });
      alert(res.data?.message || 'KPI가 성공적으로 취소 요청되었습니다.');
    }

    isOpen.value = false;
    editMode.value = null;
    await handleSearch(filterValues.value);

  } catch (e) {
    console.error('제출 실패:', e);
    alert('제출 중 오류 발생');
  } finally {
    isSubmitting.value = false;
  }
}


// 페이지 변경 감지
watch(currentPage, () => {
  handleSearch(filterValues.value);
});


// 초기 로딩 & 이벤트 바인딩
onMounted(() => {
  handleSearch(filterValues.value);
});

// 뒤로 가기
function handleBack() {
  router.push({ path: '../kpi/employees' });
}
</script>


<template>
  <main>
    <!-- 헤더 및 상단 버튼 -->
    <HeaderWithTabs
        :headerItems="[
        { label: 'KPI 조회', href: '#', active: true },
      ]"
        :submitButtons="[{ label: 'KPI 제출', icon: 'fa-file-signature', event: 'openModal', variant: 'blue' }]"
        :showTabs="false"
        @openModal="handleSubmitModal"
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
    <EmployeeFilter :filters="filterOptions" :tabs="tabOpstions" v-model="filterValues" @search="handleSearch"/>

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
        :showReject="true"
        :reject-text="rejectText"
        :showSubmit="true"
        :submit-text="submitText"
        @close="isOpen = false"
        @submit="handleDetailModalSubmit"
        @reject="handleDetailModalReject"
        v-model:form="createForm"
    />


    <!-- KPI 등록 사이드 모달 -->
    <SideModal
        v-model:visible="isCreateModalOpen"
        title="KPI 제출"
        icon="fa-file-signature"
        :showSubmit="true"
        :readonly="false"
        @close="isCreateModalOpen = false"
        @submit="submitKpiForm"
        :sections="createFormSections"
        v-model:form="createForm"
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
