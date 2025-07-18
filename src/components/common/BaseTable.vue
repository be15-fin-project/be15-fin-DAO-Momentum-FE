<script setup>
defineProps({
  columns: {type: Array, required: true},
  rows: {type: Array, default: () => []},
  actions: {type: Array, default: () => []}
})

const emit = defineEmits(['click-detail', 'action']);
</script>

<template>
  <div class="list-table-area">
    <div class="table-container">
      <table class="list-table">
        <!-- 헤더 -->
        <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">
            {{ col.label }}
          </th>
          <th v-for="action in actions" :key="`action-header-${action.key}`">{{ action.label || '동작' }}</th>
        </tr>
        </thead>

        <!-- 바디 -->
        <tbody>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td
              v-for="col in columns"
              :key="col.key"
              :class="{ 'text-left': col.align === 'left' }"
          >
            <!-- 프로필 아이콘 렌더링 -->
            <template v-if="col.key === 'profile'">
              <div class="profile-icon-container">
                <i class="fas fa-user"></i>
              </div>
            </template>

            <!-- 상태 컬럼 색상 처리 -->
            <template v-else-if="col.key === 'statusType'">
              <span
                  :class="{
                  'status-wait': row[col.key] === '대기',
                  'status-approved': row[col.key] === '승인',
                  'status-rejected': row[col.key] === '반려'
                }"
              >
                {{ row[col.key] }}
              </span>
            </template>

            <!-- 재직 상태 배지 처리 -->
            <template v-else-if="col.key === 'empStatus'">
              <span
                  :class="{
                  'badge-employed': (col.format ? col.format(null, row) : '-') === '재직',
                  'badge-on-leave': (col.format ? col.format(null, row) : '-') === '휴직',
                  'badge-resigned': (col.format ? col.format(null, row) : '-') === '퇴사'
                }"
              >
                {{ col.format ? col.format(null, row) : '-' }}
              </span>
            </template>

            <!-- 근무 유형 배지 처리 -->
            <template v-else-if="col.key === 'workType'">
              <span
                  :class="{
                  'badge-work': (col.format ? col.format(null, row) : '-') === '근무',
                  'badge-remote': (col.format ? col.format(null, row) : '-') === '재택근무',
                  'badge-vacation': (col.format ? col.format(null, row) : '-')=== '휴가',
                  'badge-business': (col.format ? col.format(null, row) : '-') === '출장',
                  'badge-additional': (col.format ? col.format(null, row) : '-') === '초과근무',
                }"
              >
                {{ col.format ? col.format(row[col.key], row) : row[col.key] }}
              </span>
            </template>


            <template v-else-if="col.key === 'showDetail'">
              <button
                  v-if="row.showDetail"
                  class="action-button"
                  @click="emit('click-detail', row)"
              >
                <i class="fas fa-angle-right"></i>
              </button>
            </template>

            <!-- 일반 텍스트 렌더링 -->
            <template v-else-if="col.key !== 'action'">
              {{ col.format ? col.format(row[col.key], row) : row[col.key] }}
            </template>

            <!-- 상세 보기 버튼 -->
            <template v-else>
              <button
                  class="action-button"
                  @click="emit('click-detail', row)"
              >
                <i class="fas fa-angle-right"></i>
              </button>
            </template>
          </td>

          <td
              v-for="action in actions"
              :key="`action-cell-${action.key}-${idx}`"
          >
            <button
                class="action-button"
                @click="emit('action', { action: action.key, row })"
            >
              <i :class="['fas', action.icon]"></i>
            </button>
          </td>
        </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<style scoped>
.list-table-area {
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: var(--table-shadow);
  width: 100%;
  overflow-x: auto;
}

.list-table-area::-webkit-scrollbar {
  height: 1px;
}

.list-table {
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 0;
}

.list-table th,
.list-table td {
  padding: 14px 12px;
  font-size: 1rem;
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
}

.list-table th {
  background: var(--gray-100);
  color: var(--color-text-sub);
  font-weight: 600;
  border-bottom: 2px solid var(--color-muted);
  position: sticky;
  top: 0;
  z-index: 1;
}

.list-table tbody tr {
  transition: background 0.16s;
}

.list-table tbody tr:hover {
  background: var(--blue-50);
}

.list-table td {
  border-bottom: 1px solid var(--color-muted);
}

.text-left {
  text-align: left;
}

.list-table th:first-child,
.list-table td:first-child {
  padding-left: 4rem;
}

.list-table th:last-child,
.list-table td:last-child {
  padding-right: 4rem;
}

.profile-icon-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--blue-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.profile-icon-container i {
  font-size: 18px;
  color: var(--blue-400);
}

.action-button {
  background-color: var(--blue-400);
  color: var(--color-surface);
  border: none;
  border-radius: var(--radius-ss);
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.action-button:hover {
  background-color: var(--blue-500);
}

@media (max-width: 1100px) {
  .list-table {
    min-width: 600px;
  }
}

@media (max-width: 700px) {
  .list-table th, .list-table td {
    padding: 10px;
  }
}

.status-approved, .status-rejected, .status-wait {
  border-radius: 30%;
  padding: 3px 6px;
}

.status-approved {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.status-rejected {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}

.status-wait {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}

/* 재직 상태 */
.badge-employed,
.badge-on-leave,
.badge-resigned {
  border-radius: 30%;
  padding: 3px 6px;
}

.badge-employed {
  background-color: var(--label-approved); /* 예: 초록색 계열 */
  color: var(--text-on-label-approved);
}

.badge-on-leave {
  background-color: var(--label-pending); /* 예: 노란색 계열 */
  color: var(--text-on-label-pending);
}

.badge-resigned {
  background-color: var(--label-rejected); /* 예: 빨간색 계열 */
  color: var(--text-on-label-rejected);
}

/* 근무 유형 뱃지 스타일 */
.badge-work,
.badge-remote,
.badge-vacation,
.badge-business,
.badge-additional {
  display: inline-block;
  border-radius: 9999px;
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge-work {
  background-color: var(--label-approved);
  color: var(--text-on-label-approved);
}

.badge-remote {
  background-color: var(--blue-200);
  color: var(--blue-500);
}

.badge-vacation {
  background-color: var(--label-pending);
  color: var(--text-on-label-pending);
}

.badge-business {
  background-color: var(--gray-300);
  color: var(--gray-900);
}

.badge-additional {
  background-color: var(--label-rejected);
  color: var(--text-on-label-rejected);
}
</style>