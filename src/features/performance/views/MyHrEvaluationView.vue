<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: '인사 평가 내역', to: '/hr/hr-list', active: true }]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
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
        title="인사 평가 상세 정보"
        icon="fa-star-half-stroke"
        :sections="formSections"
        :showReject="!isRejecting && !selectedRow?.objectionSubmitted"
        :showSubmit="isRejecting"
        :showCancel="isRejecting"
        :submitText="'제출'"
        :rejectText="'이의제기'"
        @close="isOpen = false"
        @submit="handleSubmit"
        @reject="handleReject"
        @cancel="handleCancel"
        v-model:form="createForm"
    />
  </main>
</template>

<script setup>
/* ========== Import ========== */
import { ref, onMounted, computed, watch } from 'vue';
import {
  getEvaluationRounds,
  getMyHrEvaluations,
  getEvaluationRoundNos,
  getMyHrEvaluationDetail,
  submitHrObjection,
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast()

/* ========== State ========== */
const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const isRejecting = ref(false);
const createForm = ref({ reason: '' });
const formSections = ref([]);
const selectedRow = ref(null);

const roundList = ref([]);
const filterOptions = ref([]);

const tableColumns = [
  { key: 'roundNo', label: '회차' },
  { key: 'evaluatedAt', label: '평가일' },
  { key: '업무 수행 역량', label: '업무 수행 역량' },
  { key: '협업 역량', label: '협업 역량' },
  { key: '자기관리 및 태도', label: '자기 관리 및 태도' },
  { key: '성장 의지', label: '성장 의지' },
  { key: '조직 기여도', label: '조직 기여도' },
  { key: 'KPI 성과관리', label: 'KPI 성과 관리' },
  { key: 'overallGrade', label: '등급' },
  { key: 'action', label: '상세' },
];

/* ========== Computed ========== */
const mappedTableData = computed(() => tableData.value.map(row => {
  const baseRow = { ...row, evaluatedAt: row.evaluatedAt?.split('T')[0] ?? '' };
  row.factorScores?.forEach(f => baseRow[f.propertyName] = f.score);
  return baseRow;
}));

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
  return normalized;
};

/* ========== Actions ========== */
const handleSearch = async (values) => {
  const params = { ...normalizeFilterParams(values), page: currentPage.value, size: 10 };
  try {
    const res = await getMyHrEvaluations(params);
    const items = res.items ?? [];
    if (items.length === 1 && Array.isArray(res.factorScores)) {
      items[0].factorScores = res.factorScores;
    }
    tableData.value = items;
    pagination.value = {
      currentPage: res.pagination?.currentPage || 1,
      totalPage: res.pagination?.totalPage || 1,
    };
  } catch (e) {
    toast.error('인사 평가 목록 조회에 실패했습니다.');
    tableData.value = [];
  }
};

const openModalHandler = async (row) => {
  try {
    const res = await getMyHrEvaluationDetail(row.resultId);
    const { content, factorScores, weightInfo, rateInfo } = res;

    selectedRow.value = row;
    isOpen.value = true;
    isRejecting.value = false;
    createForm.value = { reason: '' };

    formSections.value = [
      {
        title: '인사 평가 정보',
        icon: 'fa-clipboard-check',
        layout: 'two-column',
        fields: [
          { label: '회차', value: row.roundNo, type: 'input', editable: false },
          { label: '사원명', value: `${content.empName} (${content.empNo})`, type: 'input', editable: false },
          { label: '등급', value: content.overallGrade, type: 'input', editable: false },
          { label: '평가일', value: content.evaluatedAt?.split('T')[0], type: 'input', editable: false },
        ]
      },
      {
        title: '요인별 평가 결과',
        icon: 'fa-star-half-alt',
        layout: 'one-column',
        fields: [{
          label: '',
          type: 'radarChart',
          editable: false,
          value: {
            labels: factorScores.map(f => f.propertyName),
            scores: factorScores.map(f => f.score),
          }
        }]
      },
      {
        title: '항목 가중치 (%)',
        icon: 'fa-weight-hanging',
        layout: 'one-column',
        fields: [{
          key: 'weightSegments',
          type: 'sliderGroup',
          initial: [
            weightInfo?.weightPerform, weightInfo?.weightTeam, weightInfo?.weightAttitude,
            weightInfo?.weightGrowth, weightInfo?.weightEngagement, weightInfo?.weightResult
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
          initial: [rateInfo?.rateS, rateInfo?.rateA, rateInfo?.rateB, rateInfo?.rateC, rateInfo?.rateD],
          labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
          icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
          editable: false
        }]
      }
    ];
  } catch (e) {
    toast.error('상세 정보를 불러오지 못했습니다.');
    isOpen.value = false;
  }
};

const handleReject = () => {
  if (isRejecting.value) return;
  isRejecting.value = true;
  formSections.value.push({
    title: '이의제기 사유',
    icon: 'fa-comment-dots',
    layout: 'one-column',
    fields: [{
      label: '사유',
      type: 'textarea',
      key: 'reason',
      required: true,
      editable: true,
      placeholder: '이의제기 사유를 입력하세요.',
    }],
  });
};

const handleCancel = () => {
  isRejecting.value = false;
  createForm.value.reason = '';
  formSections.value = formSections.value.filter(section => section.title !== '이의제기 사유');
};

const handleSubmit = async () => {
  const reason = createForm.value.reason?.trim();
  if (!reason) return toast.error('이의제기 사유를 입력해주세요.');
  try {
    await submitHrObjection(selectedRow.value.resultId, { reason });
    toast.success('이의제기가 성공적으로 제출되었습니다.');
    isOpen.value = false;
    isRejecting.value = false;
    createForm.value = { reason: '' };
  } catch (e) {
    toast.error('이의제기 제출에 실패했습니다.');
  }
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
};

/* ========== Lifecycle ========== */
watch(currentPage, () => handleSearch(filterValues.value));

onMounted(async () => {
  try {
    await getEvaluationRounds({ page: 1, size: 100 }); // Round 리스트 미리 호출
    await fetchRoundNos();
    initFilters();
    await handleSearch({});
  } catch (e) {
    toast.error('초기화 중 오류가 발생했습니다.');
  }
});
</script>
