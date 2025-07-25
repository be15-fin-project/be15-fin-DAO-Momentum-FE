<script setup>
import {ref, onMounted, computed, watch} from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from "@/components/common/Pagination.vue"
import Filter from "@/components/common/Filter.vue"
import TabNav from '@/components/common/NavigationTab.vue'
import {getReceivedApprovals} from "@/features/approvals/api.js";
import NotExistApproval from "@/features/approvals/components/NotExistApproval.vue";
import {getDepartments} from "@/features/works/api.js";
import { useRouter } from 'vue-router'
import {toastError} from "@/util/toastError.js";

/* 경로 이동을 의한 부분 */
const router = useRouter();

/* 결재 목록 데이터 */
const approvals = ref([]);
const pagination = ref({ totalPage: 0 });
const currentPage = ref(1);
const departmentTree = ref([]);
const filterOptions = ref([]);

/* 탭 항목 정의 */
// 현재 선택된 탭
const selectedTab = ref('ALL');

// 탭의 종류
const tabItems = [
  { label: '전체', value: 'ALL', icon: 'fa-building' },
  { label: '근태', value: 'ATTENDANCE', icon: 'fa-sitemap' },
  { label: '비용 처리', value: 'RECEIPT', icon: 'fa-receipt' },
  { label: '품의', value: 'PROPOSAL', icon: 'fa-user-tie' },
  { label: '취소', value: 'CANCEL', icon: 'fa-shield-alt' }
]

/* 필터링 정의 */
// 필터 바인딩 값
const filterValues = ref({
  approveType: null,
  receiptType: null,
  statusType: null,
  title: '',
  employeeName: '',
  deptId: null,
  completeAt: null,
  sort: null
})

watch(departmentTree, () => {
  filterOptions.value = generateBaseFilters();
}, { immediate: true });

function generateBaseFilters() {
  return [
    {
      key: 'statusType',
      label: '결재 상태',
      icon: 'fa-clipboard-check',
      type: 'select',
      options: ['전체', '대기', '승인', '반려']
    },
    {
      key: 'title',
      label: '제목',
      icon: 'fa-heading',
      type: 'input',
      placeholder: '제목 검색'
    },
    {
      key: 'employeeName',
      label: '기안자',
      icon: 'fa-user',
      type: 'input',
      placeholder: '기안자 이름 입력'
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value // 이건 ref reactive라서 반응함
    },
    {
      key: 'completeAt',
      label: '등록일',
      icon: 'fa-calendar-day',
      type: 'date-range'
    },
    {
      key: 'sort',
      label: '처리일',
      icon: 'fa-sort',
      type: 'select',
      options: ['최신순', '오래된순']
    }
  ];
}

/* 동적 필터 */
// 비용 처리 필터
const receiptTypeFilter = {
  key: 'receiptType',
  label: '비용 처리 종류',
  icon: 'fa-receipt',
  type: 'select',
  options: ['전체', '식비', '출장비', '비품 구입비', '기타']
}

// 근태 필터
const attendanceTypeFilter = {
  key: 'approveType',
  label: '근태 종류',
  icon: 'fa-clock',
  type: 'select',
  options: ['전체', '출퇴근 정정', '재택 근무', '초과 근무', '출장', '휴가']
}

// 동적 필터 조합
const visibleFilterOptions = computed(() => {
  const filters = [...filterOptions.value];

  if (selectedTab.value === 'RECEIPT') {
    filters.splice(1, 0, receiptTypeFilter);
  } else if (selectedTab.value === 'ATTENDANCE') {
    filters.splice(1, 0, attendanceTypeFilter);
  }

  return filters;
});

/* 테이블 컬럼 정의 */
const columns = [
  { key: 'statusType', label: '상태' },
  { key: 'approveTitle', label: '제목' },
  { key: 'approveType', label: '종류' },
  { key: 'employeeName', label: '작성자' },
  { key: 'departmentName', label: '부서' },
  { key: 'createAt', label: '작성일' },
  { key: 'completeAt', label: '처리일' },
  { key: 'action', label: '상세' }
]

/* 결재 상태과 결재 타입 매핑을 위한 부분 */
// 승인 종류
const statusTypeMap = {
  'PENDING': '대기',
  'ACCEPTED': '승인',
  'REJECTED': '반려'
};

// 결재 종류
const approveTypeMap = {
  'PROPOSAL': '품의',
  'RECEIPT': '비용 처리',
  'BUSINESSTRIP': '출장',
  'VACATION': '휴가',
  'REMOTEWORK': '재택 근무',
  'OVERTIME': '초과 근무',
  'WORKCORRECTION': '출퇴근 정정',
  'CANCEL': '취소'
};

// 상태 아이디를 기반으로 승인, 대기, 출장 구분
function convertStatusToId(status) {
  const statusMap = {
    '대기': 1,
    '승인': 2,
    '반려': 3
  };

  return statusMap[status] || null;
}

// 정렬 변환
function convertSort(sort) {
  const statusMap = {
    '최신순': 'desc',
    '오래된순': 'asc'
  };

  return statusMap[sort] || null;
}

// approveType 변환
function convertApproveType(tab, approveTypeLabel) {
  const map = {
    'ATTENDANCE': {
      '출퇴근 정정': 'WORKCORRECTION',
      '초과 근무': 'OVERTIME',
      '재택 근무': 'REMOTEWORK',
      '출장': 'BUSINESSTRIP',
      '휴가': 'VACATION'
    },
    'RECEIPT': {
      '비용 처리': 'RECEIPT'
    },
    'PROPOSAL': {
      '품의': 'PROPOSAL'
    },
    'CANCEL': {
      '취소': 'CANCEL'
    }
  };

  if (approveTypeLabel === '전체') return null;

  return map[tab]?.[approveTypeLabel] || null;
}


// 비용 처리 변환
function convertReceipt(receiptType) {
  const statusMap = {
    '식비': 'MEALEXPENSE',
    '출장비': 'TRAVELEXPENSE',
    '비품 구입비': 'SUPPLYPURCHASE',
    '기타': 'MISCELLANEOUS'
  };

  return statusMap[receiptType] || null;
}

const displayApprovals = computed(() => {
  return approvals.value.map(item => ({
    ...item,
    statusType: statusTypeMap[item.statusType] || item.statusType,
    approveType: approveTypeMap[item.approveType] || item.approveType,
    createAt: item.createAt ? item.createAt.replace('T', ' ').slice(0, 16) : '',
    completeAt: item.completeAt? item.completeAt.replace('T', ' ').slice(0, 16) : ''
  }));
});

/* 탭 클릭 시 로직 */
// 탭 클릭
const handleTabClick = () => {
  resetFilters(); // 필터들 다 초기화 하기
  currentPage.value = 1 // 1번재 페이지로 넘어가기
  fetchReceivedApprovals()// (); // 결재 문서 가져오기
}

// 필터 조건을 초기화
const resetFilters = () => {
  filterValues.value = {
    approveType: null,
    receiptType: null,
    statusType: null,
    approveTitle: '',
    employeeName: '',
    deptId: null,
    startDate: null,
    endDate: null,
    sort: null
  }
}

/* 필터 검색 이벤트 */
const handleSearch = (filters) => {
  currentPage.value = 1;
  fetchReceivedApprovals();
}

/* 결재 문서를 가져오는 api  */
async function fetchReceivedApprovals() {
  try {
    const approveListRequest = {
      tab: selectedTab.value,
      approveType:  convertApproveType(selectedTab.value, filterValues.value.approveType) || null ,
      receiptType: convertReceipt(filterValues.value.receiptType) || null,
      status: convertStatusToId(filterValues.value.statusType),
      title: filterValues.value.title || null,
      employeeName: filterValues.value.employeeName || null,
      deptId: filterValues.value.deptId || null,
      startDate: filterValues.value.completeAt_start || null,
      endDate: filterValues.value.completeAt_end || null,
      sort:  convertSort(filterValues.value.sort) || null
    }

    const pageRequest = {
      page: currentPage.value,
      size: 10
    }

    const res = await getReceivedApprovals(approveListRequest, pageRequest);
    approvals.value = res.data.data.approveDTO;
    pagination.value.totalPage = res.data.data.pagination.totalPage;
  } catch (e) {
    toast.error('결재 내역 불러오기에 실패했습니다.');
  }
}

/* 결재 내역 상세 보기로 이동 */
function handleDetailClick(row) {
  router.push({
    name: 'ApprovalDetail',
    params: { documentId: row.approveId },
    state: { source: 'inbox' },
    query: { from: 'inbox',  tab: 'received' }
  })
}

/* 페이지와 관련된 부분 */
watch(currentPage, () => {
  fetchReceivedApprovals();
});

/* mount 될 때 실행하기 */
onMounted(async () => {
  try {
    const deptRes = await getDepartments();
    departmentTree.value =  deptRes.data?.departmentInfoDTOList || [];
  } catch (err) {
    toast.error('부서 불러오기에 실패했습니다.');
  }

  filterValues.value = {};
  handleSearch();
});

onMounted(fetchReceivedApprovals);
</script>

<template>
  <section>
    <TabNav
      :tabs="tabItems"
      v-model:selected="selectedTab"
      @tab-click="handleTabClick"
    />

    <Filter
      :filters="visibleFilterOptions"
      v-model="filterValues"
      @search="handleSearch"
    />

    <div>
      <NotExistApproval v-if="approvals.length === 0" message="받은 문서가 없습니다." />
      <BaseTable v-else
                 :columns="columns"
                 :rows="displayApprovals"
                 @click-detail="handleDetailClick"
      />
    </div>

    <Pagination
      v-if="pagination.totalPage"
      :totalPages="pagination.totalPage"
      v-model="currentPage"
    />
  </section>
</template>