<script setup>
import {computed, onMounted, ref, watch} from "vue";
import Pagination from "@/components/common/Pagination.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import {getMyContracts} from "@/features/employee/api.js";
import {getFileUrl} from "@/features/common/api.js";

const currentPage = ref(1);
const pagination = ref({currentPage: 1, totalPage: 1});
const filterValues = ref({});
const appliedFilterValues = ref({});
const contracts = ref([]);

// 테이블 컬럼
const columns = [
  {
    key: 'type', label: '계약서 종류', format: val => {
      switch (val) {
        case 'EMPLOYEE_AGREEMENT': return '근로계약서';
        case 'SALARY_AGREEMENT': return '연봉계약서';
      }
    }
  },
  {key: 'createdAt', label: '등록일', format: val => val.split('T')[0]},
  {key: 'action', label: '다운로드'}
];

// 필터 정의
const filterOptions = computed(() => [
  /*{
    key: 'order', type: 'select', label: '정렬 (등록일)', icon: 'fa-filter', options: [
      {label: '오름차순', value: 'ASC'},
      {label: '내림차순', value: 'DESC'}
    ]
  },*/
  {
    key: 'type', type: 'select', label: '계약서 종류', icon: 'fa-filter', options: [
      {label: '전체', value: null},
      {label: '근로계약서', value: 'EMPLOYEE_AGREEMENT'},
      {label: '연봉계약서', value: 'SALARY_AGREEMENT'}
    ]
  }
]);

// 필터 파라미터 변환
const setParams = (v) => ({
  // order: v.order || null,
  type: v.type ?? null
});

// 계약서 목록 조회
const fetchSummary = async (values) => {
  const params = {
    ...setParams(values),
    page: currentPage.value,
    size: 10
  };

  try {
    const resp = await getMyContracts(params);
    contracts.value = resp.contracts || [];
    const current = resp.pagination?.currentPage || 1;
    const total = resp.pagination?.totalPage > 0 ? resp.pagination.totalPage : 1;
    pagination.value = {currentPage: current, totalPage: total};
  } catch (err) {
    contracts.value = [];
    pagination.value = {currentPage: 1, totalPage: 1};
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  appliedFilterValues.value = {...filterValues.value};
  fetchSummary(filterValues.value);
};

const downloadFile = async (row) => {
  const s3Key = row.s3Key;
  const fileName = row.fileName;

  const response = await getFileUrl({key: s3Key, fileName});
  const signedUrl = response.data?.data?.signedUrl;

  if (!signedUrl) {
    console.error('Signed URL을 가져오지 못했습니다.');
    return;
  }

  const link = document.createElement('a');
  link.href = signedUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  handleSearch();
  filterValues.value = {};
});

watch(currentPage, () => fetchSummary(filterValues.value));
</script>

<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: '내 계약서 조회', to: '/mypage/contracts', active: true }]"
        :showTabs="false"
    />
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />
    <BaseTable :columns="columns" :rows="contracts" @click-detail="downloadFile" />
    <Pagination
        v-if="pagination.totalPage"
        v-model="currentPage"
        :total-pages="pagination.totalPage"
    />
  </main>
</template>
