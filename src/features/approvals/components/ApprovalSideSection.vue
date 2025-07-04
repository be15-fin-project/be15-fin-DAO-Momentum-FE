<script setup>
import { computed } from 'vue';

const props = defineProps({
  approveLineGroupDTO: { type: Array, required: true },
  approveRefDTO: { type: Array, default: () => [] },
});

// 결재선 처리
const approvalLines = computed(() => {
  return props.approveLineGroupDTO.map(group => ({
    step: group.approveLineDTO.approveLineOrder,
    requiredType: group.approveLineDTO.isRequiredAll === 'REQUIRED' ? '필수' : '선택',
    approvers: group.approveLineListDTOs.map(approver => ({
      name: approver.employeeDisplayName,
      dept: approver.departmentName,
      status: approver.statusType
    }))
  }));
});

// 참조자 처리
const referenceList = computed(() =>
  props.approveRefDTO.map(ref => ({
    name: ref.employeeDisplayName,
    dept: ref.departmentName,
    status : ref.isConfirmed
  }))
);
</script>

<template>
  <aside class="sidebar">
    <!-- 결재선 -->
    <section class="form-section side-section">
      <div class="section-header">
        <div class="section-icon"><i class="fas fa-users"></i></div>
        <h3 class="section-title">결재선</h3>
      </div>

      <div v-for="(line, idx) in approvalLines" :key="idx" class="step-section">
        <div class="step-header">
          <span class="step-label">{{ line.step }}단계 승인</span>
          <div class="step-line"></div>
          <span class="step-type">{{ line.requiredType }}</span>
        </div>

        <div
          v-for="(approver, i) in line.approvers"
          :key="i"
          class="approver-row"
        >
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
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
    </section>

    <!-- 참조자 -->
    <section v-if="referenceList.length" class="form-section side-section">
      <div class="section-header">
        <div class="section-icon"><i class="fas fa-eye"></i></div>
        <h3 class="section-title">참조자</h3>
      </div>

      <div
        v-for="(ref, idx) in referenceList"
        :key="idx"
        class="approver-row"
      >
        <div class="avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="info">
          <div class="name">{{ ref.name }}</div>
          <div class="dept">{{ ref.dept }}</div>
        </div>
        <span
          class="status-chip"
          :class="ref.status === 'Y' ? 'y' : 'n'"
        >
          {{ ref.status === 'Y' ? '확인' : '미확인' }}
        </span>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 400px;
  flex-shrink: 0;
  background-color: var(--color-background);
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

.step-type {
  font-size: 12px;
  color: var(--gray-500);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background-color: var(--gray-100);
}

.approver-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  background-color: var(--basic);
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
  color: var(--blue-400)
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

.status-chip {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 40%;
  white-space: nowrap;
}

.status-chip.accepted {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.status-chip.rejected {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}

.status-chip.pending {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}

.status-chip.y {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.status-chip.n {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}
</style>
