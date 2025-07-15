<script setup>
import {computed, onMounted, reactive, ref, watch, watchEffect} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import SideModal from "@/components/common/SideModal.vue";
import {getDepartments, getPositions} from "@/features/works/api.js";
import {createEmployee, getEmployees} from "@/features/employee/api.js";
import {useRouter} from "vue-router";
import {useToast} from "vue-toastification";
import dayjs from "dayjs";

const toast = useToast();
const router = useRouter();

const isSubmitting = ref(false);

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const employees = ref([]);

const deptOptions = ref([]);
const positionOptions = ref([]);
const positionFilterOptions = ref([]);

const MONTHS_IN_YEAR = 12;
const STANDARD_DAYOFF = 15;
const MAXIMUM_DAYOFF = 25;
const WORKING_HOURS_IN_DAY = 8;

const showModal = ref(false);

const columns = [
  {key: 'profile', label: '#'},
  {key: 'empNo', label: '사번'},
  {key: 'name', label: '이름'},
  {key: 'deptName', label: '부서', format: val => val ?? '-'},
  {key: 'positionName', label: '직위'},
  {key: 'userRoles', label: '권한', format: val => val.map(x => roleMap[x]).join(", ")},
  {key: 'joinDate', label: '입사일', format: val => val},
  {
    key: 'empStatus', label: '재직 상태', format: (val, row) => {
      switch (row.status) {
        case 'EMPLOYED':
          return '재직';
        case 'ON_LEAVE':
          return '휴직';
        case 'RESIGNED':
          return '퇴사';
      }
    }
  },
  {key: 'action', label: '상세'},
];

// 필터
const baseFilterOptions = computed(() => [
  {key: 'deptId', type: 'tree', label: '부서', icon: 'fa-building', options: departmentTree.value},
  {key: 'positionId', type: 'select', label: '직위', icon: 'fa-user-tie', options: positionFilterOptions.value},
  {key: 'userRole', type: 'select', label: '권한', icon: 'fa-shield-alt', options: roleOptions.value},
  {key: 'joinDate', type: 'date-range', label: '입사일', icon: 'fa-calendar-day'},
  {
    key: 'sortBy',
    type: 'select',
    label: '정렬 기준',
    icon: 'fa-filter',
    options: [{label: '사번', value: null}, {label: '입사일', value: 'JOIN_DATE'}, {label: '직위', value: 'POSITION'}]
  },
  {
    key: 'order',
    type: 'select',
    label: '정렬',
    icon: 'fa-sort',
    options: [{label: '오름차순', value: 'ASC'}, {label: '내림차순', value: 'DESC'}]
  }
]);

const filterOptions = computed(() => [...baseFilterOptions.value]);

const setParams = (v) => {
  return {
    deptId: v.deptId ?? null,
    positionId: v.positionId ?? null,
    userRole: v.userRole ?? null,
    searchStartDate: v.joinDate_start || null,
    searchEndDate: v.joinDate_end || null,
    sortBy: v.sortBy || null,
    order: v.order || null
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
    const resp = await getEmployees(params);
    console.log(resp);

    employees.value = resp.employees || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (err) {
    employees.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};
  }
}

const handleSearch = () => {
  currentPage.value = 1;
  filterValues.value = {...filterValues.value}; // 검색 후에 column 변동
  fetchSummary(filterValues.value);
}

const roleMap = {
  MASTER: '최고 관리자',
  HR_MANAGER: '인사 관리자',
  MANAGER: '팀장',
  EMPLOYEE: '일반',
  BOOKKEEPING: '경리 관리자',
};

const roleOptions = ref({});
roleOptions.value = [
  {label: '전체', value: null},
  ...Object.keys(roleMap).map(key => ({
    label: roleMap[key],
    value: key
  }))
];

onMounted(async () => {
  const depts = await getDepartments()
  const raw = depts.data?.departmentInfoDTOList || [];
  departmentTree.value = raw;
  deptOptions.value = raw;

  const positions = await getPositions();
  positionFilterOptions.value = [{label: '전체', value: null}, ...positions.map(p => ({label: p.name, value: p.positionId}))];
  positionOptions.value = [...positions.map(p => ({label: p.name, value: p.positionId}))];
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

const goToDetailsPage = (emp) => {
  const empId = emp.empId;
  router.push(`/employees/${empId}`);
};

const departmentTree = ref([]);

const req = reactive({
  name: '',
  birthDate: null,
  email: '',
  contact: '',
  address: '',
  deptId: null,
  positionId: null,
  // employeeRoles: [],
  status: 'EMPLOYED',
  joinDate: null,
  remainingDayoffHours: 0,
  remainingRefreshDays: 0,
  gender: null,
});

const resetReq = () => {
  req.name = '';
  req.birthDate = null;
  req.email = '';
  req.contact = '';
  req.address = '';
  req.deptId = null;
  req.positionId = null;
  // req.employeeRoles = [];
  req.status = 'EMPLOYED';
  req.joinDate = null;
  req.joinDate = dayjs().format('YYYY-MM-DD');
  req.gender = null;
}

const openCreateModal = () => {
  resetReq()
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
}

const modalSections = computed(() => [
  {
    title: '기본 정보',
    icon: 'fa-user',
    layout: 'two-column',
    fields: [
      {key: 'name', label: '이름', type: 'input', editable: true, required: true, placeholder: '홍길동'},
      {
        key: 'gender', label: '성별', type: 'select', editable: true, required: true,
        options: [
          {label: '남성', value: 'M'},
          {label: '여성', value: 'F'}
        ]
      },
      {key: 'birthDate', label: '생년월일', type: 'date', editable: true, required: true},
      {key: 'email', label: '이메일', type: 'input', editable: true, required: true, placeholder: 'gildong@example.com'},
      {key: 'contact', label: '연락처', type: 'input', editable: true, required: true, placeholder: '010-0000-0000'},
      {key: 'address', label: '주소', type: 'input', editable: true, required: true, placeholder: '도로명 주소를 입력하세요.'},
    ]
  },
  {
    title: '근무 정보',
    icon: 'fa-briefcase',
    layout: 'two-column',
    fields: [
      { key: 'deptId', label: '부서', type: 'deptList', editable: true, list: deptOptions.value || [] },
      { key: 'positionId', label: '직위', type: 'select', editable: true, required: true, options: positionOptions.value || [] },
      {
        key: 'status', label: '재직 상태', type: 'select', editable: true, required: true,
        options: [
          { label: '재직', value: 'EMPLOYED' },
          { label: '휴직', value: 'ON_LEAVE' },
          { label: '퇴사', value: 'RESIGNED' }
        ]
      },
      { key: 'joinDate', label: '입사일', type: 'date', editable: true, required: true },
      { key: 'remainingDayoffHours', label: '부여 연차 시간 (예: 15일 -> 120)', type: 'number', editable: true, required: true, placeholder: '120' },
      { key: 'remainingRefreshDays', label: '부여 리프레시 휴가 일수', type: 'number', editable: true, required: true },
    ]
  },
  // {
  //   title: '권한 설정 정보',
  //   icon: 'fa-shield-alt',
  //   layout: 'one-column',
  //   fields: [
  //     {
  //       key: 'employeeRoles',
  //       label: '권한',
  //       type: 'checkbox-group',
  //       style: 'permission',
  //       editable: true,
  //       options: Object.keys(roleMap).filter(k => k !== 'EMPLOYEE').map(k => ({
  //         label: roleMap[k], value: k
  //       }))
  //     }
  //   ]
  // }
]);

const handleHeaderButton = (event) => {
  switch (event.value) {
    case 'create':
      openCreateModal();
      break;
    case 'upload':
      router.push('/employees/csv');
      break;
  }
};

watchEffect(() => {
  const joinDate = req.joinDate;
  if (!joinDate) return;

  const join = dayjs(joinDate);
  const now = dayjs();

  const joinYear = join.year();
  const joinMonth = join.month() + 1;
  const targetYear = now.year();

  req.remainingDayoffHours = computeDayoffHours(joinYear, joinMonth, targetYear);
  req.remainingRefreshDays = computeRefreshDays(joinYear, targetYear);
});

function computeDayoffDays(joinYear, joinMonth, targetYear) {
  const yearsWorked = targetYear - joinYear;

  if (yearsWorked < 0) return 0;

  if (yearsWorked === 0) {
    return Math.max(0, MONTHS_IN_YEAR - joinMonth);
  }

  if (yearsWorked === 1) {
    const monthsNotWorked = joinMonth - 1;
    const weight = monthsNotWorked / MONTHS_IN_YEAR;

    return Math.ceil(STANDARD_DAYOFF - (STANDARD_DAYOFF - 12) * weight);
  }

  const dayoffDays = STANDARD_DAYOFF + Math.floor((yearsWorked - 1) / 2);
  return Math.min(MAXIMUM_DAYOFF, dayoffDays);
}

function computeDayoffHours(joinYear, joinMonth, targetYear) {
  return computeDayoffDays(joinYear, joinMonth, targetYear) * WORKING_HOURS_IN_DAY;
}

function computeRefreshDays(joinYear, targetYear) {
  const yearsWorked = targetYear - joinYear;

  switch (yearsWorked) {
    case 3:
      return 3;
    case 5:
      return 5;
    case 10:
      return 10;
    default:
      return 0;
  }
}

/* TODO: 프론트 검증 로직 작성 */
const handleRegisterSubmit = async (req) => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const resp = await createEmployee(req);
    closeModal();
    toast.success('사원 등록 완료');
    handleSearch(); // 목록 새로고침
  } catch (e) {
    toast.error('사원 등록 실패');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: '사원 목록 조회', to: '/employees', active: true },
    ]"
                    :submitButtons="[{ label: '등록', icon: 'fa-user-plus', variant: 'blue', event: 'click', value: 'create'},
    {label: 'CSV', icon: 'fa-upload', variant: 'green', event: 'click', value: 'upload'}]"
                    :showTabs="false"
                    @click="handleHeaderButton"
    />
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="employees" @click-detail="goToDetailsPage"/>

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
        :title="'사원 등록'"
        icon="fa-user-plus"
        @close="closeModal"
        :sections="modalSections"
        :submitDisabled="isSubmitting"
        @submit="handleRegisterSubmit(req)"
    />
  </main>
</template>