<script setup>
import {computed, onMounted, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import SideModal from "@/components/common/SideModal.vue";
import {getPositions} from "@/features/works/api.js";
import {createAppoint, getAppoints} from "@/features/employee/api.js";

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const appoints = ref([]);

const positionFilterOptions = ref([]);
const departmentFilterOptions = ref([]);

const deptOptions = ref([
  {label: '테크놀로지(주)', value: 1},
  {label: '경영지원본부', value: 2},
  {label: '인사팀', value: 10},
  {label: '재무팀', value: 11},
  {label: '프론트엔드팀', value: 12},
  {label: '백엔드팀', value: 13},
  {label: '데이터팀', value: 14},
  {label: '영업팀', value: 15},
  {label: '디지털마케팅팀', value: 16},
]);

const showModal = ref(false);

const columns = [
  {key: 'empNo', label: '사번'},
  {key: 'empName', label: '사원명'},
  {key: 'beforeDeptName', label: '기존 부서'},
  {key: 'beforePositionName', label: '기존 직위'},
  {key: 'afterDeptName', label: '발령 부서'},
  {key: 'afterPositionName', label: '발령 직위'},
  {
    key: 'type', label: '발령 종류', format: val => {
      switch (val) {
        case 'DEPARTMENT_TRANSFER':
          return '소속 이동'
        case 'PROMOTION':
          return '승진'
      }
    }
  },
  {key: 'appointDate', label: '발령일', format: val => val},
];

// 필터
const baseFilterOptions = computed(() => [
  {key: 'empNo', type: 'input', label: '사번', icon: 'fa-id-badge', placeholder: '사번 입력'},
  {key: 'empName', type: 'input', label: '사원명', icon: 'fa-user', placeholder: '이름 입력'},
  {key: 'deptId', type: 'select', label: '발령 부서', icon: 'fa-building', options: departmentFilterOptions.value},
  {key: 'positionId', type: 'select', label: '발령 직위', icon: 'fa-user-tie', options: positionFilterOptions.value},
  {key: 'appointDate', type: 'date-range', label: '발령일', icon: 'fa-calendar-day'},
  {
    key: 'order',
    type: 'select',
    label: '정렬',
    icon: 'fa-filter',
    options: [{label: '오름차순', value: 'ASC'}, {label: '내림차순', value: 'DESC'}]
  }
]);

const filterOptions = computed(() => [...baseFilterOptions.value]);

const setParams = (v) => {
  return {
    empNo: v.empNo ?? null,
    empName: v.empName ?? null,
    deptId: v.deptId ?? null,
    positionId: v.positionId ?? null,
    searchStartDate: v.appointDate_start ?? null,
    searchEndDate: v.appointDate_end ?? null,
    order: v.order ?? null
  };
}

// 데이터 불러오기
const fetchSummary = async (values) => {
  const params = {
    ...setParams(values),
    page: currentPage.value,
    size: 10
  };

  try {
    console.log(params);
    const resp = await getAppoints(params);
    console.log(resp);

    appoints.value = resp.appoints || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (err) {
    appoints.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};
  }
}

const handleSearch = () => {
  currentPage.value = 1;
  filterValues.value = {...filterValues.value}; // 검색 후에 column 변동
  fetchSummary(filterValues.value);
}

onMounted(async () => {
  const positions = await getPositions();
  departmentFilterOptions.value = [{label: '전체', value: null}, ...deptOptions.value
  ];
  //   departmentFilterOptions.value = [{label: '전체', value: null}, ...departments.map(p => ({
//   label: p.name,
//   value: p.deptId
// }))]
  positionFilterOptions.value = [{label: '전체', value: null}, ...positions.map(p => ({
    label: p.name,
    value: p.positionId
  }))];
  positionOptions.value = [{label: '선택', value: null}, ...positions.map(p => ({label: p.name, value: p.positionId}))];
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

const positionOptions = ref({});

const req = {
  name: '',
  birthDate: null,
  email: '',
  contact: '',
  address: '',
  deptId: null,
  positionId: null,
  employeeRoles: [],
  status: 'EMPLOYED',
  joinDate: null,
  remainingDayoffHours: 0,
  remainingRefreshDays: 0,
  gender: null,
};

const openCreateModal = () => {
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
}

const modalSections = computed(() => [
  {
    title: '발령 정보',
    icon: 'fa-user',
    layout: 'two-column',
    fields: [
        /* TODO: 트리에서 가져오는 것으로 수정 */
      {key: 'empId', label: '사원ID', type: 'number', editable: true, required: true, placeholder: '1'},
      {
        key: 'type', label: '발령 종류', type: 'select', editable: true, required: true, options: [
          {label: '선택', value: null},
          {label: '소속 이동', value: 'DEPARTMENT_TRANSFER'},
          {label: '승진', value: 'PROMOTION'}
        ]
      },
      {key: 'positionId', label: '발령 직위', type: 'select', editable: true, required: true, options: positionOptions.value || []},
      {key: 'deptId', label: '발령 부서', type: 'select', editable: true, required: true, options: deptOptions.value || []},
      {key: 'appointDate', label: '발령일', type: 'date', editable: true, required: true}
    ]
  }
]);

/* TODO: 프론트 예외 처리, 토스트 알림 추가 */
const handleRegisterSubmit = async (req) => {
  try {
    const resp = await createAppoint(req);
    closeModal();
    handleSearch(); // 목록 새로고침
  } catch (e) {
    console.error('등록 실패:', e);
  }
};
</script>

<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: '발령 내역 조회', to: '/appoints', active: true },
    ]"
                    :submitButtons="[{ label: '등록', icon: 'fa-user-plus', variant: 'blue'}]"
                    :showTabs="false"
                    @click="openCreateModal"
    />
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="appoints" @click-detail="handleRegisterSubmit"/>

    <!-- Pagination -->
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"/>

    <!-- 사원 등록 사이드 모달 -->
    <SideModal
        v-if="showModal"
        :visible="showModal"
        v-model:form="req"
        :title="'발령 등록'"
        icon="fa-user-plus"
        @close="closeModal"
        :sections="modalSections"
        @submit="handleRegisterSubmit(req)"
    />
  </main>
</template>