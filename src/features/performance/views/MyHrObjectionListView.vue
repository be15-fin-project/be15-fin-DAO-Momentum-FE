<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: '이의제기 내역', to: '/my/hr-objections', active: true }]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
        :tabs="tabOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="goToDetail"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        v-model="currentPage"
        :total-pages="pagination.totalPage"
    />
  </main>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import {
  getEvaluationRoundNos,
  getMyHrObjections
} from '@/features/performance/api.js'
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue'
import EmployeeFilter from '@/components/common/Filter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const currentPage = ref(1)
const pageSize = 10
const filterValues = ref({ status: 'PENDING' });
const tableData = ref([])
const pagination = ref({currentPage: 1, totalPage: 1})
const roundList = ref([]);
const filterOptions = ref([]);

const fetchRoundNos = async () => {
  roundList.value = await getEvaluationRoundNos();
};

const initFilters = () => {
  filterOptions.value = [
    {
      key: 'roundNo',
      label: '회차',
      icon: 'fa-list-ol',
      type: 'select',
      options: ['전체', ...roundList.value.map(r => ({
        label: `${r.roundNo} 회차`,
        value: r.roundNo
      }))]
    }
  ];
};

const tabOptions = [
  { key: 'status', label: '대기', value: 'PENDING' },
  { key: 'status', label: '승인', value: 'ACCEPTED' },
  { key: 'status', label: '반려', value: 'REJECTED' },
  { key: 'status', label: '취소', value: 'CANCELLED' }
];

const tableColumns = [
  {key: 'roundNo', label: '회차'},
  {key: 'overallGrade', label: '등급'},
  {key: 'statusType', label: '상태'},
  {key: 'createdAt', label: '제출일자'},
  {key: 'action', label: '상세'},
]


const normalizeFilterParams = (values) => {
  const normalized = { ...values };
  if (normalized.roundNo === '전체') {
    normalized.roundNo = null;
  }

  switch (values.status) {
    case 'ACCEPTED':
      normalized.statusId = 2;
      normalized.isDeleted = 'N';
      break;
    case 'REJECTED':
      normalized.statusId = 3;
      normalized.isDeleted = 'N';
      break;
    case 'CANCELLED':
      normalized.statusId = 2;
      normalized.isDeleted = 'Y';
      break;
    default:
      normalized.statusId = 1;
      break;
  }

  return normalized;
};


const handleSearch = async (values) => {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: pageSize,
  }

  try {
    const resData = await getMyHrObjections(params)
    tableData.value = resData.content ?? []
    pagination.value = {
      currentPage: resData.pagination?.currentPage || 1,
      totalPage: Math.max(resData.pagination?.totalPage || 1, 1)
    };

  } catch (e) {
    console.error('이의제기 목록 조회 실패:', e)
    tableData.value = []
  }
}

function goToDetail(row) {
  router.push(`/my/hr-objections/${row.objectionId}`)
}

watch(currentPage, () => {
  handleSearch(filterValues.value)
})

onMounted(async () => {
  try {
    await Promise.all([fetchRoundNos()]);
    await handleSearch(filterValues.value);
    initFilters();
  } catch (e) {
    console.error('초기화 실패:', e);
  }
})
</script>
