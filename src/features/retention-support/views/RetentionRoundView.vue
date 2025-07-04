<template>
  <main>
    <!-- 헤더 -->
    <HeaderWithTabs
        :headerItems="[
          { label: '대시보드', to: '/retention/prospect-dash', active: false },
          { label: '근속 전망', to: '/retention/prospect-employees', active: false },
          { label: '전망 회차', to: '/retention/prospect-rounds', active: true }
        ]"
        :submitButtons="[{ label: '신규 회차 등록', icon: 'fa-calendar-plus', event: 'create', variant: 'blue' }]"
        :showTabs="false"
        @create="openCreateModal"
    />

    <!-- 필터 -->
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />

    <!-- 테이블 -->
    <BaseTable :columns="tableColumns" :rows="tableData" />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage >= 1"
        v-model="currentPage"
        :total-pages="pagination.totalPage"
    />

    <!-- 회차 등록 모달 -->
    <SideModal
        :visible="isOpen"
        title="신규 회차 등록"
        icon="fa-plus"
        :sections="formSections"
        :showSubmit="true"
        submitLabel="등록"
        @close="isOpen = false"
        @submit="handleCreate"
        v-model:form="createForm"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';

import {
  getRetentionRounds,
  createRetentionForecastRound
} from '@/features/retention-support/api.js';

const filterOptions = ref([]);
const filterValues = ref({});
const currentPage = ref(1);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const tableData = ref([]);
const isOpen = ref(false);

// 회차 등록 폼 섹션
const formSections = ref([
  {
    title: '회차 정보 입력',
    icon: 'fa-calendar-plus',
    layout: 'one-column',
    fields: [
      { label: '회차 번호', key: 'roundNo', type: 'input', inputType: 'number', required: false, editable: true },
      { label: '연도', key: 'year', type: 'input', inputType: 'number', required: true, editable: true },
      { label: '월', key: 'month', type: 'input', inputType: 'number', required: true, editable: true },
    ]
  }
]);

const createForm = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

onMounted(async () => {
  await initFilters();
  await handleSearch();
});

watch(currentPage, () => handleSearch());

const initFilters = async () => {
  filterOptions.value = [
    {
      key: 'date',
      label: '등록일',
      type: 'date-range',
      icon: 'fa-calendar-day'
    }
  ];
};

// 필터 정규화 함수
function normalizeFilterParams(values) {
  const normalized = { ...values };

  // 날짜 변환
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

const handleSearch = async () => {
  try {
    const normalizedFilters = normalizeFilterParams(filterValues.value);
    const res = await getRetentionRounds({
      ...normalizedFilters,
      page: currentPage.value,
      size: 10
    });

    tableData.value = res.content ?? [];
    pagination.value = {
      currentPage: res.pageable?.pageNumber + 1 || 1,
      totalPage: res.totalPages || 1
    };
  } catch (err) {
    console.error('회차 목록 조회 실패:', err);
  }
};

const tableColumns = [
  { key: 'roundNo', label: '회차 번호' },
  { key: 'year', label: '연도' },
  { key: 'month', label: '월' },
  { key: 'participantCount', label: '인원' },
  { key: 'status', label: '상태' },
];

const openCreateModal = () => {
  isOpen.value = true;
  formSections.value[0].fields.forEach(field => {
    createForm.value[field.key] = field.key === 'year'
        ? new Date().getFullYear()
        : (field.key === 'month' ? new Date().getMonth() : '');
  });
};

const handleCreate = async () => {
  try {
    const payload = {
      year: Number(createForm.value.year),
      month: Number(createForm.value.month)
    };
    await createRetentionForecastRound(payload);
    alert('근속 전망 회차 등록이 완료되었습니다.');
    isOpen.value = false;
    await handleSearch();
  } catch (err) {
    console.error('등록 실패:', err);
    alert('등록에 실패했습니다.');
  }
};
</script>
