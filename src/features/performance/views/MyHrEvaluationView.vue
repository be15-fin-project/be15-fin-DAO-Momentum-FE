<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import {
  getMyHrEvaluations,
  getMyHrEvaluationDetail,
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
const formSections = ref([]);
const selectedRow = ref(null);

// 필터 옵션: 회차/등급 등 추후 확장 가능
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
    tableData.value = res.items ?? [];

    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage || 1;
    pagination.value = { currentPage: current, totalPage: total };
  } catch (e) {
    console.error('인사 평가 내역 조회 실패:', e);
    tableData.value = [];
  }
}

const mappedTableData = computed(() =>
    tableData.value.map(row => ({
      ...row,
      evaluatedAt: row.evaluatedAt?.split('T')[0] ?? '',
    }))
);

async function openModalHandler(row) {
  try {
    const res = await getMyHrEvaluationDetail(row.resultId);
    const { overallGrade, factorScores } = res;

    const baseSection = {
      title: '인사 평가 정보',
      icon: 'fa-clipboard-check',
      layout: 'two-column',
      fields: [
        { label: '회차', value: row.roundNo, type: 'input', editable: false },
        { label: '등급', value: overallGrade, type: 'input', editable: false },
        { label: '평가일', value: row.evaluatedAt, type: 'input', editable: false },
      ]
    };

    const scoreSection = {
      title: '요인별 평가 결과',
      icon: 'fa-chart-pie',
      layout: 'one-column',
      fields: factorScores.map(f => ({
        label: f.propertyName,
        value: f.score,
        type: 'input',
        editable: false,
      }))
    };

    formSections.value = [baseSection, scoreSection];
    selectedRow.value = row;
    isOpen.value = true;
  } catch (err) {
    console.error('인사 평가 상세 조회 실패:', err);
    isOpen.value = false;
  }
}

watch(currentPage, () => handleSearch(filterValues.value));

onMounted(() => {
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
        { key: 'overallGrade', label: '등급' },
        { key: 'evaluatedAt', label: '평가일' },
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
        :showSubmit="false"
        @close="isOpen = false"
    />
  </main>
</template>
