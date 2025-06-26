<template>
  <main class="main">
    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <!-- 이후 테이블 영역 -->
  </main>
</template>

<script setup>
import { ref } from 'vue';
import EmployeeFilter from '@/components/common/Filter.vue';

const filterValues = ref({});

const filterOptions = [
  {
    key: 'dept',
    label: '부서',
    icon: 'fa-building',
    type: 'select',
    options: ['전체', '개발팀', '디자인팀', '영업팀', '인사팀'],
  },
  {
    key: 'position',
    label: '직위',
    icon: 'fa-user-tie',
    type: 'select',
    options: ['전체', '사원', '대리', '과장', '차장', '부장'],
  },
  {
    key: 'role',
    label: '권한',
    icon: 'fa-shield-alt',
    type: 'select',
    options: ['전체', '일반', '관리자'],
  },
  {
    key: 'empId',
    label: '사번',
    icon: 'fa-id-badge',
    type: 'input',
    placeholder: '사번 입력',
  },
  {
    key: 'date',
    label: '등록일',
    icon: 'fa-calendar-day',
    type: 'date-range',
  }
];

function handleSearch(values) {
  console.log(' 검색 요청:', values);
  // API 호출 등 처리
}
</script>
