<script setup>
import {computed, onMounted, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import SideModal from "@/components/common/SideModal.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import {getPositions} from "@/features/works/api.js";
import {getEmployees} from "@/features/employee/api.js";

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
// const appliedFilterValues = ref({});
const employees = ref([]);

const showModal = ref(false);
const modalWorkId = ref(null);
const workDetails = ref(null);
const loadingDetails = ref(false);

const positionOptions = ref([]);

const deptOptions = ref([
  {label: '전체', value: null},
  {label: '테크놀로지(주)', value: 1},
  {label: '인사팀', value: 10},
  {label: '재무팀', value: 11},
  {label: '프론트엔드팀', value: 12},
  {label: '백엔드팀', value: 13},
  {label: '데이터팀', value: 14},
  {label: '영업팀', value: 15},
  {label: '디지털마케팅팀', value: 16},
]);

const columns = [
    {key: 'empNo', label: '사번'},
    {key: 'name', label: '이름'},
    {key: 'deptName', label: '부서'},
    {key: 'positionName', label: '직위'},
    {key: 'userRoles', label: '권한', format: val => val.map(x => roleMap[x]).join(", ")},
    {key: 'joinDate', label: '입사일', format: val => val},
    {key: 'status', label: '재직 상태', format: val => {
      switch (val) {
        case 'EMPLOYED': return '재직';
        case 'ON_LEAVE': return '휴직';
        case 'RESIGNED': return '퇴사';
      }
      }}
];

// 필터
const baseFilterOptions = computed(() => [
  {key: 'deptId', type: 'select', label: '부서', icon: 'fa-building', options: deptOptions.value},
  {key: 'positionId', type: 'select', label: '직위', icon: 'fa-user-tie', options: positionOptions.value},
  {key: 'userRole', type: 'select', label: '권한', icon: 'fa-shield-alt', options: roleOptions.value},
  {key: 'joinDate', type: 'date-range', label: '입사일', icon: 'fa-calendar-day'},
  {key: 'sortBy', type: 'select', label: '정렬 기준', options: [{label: '사번', value: null}, {label:'입사일', value:'JOIN_DATE'}, {label:'직위', value:'POSITION'}]},
  {key: 'order', type: 'select', label: '정렬', icon:'fa-filter', options: [{label:'오름차순', value:'ASC'}, {label: '내림차순', value:'DESC'}]}
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
  MASTER: '마스터 관리자',
  HR_MANAGER: '인사 관리자',
  MANAGER: '팀장',
  EMPLOYEE: '일반',
  BOOKKEEPING: '경리 관리자',
};

const roleOptions = ref({});
roleOptions.value = [
  { label: '전체', value: null },
  ...Object.keys(roleMap).map(key => ({
    label: roleMap[key],
    value: key
  }))
];

onMounted(async () => {
  const positions = await getPositions();
  positionOptions.value = [{label: '전체', value: null}, ...positions.map(p => ({label: p.name, value: p.positionId}))];
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

const openDetailsModal = async (work) => {
  // const workId = work.workId;
  // modalWorkId.value = workId;
  // showModal.value = true;
  // loadingDetails.value = true;
  //
  // try {
  //   workDetails.value = await getWorkDetails(workId);
  // } catch (error) {
  //   workDetails.value = null;
  // } finally {
  //   loadingDetails.value = false;
  // }

};
//
// const closeModal = () => {
//   showModal.value = false;
//   modalWorkId.value = null;
//   workDetails.value = null;
// }
//
// const formatPushedAt = (val) => val ? val.replace('T', ' ') : '-';
// const formatDuration = (minutes) => {
//   const h = Math.floor(minutes / 60);
//   const m = minutes % 60;
//   return (h >= 1 ? `${h}시간 ` : '') + `${m}분`;
// }
//
// const modalSections = computed(() => {
//   if (!workDetails.value) return [];
//
//   // 예시: workDetails 값에 맞게 키와 라벨, 값 매핑
//   // 필드는 key, label, value 순으로 필드 렌더러가 읽음
//   return [
//     {
//       title: '기록 정보',
//       icon: 'fa-info-circle',
//       layout: 'one-column',
//       fields: [
//         {
//           key: 'startPushedAt',
//           label: '출근 등록 일시',
//           value: formatPushedAt(workDetails.value.startPushedAt)
//         },
//         {
//           key: 'endPushedAt',
//           label: '퇴근 등록 일시',
//           value: formatPushedAt(workDetails.value.endPushedAt)
//         },
//         {
//           key: 'breakTime',
//           label: '휴게 시간',
//           value: formatDuration(workDetails.value.breakTime)
//         },
//         { key: 'isNormalWork', label: '정상 근무 여부', value: workDetails.value.isNormalWork}
//       ],
//     },
//   ];
// });
</script>

<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: '사원 목록 조회', to: '/employees', active: true },
    ]" :showTabs="false"/>
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="employees" @click-detail="openDetailsModal"/>

    <!-- Pagination -->
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"/>

    <!-- 출퇴근 상세 모달 -->
<!--    <SideModal-->
<!--        v-if="showModal"-->
<!--        :visible="showModal"-->
<!--        :title="'상세 출퇴근 정보'"-->
<!--        icon="fa-clock"-->
<!--        :sections="modalSections"-->
<!--        :readonly="true"-->
<!--        @update:visible="showModal = $event"-->
<!--        @close="closeModal"-->
<!--        :showSubmit="false"-->
<!--    />-->

  </main>
</template>