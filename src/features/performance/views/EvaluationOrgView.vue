<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '평가 내역', to: '/eval/manage-peer', active: true },
        { label: '평가 회차', to: '/eval/round', active: false }]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :tabs="[
        { label: '사원 간 평가', icon: 'fa-building', to: '/eval/manage-peer' },
        { label: '조직 평가', icon: 'fa-sitemap', to: '/eval/manage-org', active: true },
        { label: '자가 진단', icon: 'fa-user-tie', to: '/eval/manage-self' }
      ]"
        :showTabs="true"
        :activeTab="currentTab"
        @tabSelected="currentTab = $event"
        @download="handleDownload"
    />

    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
        { key: 'roundNo', label: '회차' },
        { key: 'formDisplayName', label: '평가 유혀' },
        { key: 'evalName', label: '사원 이름' },
        { key: 'score', label: '점수' },
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
        title="조직 평가 상세 정보"
        icon="fa-chart-line"
        :sections="formSections"
        :showSubmit="false"
        @close="isOpen = false"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  getDepartments,
  getPositions
} from '@/features/works/api.js';
import {
  getEvaluationFormTypes,
  getEvaluationRoundNos,
  getOrgEvaluations,
  getOrgEvaluationDetail,
  getOrgExcelDownload
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';

// ====================== 상태 변수 ======================
const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const isOpen = ref(false);
const selectedRow = ref(null);
const formSections = ref([]);
const currentTab = ref('조직 평가');

const departmentTree = ref([]);
const positionList = ref([]);
const formTypeList = ref([]);
const roundList = ref([]);
const filterOptions = ref([]);

// ====================== 초기화 ======================
onMounted(async () => {
  try {
    const [deptRes, posRes] = await Promise.all([
      getDepartments(),
      getPositions()
    ]);
    departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
    positionList.value = posRes;

    await Promise.all([fetchFormTypes(), fetchRoundNos()]);
    initFilters();
    await handleSearch({});
  } catch (e) {
    console.error('초기화 실패:', e);
  }
});

// ====================== 필터 ======================
const fetchFormTypes = async () => {
  formTypeList.value = await getEvaluationFormTypes({ typeId: 2 }); // 조직 평가
};

const fetchRoundNos = async () => {
  roundList.value = await getEvaluationRoundNos();
};

const initFilters = () => {
  filterOptions.value = [
    {
      key: 'formId',
      label: '폼 종류',
      icon: 'fa-file-signature',
      type: 'select',
      options: ['전체', ...formTypeList.value.map(f => f.description)],
    },
    {
      key: 'roundNo',
      label: '회차',
      icon: 'fa-list-ol',
      type: 'select',
      options: ['전체', ...roundList.value.map(r => r.roundNo)],
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value,
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positionList.value.map(pos => pos.name)],
    },
    {
      key: 'evalNo',
      label: '사번',
      icon: 'fa-id-badge',
      type: 'input',
      placeholder: '사번 입력',
    },
    {
      key: 'date',
      label: '평가일',
      icon: 'fa-calendar-day',
      type: 'date-range',
    },
  ];
};

const normalizeFilterParams = (values) => {
  const normalized = { ...values };

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  if (normalized.positionId && normalized.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === normalized.positionId);
    normalized.positionId = match?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  if (normalized.formId && normalized.formId !== '전체') {
    const match = formTypeList.value.find(f =>
        f.name === normalized.formId || f.description === normalized.formId
    );
    normalized.formId = match?.formId ?? null;
  } else {
    normalized.formId = null;
  }

  if (normalized.roundNo === '전체') {
    normalized.roundNo = null;
  }

  return normalized;
};

// ====================== 테이블 조회 ======================
const handleSearch = async (values) => {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10,
  };
  console.log('[SEARCH PARAMS]', params);

  try {
    const resData = await getOrgEvaluations(params);
    tableData.value = resData.list ?? [];
    pagination.value = {
      currentPage: resData.pagination?.currentPage || 1,
      totalPage: Math.max(resData.pagination?.totalPage || 1, 1)
    };
  } catch (e) {
    console.error('조직 평가 조회 실패:', e);
    tableData.value = [];
  }
};

watch(currentPage, () => handleSearch(filterValues.value));

const mappedTableData = computed(() =>
    tableData.value.map(row => {
      const form = formTypeList.value.find(f => f.name === row.formName);
      return {
        ...row,
        formDisplayName: form?.description || row.formName,
      };
    })
);

// ====================== 상세 모달 ======================
const openModalHandler = async (row) => {
  selectedRow.value = row;
  isOpen.value = true;

  try {
    const { detail, factorScores } = await getOrgEvaluationDetail(row.resultId);
    const form = formTypeList.value.find(f => f.name === detail.formName);
    const formDisplayName = form?.description || detail.formName;
    const formattedDate = detail.createdAt?.split('T')[0];

    const baseSections = [
      {
        title: '조직 평가 정보',
        icon: 'fa-clipboard-check',
        layout: 'two-column',
        fields: [
          { label: '회차', value: detail.roundNo, type: 'input', editable: false },
          { label: '폼 이름', value: formDisplayName, type: 'input', editable: false },
          { label: '점수', value: detail.score, type: 'input', editable: false },
          { label: '평가일', value: formattedDate, type: 'input', editable: false },
        ],
      },
      {
        title: '평가자',
        icon: 'fa-user',
        layout: 'one-column',
        fields: [
          { label: '사번', value: `${detail.evalName} (${detail.empNo})`, type: 'input', editable: false },
        ],
      },
    ];

    const reasonSection = detail.reason
        ? [{
          title: '사유',
          icon: 'fa-comment',
          layout: 'one-column',
          fields: [{ label: '사유', value: detail.reason, type: 'input', editable: false }],
        }]
        : [];

    const factorSection = factorScores.length
        ? [{
          title: '평가 항목 점수',
          icon: 'fa-star-half-alt',
          layout: 'one-column',
          fields: factorScores.map(f => ({
            label: f.propertyName,
            value: f.score,
            type: 'scoreChart',
            editable: false,
          })),
        }]
        : [];

    formSections.value = [...baseSections, ...reasonSection, ...factorSection];
  } catch (err) {
    console.error('상세 조회 실패:', err);
    isOpen.value = false;
  }
};

// ====================== 엑셀 다운로드 ======================
const handleDownload = async () => {
  try {
    const normalized = normalizeFilterParams(filterValues.value);
    const blob = await getOrgExcelDownload({ ...normalized });

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evaluation-org-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('엑셀 다운로드 오류:', err);
    alert('엑셀 다운로드 실패');
  }
};
</script>
