<template>
  <main>
    <!-- 헤더 -->
    <HeaderWithTabs
        :headerItems="[
          { label: '대시 보드', to: '/retention/prospect-dash', active: true },
        ]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <!-- 필터 -->
    <EmployeeFilter :filters="filterOptions" v-model="filterValues" @search="handleSearch" />

    <!-- 통계 차트 -->
    <section class="chart-row">
      <DoughnutChart
          :labels="donutChartData.labels"
          :data="donutChartData.data"
          :colors="donutChartData.colors"
      />
      <LineChart
          :labels="lineChartData.labels"
          :datasets="lineChartData.datasets"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import DoughnutChart from '@/features/retention-support/components/DonutChart.vue';
import LineChart from '@/features/retention-support/components/LineChart.vue';

import {
  getAverageRetentionScore,
  getOverallStabilityDistribution,
  getDepartmentStabilityDistribution,
  downloadRetentionPredictionExcel
} from '@/features/retention-support/api.js';
import { getDepartments, getPositions } from '@/features/works/api.js';

// 상태
const filterValues = ref({});
const filterOptions = ref([]);
const departmentTree = ref([]);
const positionList = ref([]);

const donutChartData = ref({ labels: [], data: [], colors: [] });
const lineChartData = ref({ labels: [], datasets: [] });

const chartRefs = {
  donut: null,
  monthly: null,
};

// 필터 초기화
function initFilters() {
  filterOptions.value = [
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: departmentTree.value,
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positionList.value.map(p => p.name)],
    },
    {
      key: 'empNo',
      label: '사번',
      icon: 'fa-id-badge',
      type: 'input',
      placeholder: '사번 입력',
    },
    {
      key: 'date',
      label: '조회일',
      icon: 'fa-calendar-day',
      type: 'date-range',
    },
  ];
}

function normalizeFilterParams(values) {
  const normalized = { ...values };

  if (normalized.positionId && normalized.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === normalized.positionId);
    normalized.positionId = match?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  if (normalized.date?.[0]) normalized.startDate = normalized.date[0];
  if (normalized.date?.[1]) normalized.endDate = normalized.date[1];
  delete normalized.date;

  return normalized;
}

// 차트 렌더링
async function renderCharts() {
  try {
    const params = normalizeFilterParams(filterValues.value);
    const rootStyle = getComputedStyle(document.documentElement);
    const blue200 = rootStyle.getPropertyValue('--blue-200').trim();
    const blue400 = rootStyle.getPropertyValue('--blue-400').trim();
    const blue500 = rootStyle.getPropertyValue('--blue-500').trim();

    const avg = await getAverageRetentionScore(params);
    const stability = await getOverallStabilityDistribution(params);
    const deptDistribution = await getDepartmentStabilityDistribution(params);

    donutChartData.value = {
      labels: ['매우 안정', '안정', '불안정', '매우 불안정'],
      data: [
        stability.veryStableCount,
        stability.stableCount,
        stability.unstableCount,
        stability.veryUnstableCount,
      ],
      colors: [blue500, blue400, blue200, '#ddd'],
    };

    lineChartData.value = {
      labels: deptDistribution.map(d => d.departmentName),
      datasets: [
        {
          label: '안정성 평균',
          type: 'bar',
          color: blue400,
          data: deptDistribution.map(d => d.averageScore),
          yAxisID: 'y',
        },
      ],
    };
  } catch (e) {
    console.warn('차트 렌더링 실패', e);
  }
}

async function handleSearch(values) {
  filterValues.value = values;
  await renderCharts();
}

// 엑셀 다운로드
async function handleDownload() {
  try {
    const normalized = normalizeFilterParams(filterValues.value);
    const blob = await downloadRetentionPredictionExcel(normalized);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retention-prediction-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('엑셀 다운로드 실패', err);
    alert('엑셀 다운로드 실패');
  }
}

// 초기화
onMounted(async () => {
  const deptRes = await getDepartments();
  departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
  positionList.value = await getPositions();
  initFilters();
  await renderCharts();

  window.addEventListener('resize', () => {
    if (chartRefs.donut) chartRefs.donut.resize();
    if (chartRefs.monthly) chartRefs.monthly.resize();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.chart-row {
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}
</style>
