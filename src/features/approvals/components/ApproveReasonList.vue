<script setup>
import {computed} from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
});

const visibleItems = computed(() =>
  props.items.filter(
    (item) =>
      item.statusType === 'REJECTED' ||
      (item.statusType === 'APPROVED' && item.reason && item.reason.trim() !== '')
  )
);
</script>

<template>
  <div v-if="visibleItems.length > 0" class="approve-reason-list">
    <h3 class="section-title">
      <i class="fas fa-check-circle check-color"></i>승인/반려 사유
    </h3>

    <div
      v-for="(item, index) in visibleItems"
      :key="index"
      class="reason-item"
      :class="item.statusType.toLowerCase()"
    >
      <div class="info">
        <!-- 프로필 사진 자리 -->
        <div class="avatar">
          <i class="fas fa-user"></i>
        </div>

        <!-- 부서 및 이름 -->
        <div class="meta">
          <div class="department">{{ item.departmentName }}</div>
          <div class="name-status">
            <strong>{{ item.employeeDisplayName }}</strong>
            <span
              class="status-chip"
              :class="item.statusType.toLowerCase()"
            >
              {{ item.statusType === 'APPROVED' ? '승인' : '반려' }}
            </span>
          </div>
        </div>
      </div>

      <div class="reason">
        {{ item.reason || '사유 없음' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.approve-reason-list {
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

.check-color {
  color: var(--blue-100)
}

.reason-item {
  display: flex;
  flex-direction: column;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background-color: #f9fafb;
  margin-bottom: 16px;
  gap: 12px;
}

.info {
  display: flex;
  align-items: center;
  gap: 12px;
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

.meta {
  display: flex;
  flex-direction: column;
}

.department {
  font-size: 0.85rem;
  color: #6b7280;
}

.name-status {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 0.95rem;
}

.status-chip {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 40%;
  white-space: nowrap;
}

.status-chip.approved {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.status-chip.rejected {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}

.reason {
  font-size: 0.95rem;
  color: #374151;
  white-space: pre-wrap;
}
</style>
