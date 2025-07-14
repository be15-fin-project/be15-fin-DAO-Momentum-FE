<script setup>
import {ref, onMounted, computed, watch, watchEffect} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApprovalSideSection from '@/features/approvals/components/ApprovalSideSection.vue'
import WriteFormSection from "@/features/approvals/components/WriteFormSection.vue";
import {submitApproval} from "@/features/approvals/api.js";
import {useToast} from "vue-toastification";

const router = useRouter();
const route = useRoute();
const toast = useToast();

/* 결재 문서 작성에 시간이 걸려서 로딩 중을 표시하기 위해 사용하는 변수 */
const isSubmitting = ref(false);

/* form의 기본 결재 종류는 출퇴근 정정으로 설정 */
const form = ref({
  approveType: 'WORKCORRECTION',
});

const formDetail = ref({});
const uploadedFiles = ref([]);
const selectedApprovalLine = ref([]);
const selectedRefList = ref([]);

/* 결재 종류별로 텍스트화 하기 */
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

/* 문서함으로 돌아가기 */
function goBack() {
  const from = route.query.from || window.history.state?.from
  if (from === 'list') {
    router.push({ name: 'ApprovalList' })
  } else {
    router.go(-1)
  }
}

/* 결재 문서 제출하기 */
async function submitForm() {
  if (!form.value.approveTitle) {
    toast.error('제목을 입력해주세요.');
    return;
  }

  if (!formDetail.value || Object.keys(formDetail.value).length === 0) {
    toast.error('상세 내용을 작성해주세요.');
    return;
  }

  isSubmitting.value = true;

  const request = {
    parentApproveId: null,
    approveTitle: form.value.approveTitle,
    approveType: form.value.approveType,
    formDetail: formDetail.value,
    attachments: formDetail.value.attachments || [],
    approveLineLists: selectedApprovalLine.value.map((line, index) => ({
      statusId: 1,
      approveLineOrder: index + 1,
      isRequiredAll: line.requiredType === '필수' ? 'REQUIRED' : 'OPTIONAL',
      approveLineList: line.approvers.map(approver => ({
        statusId: 1,
        empId: approver.empId
      }))
    })),
    refRequests: selectedRefList.value.map(ref => ({
      empId: ref.empId,
      isConfirmed: 'N'
    }))
  };

  try {
    await submitApproval(request);

    toast.success('결재 문서 제출이 완료됐습니다.');

    await router.push({
      name: 'MyApprovalsList',
      query: { tab: 'sent' }
    });

  } catch (error) {
    console.error(error);
    toast.error('결재 문서 제출 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="approval-header">
    <div class="header-left">
      <div class="icon-wrapper">
        <i class="fas fa-file-signature"></i>
      </div>
      <h1>
        {{ approveTypeText(form.approveType) }}
      </h1>
    </div>

    <div class="header-buttons">
      <button class="blue-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> 문서함
      </button>
    </div>
  </div>

  <div class="container">
    <div v-if="isSubmitting" class="overlay">
      <div class="spinner"></div>
      <p>결재 문서를 제출 중입니다...</p>
    </div>

    <div class="approval-page">
      <div class="page-body">
        <WriteFormSection
          v-model:title="form.approveTitle"
          v-model:approve-type="form.approveType"
          v-model:form-data="formDetail"
          v-model:uploaded-files="uploadedFiles"
        />

        <ApprovalSideSection
          v-model:modelValueApprovalLines="selectedApprovalLine"
          v-model:modelValueReferenceList="selectedRefList"
          :approve-type="form.approveType"
          :read-only="false"
          :is-read-only="form.approveType === 'CANCEL'"
        />
      </div>

      <div class="form-buttons">
        <button
          type="button"
          class="btn-action btn-submit"
          data-v-fb076351 data-v-f51fb21f
          @click="submitForm"
        >
          <i data-v-fb076351="" class="fas fa-paper-plane"></i>
          제출
        </button>
      </div>
    </div>
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


.form-buttons {
  display: flex;
  justify-content: right;
  margin-top: 32px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
