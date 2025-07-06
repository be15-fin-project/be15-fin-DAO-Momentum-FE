<script setup>
import {computed, ref} from 'vue';
import OvertimeForm from "@/features/approvals/components/approveType/OvertimeForm.vue";
import CancelForm from "@/features/approvals/components/approveType/CancelForm.vue";
import WorkCorrectionForm from "@/features/approvals/components/approveType/WorkCorrectionForm.vue";
import RemoteWorkForm from "@/features/approvals/components/approveType/RemoteWorkForm.vue";
import BusinessTripForm from "@/features/approvals/components/approveType/BusinessTripForm.vue";
import VacationForm from "@/features/approvals/components/approveType/VacationForm.vue";
import ProposalForm from "@/features/approvals/components/approveType/ProposalForm.vue";
import ReceiptForm from "@/features/approvals/components/approveType/ReceiptForm.vue";
import ApproveReasonList from "@/features/approvals/components/ApproveReasonList.vue";

/* 승인/반려 사유 */
const reason = ref('');
const rejectError = ref('');

/* 부모에게 받아 온 값 */
const {
  approveDTO,
  parentApproveDTO,
  approveFileDTO,
  approveLineGroupDTO,
  formDetail,
  isReadOnly
} = defineProps({
  approveDTO: { type: Object, required: true },
  parentApproveDTO: { type: Object, default: null },
  approveFileDTO: { type: Array, default: () => [] },
  approveLineGroupDTO: { type: Object },
  formDetail: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
});

/* 대기 상태인 경우 */
const canAction = computed(() => {
  return approveDTO.statusType === 'PENDING'
})

/* form에 따라서 매핑 하기 */
const formMap = {
  WORKCORRECTION: WorkCorrectionForm,
  OVERTIME: OvertimeForm,
  REMOTEWORK: RemoteWorkForm,
  BUSINESSTRIP: BusinessTripForm,
  VACATION: VacationForm,
  PROPOSAL: ProposalForm,
  RECEIPT: ReceiptForm,
  CANCEL: CancelForm
};

const selectedFormComponent = computed(() => {
  return formMap[approveDTO.approveType] || null;
});

const emit = defineEmits(['approve', 'reject']);

  /* 반려 하기 */
  function handleReject() {
    if (!reason.value || reason.value.trim() === '') {
      rejectError.value = '반려 사유는 반드시 입력해야 합니다.';
      return;
    }
    console.log('emit reject:', reason.value); // ← 이 값이 null이 아닌지 확인

    rejectError.value = '';
    emit('reject', reason.value);
  }
</script>

<template>
  <div class="form-wrapper">
    <div class="form-container">
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-pen-nib"></i>제목
        </h3>
        <div class="form-group">
          <input
            type="text"
            class="form-input enhanced"
            :class="{ readonly: isReadOnly }"
            :value="approveDTO.approveTitle"
            :readonly="isReadOnly"
            placeholder="제목을 입력하세요"
          />
        </div><br>
      </section>

      <div class="form-group-row">
        <div class="form-group half-width">
          <h3 class="section-title">
            <i class="fas fa-user"></i>작성자
          </h3>
          <div class="readonly-box">
            {{ `${approveDTO.departmentName} ${approveDTO.employeeName}` }}
          </div>
        </div>

        <div class="form-group half-width">
          <h3 class="section-title">
            <i class="fas fa-calendar-alt"></i>작성일
          </h3>
          <div class="readonly-box">
            {{ approveDTO.createAt?.slice(0, 10) }}
          </div>
        </div>
      </div>

      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-file-alt"></i>결재 내역
        </h3>
        <div class="form-group">
          <component
            :is="selectedFormComponent"
            v-if="selectedFormComponent"
            :form-data="formDetail"
            :approve-file-d-t-o="approveFileDTO"
            :parent-Approve-d-t-o="parentApproveDTO"
            :class="{ readonly: isReadOnly }"
            :is-read-only="isReadOnly"
          />
        </div>
      </section>

      <ApproveReasonList :items="approveLineGroupDTO?.[0]?.approveLineListDTOs || []" />

      <div
        v-if="canAction && isReadOnly"
        class="approve-action-wrapper"
      >
        <textarea
          v-model="reason"
          class="form-textarea"
          placeholder="승인, 반려 사유를 입력해주세요. 반려 사유는 반드시 입력되어야 합니다."
        />
        <p v-if="rejectError" class="error-message">{{ rejectError }}</p>

        <div class="form-buttons">
          <button
            type="button"
            class="btn-action btn-submit"
            @click="$emit('approve', reason)"
            data-v-fb076351 data-v-f51fb21f
          >
            승인
          </button>

          <button
            type="button"
            class="btn-action btn-reject"
            @click="handleReject"
            data-v-fb076351 data-v-f51fb21f
          >
            반려
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-wrapper {
  flex: 1;
  min-width: 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.form-container {
  margin: 0 auto;
  padding: 0 24px;
}

.form-group-row {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.form-group.half-width {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  color: var(--gray-800);
  background-color: var(--color-surface);
}

.fas {
  color: var(--blue-100);
}

.form-section {
  margin: 0;
}

.form-section:nth-of-type(2) {
  margin-top: 32px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--font-main);
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid var(--gray-200);
  border-radius: var(--form-radius);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--color-surface);
  color: var(--gray-800);
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input.enhanced {
  border: 2px solid var(--gray-200);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--blue-450);
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1),
    inset 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: var(--color-surface);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input.readonly,
.form-textarea.readonly {
  border-color: var(--gray-200);
  color: var(--gray-600);
  cursor: not-allowed;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input.readonly:focus,
.form-textarea.readonly:focus {
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  border-color: var(--gray-200);
}

.form-textarea {
  resize: vertical;
  height: 200px;
  max-height: 300px;
}

.upload-box {
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);
}

.upload-box:hover {
  border-color: var(--blue-450);
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--blue-100) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.upload-box i {
  font-size: 2rem;
  color: var(--gray-500);
  margin-bottom: 12px;
  display: block;
}

.approve-action-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.form-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 200px;
}

.error-message {
  color: var(--error-500);
  font-size: 0.9rem;
  margin-top: 4px;
  align-self: flex-start;
}
</style>