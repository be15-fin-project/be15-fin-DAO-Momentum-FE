<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: 'KPI 요청 관리', to: '/kpi/requests', active: true }]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
        :tabs="tabOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="(row) => openModalHandler(row.kpiId)"
    />

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
        :showReject="canProgress"
        :reject-text="`반려`"
        :showSubmit="canProgress"
        :submit-text="`승인`"
        @close="isOpen = false"
        @submit="handleDetailModalSubmit"
        @reject="handleDetailModalReject"
        v-model:form="createForm"
    />

  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  getKpiDetail,
  getKpiRequests,
  approveKpi,
  approveKpiCancel
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast()

// ───────── 상태값 ─────────
const route = useRoute();
const currentPage = ref(1);
const filterValues = ref({ status: 'PENDING' });
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const formSections = ref([]);
const selectedKpiId = ref(null);
const createForm = ref({ reason: '' });
const editMode = ref(null);
const isSubmitting = ref(false);

// ───────── 필터 및 컬럼 옵션 ─────────
const tableColumns = [
  { key: 'profile', label: '#' },
  { key: 'employeeName', label: '사원명' },
  { key: 'departmentName', label: '부서' },
  { key: 'positionName', label: '직급' },
  { key: 'goal', label: '목표' },
  { key: 'goalValue', label: '목표 수치' },
  { key: 'kpiProgress', label: '진척도 (%)' },
  { key: 'createdAt', label: '작성일' },
  { key: 'deadline', label: '마감일' },
  { key: 'action', label: '상세' }
];

const filterOptions = [
  {
    key: 'empNo',
    label: '사번',
    icon: 'fa-id-badge',
    type: 'input',
    placeholder: '사번 입력'
  },
  {
    key: 'date',
    label: '작성일',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
];

const tabOptions = [
  { key: 'status', label: '대기', value: 'PENDING' },
  { key: 'status', label: '승인', value: 'ACCEPTED' },
  { key: 'status', label: '반려', value: 'REJECTED' },
  { key: 'status', label: '취소', value: 'CANCELLED' }
];

// ───────── computed ─────────
const canProgress = computed(() => {
  const detail = createForm.value;
  return detail.statusType === 'PENDING' && new Date(detail.deadline) > new Date();
});

// ───────── 필터 정규화 함수 ─────────
function normalizeFilter(values) {
  const result = { ...values };

  if (result.date_start) {
    result.startDate = result.date_start;
    delete result.date_start;
  }
  if (result.date_end) {
    result.endDate = result.date_end;
    delete result.date_end;
  }

  switch (values.status) {
    case 'ACCEPTED':
      result.statusId = 2;
      result.isDeleted = 'N';
      break;
    case 'REJECTED':
      result.statusId = 3;
      result.isDeleted = 'N';
      break;
    case 'CANCELLED':
      result.statusId = 2;
      result.isDeleted = 'Y';
      break;
    default:
      result.statusId = 1;
      break;
  }

  return result;
}

// ───────── KPI 목록 조회 ─────────
async function handleSearch(values) {
  const params = {
    ...normalizeFilter(values),
    empNo: values.empNo ?? route.query.empNo,
    page: currentPage.value,
    size: 10
  };

  try {
    const res = await getKpiRequests(params);
    tableData.value = res.data?.content ?? [];

    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage > 0 ? res.pagination.totalPage : 1;
    pagination.value = { currentPage: current, totalPage: total };
  } catch (err) {
    toast.error('KPI 요청 목록을 불러오지 못했습니다.');
  }
}

// ───────── KPI 상세 모달 열기 ─────────
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
      isDeleted: detail.isDeleted,
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
        outerClass: 'kpi-detail-section',
        fields: [
          {
            label: '진척도 타임라인',
            key: 'timeline',
            type: 'progressTimeline',
            editable: false
          }
        ]
      }
      ,
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
          {
            label: '처리 사유',
            key: 'reason',
            editable: true,
            type: 'textarea'
          },
          ...(detail.cancelReason
              ? [
                { label: '취소 신청 사유', key: 'cancelReason', editable: false, type: 'input' },
                { label: '취소 처리 사유', key: 'cancelResponse', editable: true, type: 'input' }
              ]
              : [])
        ]
      }
    ].filter(section => section.fields.length > 0);
  } catch (err) {
    toast.error('KPI 상세 정보를 불러오지 못했습니다.');
    isOpen.value = false;
  }
}

// ───────── 승인 / 반려 처리 ─────────
async function submitEditOrCancel(approved = true) {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    const { statusType, reason, isDeleted, cancelResponse } = createForm.value;
    const isCancelRequest = statusType === 'PENDING' && isDeleted === 'Y';
    const finalReason = isCancelRequest ? cancelResponse : reason;

    if (!approved && !finalReason?.trim()) {
      toast.error(isCancelRequest ? '취소 반려 사유를 입력해주세요.' : '반려 사유를 입력해주세요.');
      return;
    }

    const res = isCancelRequest
        ? await approveKpiCancel(selectedKpiId.value, approved, finalReason)
        : await approveKpi(selectedKpiId.value, approved, finalReason);

    const message = approved
        ? isCancelRequest ? 'KPI 취소 요청이 승인되었습니다.' : 'KPI 요청이 승인되었습니다.'
        : isCancelRequest ? 'KPI 취소 요청이 반려되었습니다.' : 'KPI 요청이 반려되었습니다.';

    toast.success(message);
    isOpen.value = false;
    editMode.value = null;
    await handleSearch(filterValues.value);
  } catch (err) {
    toast.error('KPI 요청 처리 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

// ───────── 모달 이벤트 핸들러 ─────────
function handleDetailModalSubmit() {
  submitEditOrCancel(true);
}

function handleDetailModalReject() {
  submitEditOrCancel(false);
}

// ───────── 생명주기 및 감시자 ─────────
onMounted(() => {
  handleSearch(filterValues.value);
});

watch(currentPage, () => {
  handleSearch(filterValues.value);
});
</script>


<style scoped>

</style>
