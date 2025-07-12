<script setup>
import {ref, onMounted, computed, watch, watchEffect} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApprovalSideSection from '@/features/approvals/components/ApprovalSideSection.vue'
import WriteFormSection from "@/features/approvals/components/WriteFormSection.vue";
import {submitApproval} from "@/features/approvals/api.js";

const router = useRouter();
const route = useRoute();

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
    approveRefList: selectedRefList.value.map(ref => ({
      empId: ref.empId,
      isConfirmed: 'N'
    }))
  };

  try {
    await submitApproval(request);

    await router.push({
      name: 'MyApprovalsList',
      query: { tab: 'sent' }
    });

  } catch (error) {
    console.error(error);
    alert('제출 중 오류가 발생했습니다.');

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
        />
      </div>

      <div class="form-buttons">
        <button
          type="button"
          class="btn-action btn-submit"
          data-v-fb076351 data-v-f51fb21f
          @click="submitForm"
        >
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
</style>
