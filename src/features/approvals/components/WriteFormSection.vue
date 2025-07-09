<script setup>
import {computed, ref, watch} from 'vue'
import OvertimeForm from '@/features/approvals/components/approveType/OvertimeForm.vue'
import WorkCorrectionForm from '@/features/approvals/components/approveType/WorkCorrectionForm.vue'
import RemoteWorkForm from '@/features/approvals/components/approveType/RemoteWorkForm.vue'
import BusinessTripForm from '@/features/approvals/components/approveType/BusinessTripForm.vue'
import VacationForm from '@/features/approvals/components/approveType/VacationForm.vue'
import ProposalForm from '@/features/approvals/components/approveType/ProposalForm.vue'
import ReceiptForm from '@/features/approvals/components/approveType/ReceiptForm.vue'

const selectedFormComponent = ref(WorkCorrectionForm);
const formData = ref({});

const props = defineProps({
  title: String,
  approveType: String,
  formData: Object,
  uploadedFiles: Array
})

const emit = defineEmits([
  'update:title',
  'update:approveType',
  'update:formData',
  'update:uploadedFiles'
])

const localTitle = computed({
  get: () => props.title,
  set: val => emit('update:title', val)
})

const localFormData = computed({
  get: () => props.formData,
  set: val => emit('update:formData', val)
})

const formMap = {
  WORKCORRECTION: WorkCorrectionForm,
  OVERTIME: OvertimeForm,
  REMOTEWORK: RemoteWorkForm,
  BUSINESSTRIP: BusinessTripForm,
  VACATION: VacationForm,
  PROPOSAL: ProposalForm,
  RECEIPT: ReceiptForm
}

watch(
  () => props.approveType,
  (newType) => {
    selectedFormComponent.value = formMap[newType] || null
  },
  { immediate: true }
)

function handleDocumentType(event) {
  const type = event.target.value;
  selectedFormComponent.value = formMap[type] || null;
  emit('update:approveType', type);
}
</script>

<template>
  <div class="form-wrapper">
    <div class="form-container">
      <!-- 제목 -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-pen-nib"></i>제목
        </h3>
        <div class="form-group">
          <input
            type="text"
            class="form-input enhanced"
            placeholder="제목을 입력하세요"
            v-model="localTitle"
          />
        </div>
      </section>

      <!-- 결재 종류 -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-layer-group"></i>결재 종류
        </h3>
        <div class="form-group">
          <select class="form-select" @change="handleDocumentType">
            <option value="WORKCORRECTION">출퇴근 정정 신청서</option>
            <option value="OVERTIME">초과 근무 신청서</option>
            <option value="REMOTEWORK">재택 근무 신청서</option>
            <option value="BUSINESSTRIP">출장 신청서</option>
            <option value="VACATION">휴가 신청서</option>
            <option value="PROPOSAL">품의서</option>
            <option value="RECEIPT">영수증</option>
          </select>
        </div>
      </section>

      <!-- 선택된 결재 내역 -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-file-alt"></i>결재 내역
        </h3>
        <div class="form-group">
          <component
            :is="selectedFormComponent"
            v-if="selectedFormComponent"
            v-model:form-data="localFormData"
            :is-read-only="false"
          />
        </div>
      </section>
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

.form-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--font-main);
}

.form-group {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.form-input,
.form-select {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #1f2937;
}

.form-input.enhanced {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.fas {
  color: var(--blue-100);
}

</style>
