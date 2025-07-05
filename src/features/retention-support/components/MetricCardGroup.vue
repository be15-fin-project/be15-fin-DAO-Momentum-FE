<template>
  <section class="metric-grid">
    <MetricCard label="전체 사원 수" :value="employeeCount + '명'" icon="fas fa-users" bgClass="bg-blue" />
    <MetricCard label="평균 근속 지수" :value="averageScore + '점'" icon="fas fa-chart-bar" bgClass="bg-green" colorClass="green" />
    <MetricCard label="안정형 비율" :value="stableRate + '%'" icon="fas fa-shield-alt" bgClass="bg-blue" colorClass="blue" />
    <MetricCard label="위험군 비율" :value="riskRate + '%'" icon="fas fa-exclamation-triangle" bgClass="bg-red" colorClass="red" />
  </section>
</template>

<script setup>
import MetricCard from './MetricCard.vue';

defineProps({
  employeeCount: Number,
  averageScore: Number,
  stableRate: Number,
  riskRate: Number
});
</script>

<style scoped>
.metric-grid {
  padding: 0 40px;
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr)); /* 2개의 열을 각 240px로 고정 */
  grid-template-rows: repeat(auto-fill, minmax(100px, 1fr)); /* 행의 높이를 120px로 고정 */
  gap: 24px;
  margin-bottom: 32px;
}
</style>
