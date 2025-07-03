<script setup>
import { computed } from 'vue';
import OvertimeForm from "@/features/approvals/components/approveType/OvertimeForm.vue";
import CancelForm from "@/features/approvals/components/approveType/CancelForm.vue";
import WorkCorrectionForm from "@/features/approvals/components/approveType/WorkCorrectionForm.vue";
import RemoteWorkForm from "@/features/approvals/components/approveType/RemoteWorkForm.vue";
import BusinessTripForm from "@/features/approvals/components/approveType/BusinessTripForm.vue";
import VacationForm from "@/features/approvals/components/approveType/VacationForm.vue";
import ProposalForm from "@/features/approvals/components/approveType/ProposalForm.vue";
import ReceiptForm from "@/features/approvals/components/approveType/ReceiptForm.vue";
import ApproveReasonList from "@/features/approvals/components/ApproveReasonList.vue";

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
  isReadOnly: { type: Boolean, default: true }
});

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
        <h3 class="section-title">
          <i class="fas fa-user"></i>작성자
        </h3>
        <div class="form-group">
          <input
            type="text"
            class="form-input enhanced"
            :class="{ readonly: isReadOnly }"
            :value="`${approveDTO.departmentName} ${approveDTO.employeeName}`"
            :readonly="isReadOnly"
          />
        </div>
      </section>

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
    </div>
  </div>
</template>

<style scoped>
.form-wrapper {
  flex: 1;
  min-width: 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xsm);
}

.form-container {
  margin: 0 auto;
  padding: 0 24px;
}

.fas{
  color: var(--blue-100)
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
.form-select,
.form-textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #1f2937;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input.enhanced {
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1),
    inset 0 1px 3px rgba(0, 0, 0, 0.05);
  background: white;
}

.form-input::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.form-input.readonly,
.form-select.readonly,
.form-textarea.readonly {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #4b5563;
  cursor: not-allowed;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input.readonly:focus,
.form-select.readonly:focus,
.form-textarea.readonly:focus {
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  border-color: #e5e7eb;
}

.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.upload-box:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
}

.upload-box i {
  font-size: 2rem;
  color: #64748b;
  margin-bottom: 12px;
  display: block;
}

.reason-readonly {
  background-color: #f3f4f6;
  color: #374151;
  cursor: not-allowed;
}
</style>