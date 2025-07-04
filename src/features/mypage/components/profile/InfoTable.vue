<script setup>
defineProps({
  headers:[],
  rows:[]
});
</script>

<template>
  <table class="info-table">
    <thead>
      <tr>
        <th  v-for="header in headers">{{header}}</th>
      </tr>
    </thead>
    <tbody>
    <tr v-for="row in rows">
      <td v-for="value in row" class="table-value">{{value}}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.info-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.info-table th,
.info-table td {
  padding: 20px 24px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.info-table th {
  background: var(--blue-50);
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.info-table tr:hover {
  background: #f9fafb;
}

.info-table tr:last-child td {
  border-bottom: none;
}

.table-value {
  font-weight: 600;
  color: #1f2937;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}
</style>