<script setup>
import BaseTable from '@/components/common/BaseTable.vue'
import { ref, onMounted } from 'vue'
import Pagination from "@/components/common/Pagination.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import EmployeeFilter from "@/components/common/Filter.vue";
import Filter from "@/components/common/Filter.vue";

const approvals = ref([])

/* 컬럼명들 */
const columns = [
  { key: 'status', label: '상태' },
  { key: 'approveTitle', label: '제목' },
  { key: 'type', label: '종류' },
  { key: 'employeeName', label: '작성자' },
  { key: 'departmentName', label: '부서' },
  { key: 'createAt', label: '작성일' },
  { key: 'completeAt', label: '처리일' },
  { key: 'detail', label: '상세' }
]

/* 전체 결재 내역 */
onMounted(() => {
  approvals.value = [
    {
      status: '대기',
      title: '연차 신청서',
      writer: '김태훈',
      type: '휴가',
      department: '개발팀',
      createdAt: '2024-06-15',
      processedAt: '-'
    },
    {
      status: '승인',
      title: '출장비 청구서',
      writer: '이하나',
      type: '출장',
      department: '영업팀',
      createdAt: '2024-06-12',
      processedAt: '2024-06-13'
    }
  ]
})

</script>

<template>
  <section>
    <!-- 1. 탭이 있는 부분 -->
    <HeaderWithTabs
      :headerItems="[
        { label: '전체 결재 목록', active: true }
      ]"
      :showTabs="false"
    />

    <!-- 2. 필터 -->
    <Filter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />

    <!-- 3. 결재 목록 표 -->
    <BaseTable :columns="columns" :rows="approvals" :classMap="statusClassMap" />

    <!-- 4. 페이징 처리 -->
    <Pagination/>
  </section>
</template>