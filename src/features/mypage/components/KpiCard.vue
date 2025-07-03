<template>
  <div class="card kpi-card">
    <div class="side-section-title">
      <span class="material-icons">trending_up</span>KPI
    </div>
    <table class="kpi-table">
      <thead>
      <tr>
        <th>구분</th>
        <th>제목</th>
        <th>목표치</th>
        <th>진척도</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in kpis" :key="idx">
        <td>{{ item.category }}</td>
        <td>{{ item.title }}</td>
        <td>{{ item.goal }}</td>
        <td>
          <div class="kpi-progress-bar">
            <div
                class="kpi-progress-inner"
                :class="item.variant"
                :style="{ width: item.progress + '%' }"
            ></div>
          </div>
          <span class="kpi-progress-label">{{ item.progressLabel }}</span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  kpis: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.kpi-card {
  padding-bottom: 20px;
}

table.kpi-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13.5px;
  margin-top: 12px;
  background: var(--gray-50);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(69, 111, 230, 0.07);
}

.kpi-table th, .kpi-table td {
  padding: 10px 8px;
  border: none;
  text-align: center;
}

.kpi-table th {
  background: var(--blue-100);
  color: var(--blue-400);
  font-weight: 700;
  font-size: 14.1px;
  border-bottom: 1px solid var(--gray-200);
}

.kpi-table tr:not(:last-child) td {
  border-bottom: 1px solid var(--gray-200);
}

.kpi-table td {
  color: var(--font-main);
  background: #fff;
  position: relative;
}

.kpi-progress-bar {
  width: 94%;
  height: 8.5px;
  background: var(--gray-100);
  border-radius: 7px;
  overflow: hidden;
  margin: 7px auto 0 auto;
}

.kpi-progress-inner {
  height: 100%;
  border-radius: 7px;
  background: var(--blue-400);
  transition: width .7s cubic-bezier(.5, 0, .2, 1);
}

.kpi-progress-inner.success {
  background: var(--success);
}

.kpi-progress-inner.accent {
  background: var(--warning);
}

.kpi-progress-inner.danger {
  background: var(--error);
}

.kpi-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-400);
  margin-top: 3px;
  display: inline-block;
}

.side-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--blue-400);
  font-size: 1.06rem;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 0;
}
</style>
