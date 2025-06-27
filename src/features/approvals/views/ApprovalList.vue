<script setup>
import BaseTable from '@/components/common/BaseTable.vue'
import { ref, onMounted } from 'vue'
import Pagination from "@/components/common/Pagination.vue";

const approvals = ref([])

const columns = [
  { key: 'status', label: '상태' },
  { key: 'title', label: '제목' },
  { key: 'type', label: '종류' },
  { key: 'writer', label: '작성자' },
  { key: 'department', label: '부서' },
  { key: 'createdAt', label: '작성일' },
  { key: 'processedAt', label: '처리일' },
  { key: 'detail', label: '상세' }
]

const statusClassMap = {
  '대기': 'status-wait',
  '승인': 'status-approved',
  '반려': 'status-rejected'
}

onMounted(() => {
  approvals.value = [
    {
      status: '대기',
      title: '연차 신청서',
      writer: '김태훈',
      type : '휴가',
      department: '개발팀',
      createdAt: '2024-06-15',
      processedAt: '-'
    },
    {
      status: '승인',
      title: '출장비 청구서',
      writer: '이하나',
      type : '출장',
      department: '영업팀',
      createdAt: '2024-06-12',
      processedAt: '2024-06-13'
    }
  ]
})
</script>

<template>
  <section>
    <h1 class="main-title">전체 결재 목록</h1>
    <BaseTable :columns="columns" :rows="approvals" :classMap="statusClassMap" />
    <Pagination/>
  </section>
</template>


<style scoped>
  .main-title {
    padding: 0 40px 0 3rem;
  }

</style>
