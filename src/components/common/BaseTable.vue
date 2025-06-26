<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] }
})
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
            <span>{{ row[col.key] }}</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.list-table-area {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 30px -10px rgba(36,48,71,0.08);
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
  background: #f7fafd;
  color: #334155;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1;
}
.list-table tbody tr {
  transition: background 0.16s;
}
.list-table tbody tr:hover {
  background: #f0f6ff;
}
.list-table td {
  border-bottom: 1px solid #e5e7eb;
}
.text-left {
  text-align: left;
}

.list-table th:first-child,
.list-table td:first-child { padding-left: 4rem; }
.list-table th:last-child,
.list-table td:last-child  { padding-right: 4rem; }

@media (max-width: 1100px) { .list-table { min-width: 600px; } }
@media (max-width: 700px)  { .list-table th, .list-table td { padding: 10px; } }
</style>