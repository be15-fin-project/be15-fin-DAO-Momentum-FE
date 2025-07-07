<template>
  <main>
    <!-- 헤더 및 상단 버튼 -->
    <HeaderWithTabs
        :headerItems="[
        { label: 'KPI 조회', href: '#', active: true },
      ]"
        :submitButtons="[{ label: 'KPI 제출', icon: 'fa-paper-plane', event: 'openModal', variant: 'blue' }]"
        :showTabs="false"
        @openModal="handleSubmitModal"
        @back="handleBack"
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
    <EmployeeFilter :filters="filterOptions" :tabs="tabOptions" v-model="filterValues" @search="handleSearch"/>

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
        :showReject="canCancelRequest || canReject"
        :reject-text="rejectText"
        :showSubmit="canEditProgress"
        :submit-text="submitText"
        @close="closeDetailModal"
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

<script setup>
// 외부 라이브러리
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// API
import {
  getMyKpiStatistics,
  getMyKpiTimeseries,
  getMyKpiList,
  createMyKpi,
  getKpiDetail,
  updateKpiProgress,
  deleteKpi, withdrawKpi
} from '@/features/performance/api.js';

// 컴포넌트
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import DonutChart from '@/features/performance/components/DonutChart.vue';
import LineChart from '@/features/performance/components/LineChart.vue';
import { useToast } from 'vue-toastification';
import DeleteConfirmToast from '@/components/common/DeleteConfirmToast.vue';

const showDeleteConfirm = () => {
  return new Promise((resolve) => {
    const id = toast(
        {
          component: DeleteConfirmToast,
          props: {
            toastId: '',
            resolve
          }
        },
        {
          type: 'error',
          timeout: false,
          closeOnClick: false,
          draggable: false
        }
    );

    toast.update(id, {
      content: {
        component: DeleteConfirmToast,
        props: {
          toastId: id,
          resolve
        }
      }
    });
  });
};

const toast = useToast();
// 라우터 관련
const route = useRoute();
const router = useRouter();

// KPI 목록 상태
const currentPage = ref(1);
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const filterValues = ref({ status: '승인' });

// KPI 등록 모달 상태
const isCreateModalOpen = ref(false);
const createForm = ref({
  goal: '',
  goalValue: '',
  kpiProgress: 0,
  progress25: '',
  progress50: '',
  progress75: '',
  progress100: '',
  deadline: ''
});
const createFormSections = ref([]);

// KPI 상세 모달 상태
const isOpen = ref(false);
const selectedKpiId = ref(null);
const formSections = ref([]);

// 기타 상태
const isSubmitting = ref(false);
const editMode = ref(null); // 'progress' | 'cancel' | null
const cancelReason = ref('');

// 버튼 텍스트 계산
const rejectText = computed(() => {
  if (editMode.value === 'cancel') return '신청 취소';
  if (editMode.value === 'progress') return '최신화 취소';
  return '취소 신청';
});

const submitText = computed(() => {
  if (editMode.value === 'cancel') return '신청 제출';
  if (editMode.value === 'progress') return '진척도 제출';
  return '최신화';
});

// 권한 여부 계산
const canEditProgress = computed(() => {
  const detail = createForm.value;
  return (
      detail.statusType === 'ACCEPTED' &&
      new Date(detail.deadline) > new Date()
  );
});

const canCancelRequest = computed(() => {
  const detail = createForm.value;
  return (
      detail.statusType === 'ACCEPTED' &&
      new Date(detail.deadline) > new Date()
  );
});

const canReject = computed(() => {
  const detail = createForm.value;
  return detail.statusType === 'PENDING';
});

// 페이지 변경 감지 → KPI 목록 재조회
watch(currentPage, () => {
  handleSearch(filterValues.value);
});

// KPI 필터 옵션
const filterOptions = [
  { key: 'date', label: '등록일', icon: 'fa-calendar-day', type: 'date-range' }
];

// KPI 상태 탭 옵션
const tabOptions = [
  { key: 'status', label: '승인', value: '승인' },
  { key: 'status', label: '대기', value: '대기' },
  { key: 'status', label: '반려', value: '반려' },
  { key: 'status', label: '취소', value: '취소' }
];

// KPI 테이블 컬럼
const tableColumns = [
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'statusName', label: '달성 여부' },
  { key: 'createdAt', label: '작성일' },
  { key: 'action', label: '상세' }
];

// 차트용 상태
const donutChartData = ref({ labels: [], data: [], colors: [] });
const lineChartData = ref({ labels: [], datasets: [] });

// KPI 통계 및 시계열 데이터 렌더링
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
    toast.error('차트 데이터 로드 중 오류가 발생했습니다.');
  }
}

// 필터 파라미터 정규화
function normalizeFilterParams(values) {
  const normalized = { ...values };

  // 날짜 필드 처리
  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  // 직위 & 부서 명칭 → ID 매핑
  const positionMap = { '전체': null, '대표이사': 1, '이사': 2, '부장': 3, '과장': 4, '대리': 5, '사원': 6 };
  const deptMap = {
    '전체': null, '인사팀': 10, '재무팀': 11, '프론트엔드팀': 12,
    '백엔드팀': 13, '데이터팀': 14, '영업팀': 15, '디지털마케팅팀': 16
  };
  normalized.positionId = positionMap[normalized.positionId] ?? normalized.positionId;
  normalized.deptId = deptMap[normalized.deptId] ?? normalized.deptId;

  // 상태 매핑
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
    toast.error('\'KPI 목록 조회 중 오류가 발생했습니다.');
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
    createForm.value = {
      ...createForm.value,
      kpiProgress: detail.kpiProgress,
      statusType: detail.statusType,
      deadline: detail.deadline,
      reason: detail.reason,
      cancelReason: detail.cancelReason,
      cancelResponse: detail.cancelResponse,
      timeline: {
        kpiProgress: detail.kpiProgress,
        progress25: detail.progress25,
        progress50: detail.progress50,
        progress75: detail.progress75,
        progress100: detail.progress100
      }
    };

    formSections.value = [
      {
        title: 'KPI 정보',
        icon: 'fa-bullseye',
        layout: 'two-column',
        outerClass: 'kpi-detail-section',
        fields: [
          { label: '목표', value: detail.goal, editable: false, type: 'input' },
          { label: '목표 수치', value: `${detail.goalValue}건`, editable: false, type: 'number' },
          { label: '진척도', key: 'kpiProgress', editable: false, type: 'number' },
          { label: '마감일', value: detail.deadline, editable: false, type: 'input' }
        ]
      },
      {
        title: '진척 기준',
        icon: 'fa-chart-bar',
        layout: 'one-column',
        outerClass: 'kpi-detail-section',
        fields: [
          {
            label: '진척도 타임라인',
            key: 'timeline',
            type: 'progressTimeline',
            editable: false
          }
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
          }] : []),
          ...(detail.cancelResponse ? [{
            label: '취소 처리',
            value: detail.cancelResponse,
            editable: false,
            type: 'input'
          }] : [])
        ]
      }
    ].filter(section => section.fields.length > 0); // 빈 섹션 제거
  } catch (err) {
    toast.error('KPI 상세 조회 중 오류가 발생했습니다.');
    isOpen.value = false;
  }
}

// KPI 상세 모달 닫기 핸들러
function closeDetailModal() {
  isOpen.value = false;
  selectedKpiId.value = null;
  editMode.value = null;
  cancelReason.value = '';
  createForm.value.cancelReason = '';
  formSections.value = [];
}


// 진척도 수정 시작
function startEditProgress() {
  editMode.value = 'progress';
  const progressField = formSections.value
      .flatMap(section => section.fields)
      .find(f => f.key === 'kpiProgress');
  if (progressField) progressField.editable = true;
}

// KPI 취소 요청 시작
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

// 취소 버튼 핸들러
async function handleDetailModalReject() {
  // 대기 상태일 경우 철회 확인 토스트 띄우기
  if (canReject.value) {
    const confirmed = await showDeleteConfirm();
    if (!confirmed) return;

    try {
      const res = await withdrawKpi(selectedKpiId.value, { reason: '사용자 철회' });
      toast.success(res.data?.message || 'KPI가 성공적으로 철회되었습니다.');
      isOpen.value = false;
      await handleSearch(filterValues.value);
    } catch (e) {
      toast.error('KPI 철회 중 오류가 발생했습니다.');
    }
    return;
  }

  if (editMode.value === 'cancel' || editMode.value === 'progress') {
    // 편집 취소
    editMode.value = null;
    cancelReason.value = '';
    createForm.value.cancelReason = '';
    formSections.value = formSections.value.filter(s => s.title !== '취소 요청 사유');
    const progressField = formSections.value
        .flatMap(section => section.fields)
        .find(f => f.key === 'kpiProgress');
    if (progressField) progressField.editable = false;
  } else {
    // 편집 모드 진입
    startCancelRequest();
  }
}

// 제출 버튼 핸들러
async function handleDetailModalSubmit() {
  if (editMode.value === 'cancel' || editMode.value === 'progress') {
    await submitEditOrCancel();
    return;
  }

  editMode.value = 'progress';
  const progressField = formSections.value
      .flatMap(section => section.fields)
      .find(f => f.key === 'kpiProgress');
  if (progressField) progressField.editable = true;
}

// 제출 처리 함수
async function submitEditOrCancel() {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    if (editMode.value === 'progress') {
      const payload = { progress: createForm.value.kpiProgress };
      const res = await updateKpiProgress(selectedKpiId.value, payload);
      toast.success(res.data?.message || 'KPI 진척도가 성공적으로 업데이트되었습니다.');
    } else if (editMode.value === 'cancel') {
      const reason = createForm.value.cancelReason?.trim();
      if (!reason) {
        toast.error('취소 사유를 입력해주세요.');
        return;
      }
      const res = await deleteKpi(selectedKpiId.value, { reason });
      toast.success(res.data?.message || 'KPI가 성공적으로 취소 요청되었습니다.');
    }

    isOpen.value = false;
    editMode.value = null;
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('제출 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

// KPI 등록 모달 열기
function handleSubmitModal() {
  createForm.value = {
    goal: '',
    goalValue: '',
    kpiProgress: 0,
    progress25: '',
    progress50: '',
    progress75: '',
    progress100: '',
    deadline: '',
    timeline: {
      kpiProgress: 0,
      progress25: '',
      progress50: '',
      progress75: '',
      progress100: ''
    }
  };

  createFormSections.value = [
    {
      title: 'KPI 정보',
      icon: 'fa-bullseye',
      layout: 'two-column',
      fields: [
        { label: '목표', key: 'goal', editable: true, type: 'input', required: true },
        { label: '목표 수치', key: 'goalValue', editable: true, type: 'number', required: true },
        { label: '진척도', key: 'kpiProgress', editable: false, type: 'number' },
        { label: '마감일', key: 'deadline', editable: true, type: 'date', required: true }
      ]
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
          editable: true,
          required: true
        }
      ]
    }
  ];

  isCreateModalOpen.value = true;
}

// KPI 등록 제출
async function submitKpiForm() {
  if (isSubmitting.value) return;

  const required = ['goal', 'goalValue', 'deadline'];
  const timelineFields = ['progress25', 'progress50', 'progress75', 'progress100'];
  const missing = required.some(field => !createForm.value[field]?.toString().trim()) ||
      timelineFields.some(field => !createForm.value.timeline?.[field]?.toString().trim());

  if (missing) {
    toast.error('필수 정보를 모두 입력해주세요.');
    return;
  }

  try {
    isSubmitting.value = true;

    const payload = {
      goal: createForm.value.goal,
      goalValue: createForm.value.goalValue,
      deadline: createForm.value.deadline,
      kpiProgress: 0,
      progress25: createForm.value.timeline?.progress25,
      progress50: createForm.value.timeline?.progress50,
      progress75: createForm.value.timeline?.progress75,
      progress100: createForm.value.timeline?.progress100
    };

    const result = await createMyKpi(payload);
    toast.success(result.message || 'KPI가 성공적으로 생성되었습니다.');
    isCreateModalOpen.value = false;
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('KPI 생성 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

// 초기 로딩
onMounted(() => {
  handleSearch(filterValues.value);
});

// 뒤로 가기 핸들러
function handleBack() {
  router.push({ path: '../kpi/employees' });
}

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