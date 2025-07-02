<script setup>
import { ref, onMounted, watch } from 'vue';
import { getEmployeeKpiSummary } from '@/features/performance/api.js';
import { getDepartments, getPositions  } from '@/features/works/api.js';
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
const departmentTree = ref([]);
const departmentList = ref([]);
const positionList = ref([]);
const filterOptions = ref([]);

// 필터 구성
function initFilters() {
  filterOptions.value = [
    {
      key: 'year',
      label: '연도',
      icon: 'fa-calendar',
      type: 'select',
      options: ['전체', '2024', '2025']
    },
    {
      key: 'month',
      label: '월',
      icon: 'fa-calendar-alt',
      type: 'select',
      options: ['전체', ...Array.from({ length: 12 }, (_, i) => `${i + 1}`)]
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value, // 부서 트리 반영
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positionList.value.map(p => p.name)]
    },
    {
      key: 'empNo',
      label: '사번',
      icon: 'fa-id-badge',
      type: 'input',
      placeholder: '사번 입력'
    }
  ];
}

// 파라미터 정리
function normalizeParams(values) {
  const v = { ...values };

  if (v.deptId && v.deptId !== '전체') {
    const match = departmentList.value.find(d => d.name === v.deptId);
    v.deptId = match?.deptId ?? null;
  } else {
    delete v.deptId;
  }

  if (v.positionId && v.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === v.positionId);
    v.positionId = match?.positionId ?? null;
  } else {
    delete v.positionId;
  }

  if (v.year === '전체') delete v.year;
  if (v.month === '전체') delete v.month;

  return v;
}

// 데이터 로드
async function fetchSummary(values) {
  const params = {
    ...normalizeParams(values),
    page: currentPage.value,
    size: 10
  };
  try {
    const res = await getEmployeeKpiSummary(params);
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



// 초기 마운트
onMounted(async () => {
  try {
    const deptRes = await getDepartments();
    departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
    positionList.value = await getPositions();
    initFilters();
  } catch (err) {
    console.error('부서/직위 불러오기 실패:', err);
  }

  filterValues.value = {};
  handleSearch();
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
        { label: '사원별 KPI', to: '../kpi/employee-kpis', active: true }
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
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

  </main>
</template>
