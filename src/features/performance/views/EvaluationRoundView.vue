<script setup>
// Vue
import {ref, onMounted, watch} from 'vue';
import {
  getEvaluationRounds,
  createEvaluationRound,
  deleteEvaluationRound,
  getHrEvaluationCriteria,
  updateEvaluationRound
} from '@/features/performance/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';

const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({currentPage: 1, totalPage: 1});

const isOpenCreate = ref(false);
const createFormModel = ref({});
const createFormSections = ref([]);

const isOpenDetail = ref(false);
const detailFormModel = ref({});
const detailFormSections = ref([]);
const selectedRoundId = ref(null);
const detailMode = ref('view');
const detailStatus = ref();
let origDetailModel = null;

const roundStatusOptions = [
  {label: '전체', value: null},
  {label: '대기', value: 'BEFORE'},
  {label: '진행 중', value: 'IN_PROGRESS'},
  {label: '진행 완료', value: 'DONE'}
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

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function normalizeFilterParams(values) {
  const params = {};
  if (values.date_start) params.startDate = values.date_start;
  if (values.date_end) params.endDate = values.date_end;
  const sel = roundStatusOptions.find(o => o.label === values.status);
  if (sel) params.status = sel.value;
  return params;
}

async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10
  };
  try {
    const res = await getEvaluationRounds(params);
    tableData.value = (res.list || []).map(item => {
      const label = roundStatusOptions.find(o => o.value === item.status)?.label;
      return {
        ...item,
        statusLabel: roundStatusOptions.find(o => o.value === item.status)?.label || item.status,
        status: item.status
      };
    });
    const p = res.pagination || {};
    pagination.value = {
      currentPage: p.currentPage || 1,
      totalPage: p.totalPage || 1
    };
  } catch
      (err) {
    console.error('회차 조회 실패:', err);
    tableData.value = [];
  }
}

watch(currentPage, () => handleSearch(filterValues.value));
onMounted(() => handleSearch({}));

// ——— 생성 모달 ———
function openCreateModal() {
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
        {label: '회차 번호', key: 'roundNo', type: 'number', editable: true},
        {label: '시작일', key: 'startAt', type: 'date', editable: true},
        {label: '종료일', key: 'endAt', type: 'date', editable: false}
      ]
    },
    {
      title: '항목 가중치 (%)',
      icon: 'fa-weight-hanging',
      layout: 'one-column',
      fields: [
        {
          key: 'weightSegments',
          type: 'sliderGroup',
          initial: createFormModel.value.weightSegments,
          labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
          icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
          editable: true
        }
      ]
    },
    {
      title: '등급 비율 (%)',
      icon: 'fa-percent',
      layout: 'one-column',
      fields: [
        {
          key: 'gradeRatios',
          type: 'sliderGroup',
          initial: createFormModel.value.gradeRatios,
          labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
          icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
          editable: true
        }
      ]
    }
  ];
}

async function handleSubmit() {
  const {
    roundNo,
    startAt,
    endAt,
    weightSegments = [],
    gradeRatios = []
  } = createFormModel.value;

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
    alert('등록 완료');
    isOpenCreate.value = false;
    await handleSearch(filterValues.value);
  } catch (err) {
    console.error('저장 실패:', err);
    alert(err.response?.data?.message || '저장 실패');
  }
}

function handleCloseCreateModal() {
  isOpenCreate.value = false;
}

// ——— 상세 모달 ———
function makeDetailSections(editable = false) {
  return [
    {
      title: '회차 정보',
      icon: 'fa-calendar-alt',
      layout: 'two-column',
      fields: [
        {label: '회차 번호', key: 'roundNo', type: 'number', editable},
        {label: '참여 인원', key: 'participantCount', type: 'number', editable: false},
        {label: '시작일', key: 'startAt', type: 'date', editable},
        {label: '종료일', key: 'endAt', type: 'date', editable: false}
      ]
    },
    {
      title: '등급 비율 (%)',
      icon: 'fa-percent',
      layout: 'one-column',
      fields: [
        {
          key: 'gradeRatios',
          type: 'sliderGroup',
          handles: detailFormModel.value.gradeRatios.length - 1,
          initial: detailFormModel.value.gradeRatios,
          labels: ['S', 'A', 'B', 'C', 'D'],
          icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
          editable
        }
      ]
    },
    {
      title: '항목 가중치 (%)',
      icon: 'fa-weight-hanging',
      layout: 'one-column',
      fields: [
        {
          key: 'weightSegments',
          type: 'sliderGroup',
          handles: detailFormModel.value.weightSegments.length - 1,
          initial: detailFormModel.value.weightSegments,
          labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
          icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
          editable
        }
      ]
    }
  ];
}

async function openDetailModal(row) {
  isOpenDetail.value = true;
  selectedRoundId.value = row.roundId;
  detailMode.value = 'view';
  detailStatus.value = row.status;

  try {
    const {rateInfo, weightInfo} = await getHrEvaluationCriteria(row.roundNo);

    detailFormModel.value = {
      roundNo: row.roundNo,
      participantCount: row.participantCount,
      startAt: row.startAt,
      endAt: row.endAt,
      gradeRatios: [
        rateInfo.rateS, rateInfo.rateA, rateInfo.rateB,
        rateInfo.rateC, rateInfo.rateD
      ],
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
    console.error('상세 조회 실패:', err);
    alert('평가 기준 정보를 불러오지 못했습니다.');
  }
}

function handleEdit() {
  detailMode.value = 'edit';
  detailFormSections.value = makeDetailSections(true);
}

function handleCancelEdit() {
  detailFormModel.value = JSON.parse(JSON.stringify(origDetailModel));
  detailFormSections.value = makeDetailSections(false);
  detailMode.value = 'view';
}

function handleCloseDetailModal() {
  if (detailMode.value === 'edit') {
    detailFormModel.value = JSON.parse(JSON.stringify(origDetailModel));
    detailMode.value = 'view';
  }
  isOpenDetail.value = false;
}

async function handleEditSubmit() {
  const {roundNo, startAt, gradeRatios, weightSegments} = detailFormModel.value;
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
    await updateEvaluationRound(payload);
    alert('수정 완료');
    detailMode.value = 'view';
    await handleSearch(filterValues.value);
  } catch (err) {
    console.error('수정 실패:', err);
    alert(err.response?.data?.message || '수정 실패');
  }
}

async function handleDelete() {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteEvaluationRound(selectedRoundId.value);
    alert('삭제 완료');
    isOpenDetail.value = false;
    await handleSearch(filterValues.value);
  } catch (err) {
    console.error('삭제 실패:', err);
    alert('삭제 실패');
  }
}

watch(() => detailFormModel.value.startAt, (newDate) => {
  if (detailMode.value === 'edit') {
    detailFormModel.value.endAt = formatDate(addDays(new Date(newDate), 7));
  }
});
</script>


<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '평가 내역', to: '/eval/manage-peer', active: false },
        { label: '평가 회차', to: '/eval/round',  active: true  }
      ]"
        :submitButtons="[
        { label: '회차 등록', icon: 'fa-file-signature', event: 'create', variant: 'blue' }
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
