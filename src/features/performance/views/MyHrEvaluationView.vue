<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import {
  getEvaluationRounds,
  getMyHrEvaluations,
  getMyHrEvaluationDetail,
  submitHrObjection,
} from '@/features/performance/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';

const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const isRejecting = ref(false);
const createForm = ref({ reason: '' });
const formSections = ref([]);
const selectedRow = ref(null);
const roundOptions = ref([]);

const filterOptions = ref([
  {
    key: 'date',
    label: '평가일',
    icon: 'fa-calendar-day',
    type: 'date-range',
  }
]);

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

  return normalized;
}

async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10,
  };

  try {
    const res = await getMyHrEvaluations(params);

    // 항목이 하나뿐이면 factorScores를 해당 row에 주입
    const items = res.items ?? [];
    if (items.length === 1 && Array.isArray(res.factorScores)) {
      items[0].factorScores = res.factorScores;
    }

    tableData.value = items;

    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage || 1;
    pagination.value = { currentPage: current, totalPage: total };
  } catch (e) {
    console.error('인사 평가 내역 조회 실패:', e);
    tableData.value = [];
  }
}


const mappedTableData = computed(() =>
    tableData.value.map(row => {
      const baseRow = {
        ...row,
        evaluatedAt: row.evaluatedAt?.split('T')[0] ?? '',
      };

      // factorScores에서 각 propertyName을 key로, score를 값으로 병합
      if (row.factorScores) {
        row.factorScores.forEach(f => {
          baseRow[f.propertyName] = f.score;
        });
      }

      return baseRow;
    })
);

async function openModalHandler(row) {
  try {
    const res = await getMyHrEvaluationDetail(row.resultId);
    const { content, factorScores } = res;

    isOpen.value = true;
    isRejecting.value = false;
    createForm.value = { reason: '' };
    selectedRow.value = row;

    const baseSection = {
      title: '인사 평가 정보',
      icon: 'fa-clipboard-check',
      layout: 'two-column',
      fields: [
        { label: '회차', value: row.roundNo, type: 'input', editable: false },
        { label: '사원명', value: `${content.empName} (${content.empNo})`, type: 'input', editable: false },
        { label: '등급', value: content.overallGrade, type: 'input', editable: false },
        { label: '평가일', value: content.evaluatedAt?.split('T')[0], type: 'input', editable: false }
      ]
    };

    const radarSection = {
      title: '요인별 평가 결과',
      icon: 'fa-star-half-alt',
      layout: 'one-column',
      fields: [
        {
          label: '',
          type: 'radarChart',
          editable: false,
          value: {
            labels: factorScores.map(f => f.propertyName),
            scores: factorScores.map(f => f.score)
          }
        }
      ]
    };

    formSections.value = [baseSection, radarSection];
  } catch (err) {
    console.error('상세 조회 실패:', err);
    isOpen.value = false;
  }
}


function handleCancel() {
  isRejecting.value = false;
  createForm.value.reason = '';

  formSections.value = formSections.value.filter(
      section => section.title !== '이의제기 사유'
  );
}

function handleReject() {
  if (isRejecting.value) return;
  isRejecting.value = true;

  formSections.value.push({
    title: '이의제기 사유',
    icon: 'fa-comment-dots',
    layout: 'one-column',
    fields: [
      {
        label: '사유',
        type: 'textarea',
        key: 'reason',
        required: true,
        editable: true,
        placeholder: '이의제기 사유를 입력하세요.',
      },
    ],
  });
}

async function handleSubmit() {
  const reason = createForm.value.reason?.trim();
  if (!reason) {
    alert('이의제기 사유를 입력해주세요.');
    return;
  }
  console.log('제출 ID:', selectedRow.value?.resultId);
  console.log('제출 사유:', reason);

  try {
    await submitHrObjection(selectedRow.value.resultId, { reason });

    alert('이의제기가 성공적으로 제출되었습니다.');
    isOpen.value = false;
    isRejecting.value = false;
    createForm.value = { reason: '' };
  } catch (e) {
    console.error('이의제기 제출 실패:', e);
    alert('이의제기 제출에 실패했습니다.');
  }
}

watch(currentPage, () => handleSearch(filterValues.value));

onMounted(async () => {
  try {
    const res = await getEvaluationRounds({ page: 1, size: 100 }); // 최대 100개까지
    roundOptions.value = res.list.map(round => ({
      label: `${round.roundNo} 회`,
      value: round.roundNo
    }));
  } catch (e) {
    console.error('회차 목록 로딩 실패:', e);
  }

  handleSearch({});
});

</script>

<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '인사 평가 내역', to: '/hr/hr-list', active: true },
      ]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
          { key: 'roundNo', label: '회차' },
          { key: 'evaluatedAt', label: '평가일' },
          { key: '업무 수행 역량', label: '업무 수행 역량' },
          { key: '협업 역량', label: '협업 역량' },
          { key: '자기관리 및 태도', label: '자기 관리 및 태도' },
          { key: '성장 의지', label: '성장 의지' },
          { key: '조직 기여도', label: '조직 기여도' },
          { key: 'KPI 성과관리', label: 'KPI 성과 관리' },
          { key: 'overallGrade', label: '등급' },
          { key: 'action', label: '상세' }
        ]"
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
