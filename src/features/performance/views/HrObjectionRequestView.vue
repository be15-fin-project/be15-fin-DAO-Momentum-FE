<template>
  <main>
    <HeaderWithTabs
        :headerItems="headerTabs"
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
        :rows="mappedTableData"
        @click-detail="openModalHandler"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <SideModal
        :visible="isOpen"
        title="이의 제기 상세 정보"
        icon="fa-star-half-stroke"

        :showReject="!isEditing && isPending"
        :showSubmit="(!isEditing && isPending) || isSubmit"
        :showCancel="isSubmit"

        :submitText="isSubmit ? '처리' : '승인'"
        :rejectText="isEditing ? '취소' : '반려'"

        @submit="onSubmit"
        @reject="onReject"
        @cancel="handleCancel"
        @close="handleClose"

        v-model:form="createForm"
        :sections="formSections"
    />


  </main>
</template>

<script setup>
/* ========== Import ========== */
import { ref, onMounted, computed, watch } from 'vue';
import {
  getEvaluationRounds,
  getEvaluationRoundNos,
  getHrObjectionRequests,
  getHrObjectionRequestDetail,
  processHrObjection,
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';

import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.js';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';

const toast = useToast()

/* ========== State ========== */
const currentPage = ref(1);
const filterValues = ref({ status: 'PENDING' });
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const isRejecting = ref(false);
const createForm = ref({ reason: '' });
const formSections = ref([]);
const selectedRow = ref(null);

const roundList = ref([]);
const filterOptions = ref([]);
const tabOptions = ref([]);

const route = useRoute();
const authStore = useAuthStore();
const { userRole } = storeToRefs(authStore);

const isSubmit = ref(false); // 승인 시 사용
const isEditing = ref(false); // 승인/반려 공통
const isApproval = ref(); // true면 승인, false면 반려

const selectedContent = ref(null);
const selectedFactorScores = ref([]);
const selectedWeightInfo = ref(null);
const selectedRateInfo = ref(null);



const tableColumns = [
  { key: 'roundNo', label: '회차' },
  { key: 'statusType', label: '상태' },
  { key: 'createdAt', label: '평가일' },
  { key: 'score', label: '점수' },
  { key: 'action', label: '상세' },
];

const isPending = computed(() => {
  const status = selectedRow.value?.statusType ?? '';
  return status === '대기 중' || status === 'PENDING' || status === getStatusLabel('PENDING');
});


/* ========== Computed ========== */
const mappedTableData = computed(() =>
    tableData.value.map(row => ({
      ...row,
      createdAt: row.createdAt?.split(' ')[0] ?? '',
      statusType: getStatusLabel(row.status),
      statusHtml: getStatusWithIcon(row.status),
    }))
);


/* ========== Util ========== */
const normalizeFilterParams = (values) => {
  const normalized = { ...values };
  if (normalized.roundNo === '전체') normalized.roundNo = null;
  if (normalized.roundNo != null) normalized.roundId = Number(normalized.roundNo);
  delete normalized.roundNo;

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }
  switch (normalized.status) {
    case 'ACCEPTED':
      normalized.statusId = 2;
      normalized.isDeleted = 'N';
      break;
    case 'REJECTED':
      normalized.statusId = 3;
      normalized.isDeleted = 'N';
      break;
    default:
      normalized.statusId = 1;
      normalized.isDeleted = 'N';
  }
  delete normalized.status;

  return normalized;
};

/* ========== Actions ========== */
const headerTabs = computed(() => {
  const tabs = [
    { label: '이의 제기 내역', to: '/hr/my-objection', active: route.path === '/hr/my-objection' }
  ];
  if (userRole.value.includes('MANAGER')) {
    tabs.push({ label: '이의 제기 요청', to: '/hr/objection-requests', active: route.path === '/hr/objection-requests' });
  }
  return tabs;
});

const handleSearch = async (values) => {
  const params = { ...normalizeFilterParams(values), page: currentPage.value, size: 10 };

  try {
    const res = await getHrObjectionRequests(params);

    const items = res.list ?? [];
    if (items.length === 1 && Array.isArray(res.factorScores)) {
      items[0].factorScores = res.factorScores;
    }
    tableData.value = items;
    pagination.value = {
      currentPage: res.pagination?.currentPage || 1,
      totalPage: res.pagination?.totalPage || 1,
    };
  } catch (e) {
    toast.error('이의제기 목록을 불러오지 못했습니다.');
    tableData.value = [];
  }
};

const openModalHandler = async (row) => {
  try {
    const { itemDto: content, factorScores, weightInfo, rateInfo } = await getHrObjectionRequestDetail(row.objectionId);

    isSubmit.value = false;
    isEditing.value = false;
    isApproval.value = false;
    isRejecting.value = false;

    selectedRow.value = row;
    isOpen.value = true;
    isRejecting.value = false;
    createForm.value = { reason: '' };

    const enrichedContent = {
      ...content,
      roundNo: row.roundNo ?? content.roundNo,
      overallGrade: row.score ?? content.overallGrade,
      statusType: row.statusType ?? content.statusType,
    };

    selectedContent.value = enrichedContent;
    selectedFactorScores.value = factorScores;
    selectedWeightInfo.value = weightInfo;
    selectedRateInfo.value = rateInfo;

    formSections.value = buildFormSections(enrichedContent, factorScores, weightInfo, rateInfo);

  } catch (e) {
    toast.error('상세 정보를 불러오지 못했습니다.');
    isOpen.value = false;
  }
};


const onSubmit = () => {
  if (isSubmit.value) {
    handleSubmit();
  } else {
    handleSubmitClick();
  }
};

const onReject = () => {
  if (isEditing.value) {
    handleCancel();
  } else {
    handleReject();
  }
};

const handleReject = () => {
  isEditing.value = true;
  isApproval.value = false;
  isSubmit.value = true;
  formSections.value = buildFormSections(selectedContent.value, selectedFactorScores.value, selectedWeightInfo.value, selectedRateInfo.value, true, false);
};

const handleSubmitClick = () => {
  isEditing.value = true;
  isApproval.value = true;
  isSubmit.value = true;
  formSections.value = buildFormSections(selectedContent.value, selectedFactorScores.value, selectedWeightInfo.value, selectedRateInfo.value, true, true);
};

const handleCancel = () => {
  isEditing.value = false;
  isApproval.value = false;
  isSubmit.value = false;
  createForm.value = { reason: '' };
  openModalHandler(selectedRow.value); // 값 초기화
};


const handleSubmit = async () => {
  if (!selectedRow.value) return;

  const reasonField = formSections.value
      .find(s => s.title === '이의제기 현황')?.fields
      .find(f => f.key === 'reason');

  const reason = createForm.value.reason || '';

  const payload = {
    objectionId: selectedRow.value.objectionId,
    approved: isApproval.value,
    rejectReason: reason,
  };

  if (isApproval.value) {
    const factorSection = formSections.value.find(s => s.title === '요인별 평가 결과');
    const scoreField = factorSection?.fields?.find(f => f.type === 'scoreChart');

    payload.factorScores = scoreField?.value?.map(f => ({
      propertyId: f.propertyId,
      score: f.score
    })) || [];
  }

  try {
    await processHrObjection(payload);
    toast.success(isApproval.value ? '승인 처리되었습니다.' : '반려 처리되었습니다.');
    isOpen.value = false;
    await handleSearch(filterValues.value);
  } catch (e) {
    toast.error('이의제기 처리 중 오류가 발생했습니다.');
  }
};


const handleClose = () => {
  isOpen.value = false;

  // 상태 리셋
  isEditing.value = false;
  isSubmit.value = false;
  isApproval.value = false;
  isRejecting.value = false;
  createForm.value = { reason: '' };
  selectedContent.value = null;
  selectedFactorScores.value = [];
  selectedWeightInfo.value = null;
  selectedRateInfo.value = null;
  formSections.value = [];
};



const fetchRoundNos = async () => {
  roundList.value = await getEvaluationRoundNos();
};

const initFilters = () => {
  filterOptions.value = [
    {
      key: 'roundNo',
      label: '회차',
      icon: 'fa-list-ol',
      type: 'select',
      options: ['전체', ...roundList.value.map(r => ({ label: `${r.roundNo} 회차`, value: r.roundNo }))],
    },
    {
      key: 'date',
      label: '평가일',
      icon: 'fa-calendar-day',
      type: 'date-range',
    }
  ];
  tabOptions.value = [
    { key: 'status', label: '대기', value: 'PENDING' },
    { key: 'status', label: '승인', value: 'ACCEPTED' },
    { key: 'status', label: '반려', value: 'REJECTED' }
  ];

};

function getStatusLabel(statusType) {
  switch (statusType) {
    case 'PENDING':
      return '대기 중';
    case 'ACCEPTED':
      return '승인됨';
    case 'REJECTED':
      return '반려됨';
    default:
      return '-';
  }
}

function getStatusWithIcon(statusType) {
  switch (statusType) {
    case 'PENDING':
      return '<i class="fas fa-hourglass-half" style="color: #999; margin-right: 6px;"></i> 대기 중';
    case 'ACCEPTED':
      return '<i class="fas fa-circle-check" style="color: #4caf50; margin-right: 6px;"></i> 승인됨';
    case 'REJECTED':
      return '<i class="fas fa-circle-xmark" style="color: #f44336; margin-right: 6px;"></i> 반려됨';
    default:
      return '-';
  }
}

function buildFormSections(content, factorScores, weightInfo, rateInfo, editable = false, approvalMode = false) {
  return [
    {
      title: '인사 평가 정보',
      icon: 'fa-clipboard-check',
      layout: 'two-column',
      fields: [
        { label: '회차', value: content.roundNo, type: 'input', editable: false },
        { label: '사원명', value: `${content.empName} (${content.empNo})`, type: 'input', editable: false },
        { label: '점수', value: content.overallGrade, type: 'input', editable: false },
        { label: '평가일', value: content.evaluatedAt?.split(' ')[0], type: 'input', editable: false },
      ]
    },
    {
      title: '요인별 평가 결과',
      icon: 'fa-star-half-alt',
      layout: 'one-column',
      fields: [
        {
          type: 'scoreChart',
          value: factorScores.map(f => ({ label: f.propertyName, score: f.score, propertyId: f.propertyId })),
          editable: editable && approvalMode,
        }
      ],
    },
    {
      title: '항목 가중치 (%)',
      icon: 'fa-weight-hanging',
      layout: 'one-column',
      fields: [{
        key: 'weightSegments',
        type: 'sliderGroup',
        initial: [
          weightInfo?.weightPerform,
          weightInfo?.weightTeam,
          weightInfo?.weightAttitude,
          weightInfo?.weightGrowth,
          weightInfo?.weightEngagement,
          weightInfo?.weightResult
        ],
        labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
        icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
        editable: false
      }]
    },
    {
      title: '등급 비율 (%)',
      icon: 'fa-percent',
      layout: 'one-column',
      fields: [{
        key: 'gradeRatios',
        type: 'sliderGroup',
        initial: [
          rateInfo?.rateS,
          rateInfo?.rateA,
          rateInfo?.rateB,
          rateInfo?.rateC,
          rateInfo?.rateD
        ],
        labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
        icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
        editable: false
      }]
    },
    {
      title: '이의제기 현황',
      icon: 'fa-comments',
      layout: 'one-column',
      fields: [
        {
          label: '이의제기 사유',
          value: content.objectionReason,
          type: 'textarea',
          editable: false,
        },
        {
          label: '처리 사유',
          key: 'reason',
          value: content.responseReason || '',
          type: 'textarea',
          editable: editable,
        },
        {
          label: '처리 상태',
          value: getStatusWithIcon(content.statusType),
          type: 'input',
          editable: false,
        }
      ]
    }
  ];
}


/* ========== Lifecycle ========== */
watch(currentPage, () => handleSearch(filterValues.value));

onMounted(async () => {
  try {
    await getEvaluationRounds({ page: 1, size: 100 }); // Round 리스트 미리 호출
    await fetchRoundNos();
    initFilters();
    await handleSearch(filterValues.value);
  } catch (e) {
    console.error('초기 로딩 실패:', e);
  }
});
</script>
