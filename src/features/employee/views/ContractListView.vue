<script setup>
import {computed, onMounted, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import {createEmployee, getContracts, getDownloadUrl} from "@/features/employee/api.js";
import SideModal from "@/components/common/SideModal.vue";
import {useRouter} from "vue-router";

const router = useRouter();

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const appliedFilterValues = ref({});
const contracts = ref([]);

const showModal = ref(false);

const columns = [
  {key: 'empNo', label: '사번'},
  {key: 'empName', label: '사원명'},
  // {key: 'deptName', label: '부서'},
  // {key: 'positionName', label: '직위'},
  {
    key: 'type', label: '계약서 종류', format: val => {
      switch (val) {
        case 'EMPLOYEE_AGREEMENT':
          return '근로계약서';
        case 'SALARY_AGREEMENT':
          return '연봉계약서';
      }
    }
  },
  {key: 'createdAt', label: '등록일', format: val => val.split('T')[0]},
  {key: 'action', label: '다운로드'},
  /* TODO: 베이스테이블 수정 후 "삭제" 버튼 추가*/
];

// 필터
const filterOptions = computed(() => [
  {key: 'empNo', type: 'input', label: '사번', icon: 'fa-id-badge', placeholder: '사번 입력'},
  {key: 'empName', type: 'input', label: '사원명', icon: 'fa-user', placeholder: '이름 입력'},
  // {key: 'deptId', type: 'select', label: '부서', icon: 'fa-building', options: deptOptions.value},
  // {key: 'positionId', type: 'select', label: '직위', icon: 'fa-user-tie', options: positionOptions.value},
  {key: 'createdAt', type: 'date-range', label: '등록일', icon: 'fa-calendar-day'},
  {
    key: 'order', type: 'select', label: '정렬 (등록일)', icon: 'fa-filter', options: [
      {label: '오름차순', value: 'ASC'},
      {label: '내림차순', value: 'DESC'}
    ]
  },
  {
    key: 'type',
    type: 'select',
    label: '계약서 종류',
    options: [
      {label: '전체', value: null},
      {label: '근로계약서', value: 'EMPLOYEE_AGREEMENT'},
      {label: '연봉계약서', value: 'SALARY_AGREEMENT'}
    ]
  }
]);

const setParams = (v) => {
  return {
    empNo: v.empNo || null,
    empName: v.empName || null,
    // deptId: v.deptId ?? null,
    // positionId: v.positionId ?? null,
    searchStartDate: v.createdAt_start || null,
    searchEndDate: v.createdAt_end || null,
    order: v.order || null,
    type: v.type ?? null,
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
    const resp = await getContracts(params);
    console.log(resp);
    contracts.value = resp.contracts || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (err) {
    contracts.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};
  }
}

const handleSearch = () => {
  currentPage.value = 1;
  appliedFilterValues.value = {...filterValues.value}; // 검색 후에 column 변동
  fetchSummary(filterValues.value);
}

onMounted(async () => {
  // const positions = await getPositions();
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));

const req = ref({
  empId: null,
  type: null,
  salary: null,
  attachment:
      {
        s3Key: null,
        type: null
      }
});

const initializeRequest = () => {
  req.value = {
    empId: null,
    type: null,
    salary: null,
    attachment: {
      s3Key: null,
      type: null
    }
  };
}

const openCreateModal = () => {
  initializeRequest()
  showModal.value = true;
};

const downloadFile = async (row) => {
  const s3Key = row.s3Key;
  const signedUrl = await getDownloadUrl(s3Key);

  const link = document.createElement('a');
  link.href = signedUrl;
  link.download = ''; // or you can set a filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const closeModal = () => {
  showModal.value = false;
}

/* TODO
* 1. empId 대신 조직도 타는 쪽으로 변경
* 2. 파일 업로드 로직 및 form 작성
* */
const modalSections = computed(() => {
  const salaryEditable = req.value.type === 'SALARY_AGREEMENT';

  return [
    {
      title: '계약서 정보',
      icon: 'fa-info-circle',
      layout: 'two-column',
      fields: [
        {key: 'empId', label: '사원ID', type: 'number', editable: true, required: true, placeholder: '1'},
        {key: 'file', label: '첨부 파일', type: 'file', editable: true, required: true},
        {
          key: 'type', label: '계약서 종류', type: 'select', editable: true, required: true, options: [
            {label: '근로계약서', value: 'EMPLOYEE_AGREEMENT'},
            {label: '연봉계약서', value: 'SALARY_AGREEMENT'},
          ],
          value: req.value.type
        },
        {
          key: 'salary',
          label: '연봉',
          type: 'input',
          editable: salaryEditable,
          placeholder: '40000000'
        }
      ]
    }
  ];
});

const handleRegisterSubmit = async (req) => {
  try {
    const resp = await createEmployee(req);
    closeModal();
    handleSearch(); // 목록 새로고침
  } catch (e) {
    console.error('등록 실패:', e);
  }
};

const handleHeaderButton = (event) => {
  if (event.value === 'create') {
    openCreateModal();
  }
}

watch(() => req.value.type, (newType) => {
  if (newType !== 'SALARY_AGREEMENT') {
    req.value.salary = null;
  }
}, { immediate: true });

</script>

<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '계약서 목록 조회', to: '/contracts', active: true },
    ]"
        :submitButtons="[{label: '계약서 등록', icon: 'fa-file-signature', event: 'click', value: 'create', variant: 'blue'}]"
        :showTabs="false"
        @click="handleHeaderButton"
    />
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch"/>

    <!-- Table Section -->
    <BaseTable :columns="columns" :rows="contracts" @click-detail="downloadFile"/>

    <!-- Pagination -->
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"/>

    <!-- 계약서 등록 모달 -->
    <SideModal
        v-if="showModal"
        :visible="showModal"
        v-model:form="req"
        :title="'계약서 등록'"
        icon="fa-file-signature"
        @close="closeModal"
        :sections="modalSections"
        @submit="handleRegisterSubmit(req)"
    />

  </main>
</template>
