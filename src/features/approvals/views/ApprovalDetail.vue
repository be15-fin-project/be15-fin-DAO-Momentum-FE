<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormSection from '@/features/approvals/components/FormSection.vue'
import ApprovalSideSection from '@/features/approvals/components/ApprovalSideSection.vue'
import {getApprovalDetail} from "@/features/approvals/api.js";

const router = useRouter();
const route = useRoute();

const approveType = ref('');
const status = ref('');
const approval = ref(null);

/* 글자 변환하기 */
// 결재 상태를 변환
const statusText = (statusType) => {
  switch (statusType) {
    case 'PENDING':
      return '대기'
    case 'ACCEPTED':
      return '승인'
    case 'REJECTED':
      return '반려'
  }
}

// 결재 문서 타입을 변환
const approveTypeText = (approveType) => {
  switch (approveType) {
    case 'WORKCORRECTION':
      return '출퇴근 정정 신청서'
    case 'OVERTIME':
      return '초과 근무 신청서'
    case 'REMOTEWORK':
      return '재택 근무 신청서'
    case 'BUSINESSTRIP':
      return '출장 신청서'
    case 'VACATION':
      return '휴가 신청서'
    case 'PROPOSAL':
      return '품의서'
    case 'RECEIPT':
      return '영수증'
    case 'CANCEL':
      return '취소'
  }
}

/* 이전 페이지로 넘어가는 함수 */
function goBack() {
  const from = route.query.from || window.history.state?.from
  if (from === 'list') {
    router.push({ name: 'ApprovalList' })
  } else {
    router.go(-1)
  }
}

/* 상세조회 api 가져오기 */
async function fetchApproval() {
  try {
      const documentId = route.params.documentId;
      const res = await getApprovalDetail(documentId);
      approval.value = res.data.data;
      status.value = statusText(approval.value.approveDTO.statusType);
      approveType.value = approveTypeText(approval.value.approveDTO.approveType);
    } catch (e) {
      console.log(e);
    }
}

onMounted(fetchApproval);
</script>

<template>
  <div v-if="approval" class="approval-header">
    <div class="header-left">
      <div class="icon-wrapper">
        <i class="fas fa-file-signature"></i>
      </div>
      <h1>
        {{ approveType }}
        <span
          class="doc-status"
          :class="{
            'status-wait': status === '대기',
            'status-approved': status === '승인',
            'status-rejected': status === '반려'
          }"
        >
          {{ status }}
        </span>
      </h1>
    </div>

    <div class="header-buttons">
      <button class="blue-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> 문서함
      </button>
    </div>
  </div>

  <div v-if="approval" class="container">
    <div class="approval-page">
      <div class="page-body">
        <FormSection
          :approveDTO="approval.approveDTO"
          :parentApproveDTO="approval.parentApproveDTO"
          :approveLineGroupDTO="approval.approveLineGroupDTO"
          :approveFileDTO="approval.approveFileDTO"
          :formDetail="approval.formDetail"
          :isReadOnly="true"
        />
        <ApprovalSideSection
          :approveLineGroupDTO="approval.approveLineGroupDTO"
          :approveRefDTO="approval.approveRefDTO"
          :is-read-only="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px 0;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 3rem;
  height: 3rem;
  background: var(--icon-gradient);
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  box-shadow: 0 4px 14px rgba(120, 127, 245, 0.08);
}

.approval-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--font-main);
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.blue-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-ss);
  border: none;
  background-color: var(--blue-300);
  color: var(--basic);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.blue-btn:hover {
  background-color: var(--blue-450);
}

.blue-btn i {
  margin-right: 8px;
}

.doc-status {
  font-size: 1rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  margin-left: 8px;
}

.status-wait {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}
.status-approved {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}
.status-rejected {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}


.container {
  background: var(--basic);
  margin: 0 40px;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--chart-shadow);
}

.approval-page {
  display: flex;
  flex-direction: column;
}

.page-body {
  display: flex;
  gap: 32px;
}
</style>
