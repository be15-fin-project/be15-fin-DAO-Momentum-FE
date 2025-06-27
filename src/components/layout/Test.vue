<script setup>
import { ref } from 'vue';

import Sidebar from "@/components/common/Sidebar.vue";
import Chatbot from "@/components/common/Chatbot.vue";

import EmployeeFilter from '@/components/common/Filter.vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import SideModal from '@/components/common/SideModal.vue'
import BaseButton from "@/components/common/BaseButton.vue";
import Pagination from "@/components/common/Pagination.vue";

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

const currentPage = ref(1);

const isOpen = ref(false)

const formSections = [
  { title: '기본 정보', icon: 'fa-info-circle', slot: 'basic' },
  { title: '결재선', icon: 'fa-users', slot: 'approver' }
]

function handleSubmit() {
  alert('제출됨')
}
</script>

<template>
  <div class="layout-default">
    <Sidebar/>
    <main class="main-content">
      <router-view/>

      <HeaderWithTabs
          :headerItems="[
            { label: '받은 문서함', href: 'inbox.html', active: true },
            { label: '보낸 문서함', href: 'inbox-my.html', active: false }
          ]"
          :submitButtons="[
            { label: '결재 제출', icon: 'fa-file-signature', event: 'openModal', variant: 'blue' },
            { label: '반려', icon: 'fa-times', event: 'reject', variant: 'green' },
            { label: '다운로드', icon: 'fa-trash' } // 기본 버튼 (white)
          ]"
          :tabs="[
            { label: '전체', icon: 'fa-building', href: '/inbox-all.html' },
            { label: '근태', icon: 'fa-sitemap', href: '/inbox-attendance.html' },
            { label: '영수증', icon: 'fa-shield-alt', href: '/inbox-receipt.html' }
          ]"
          :showTabs="true"
          @tabSelected="onTabSelected"
          @openModal="openModalHandler"
          @reject="rejectHandler"
      />


      <EmployeeFilter
          :filters="filterOptions"
          v-model="filterValues"
          @search="handleSearch"
      />
      <Pagination
          :pages="[1, 2, 3, 4, 5, 6]"
          v-model="currentPage"
      />
      <BaseButton type="submit" icon="paper-plane" @click="isOpen = true">결제 재출</BaseButton>

      <SideModal
          :visible="isOpen"
          title="결재 등록"
          icon="fa-file-signature"
          :sections="formSections"
          @close="isOpen = false"
          @submit="handleSubmit"
      >
        <!-- section 1 -->
        <template #basic>
          <div class="form-group">
            <label class="form-label required">사유</label>
            <input type="text" class="form-input" placeholder="예: 출장비" />
          </div>
          <div class="form-group">
            <label class="form-label required">결재 종류</label>
            <select class="form-select">
              <option value="">선택해주세요</option>
              <option value="biz">출장</option>
            </select>
          </div>
        </template>

        <!-- section 2 -->
        <template #approver>
          <ul class="detail-list">
            <li><span class="label">1단계</span><span class="value">팀장</span></li>
          </ul>
        </template>
      </SideModal>
    </main>
  </div>
  <Chatbot/>
</template>

<style scoped>
.layout-default {
  display: flex;
  align-items: flex-start;
  width: 100%;
  justify-content: space-evenly;
}

.main-content {
  flex-grow: 1;
  min-height: 100vh;
  padding: 40px 0;
  background: var(--blue-50);
  transition: padding-left 0.3s ease; /* ← 여기에 트랜지션 추가 */
}
</style>