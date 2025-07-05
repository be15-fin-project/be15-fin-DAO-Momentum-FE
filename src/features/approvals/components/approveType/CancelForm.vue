<script setup>
import {computed, onMounted, ref} from 'vue';
import BusinessTripForm from "@/features/approvals/components/approveType/BusinessTripForm.vue";
import ReceiptForm from "@/features/approvals/components/approveType/ReceiptForm.vue";
import RemoteWorkForm from "@/features/approvals/components/approveType/RemoteWorkForm.vue";
import ProposalForm from "@/features/approvals/components/approveType/ProposalForm.vue";
import VacationForm from "@/features/approvals/components/approveType/VacationForm.vue";
import OvertimeForm from "@/features/approvals/components/approveType/OvertimeForm.vue";
import WorkCorrectionForm from "@/features/approvals/components/approveType/WorkCorrectionForm.vue";
import {getApprovalDetail} from "@/features/approvals/api.js";

/* 부모에게서 값 받아오기 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] },
  parentApproveDTO: {type: Object, required: true
  }
});

/* 취소 사유 */
const cancelForm = ref({
  cancelReason: ''
});

/* 부모 결재 내역 */
const parentApprove = ref(null);

/* 부모 결재 내역의 타입이 어딘지에 따라 안에 가져오는 폼이 달라짐 */
const matchedComponent = computed(() => {
  switch (props.parentApproveDTO.approveType) {
    case 'BUSINESSTRIP':
      return BusinessTripForm;
    case 'RECEIPT':
      return ReceiptForm;
    case 'REMOTEWORK':
      return RemoteWorkForm;
    case 'PROPOSAL':
      return ProposalForm;
    case 'VACATION':
      return VacationForm;
    case 'OVERTIME':
      return OvertimeForm;
    case 'WORKCORRECTION':
        return WorkCorrectionForm;
  }
});

/* 취소 사유 입력 - 수정 부분을 위해 필요한 부분 */
function validateForm() {
  if (!cancelForm.value.cancelReason.trim()) {
    alert('취소 사유를 반드시 입력해주세요.');
    return false;
  }
  return true;
}

/* mount 하기 */
onMounted(async () => {
  const parentId = props.parentApproveDTO.approveId;
  const response = await getApprovalDetail(parentId);
  parentApprove.value = response.data.data;
  console.log(parentApprove.value);
});
</script>

<template>
  <!-- 1. 취소 되는 문서 -->
  <div class="cancel-banner">
    <div class="cancel-title">
      <strong>취소 요청 문서</strong>
    </div>
    <p class="cancel-subtitle">
      아래는 취소 대상이 되는 원본 결재 내용입니다.
    </p>

    <div class="original-form-wrapper">
      <component
        v-if="matchedComponent && parentApprove && parentApprove.formDetail"
        :is="matchedComponent"
        :formData="parentApprove.formDetail"
        :isReadOnly="true"
      />
    </div>
  </div>

  <!-- 2. 취소 사유 -->
  <div class="form-section">
    <div class="form-grid">
      <div class="form-group full-width">
        <label class="form-label required">취소 사유</label>
        <textarea v-model="cancelForm.cancelReason" class="form-textarea" required></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  margin-bottom: 40px;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.form-textarea {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  color: var(--blue-300);
  box-shadow: 0 0 0 4px var(--form-shadow);
  transform: translateY(-1px);
}

.cancel-banner {
  border: 2px solid var(--blue-100);
  background-color: var(--blue-50);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.cancel-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--blue-300);
  margin-bottom: 8px;
}

.cancel-subtitle {
  font-size: 0.95rem;
  color: var(--blue-400);
  margin-bottom: 16px;
}

.original-form-wrapper {
  border: 1px solid var(--blue-100);
  padding: 20px;
  border-radius: 10px;
}
</style>
