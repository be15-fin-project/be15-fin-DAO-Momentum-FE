<script setup>
import { ref, onMounted, watch } from 'vue';
import { getEmployeeKpiSummary } from '@/features/performance/api.js';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import { useRouter } from 'vue-router';

const currentPage = ref(1);
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const isOpen = ref(false);
const selectedEmp = ref(null);

// 필터 구성
const filterOptions = [
  { key: 'year', label: '연도', icon: 'fa-calendar', type: 'select', options: ['전체', '2024', '2025'] },
  { key: 'month', label: '월', icon: 'fa-calendar-alt', type: 'select', options: ['전체', ...Array.from({ length: 12 }, (_, i) => `${i + 1}`) ] },
  {
    key: 'deptId',
    label: '부서',
    icon: 'fa-building',
    type: 'select',
    options: ['전체', '인사팀', '재무팀', '프론트엔드팀', '백엔드팀', '데이터팀', '영업팀', '디지털마케팅팀']
  },
  {
    key: 'empNo',
    label: '사번',
    icon: 'fa-id-badge',
    type: 'input',
    placeholder: '사번 입력'
  }
];

// 부서 라벨 → ID 매핑
const deptMap = {
  '전체': null,
  '인사팀': 10,
  '재무팀': 11,
  '프론트엔드팀': 12,
  '백엔드팀': 13,
  '데이터팀': 14,
  '영업팀': 15,
  '디지털마케팅팀': 16
};

// 파라미터 정리
function normalizeParams(values) {
  const v = { ...values };

  if (v.deptId) {
    v.deptId = deptMap[v.deptId] ?? null;
  }
  if (v.year === '전체') delete v.year;
  if (v.month === '전체') delete v.month;

  return v;
}

// 데이터 불러오기
async function fetchSummary(values) {
  const params = {
    ...normalizeParams(values),
    page: currentPage.value,
    size: 10
  };
  console.log('[fetchSummary] 호출 파라미터:', params);

  try {
    const res = await getEmployeeKpiSummary(params);
    console.log('[fetchSummary] 응답 데이터:', res);

    tableData.value = res.content || [];
    const current = res.pagination?.currentPage || 1;
    const total = res.pagination?.totalPage > 0 ? res.pagination.totalPage : 1;
    pagination.value = { currentPage: current, totalPage: total };
  } catch (err) {
    console.error('[fetchSummary] 오류:', err);
    tableData.value = [];
    pagination.value = { currentPage: 1, totalPage: 1 };
  }
}
function handleSearch() {
  currentPage.value = 1;
  fetchSummary(filterValues.value);
}


// 상세 보기 (모달 열기)
const router = useRouter();

function goToDetailPage(row) {
  router.push({ path: `../kpi/employee-detail`, query: { empNo: row.empNo } });
}


onMounted(() => {
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => {
  fetchSummary(filterValues.value);
});

</script>

<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '대시보드', to: '../kpi/statics', active: false },
        { label: '사원별 KPI', to: '../kpi/employees', active: true }
      ]"
        :showTabs="false"
    />

    <!-- 필터 -->
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />

    <!-- 테이블 -->
    <BaseTable
        :columns="[
        { key: 'profile', label: '#' },
        { key: 'empNo', label: '사번' },
        { key: 'employeeName', label: '이름' },
        { key: 'departmentName', label: '부서' },
        { key: 'positionName', label: '직위' },
        { key: 'totalKpiCount', label: '전체 KPI 수' },
        { key: 'completedKpiCount', label: '완료 수' },
        { key: 'averageProgress', label: '평균 진척률 (%)' },
        { key: 'completionRate', label: '달성률 (%)' },
        { key: 'action', label: '상세' }
      ]"
        :rows="tableData"
        @click-detail="goToDetailPage"
    />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage"
        :pages="Array.from({ length: pagination.totalPage }, (_, i) => i + 1)"
        v-model="currentPage"
    />

  </main>
</template>
