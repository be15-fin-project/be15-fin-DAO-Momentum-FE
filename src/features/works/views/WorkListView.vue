<script setup>
import {computed, onMounted, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import SideModal from "@/components/common/SideModal.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import {
  getDepartments,
  getPositions,
  getVacationTypes,
  getWorkDetails,
  getWorks,
  getWorkTypes
} from "@/features/works/api.js";
import {toastError} from "@/util/toastError.js";

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const appliedFilterValues = ref({});
const works = ref([]);

const showModal = ref(false);
const modalWorkId = ref(null);
const workDetails = ref(null);
const loadingDetails = ref(false);

const positionOptions = ref([]);
const typeOptions = ref([]);
const vacationTypeOptions = ref([]);
const childWorkTypeOptions = ref([]);

const workTypeIdMap = ref({VACATION: null, ADDITIONAL: null});

const departmentTree = ref([]);

const columns = computed(() => {
  const baseColumns = [
    {key: 'empNo', label: '사번'},
    {key: 'empName', label: '이름'},
    {key: 'deptName', label: '부서'},
    {key: 'positionName', label: '직위'},
    {key: 'startAt', label: '출근 일시', format: val => val.replace('T', ' ').slice(0, -3)},
    {key: 'endAt', label: '퇴근 일시', format: val => val.replace('T', ' ').slice(0, -3)},
    {key: 'workTime', label: '근무 시간', format: val => `${Math.floor(val / 60)}시간 ${val % 60}분`},
    {
      key: 'workType', label: '유형',
      format: ((val, row) => (
              {
                WORK: '근무',
                REMOTE_WORK: '재택근무',
                VACATION: '휴가',
                ADDITIONAL: '초과근무',
                BUSINESS_TRIP: '출장',
              }[row.typeName] || '-')
      )
    },
    {key: 'action', label: '상세'},
  ];

// 동적 생성
  if (appliedFilterValues.value.typeId === workTypeIdMap.value.VACATION) {
    baseColumns.splice(8, 0, {key: 'vacationType', label: '세부 유형'});
  } else if (appliedFilterValues.value.typeId === workTypeIdMap.value.ADDITIONAL) {
    baseColumns.splice(8, 0, {
      key: 'childTypeName', label: '세부 유형', format:
          val => additionalWorkMap[val]
    });
  }

  return baseColumns;
});

const tabOptions = [
  { key: 'isNormalWork', label: '전체', value: null },
  { key: 'isNormalWork', label: '정상', value: 'Y' },
  { key: 'isNormalWork', label: '이상', value: 'N' },
];

// 필터
const baseFilterOptions = computed(() => [
  {key: 'empNo', type: 'input', label: '사번', icon: 'fa-id-badge', placeholder: '사번 입력'},
  {key: 'empName', type: 'input', label: '이름', icon: 'fa-user', placeholder: '이름 입력'},
  {key: 'deptId', type: 'tree', label: '부서', icon: 'fa-building', options: departmentTree.value},
  {key: 'positionId', type: 'select', label: '직위', icon: 'fa-user-tie', options: positionOptions.value},
  {key: 'startAt', type: 'date-range', label: '출근 일시', icon: 'fa-calendar-day'},
  {
    key: 'order', type: 'select', label: '정렬 (출근 일시)', icon: 'fa-sort', options: [
      {label: '오름차순', value: 'ASC'},
      {label: '내림차순', value: 'DESC'}
    ]
  },
  {key: 'typeId', type: 'select', label: '유형', icon: 'fa-filter', options: typeOptions.value}
]);

const dynamicChildFilter = computed(() => {
  const selected = filterValues.value.typeId;
  if (selected === workTypeIdMap.value.VACATION) {
    return [{key: 'vacationTypeId', label: '세부 유형', type: 'select', options: vacationTypeOptions.value}];
  } else if (selected === workTypeIdMap.value.ADDITIONAL) {
    return [{key: 'childTypeId', label: '세부 유형', type: 'select', options: childWorkTypeOptions.value}];
  }
  return [];
});

const filterOptions = computed(() => [...baseFilterOptions.value, ...dynamicChildFilter.value]);

const setParams = (v) => {
  return {
    empNo: v.empNo || null,
    empName: v.empName || null,
    deptId: v.deptId ?? null,
    positionId: v.positionId ?? null,
    rangeStartDate: v.startAt_start || null,
    rangeEndDate: v.startAt_end || null,
    isNormalWork: v.isNormalWork || null,
    order: v.order || null,
    typeId: v.typeId ?? null,
    childTypeId: v.typeId === workTypeIdMap.value.ADDITIONAL ? (v.childTypeId ?? null) : null,
    vacationTypeId: v.typeId === workTypeIdMap.value.VACATION ? (v.vacationTypeId ?? null) : null
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
    const resp = await getWorks(params);

    works.value = resp.works || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (e) {
    works.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};

    toast.error('근태 내역 조회 실패')
  }
}

const handleSearch = () => {
  currentPage.value = 1;
  appliedFilterValues.value = {...filterValues.value}; // 검색 후에 column 변동
  fetchSummary(filterValues.value);
}

const typeNameMap = {
  WORK: '근무',
  REMOTE_WORK: '재택근무',
  VACATION: '휴가',
  ADDITIONAL: '초과근무',
  BUSINESS_TRIP: '출장',
};

const additionalWorkMap = {
  OVERTIME: '연장근무',
  NIGHT: '야간근무',
  HOLIDAY: '휴일근무'
};

onMounted(async () => {
  filterValues.value = { isNormalWork: null };
  const depts = await getDepartments();
  departmentTree.value = depts.data?.departmentInfoDTOList || [];

  const positions = await getPositions();
  positionOptions.value = [{label: '전체', value: null}, ...positions.map(p => ({label: p.name, value: p.positionId}))];

  const {parentWorkTypes, childWorkTypes} = await getWorkTypes();
  typeOptions.value = [{
    label: '전체',
    value: null
  }, ...parentWorkTypes.map(t => ({label: typeNameMap[t.typeName] || t.typeName, value: t.typeId}))];
  childWorkTypeOptions.value = [{
    label: '전체',
    value: null
  }, ...childWorkTypes.map(t => ({label: additionalWorkMap[t.typeName] || t.typeName, value: t.typeId}))];

  workTypeIdMap.value.VACATION = parentWorkTypes.find(t => t.typeName === 'VACATION')?.typeId;
  workTypeIdMap.value.ADDITIONAL = parentWorkTypes.find(t => t.typeName === 'ADDITIONAL')?.typeId;

  const vacationTypes = await getVacationTypes();
  vacationTypeOptions.value = [{label: '전체', value: null}, ...vacationTypes.map(t => ({
    label: t.description,
    value: t.vacationTypeId
  }))];

  handleSearch();
});

watch(currentPage, () => fetchSummary(filterValues.value));

const openDetailsModal = async (work) => {
  const workId = work.workId;
  modalWorkId.value = workId;
  showModal.value = true;
  loadingDetails.value = true;

  try {
    workDetails.value = await getWorkDetails(workId);
  } catch (e) {
    workDetails.value = null;
    toast.error('출퇴근 상세 내용 조회 실패')
  } finally {
    loadingDetails.value = false;
  }

};

const closeModal = () => {
  showModal.value = false;
  modalWorkId.value = null;
  workDetails.value = null;
}

const formatPushedAt = (val) => val ? val.replace('T', ' ') : '-';
const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (h >= 1 ? `${h}시간 ` : '') + `${m}분`;
}

const formatIsNormalWork = (isNormalWork) => {
  switch (isNormalWork)  {
    case 'Y': return '예';
    case 'N': return '아니오';
    default: return '-';
  }
};

const modalSections = computed(() => {
  if (!workDetails.value) return [];

  // 예시: workDetails 값에 맞게 키와 라벨, 값 매핑
  // 필드는 key, label, value 순으로 필드 렌더러가 읽음
  return [
    {
      title: '기록 정보',
      icon: 'fa-info-circle',
      layout: 'one-column',
      fields: [
        {
          key: 'startPushedAt',
          label: '출근 등록 일시',
          value: formatPushedAt(workDetails.value.startPushedAt)
        },
        {
          key: 'endPushedAt',
          label: '퇴근 등록 일시',
          value: formatPushedAt(workDetails.value.endPushedAt)
        },
        {
          key: 'breakTime',
          label: '휴게 시간',
          value: formatDuration(workDetails.value.breakTime)
        },
        {key: 'isNormalWork', label: '정상 근무 여부', value: formatIsNormalWork(workDetails.value.isNormalWork)
        }
      ],
    },
  ];
});
</script>

<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: '근태 내역 조회', to: '/works', active: true },
    ]" :showTabs="false"/>
    <Filter :tabs="tabOptions" :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="works" @click-detail="openDetailsModal"/>

    <!-- Pagination -->
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"/>

    <!-- 출퇴근 상세 모달 -->
    <SideModal
        v-if="showModal"
        :visible="showModal"
        :title="'상세 출퇴근 정보'"
        icon="fa-clock"
        :sections="modalSections"
        :readonly="true"
        @update:visible="showModal = $event"
        @close="closeModal"
        :showSubmit="false"
    />

  </main>
</template>
