<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '평가 내역', to: '/eval/manage-peer', active: false },
        { label: '평가 회차', to: '/eval/round',  active: true  }
      ]"
        :submitButtons="[
        { label: '회차 등록', icon: 'fa-calendar-plus', event: 'create', variant: 'blue' }
      ]"
        :showTabs="false"
        @create="openCreateModal"
    />

    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
        { key: 'roundNo',          label: '회차 번호' },
        { key: 'startAt',          label: '시작일'   },
        { key: 'endAt',            label: '종료일'   },
        { key: 'participantCount', label: '참여 인원' },
        { key: 'statusLabel',           label: '상태'     },
        { key: 'action',           label: '상세'     }
      ]"
        :rows="tableData"
        @click-detail="openDetailModal"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <!-- 생성 모달 -->
    <SideModal
        :visible="isOpenCreate"
        title="평가 회차 등록"
        icon="fa-calendar-week"
        :sections="createFormSections"
        v-model:form="createFormModel"
        :showSubmit="true"
        submitText="제출"
        @submit="handleSubmit"
        @close="handleCloseCreateModal"
    />

    <!-- 상세/수정 모달 -->
    <SideModal
        :visible="isOpenDetail"
        title="평가 회차 상세"
        icon="fa-calendar-week"
        :sections="detailFormSections"
        v-model:form="detailFormModel"
        :readonly="detailMode==='view'"
        :showEdit="detailMode==='view' && detailStatus==='BEFORE'"
        editText="수정"
        :showReject="detailMode==='view' && detailStatus==='BEFORE'"
        rejectText="삭제"
        :showSubmit="detailMode==='edit'"
        submitText="제출"
        :showCancel="detailMode==='edit'"
        cancelText="취소"
        @edit="handleEdit"
        @reject="handleDelete"
        @submit="handleEditSubmit"
        @cancel="handleCancelEdit"
        @close="handleCloseDetailModal"
    />
  </main>
</template>

<script setup>
// ──────────────── Imports ────────────────
import { ref, onMounted, watch } from 'vue';
import {
  getEvaluationRounds,
  createEvaluationRound,
  deleteEvaluationRound,
  updateEvaluationRound,
  getHrEvaluationCriteria
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';
import { useToast } from 'vue-toastification';
import DeleteConfirmToast from '@/components/common/DeleteConfirmToast.vue';

const toast = useToast()

const showDeleteConfirm = () => {
  return new Promise((resolve) => {
    const id = toast(
        {
          component: DeleteConfirmToast,
          props: {
            toastId: '', // placeholder
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

    // update to inject the correct toastId
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


// ──────────────── 상태 변수 ────────────────
const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const roundStatusOptions = [
  { label: '전체', value: null },
  { label: '대기', value: 'BEFORE' },
  { label: '진행 중', value: 'IN_PROGRESS' },
  { label: '진행 완료', value: 'DONE' }
];

const filterOptions = [
  {
    key: 'status',
    label: '상태',
    icon: 'fa-circle-half-stroke',
    type: 'select',
    options: roundStatusOptions.map(o => o.label)
  },
  {
    key: 'date',
    label: '기간',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
];

// ──────────────── 생성 모달 ────────────────
const isOpenCreate = ref(false);
const createFormModel = ref({});
const createFormSections = ref([]);

// ──────────────── 상세/수정 모달 ────────────────
const isOpenDetail = ref(false);
const detailFormModel = ref({});
const detailFormSections = ref([]);
const selectedRoundId = ref(null);
const detailMode = ref('view'); // 'view' | 'edit'
const detailStatus = ref();
let origDetailModel = null;

// ──────────────── 유틸 ────────────────
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const normalizeFilterParams = (values) => {
  const params = {};
  if (values.date_start) params.startDate = values.date_start;
  if (values.date_end) params.endDate = values.date_end;
  const sel = roundStatusOptions.find(o => o.label === values.status);
  if (sel?.value) params.status = sel.value;
  return params;
};

// ──────────────── 평가 회차 목록 조회 ────────────────
const handleSearch = async (values) => {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10
  };

  try {
    const res = await getEvaluationRounds(params);
    tableData.value = (res.list || []).map(item => ({
      ...item,
      statusLabel: roundStatusOptions.find(o => o.value === item.status)?.label || item.status
    }));

    const p = res.pagination || {};
    pagination.value = {
      currentPage: p.currentPage || 1,
      totalPage: p.totalPage || 1
    };
  } catch (err) {
    toast.error('모든 항목을 입력해주세요.');
    tableData.value = [];
  }
};

watch(currentPage, () => handleSearch(filterValues.value));
onMounted(() => handleSearch({}));

// ──────────────── 회차 등록 ────────────────
const openCreateModal = () => {
  isOpenCreate.value = true;
  const today = new Date();
  const start = formatDate(today);
  const end = formatDate(addDays(today, 7));

  createFormModel.value = {
    roundNo: null,
    startAt: start,
    endAt: end,
    weightSegments: [20, 20, 20, 15, 15, 10],
    gradeRatios: [10, 20, 30, 20, 20]
  };

  createFormSections.value = [
    {
      title: '회차 정보',
      icon: 'fa-calendar-plus',
      layout: 'two-column',
      fields: [
        { label: '회차 번호', key: 'roundNo', type: 'number', editable: true, required: true },
        { label: '시작일', key: 'startAt', type: 'date', editable: true, required: true },
        { label: '종료일', key: 'endAt', type: 'date', editable: false, required: true }
      ]
    },
    {
      title: '항목 가중치 (%)',
      icon: 'fa-weight-hanging',
      layout: 'one-column',
      fields: [{
        key: 'weightSegments',
        type: 'sliderGroup',
        initial: createFormModel.value.weightSegments,
        modelValue: createFormModel.value.weightSegments,
        'onUpdate:modelValue': (val) => createFormModel.value.weightSegments = val,
        labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
        icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
        editable: true
      }]
    },
    {
      title: '등급 비율 (%)',
      icon: 'fa-percent',
      layout: 'one-column',
      fields: [{
        key: 'gradeRatios',
        type: 'sliderGroup',
        initial: createFormModel.value.gradeRatios,
        modelValue: createFormModel.value.gradeRatios,
        'onUpdate:modelValue': (val) => createFormModel.value.gradeRatios = val,
        labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
        icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
        editable: true
      }]
    }
  ];

};

const handleSubmit = async () => {
  const { roundNo, startAt, endAt, weightSegments, gradeRatios } = createFormModel.value;

  // 필수값 유효성 검사
  if (
      !roundNo ||
      !startAt ||
      !endAt ||
      !Array.isArray(weightSegments) || weightSegments.length !== 6 ||
      !Array.isArray(gradeRatios) || gradeRatios.length !== 5
  ) {
    toast.error('모든 항목을 입력해주세요.');
    return;
  }

  const payload = {
    roundNo,
    startAt,
    endAt,
    performWt: weightSegments[0],
    teamWt: weightSegments[1],
    attitudeWt: weightSegments[2],
    growthWt: weightSegments[3],
    engagementWt: weightSegments[4],
    resultWt: weightSegments[5],
    rateS: gradeRatios[0],
    rateA: gradeRatios[1],
    rateB: gradeRatios[2],
    rateC: gradeRatios[3],
    rateD: gradeRatios[4]
  };

  try {
    await createEvaluationRound(payload);
    toast.success('등록이 완료되었습니다.');
    isOpenCreate.value = false;
    await handleSearch(filterValues.value);
  } catch (err) {
    toast.error(err.response?.data?.message || '저장에 실패하였습니다.');
  }
};

const handleCloseCreateModal = () => {
  isOpenCreate.value = false;
};


// ──────────────── 상세/수정 모달 ────────────────
const makeDetailSections = (editable = false) => [
  {
    title: '회차 정보',
    icon: 'fa-calendar-alt',
    layout: 'two-column',
    fields: [
      { label: '회차 번호', key: 'roundNo', type: 'number', editable },
      { label: '참여 인원', key: 'participantCount', type: 'number', editable: false },
      { label: '시작일', key: 'startAt', type: 'date', editable },
      { label: '종료일', key: 'endAt', type: 'date', editable: false }
    ]
  },
  {
    title: '등급 비율 (%)',
    icon: 'fa-percent',
    layout: 'one-column',
    fields: [{
      key: 'gradeRatios',
      type: 'sliderGroup',
      handles: detailFormModel.value.gradeRatios.length - 1,
      initial: detailFormModel.value.gradeRatios,
      labels: ['S', 'A', 'B', 'C', 'D'],
      icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
      editable
    }]
  },
  {
    title: '항목 가중치 (%)',
    icon: 'fa-weight-hanging',
    layout: 'one-column',
    fields: [{
      key: 'weightSegments',
      type: 'sliderGroup',
      handles: detailFormModel.value.weightSegments.length - 1,
      initial: detailFormModel.value.weightSegments,
      labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
      icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
      editable
    }]
  }
];

const openDetailModal = async (row) => {
  isOpenDetail.value = true;
  selectedRoundId.value = row.roundId;
  detailMode.value = 'view';
  detailStatus.value = row.status;

  try {
    const { rateInfo, weightInfo } = await getHrEvaluationCriteria(row.roundNo);

    detailFormModel.value = {
      roundNo: row.roundNo,
      participantCount: row.participantCount,
      startAt: row.startAt,
      endAt: row.endAt,
      gradeRatios: [rateInfo.rateS, rateInfo.rateA, rateInfo.rateB, rateInfo.rateC, rateInfo.rateD],
      weightSegments: [
        weightInfo.weightPerform,
        weightInfo.weightTeam,
        weightInfo.weightAttitude,
        weightInfo.weightGrowth,
        weightInfo.weightEngagement,
        weightInfo.weightResult
      ]
    };

    origDetailModel = JSON.parse(JSON.stringify(detailFormModel.value));
    detailFormSections.value = makeDetailSections(false);
  } catch (err) {
    toast.error('평가 기준 정보를 불러오지 못했습니다.');
  }
};

const handleEdit = () => {
  detailMode.value = 'edit';
  detailFormSections.value = makeDetailSections(true);
};

const handleCancelEdit = () => {
  detailFormModel.value = JSON.parse(JSON.stringify(origDetailModel));
  detailFormSections.value = makeDetailSections(false);
  detailMode.value = 'view';
};

const handleCloseDetailModal = () => {
  if (detailMode.value === 'edit') {
    handleCancelEdit();
  }
  isOpenDetail.value = false;
};

const handleEditSubmit = async () => {
  const { roundNo, startAt, gradeRatios, weightSegments } = detailFormModel.value;
  const endAt = formatDate(addDays(new Date(startAt), 7));

  const payload = {
    roundNo,
    startAt,
    endAt,
    performWt: weightSegments[0],
    teamWt: weightSegments[1],
    attitudeWt: weightSegments[2],
    growthWt: weightSegments[3],
    engagementWt: weightSegments[4],
    resultWt: weightSegments[5],
    rateS: gradeRatios[0],
    rateA: gradeRatios[1],
    rateB: gradeRatios[2],
    rateC: gradeRatios[3],
    rateD: gradeRatios[4]
  };

  try {
    await updateEvaluationRound(selectedRoundId.value, payload);
    toast.success('수정이 완료되었습니다.');
    detailMode.value = 'view';
    await handleSearch(filterValues.value);
  } catch (err) {
    toast.error(err.response?.data?.message || '수정 처리 중 오류가 발생했습니다.');
  }
};

const handleDelete = async () => {
  const confirmed = await showDeleteConfirm();
  if (!confirmed) return;

  try {
    await deleteEvaluationRound(selectedRoundId.value);
    toast.success('삭제가 완료되었습니다.');
    isOpenDetail.value = false;
    await handleSearch(filterValues.value);
  } catch (err) {
    toast.error('삭제 처리 중 오류가 발생했습니다.');
  }
};

// 종료일 자동 계산
watch(() => detailFormModel.value.startAt, (newDate) => {
  if (detailMode.value === 'edit') {
    detailFormModel.value.endAt = formatDate(addDays(new Date(newDate), 7));
  }
});
</script>
