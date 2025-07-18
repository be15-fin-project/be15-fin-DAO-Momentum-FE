<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import OvertimeForm from "@/features/approvals/components/approveType/OvertimeForm.vue";
import CancelForm from "@/features/approvals/components/approveType/CancelForm.vue";
import WorkCorrectionForm from "@/features/approvals/components/approveType/WorkCorrectionForm.vue";
import RemoteWorkForm from "@/features/approvals/components/approveType/RemoteWorkForm.vue";
import BusinessTripForm from "@/features/approvals/components/approveType/BusinessTripForm.vue";
import VacationForm from "@/features/approvals/components/approveType/VacationForm.vue";
import ProposalForm from "@/features/approvals/components/approveType/ProposalForm.vue";
import ReceiptForm from "@/features/approvals/components/approveType/ReceiptForm.vue";
import ApproveReasonList from "@/features/approvals/components/ApproveReasonList.vue";
import {submitApproval, updateApproval} from "@/features/approvals/api.js";
import {useToast} from "vue-toastification";
import {useRoute, useRouter} from "vue-router";
import BaseButton from "@/components/common/BaseButton.vue";

const router = useRouter();
const toast = useToast();
const route = useRoute();

const cancelReasonError = ref('');

/* 승인/반려 사유 */
const reason = ref('');
const rejectError = ref('');

const isEditing = ref(false);
const localApproveTitle = ref(approveDTO.approveTitle);

/* 결재 취소 요청 */
const showCancelForm = ref(false);
const showCancelButton = ref(true);

/* 결재 문서 관련 타입 */
const receivedTypes = approveDTO.receivedType?.split(',') ?? [];

const isWriter = receivedTypes.includes('WRITER'); // 문서를 쓴 사람
const isApprover = receivedTypes.includes('APPROVAL'); // 결재자
const isSentView = computed(() => route.query.tab === 'sent')

const cancelForm = ref({
  approveTitle: '결재 취소 요청',
  cancelReason: '',
});

/* 부모에게 받아 온 값 */
const {
  approveDTO,
  parentApproveDTO,
  approveFileDTO,
  approveLineGroupDTO,
  approveRefDTO,
  formDetail,
  isReadOnly
} = defineProps({
  approveDTO: { type: Object, required: true },
  parentApproveDTO: { type: Object, default: null },
  approveFileDTO: { type: Array, default: () => [] },
  approveLineGroupDTO: { type: Object },
  approveRefDTO: { type: Array },
  formDetail: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
});

/* 보낸 문서 여부 (작성자면 무조건 보낸 문서함) */
const isSent = computed(() => isWriter)

/* 승인/반려 가능 */
const canApprove = computed(
  () => isApprover && approveDTO.statusType === 'PENDING' && !isSentView.value
)

// 수정/회수/취소 가능
const canEditOrWithdrawOrCancel = computed(() => isWriter)

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

const emit = defineEmits(['approve', 'reject', 'request-delete', 'edit', 'submit-loading']);

/* 결재 문서 반려 하기 */
function handleReject() {
  if (!reason.value || reason.value.trim() === '') {
    rejectError.value = '반려 사유는 반드시 입력해야 합니다.';
    return;
  }

  rejectError.value = '';
  emit('reject', reason.value);
}

watch(() => cancelForm.value.cancelReason, (newVal) => {
  if (!newVal || !newVal.trim()) {
    cancelReasonError.value = '취소 사유는 반드시 입력해야 합니다.';
  } else {
    cancelReasonError.value = '';
  }
});

watch(() => approveDTO.approveTitle, (newVal) => {
  localApproveTitle.value = newVal;
});

async function submitCancelApproval() {
  if (!cancelForm.value.cancelReason.trim()) {
    cancelReasonError.value = '※ 취소 사유는 반드시 입력해야 합니다.';
    toast.error('취소 사유를 입력해주세요.');
    return;
  }

  cancelReasonError.value = ''; // 성공 시 초기화
  emit('submit-loading', true);

  const request = {
    parentApproveId: approveDTO.approveId,
    approveTitle: cancelForm.value.approveTitle,
    approveType: 'CANCEL',
    formDetail: {
      cancelReason: cancelForm.value.cancelReason
    },
    attachments: [],

    approveLineLists: (approveLineGroupDTO || []).map((group, index) => ({
      statusId: 1,
      approveLineOrder: index + 1,
      isRequiredAll: group.approveLineDTO?.isRequiredAll ?? 'REQUIRED',
      approveLineList: (group.approveLineListDTOs || []).map(approver => ({
        empId: parseInt(approver.empId),
        statusId: 1
      }))
    })),

    refRequests: approveRefDTO.map(ref => ({
      empId: parseInt(ref.empId),
      isConfirmed: 'N'
    }))
  };
  console.log(request);
  try {
    await submitApproval(request);
    toast.success('취소 결재가 제출되었습니다.');
    await router.push({name: 'MyApprovalsList', query: {tab: 'sent'}});
  } catch (e) {
    toast.error('취소 결재 제출에 실패했습니다.');
  }
}

async function updateCancelApproval() {
  if (!formDetail.cancelReason?.trim()) {
    toast.error('※ 취소 사유는 반드시 입력해야 합니다.');
    return;
  }

  const request = {
    approveTitle: localApproveTitle.value,
    approveType: 'CANCEL',
    formDetail: {
      cancelReason: formDetail.cancelReason
    },
    attachments: approveFileDTO ?? [],
    approveLineLists: (approveLineGroupDTO || []).map((group, index) => ({
      statusId: 1,
      approveLineOrder: index + 1,
      isRequiredAll: group.approveLineDTO?.isRequiredAll ?? 'REQUIRED',
      approveLineList: (group.approveLineListDTOs || []).map(approver => ({
        empId: parseInt(approver.empId),
        statusId: 1
      }))
    })),
    refRequests: approveRefDTO.map(ref => ({
      empId: parseInt(ref.empId),
      isConfirmed: 'N'
    }))
  };

  try {
    await updateApproval(request, approveDTO.approveId);
    toast.success('취소 결재 수정이 완료되었습니다.');
    isEditing.value = false;
  } catch (e) {
    toast.error('수정에 실패했습니다.');
  }
}

function handleEditClick() {
  if (approveDTO.approveType === 'CANCEL') {
    isEditing.value = true;
  } else {
    emit('edit');
  }
}

onMounted(() => {
  if (!cancelForm.value.cancelReason.trim()) {
    cancelReasonError.value = '* 취소 사유는 반드시 입력해야 합니다.';
  }
});
</script>

<template>
  <div class="form-wrapper">
    <div class="form-container">
      <!-- 1. 결재 문서 제목 -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-pen-nib"></i>제목
        </h3>
        <div class="form-group">
          <input
            type="text"
            class="form-input enhanced"
            :class="{ readonly: isReadOnly }"
            v-model="localApproveTitle"
            :readonly="approveDTO.approveType === 'CANCEL' ? !isEditing : isReadOnly"
            placeholder="제목을 입력하세요"
          />
        </div><br>
      </section>

      <!-- 2. 작성자 -->
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

      <!-- 3. 결재 내역 -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="fas fa-file-alt"></i>결재 내역
        </h3>
        <div class="form-group">
          <!-- 각각의 결재 내역에 맞게 연결 -->
          <component
            :is="selectedFormComponent"
            v-if="selectedFormComponent"
            :form-data="formDetail"
            :approve-file-d-t-o="approveFileDTO"
            :parent-Approve-d-t-o="parentApproveDTO"
            :class="{ readonly: isReadOnly }"
            :is-read-only="approveDTO.approveType === 'CANCEL' ? !isEditing : true"
          />
        </div>
      </section>

      <!-- 4. 결재 승인 or 반려 사유 -->
      <ApproveReasonList :items="approveLineGroupDTO?.[0]?.approveLineListDTOs || []" />

      <!-- 5. 승인, 반려 하기 -->
      <div
        v-if="canApprove && isReadOnly"
        class="approve-action-wrapper"
      >
        <textarea
          v-model="reason"
          class="form-textarea"
          placeholder="승인, 반려 사유를 입력해주세요. 반려 사유는 반드시 입력되어야 합니다."
        />
        <p v-if="rejectError" class="error-message">{{ rejectError }}</p>

        <div class="form-buttons">
          <BaseButton
            type="button"
            class="btn-action btn-submit"
            data-v-fb076351 data-v-f51fb21f
            @click="$emit('approve', reason)"
          >
            승인
          </BaseButton>
          <BaseButton
            type="button"
            class="btn-action btn-reject"
            data-v-fb076351 data-v-f51fb21f
            @click="handleReject"
          >
            반려
          </BaseButton>
        </div>
      </div>

      <!-- 6. 수정, 회수, 취소 버튼 (수정과 회수는 대기 문서인 경우, 취소는 승인/반려 문서인 경우) -->
      <div v-else-if="isWriter && isSentView" class="approve-action-wrapper">
        <div class="form-buttons">
          <BaseButton
            v-if="approveDTO.statusType === 'PENDING' && !isEditing "
            type="button"
            class="btn-action btn-edit"
            @click="handleEditClick"
            data-v-fb076351 data-v-f51fb21f
          >
            수정
          </BaseButton>
          <BaseButton
            v-if="approveDTO.statusType === 'PENDING' && !isEditing"
            type="button"
            class="btn-action btn-reject"
            @click="$emit('request-delete')"
            data-v-fb076351 data-v-f51fb21f
          >
            회수
          </BaseButton>
          <BaseButton
            v-if="(approveDTO.statusType === 'ACCEPTED' || approveDTO.statusType === 'REJECTED') && showCancelButton"
            type="button"
            class="btn-action btn-cancel"
            @click="showCancelForm = true; showCancelButton = false"
            data-v-fb076351 data-v-f51fb21f
          >
            결재 취소
          </BaseButton>

          <BaseButton
            v-if="approveDTO.approveType === 'CANCEL' && isEditing"
            type="button"
            class="btn-action btn-edit"
            @click="updateCancelApproval"
          >
            결재 제출
          </BaseButton>
        </div>
      </div>

      <!-- 7. 취소 결재와 관련된 요소 -->
      <div v-if="showCancelForm" class="cancel-form-wrapper">
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-pen-nib"></i>취소 제목<span class="asterisk"> *</span>
          </h3>
          <input v-model="cancelForm.approveTitle" type="text" class="form-input"/>
        </div>

        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-file-alt"></i>취소 사유<span class="asterisk"> *</span>
          </h3>
          <textarea v-model="cancelForm.cancelReason" class="form-textarea" />
          <p v-if="cancelReasonError" class="error-message">{{ cancelReasonError }}</p>
        </div>

        <div class="approve-action-wrapper">
          <BaseButton
            type="button"
            class="btn-action btn-edit"
            @click="submitCancelApproval"
            data-v-fb076351 data-v-f51fb21f
          >
            취소 결재 제출
          </BaseButton>
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

.asterisk {
  color: var(--error);
  margin-left: 4px;
}
</style>