<script setup>
import {ref, computed, onMounted, watch, onBeforeUnmount} from 'vue'
import EmployeeModal from "@/features/approvals/components/EmployeeModal.vue";
import {getEmployeeLeader} from "@/features/approvals/api.js";

const targetStepIndex = ref(null);

/* 모달과 관련된 속성 */
// 모달을 열기 or 닫기
const isModalOpen = ref(false);
// 모달이 참조자 선택 모드 인지 결재자 선택 모드인지 셜정
const isReferenceMode = ref(false);

/* 부모에게 전달 받은 값 */
const props = defineProps({
  readOnly: { type: Boolean, default: true },
  approveLineGroupDTO: { type: Array, default: () => [] },
  approveRefDTO: { type: Array, default: () => [] },
  modelValueApprovalLines: { type: Array, default: () => [] },
  modelValueReferenceList: { type: Array, default: () => [] },
  approveType : {type : String}
})

const activeDropdownIndex = ref(null);

/* 부모에게 전달해야 하는 부분 */
const emit = defineEmits([
  'update:modelValueApprovalLines',
  'update:modelValueReferenceList'
])

/* 전달 받은 결재선  */
const approvalLines = computed(() => {
  return props.approveLineGroupDTO.map(group => ({
    step: group.approveLineDTO.approveLineOrder,
    requiredType: group.approveLineDTO.isRequiredAll === 'REQUIRED' ? '필수' : '선택',
    approvers: group.approveLineListDTOs.map(approver => ({
      name: approver.employeeDisplayName,
      dept: approver.departmentName,
      status: approver.statusType
    }))
  }))
});

/* 전달 받은 참조자 리스트 */
const referenceList = computed(() =>
  props.approveRefDTO.map(ref => ({
    name: ref.employeeDisplayName,
    dept: ref.departmentName,
    status: ref.isConfirmed
  }))
);

/* 부모에게 전달하는 결재선 */
const writableApprovalLines = computed({
  get: () => props.modelValueApprovalLines,
  set: val => emit('update:modelValueApprovalLines', val)
})

/* 부모에게 전달하는 참조자 */
const writableReferenceList = computed({
  get: () => props.modelValueReferenceList,
  set: val => emit('update:modelValueReferenceList', val)
})

/* 참조자 리스트가 보일 때 */
const visibleReferenceList = computed(() =>
  writableReferenceList.value.filter(ref => ref.name?.trim() !== '')
)

/* 결재선 안에서 사람을 추가할 때 사용하는 모달 함수 */
function addApprovalLineWithModal() {
  targetStepIndex.value = writableApprovalLines.value.length;
  isModalOpen.value = true;
}

/* 결재선을 추가할 때 사용하는 모달 함수 */
function openApproverModal(stepIndex) {
  targetStepIndex.value = stepIndex
  isReferenceMode.value = false
  isModalOpen.value = true
}

/* 참조자 추가 함수 */
function openReferenceModal() {
  targetStepIndex.value = null
  isReferenceMode.value = true
  isModalOpen.value = true
}

/* 결재선, 참조자 모으기 */
function handleApproverSelect(selectedApprovers) {
  if (targetStepIndex.value === null) {
    // 참조자 처리
    writableReferenceList.value.push(...selectedApprovers)
  } else {
    // 결재선 처리
    const targetLine = writableApprovalLines.value[targetStepIndex.value]
    if (!targetLine) {
      writableApprovalLines.value.push({
        step: targetStepIndex.value + 1,
        requiredType: '필수',
        approvers: selectedApprovers
      })
    } else {
      const existingIds = targetLine.approvers.map(a => a.empId)
      const uniqueApprovers = selectedApprovers.filter(
        a => !existingIds.includes(a.empId)
      )
      targetLine.approvers.push(...uniqueApprovers)
    }
  }

  isModalOpen.value = false
}

/* 만약 결재선 안에 아무도 없다면 결재선 제목이 사라지게 하는 부분
* (예를 들어 '2차 결재선' 안에 사람이 없다면 이걸 안보이게 설정)*/
const visibleApprovalLines = computed(() =>
  writableApprovalLines.value.filter(line =>
    Array.isArray(line.approvers) && line.approvers.length > 0
  )
)

/* 결재자를 삭제하는 함수 */
function removeApprover(stepIndex, approverIndex) {
  if (stepIndex === 0 && approverIndex === 0) return
  writableApprovalLines.value[stepIndex].approvers.splice(approverIndex, 1)
}

/* 참조자를 삭제하는 함수 */
function removeReference(index) {
  writableReferenceList.value.splice(index, 1)
}

/* 마운트 하는 시점에 결재자 가져오기 */
watch(
  () => props.approveType,
  async (newType) => {
    if (!props.readOnly) {
      if (newType === 'RECEIPT') { // 비용 처리 결재자는 따로 api가 없으므로, 하드코딩으로 지정
        writableApprovalLines.value = [
          {
            step: 1,
            requiredType: '필수',
            approvers: [
              {
                empId: 21,
                name: '이서윤 과장님',
                deptName: '재무팀'
              }
            ]
          }
        ]
      } else {
        const res = await getEmployeeLeader();
        const leader = res.data.data;
        writableApprovalLines.value = [
          {
            step: 1,
            requiredType: '필수',
            approvers: [
              {
                empId: leader.teamLeaderId,
                name: leader.teamLeaderName,
                deptName: leader.leaderDeptName
              }
            ]
          }
        ]
      }
    }
  },
  { immediate: true }
)

function toggleDropdown(index) {
  activeDropdownIndex.value = activeDropdownIndex.value === index ? null : index;
}

function selectRequiredType(index, value) {
  writableApprovalLines.value[index].requiredType = value;
  activeDropdownIndex.value = null;
}

function handleClickOutsideDropdown(event) {
  activeDropdownIndex.value = null;
}

onMounted(() => {
  document.addEventListener("click", handleClickOutsideDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideDropdown);
});

</script>

<template>
  <aside class="sidebar">
    <!-- 1. 결재선 -->
    <section class="form-section side-section">
      <div class="section-header">
        <div class="section-icon"><i class="fas fa-users"></i></div>
        <h3 class="section-title">결재선</h3>
      </div>

      <template v-if="!readOnly">
        <button class="btn-add-section" @click="addApprovalLineWithModal">
          <i class="fas fa-plus-circle"></i> 결재선 추가
        </button>
        <div
              v-for="(line, lineIndex) in visibleApprovalLines"
             :key="lineIndex"
              class="step-section"
        >
          <div class="step-header">
            <span class="step-label">{{ lineIndex + 1 }}단계 결재</span>
            <div class="step-line"></div>
            <div class="dropdown-wrapper" @click.stop>
              <button class="dropdown-btn" @click="toggleDropdown(lineIndex)">
                {{ line.requiredType }}
                <i class="fas fa-chevron-down icon"></i>
              </button>
              <div class="dropdown" v-if="activeDropdownIndex === lineIndex">
                <button
                  v-for="option in ['필수', '선택']"
                  :key="option"
                  @click="selectRequiredType(lineIndex, option)"
                  :class="{ active: line.requiredType === option }"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>

          <div v-for="(approver, approverIndex) in line.approvers" :key="approverIndex" class="approver-row">
            <div class="avatar"><i class="fas fa-user"></i></div>
            <div class="info">
              <div class="name">{{ approver.name }} {{ approver.position }}</div>
              <div class="dept">{{ approver.deptName }}</div>
            </div>
            <button
              v-if="!(lineIndex === 0 && approverIndex === 0)"
              class="remove-line"
              @click="removeApprover(lineIndex, approverIndex)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <button class="btn-add-section" @click="openApproverModal(lineIndex)">
            <i class="fas fa-user-plus"></i> 결재자 추가
          </button>
        </div>
      </template>

      <template v-else>
        <div v-for="(line, lineIndex) in approvalLines" :key="lineIndex" class="step-section">
          <div class="step-header">
            <span class="step-label">{{ line.step }}단계 결재</span>
            <div class="step-line"></div>
            <span class="step-type">{{ line.requiredType }}</span>
          </div>
          <div v-for="(approver, approverIndex) in line.approvers" :key="approverIndex" class="approver-row">
            <div class="avatar"><i class="fas fa-user"></i></div>
            <div class="info">
              <div class="name">{{ approver.name }}</div>
              <div class="dept">{{ approver.dept }}</div>
            </div>
            <span class="status-chip" :class="approver.status?.toLowerCase()">
              {{
                approver.status === 'ACCEPTED'
                  ? '승인'
                  : approver.status === 'REJECTED'
                    ? '반려'
                    : '대기'
              }}
            </span>
          </div>
        </div>
      </template>
    </section>

    <!-- 2. 참조자 -->
    <section v-if="!readOnly || (readOnly && referenceList.length)" class="form-section side-section">
      <div class="section-header">
        <div class="section-icon"><i class="fas fa-eye"></i></div>
        <h3 class="section-title">참조</h3>
      </div>

      <template v-if="!readOnly">
        <button class="btn-add-section" @click="openReferenceModal">
          <i class="fas fa-user-plus"></i> 참조자 추가
        </button>

        <ul class="detail-list">
          <li v-if="visibleReferenceList.length === 0" class="value">참조할 사원을 추가해주세요</li>
          <li v-for="(ref, idx) in writableReferenceList" :key="idx" class="approver-row">
            <div class="avatar"><i class="fas fa-user"></i></div>
            <div class="info">
              <div class="name">{{ ref.name }}</div>
              <div class="dept">{{ ref.deptName }}</div>
            </div>
            <button class="remove-line" @click="removeReference(idx)">
              <i class="fas fa-times"></i>
            </button>
          </li>
        </ul>
      </template>

      <template v-else>
        <div v-for="(ref, idx) in referenceList" :key="idx" class="approver-row">
          <div class="avatar"><i class="fas fa-user"></i></div>
          <div class="info">
            <div class="name">{{ ref.name }}</div>
            <div class="dept">{{ ref.dept }}</div>
          </div>
          <span class="status-chip" :class="ref.status === 'Y' ? 'y' : 'n'">
            {{ ref.status === 'Y' ? '확인' : '미확인' }}
          </span>
        </div>
      </template>
    </section>

    <EmployeeModal
      v-if="isModalOpen"
      :alreadySelected="targetStepIndex === null
    ? writableReferenceList
    : writableApprovalLines[targetStepIndex]?.approvers || []"
      :disableFirstApproverRemoval="targetStepIndex === 0"
      @confirm="handleApproverSelect"
      @close="isModalOpen = false"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 400px;
  flex-shrink: 0;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.form-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-100);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--icon-gradient);
  border-radius: 1px;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--icon-gradient);
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.1rem;
  box-shadow: var(--form-shadow);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--font-main);
  margin: 0;
}

.step-section {
  margin-bottom: 24px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.step-label {
  font-weight: 600;
  color: var(--gray-700);
  white-space: nowrap;
}

.step-line {
  flex: 1;
  height: 1px;
  background-color: var(--gray-300);
}

.step-type,
select {
  font-size: 12px;
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
  padding: 4px 8px;
  border-radius: 40px;
  border: none;
}

select {
  background-color: var(--blue-100);
  color: var(--gray-800);
  font-weight: 600;
}

input.value {
  width: 100%;
  margin-top: 6px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.btn-add-section {
  background: none;
  border: none;
  color: var(--blue-300);
  cursor: pointer;
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-section i {
  font-size: 14px;
}

.remove-line {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.detail-list {
  list-style: none;
  padding-left: 0;
}

.approver-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: var(--blue-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-400);
}

.info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: var(--color-text-main);
}

.dept {
  font-size: 13px;
  color: var(--color-text-sub);
}

.status-chip {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 40%;
  white-space: nowrap;
}

.status-chip.accepted,
.status-chip.y {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.status-chip.rejected {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}

.status-chip.pending,
.status-chip.n {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}

.dropdown-wrapper {
  position: relative;
}

.dropdown-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--blue-100);
  color: var(--gray-800);
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 40px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  min-width: 64px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 10;
  min-width: 100%;
}

.dropdown button {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-800);
}

.dropdown button:hover,
.dropdown button.active {
  background-color: var(--blue-100);
  font-weight: 600;
}
</style>
