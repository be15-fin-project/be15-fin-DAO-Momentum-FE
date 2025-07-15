<script setup>
import { ref, onMounted, computed , watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormSection from '@/features/approvals/components/FormSection.vue'
import ApprovalSideSection from '@/features/approvals/components/ApprovalSideSection.vue'
import { approveOrReject, checkApproval, deleteApproval, getApprovalDetail } from "@/features/approvals/api.js"
import { useAuthStore } from "@/stores/auth.js"
import { useToast } from "vue-toastification";
import CommonModal from "@/components/common/CommonModal.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const isSubmitting = ref(false);
const isAccepting = ref(false);

/* 모달을 위한 변수 */
const showDeleteConfirmModal = ref(false);

/* 없는 문서인 경우를 구분하기 위한 변수 */
const fetchError = ref(false);

/* 결재에서 필요한 변수들 */
const approval = ref(null);
const status = ref('');
const approveType = ref('');
const loading = ref(false);
const myEmpId = computed(() => authStore.userId);
const myApproveLineListId = ref(null)

/* 상태 변환 함수 */
const statusText = (statusType) => {
  switch (statusType) {
    case 'PENDING': return '대기'
    case 'ACCEPTED': return '승인'
    case 'REJECTED': return '반려'
  }
}

/* 결재 문서 종류 */
const approveTypeText = (approveType) => {
  switch (approveType) {
    case 'WORKCORRECTION': return '출퇴근 정정 신청서'
    case 'OVERTIME': return '초과 근무 신청서'
    case 'REMOTEWORK': return '재택 근무 신청서'
    case 'BUSINESSTRIP': return '출장 신청서'
    case 'VACATION': return '휴가 신청서'
    case 'PROPOSAL': return '품의서'
    case 'RECEIPT': return '비용 처리'
    case 'CANCEL': return '취소'
  }
}

/* 상세 조회 api 호출 */
async function fetchApproval() {
  try {
    fetchError.value = false;

    const documentId = route.params.documentId;
    const res = await getApprovalDetail(documentId);

    approval.value = res.data.data;
    status.value = statusText(approval.value.approveDTO.statusType);
    approveType.value = approveTypeText(approval.value.approveDTO.approveType);

    /* 참조 기능 */
    if (approval.value.approveDTO.receivedType === 'REFERENCE') {
        await checkApproval(documentId);
        const newRes = await getApprovalDetail(documentId);
        approval.value = newRes.data.data;
    }
  } catch (e) {
    console.error("상세 조회 실패:", e)
    fetchError.value = true;
  }
}

/* 수정 클릭하기 */
function handleEdit() {
  sessionStorage.setItem('approvalEditState', JSON.stringify({
    approveDTO: approval.value.approveDTO,
    parentApproveDTO: approval.value.parentApproveDTO,
    approveLineGroupDTO: approval.value.approveLineGroupDTO,
    approveRefDTO: approval.value.approveRefDTO,
    approveFileDTO: approval.value.approveFileDTO,
    formDetail: approval.value.formDetail
  }));

  router.push({
    name: 'ApprovalEdit',
    params: { documentId: route.params.documentId }
  });
}

/* 결재 문서 회수하기 */
async function handleDelete() {
  try {
    await deleteApproval(route.params.documentId);
    goBack();
  } catch (e) {
    console.error('삭제 실패:', e);

    const errorCode = e?.response?.data?.errorCode;

    switch (errorCode) {
      case '30026':
        toast.error('결재가 시작되어 회수할 수 없습니다.');
        break;
      default:
        toast.error('삭제 중 오류가 발생했습니다.');
    }
  }
}

/* 내 결재선 찾기 */
watchEffect(() => {
  if (!approval.value) return;

  const groupList = approval.value.approveLineGroupDTO;
  if (!Array.isArray(groupList)) return;

  const empIdNum = Number(myEmpId.value);
  for (const group of groupList) {
    const target = group.approveLineListDTOs
      .find(line => Number(line.empId) === empIdNum);
    if (target) {
      myApproveLineListId.value = target.approveLineListId;
      return;
    }
  }

  myApproveLineListId.value = null;
});

/* 승인/반려를 처리하는 api */
async function handleApprove(isApprove, reason) {
  try {
    isAccepting.value = true;
    loading.value = true

    const payload = {
      approveLineListId: myApproveLineListId.value,
      isApproved: isApprove ? '승인' : '반려',
      reason: reason
    }

    await approveOrReject(payload);
    await fetchApproval();

  } catch (err) {
    console.error('승인/반려 실패:', err)
  } finally {
    loading.value = false
    isAccepting.value = false;
  }
}

/* 문서함으로 돌아가기 */
function goBack() {
  const from = route.query.from;
  const tab = route.query.tab;

  if (from === 'approvals') {
    router.push('/approvals')
  } else if (from === 'inbox') {
    router.push({
      path: '/approval/inbox',
      query: tab ? { tab } : {}
    })
  } else {
    router.back();
  }
}

onMounted(fetchApproval)
</script>

<template>

  <!-- 1. 결재 문서 헤더 (제목, 상태, 문서함으로 돌아가는 버튼) -->
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

  <!-- 2. 결재 내역 나오는 부분  -->
  <div v-if="approval" class="container">

    <div class="approval-page">
      <div class="page-body">
        <FormSection
          :approveDTO="approval.approveDTO"
          :parentApproveDTO="approval.parentApproveDTO"
          :approveLineGroupDTO="approval.approveLineGroupDTO"
          :approveRefDTO="approval.approveRefDTO"
          :approveFileDTO="approval.approveFileDTO"
          :formDetail="approval.formDetail"
          :isReadOnly="true"
          @approve="(reason) => handleApprove(true, reason)"
          @reject="(reason) => handleApprove(false, reason)"
          @request-delete="showDeleteConfirmModal = true"
          @edit="handleEdit()"
          @submit-loading="isSubmitting = $event"
        />
        <ApprovalSideSection
          :approveLineGroupDTO="approval.approveLineGroupDTO"
          :approveRefDTO="approval.approveRefDTO"
          :is-read-only="true"
        />
      </div>
    </div>
  </div>

  <!-- 3. 에러 표시 (문서가 없거나 열람 권한이 없는 경우)  -->
  <div v-if="fetchError" class="error-message">
    <i class="fas fa-exclamation-triangle"></i>
    존재하지 않거나 열람 권한이 없는 문서 입니다.
  </div>

  <!-- 4. 삭제 모달  -->
  <CommonModal
    :visible="showDeleteConfirmModal"
    confirm-visible
    confirm-text="삭제"
    cancel-text="취소"
    @confirm="() => { showDeleteConfirmModal = false; handleDelete(); }"
    @cancel="() => { showDeleteConfirmModal = false }"
  >
    <p>정말 회수하시겠습니까?</p>
  </CommonModal>

  <div v-if="isSubmitting" class="overlay">
    <div class="spinner"></div>
    <p>결재 문서를 제출 중입니다...</p>
  </div>

  <div v-if="isAccepting" class="overlay">
    <div class="spinner"></div>
    <p>결재 진행 중 입니다.</p>
  </div>
</template>

<style scoped>
.container {
  background-color: var(--color-surface);
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

.error-message {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: var(--gray-400);
  text-align: center;
  gap: 16px;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 16px;
  display: block;
}

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
  color: var(--color-surface);
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
  color: var(--color-background);
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

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #ccc;
  border-top-color: var(--blue-400);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
