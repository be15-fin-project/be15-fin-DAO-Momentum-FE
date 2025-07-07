<script setup>
defineProps({
  columns: {type: Array, required: true},
  rows: {type: Array, default: () => []}
})

const emit = defineEmits(['click-detail']);
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
</style>