<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '공지사항 목록', to: '/announcement', active: true }
      ]"
        :submitButtons="[
        {
          label: '공지사항 작성',
          icon: 'fa-plus',
          variant: 'blue',
          event: 'openModal'
        }
      ]"
        :showTabs="false"
        @openModal="goToCreate"
    />

    <!-- 필터 -->
    <Filter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <!-- 테이블 -->
    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="row => openDetail(row.announcementId)"
    />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage > 1"
        :total-pages="pagination.totalPage"
        v-model="pagination.currentPage"
    />
  </main>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import Filter from '@/components/common/Filter.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import { getDepartments } from '@/features/works/api.js';
import { getAnnouncementList } from '@/features/announcement/api.js';
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";

// 상태
const router = useRouter();
const filterValues = ref({});
const tableData = ref([]);
const pagination = ref({ currentPage: 1, totalPage: 1 });

const departmentTree = ref([]);
const filterOptions = ref([]);

// 날짜 포맷 함수
function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// 필터 초기화
function initFilters() {
  filterOptions.value = [
    {
      key: 'title',
      label: '제목',
      icon: 'fa-heading',
      type: 'input',
      placeholder: '제목 입력',
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value,
    },
    {
      key: 'name',
      label: '작성자',
      icon: 'fa-user',
      type: 'input',
      placeholder: '작성자 입력',
    },
    {
      key: 'date',
      label: '작성일',
      icon: 'fa-calendar-day',
      type: 'date-range',
    },
    {
      key: 'sortDirection',
      label: '정렬 조건',
      icon: 'fa-sort',
      type: 'select',
      options: ['최신순', '과거순'],
    },
  ];
}

// 필터 파라미터 정리
function normalizeFilterParams(values) {
  const normalized = { ...values };

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  if (normalized.sortDirection === '최신순') normalized.sortDirection = 'DESC';
  else if (normalized.sortDirection === '과거순') normalized.sortDirection = 'ASC';

  return normalized;
}

// 공지 목록 조회
const handleSearch = async (values) => {
  try {
    const params = {
      ...normalizeFilterParams(values),
      page: pagination.value.currentPage,
      size: 10,
    };

    const res = await getAnnouncementList(params);
    const responseData = res.data?.data;

    tableData.value = (responseData.announcements ?? []).map(item => ({
      ...item,
      createdAt: formatDateTime(item.createdAt) // 날짜 포맷 적용
    }));

    pagination.value = {
      currentPage: responseData.pagination?.currentPage || 1,
      totalPage: responseData.pagination?.totalPage || 1,
    };
  } catch (err) {
    console.error('공지사항 목록 조회 실패:', err);
    tableData.value = [];
    pagination.value = { currentPage: 1, totalPage: 1 };
  }
};

// 페이지 변경 시 재조회
watch(() => pagination.value.currentPage, () => {
  handleSearch(filterValues.value);
});

// 초기 로딩
onMounted(async () => {
  try {
    const deptRes = await getDepartments();
    departmentTree.value = deptRes.data?.departmentInfoDTOList || [];

    initFilters();
    filterValues.value = {};
    await handleSearch({});
  } catch (e) {
    console.error('필터 초기화 실패:', e);
  }
});

// 상세 페이지 이동
const openDetail = (id) => {
  router.push(`/announcement/${id}`);
};

// 작성 페이지 이동
const goToCreate = () => {
  router.push('/announcement/create');
};

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'announcementId', label: 'No' },
  { key: 'title', label: '제목' },
  { key: 'name', label: '작성자' },
  { key: 'createdAt', label: '작성일시' },
  { key: 'action', label: '상세', type: 'button', icon: 'fa-search' },
];
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}
</style>
