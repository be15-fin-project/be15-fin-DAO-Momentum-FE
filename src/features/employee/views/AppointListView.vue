<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import SideModal from "@/components/common/SideModal.vue";
import {getDepartments, getPositions} from "@/features/works/api.js";
import {createAppoint, getAppoints, getEmployeeDetails} from "@/features/employee/api.js";
import {useToast} from "vue-toastification";
import dayjs from "dayjs";

const toast = useToast();
const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const appoints = ref([]);

const positionFilterOptions = ref([]);

const departmentTree = ref([]);
const deptOptions = ref([]);

const showModal = ref(false);

const columns = [
  {key: 'empNo', label: '사번'},
  {key: 'empName', label: '사원명'},
  {key: 'beforeDeptName', label: '기존 부서', format: val => val || '-'},
  {key: 'beforePositionName', label: '기존 직위'},
  {key: 'afterDeptName', label: '발령 부서', format: val => val || '-'},
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
  {key: 'deptId', type: 'tree', label: '발령 부서', icon: 'fa-building', options: departmentTree.value},
  {key: 'positionId', type: 'select', label: '발령 직위', icon: 'fa-user-tie', options: positionFilterOptions.value},
  {key: 'appointDate', type: 'date-range', label: '발령일', icon: 'fa-calendar-day'},
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
  const depts = await getDepartments();
  const raw = depts.data?.departmentInfoDTOList || [];
  departmentTree.value = raw;
  deptOptions.value = raw;
  const positions = await getPositions();
  positionFilterOptions.value = [{label: '전체', value: null}, ...positions.map(p => ({
    label: p.name,
    value: p.positionId,
    level: p.level
  }))];
  positionOptions.value = [...positions.map(p => ({label: p.name, value: p.positionId, level: p.level}))];
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

const positionOptions = ref([]);

const req = reactive({
  empId: null,
  type: null,
  positionId: null,
  deptId: null,
  appointDate: dayjs().format('YYYY-MM-DD')
});

const initializeRequest = () => {
  req.empId = null;
  req.type = null;
  req.positionId = null;
  req.deptId = null;
  req.appointDate = dayjs().format('YYYY-MM-DD');
}

watch(
    () => [req.type, req.empId],
    async ([type, empId]) => {
      if (type === "PROMOTION" && empId) {
        // 1) 현재 사원 정보 조회
        const resp = await getEmployeeDetails(empId);
        const currentDept = resp.employeeDetails.deptId;
        const currentPos = resp.employeeDetails.positionId;

        // 2) 승진 순위 리스트에서 현재 직위 다음 단계 찾기
        const currLevel = positionOptions.value.find(p => p.value === currentPos)?.level;
        const next = positionOptions.value.find(p => p.level === currLevel - 1);

        // 3) req 에 자동 세팅
        req.positionId = next ? next.value : null;
        req.deptId = currentDept;

      } else if (type !== "PROMOTION") {
        // 승진이 아닐 경우(소속 이동 등)에는 입력 가능하도록 초기화
        req.deptId = null;
        req.positionId = null;
      }
    },
    {immediate: false}
);

const openCreateModal = () => {
  initializeRequest()
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
}

function findDeptName(list, id) {
  for (const n of list) {
    if (n.deptId === id) return n.name;
    if (n.childDept) {
      const v = findDeptName(n.childDept, id);
      if (v) return v;
    }
  }
}

function getPositionField() {
  const positionField = {
    key: 'positionId',
    label: '발령 직위',
    type: 'select',
    editable: !isPromotion.value,
    required: true,
    options: positionOptions.value || [],
  };
  if (isPromotion.value) {
    positionField.value = positionOptions.value.find(o => o.value === req.positionId)?.label || ''
  } else {
    positionField.value = req.positionId
  }

  return positionField
}

function getDeptField() {
  if (isPromotion.value) {
    return {
      key: 'deptId',
      label: '발령 부서',
      type: 'input',
      editable: false,
      required: true,
      value: findDeptName(deptOptions.value, req.deptId)
    };
  }
  return {
    key: 'deptId',
    label: '발령 부서',
    type: 'deptList',
    editable: true,
    required: true,
    list: deptOptions.value,
    value: req.deptId
  };
}

const isPromotion = computed(() => req.type === 'PROMOTION')
const modalSections = computed(() => [
    {
      title: '발령 정보',
      icon: 'fa-user',
      layout: 'one-column',
      fields: [
        {
          key: 'empId',
          label: '사원',
          type: 'memberPicker',
          treeData: departmentTree.value || [],
          editable: true,
          required: true,
          placeholder: '1'
        },
        {
          key: 'type', label: '발령 종류', type: 'select', editable: true, required: true, options: [
            {label: '소속 이동', value: 'DEPARTMENT_TRANSFER'},
            {label: '승진', value: 'PROMOTION'}
          ]
        },
        getPositionField(),
        getDeptField(),
        {key: 'appointDate', label: '발령일', type: 'date', editable: true, required: true}
      ]
    }
  ]
);

const handleHeaderButton = (event) => {
  if (event.value === 'create') {
    openCreateModal();
  }
}

/* TODO: 프론트 예외 처리 */
const handleRegisterSubmit = async (req) => {
  try {
    const resp = await createAppoint(req);
    closeModal();
    handleSearch(); // 목록 새로고침
    toast.success("발령 등록 성공")
  } catch (e) {
    toast.error('발령 등록 실패');
  }
};
</script>

<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: '인사 발령 내역 조회', to: '/appoints', active: true },
    ]"
                    :submitButtons="[{ label: '등록', icon: 'fa-user-plus', event: 'click', value: 'create', variant: 'blue'}]"
                    :showTabs="false"
                    @click="handleHeaderButton"
    />
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="appoints" @click-detail="handleRegisterSubmit"/>

    <!-- Pagination -->
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"/>

    <!-- 발령 등록 사이드 모달 -->
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