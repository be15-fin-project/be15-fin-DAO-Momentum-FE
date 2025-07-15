<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import OvertimeForm from '@/features/approvals/components/approveType/OvertimeForm.vue'
import WorkCorrectionForm from '@/features/approvals/components/approveType/WorkCorrectionForm.vue'
import RemoteWorkForm from '@/features/approvals/components/approveType/RemoteWorkForm.vue'
import BusinessTripForm from '@/features/approvals/components/approveType/BusinessTripForm.vue'
import VacationForm from '@/features/approvals/components/approveType/VacationForm.vue'
import ProposalForm from '@/features/approvals/components/approveType/ProposalForm.vue'
import ReceiptForm from '@/features/approvals/components/approveType/ReceiptForm.vue'
import {useRoute} from "vue-router";

const route = useRoute();
const selectedFormComponent = ref(WorkCorrectionForm);
const formData = ref({});
const isDropdownOpen = ref(false)
const isEditMode = computed(() => !!route.params.documentId)

const props = defineProps({
  title: String,
  approveType: String,
  formData: Object,
  uploadedFiles: Array
})

const formLabelMap = {
  WORKCORRECTION: '출퇴근 정정 신청서',
  OVERTIME: '초과 근무 신청서',
  REMOTEWORK: '재택 근무 신청서',
  BUSINESSTRIP: '출장 신청서',
  VACATION: '휴가 신청서',
  PROPOSAL: '품의서',
  RECEIPT: '비용 처리'
}

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

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectFormType(type) {
  emit('update:approveType', type)
  selectedFormComponent.value = formMap[type] || null
  isDropdownOpen.value = false
}

function handleClickOutside() {
  isDropdownOpen.value = false
}

function handleDocumentType(event) {
  const type = event.target.value;
  selectedFormComponent.value = formMap[type] || null;
  emit('update:approveType', type);
}

watch(
  () => props.approveType,
  (newType) => {
    selectedFormComponent.value = formMap[newType] || null
  },
  { immediate: true }
)

/* 폼 변경 시 기존 데이터 초기화 */
watch(
  () => props.approveType,
  (newType) => {
    selectedFormComponent.value = formMap[newType] || null;

    if (!isEditMode.value) {
      emit('update:title', '');
      emit('update:formData', {});
    }
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
          <!-- 커스텀 드롭다운 -->
          <div class="dropdown-wrapper" @click.stop>
            <button class="dropdown-btn" @click="toggleDropdown">
              {{ formLabelMap[props.approveType] || '결재 종류를 선택하세요.' }}
              <i class="fas fa-chevron-down icon"></i>
            </button>

            <div class="dropdown" v-if="isDropdownOpen">
              <button
                v-for="(label, value) in formLabelMap"
                :key="value"
                @click="selectFormType(value)"
                :class="{ active: props.approveType === value }"
              >
                {{ label }}
              </button>
            </div>
          </div>

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
            :uploaded-files="props.uploadedFiles"
            @update:uploaded-files="val => emit('update:uploadedFiles', val)"
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

.dropdown-wrapper {
  position: relative;
  width: 100%;
}

.dropdown-btn {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  width: 100%;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dropdown button {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  font-size: 0.95rem;
  background: none;
  border: none;
  color: var(--gray-800);
  cursor: pointer;
}

.dropdown button:hover,
.dropdown button.active {
  background-color: var(--blue-100);
  font-weight: 600;
}
</style>
