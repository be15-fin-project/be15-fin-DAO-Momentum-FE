<script setup>
defineProps({
  department: {
    type: Object,
    required: true,
  },
  members: {
    type: Array,
    required: true
  },
  editable:{
    type:Boolean,
    default:false
  }
})
</script>

<!-- components/DepartmentInfoCard.vue -->
<template>
    <div class="card fade-in">
      <header class="card-header">
        <div class="card-header-left">
          <i class="fas fa-info-circle card-icon"></i>
          <h2 class="card-title">부서 정보</h2>
        </div>
        <div v-if="editable">
          <button class="btn edit"><i class="fas fa-edit" @click="$emit('edit')"></i></button>
          <button class="btn delete"><i class="fas fa-trash" @click="$emit('delete')"></i></button>
        </div>
      </header>
      <div class="dept-info-grid">
        <div class="dept-stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card-icon icon-bg-blue">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat_num">
                <div class="stat-label">총 구성원</div>
                <div class="stat-number">{{ members.length }}</div>
              </div>
            </div>
          </div>
          <div class="dept-details">
            <div class="dept-detail-item">
              <div class="dept-detail-label">
                <i class="fas fa-building icon-purple"></i>
                <span>부서명</span>
              </div>
              <span class="dept-detail-value">{{ department.name }}</span>
            </div>
            <div class="dept-detail-item">
              <div class="dept-detail-label">
                <i class="fas fa-phone icon-blue"></i>
                <span>연락처</span>
              </div>
              <span class="dept-detail-value">{{ department.contact }}</span>
            </div>
            <div class="dept-detail-item">
              <div class="dept-detail-label">
                <i class="fas fa-calendar-plus icon-green"></i>
                <span>생성일</span>
              </div>
              <span class="dept-detail-value">{{ department.createdAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-subtle);
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-header-left{
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--font-main);
}

.card-icon {
  color: var(--blue-400);
  font-size: 1.125rem;
}

/* 대신 내용만 이동하도록 아래 추가 */
.org-item:hover .org-item-content {
  transform: translateX(4px);
  transition: transform 0.3s ease;
}

.org-item.active .org-item-name {
  color: var(--blue-400);
  font-weight: 600;
}


/* Department Info Styles */
.dept-info-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.dept-stats-section {
  flex: 0 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  background: var(--blue-50);
  border: 1px solid var(--blue-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.icon-bg-blue {
  background: #e9f2fe;
  color: #3868b9;
}

.stat-card-icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.55rem;
  box-shadow: 0 2px 8px 0 rgba(56, 104, 185, 0.08);
}
.stat_num {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--main-color);
  margin-bottom: 4px;
  display: block;
}

.stat-label {
  color: var(--font-sub);
  font-size: 0.875rem;
  font-weight: 500;
}

.dept-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dept-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.dept-detail-item:last-child {
  border-bottom: none;
}

.dept-detail-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  padding: 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}


.btn.edit:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.btn.delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}


</style>