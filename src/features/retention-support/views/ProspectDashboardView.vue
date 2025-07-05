<template>
  <main>
    <!-- 헤더 및 상단 버튼 -->
    <HeaderWithTabs
        :headerItems="[
            { label: '대시보드', to: '/retention/prospect-dash', active: true },
            { label: '근속 전망', to: '/retention/prospect-employees', active: false },
            { label: '전망 회차', to: '/retention/prospect-rounds', active: false },
            ]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <!-- 필터 영역 -->
    <EmployeeFilter
        v-if="filterOptions.length > 0"
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <section class="content">
      <!-- 평균 점수 카드 -->
      <section class="dashboard">
        <StabilityDonut :distribution="overallDistribution"/>
        <MetricCardGroup
            :employeeCount="employeeCount"
            :averageScore="averageScore"
            :stableRate="stableRate"
            :riskRate="riskRate"
        />
      </section>

      <!-- 차트 영역 -->
      <section class="chart-row">
        <DeptStabilityBar :data="departmentDistribution"/>
        <MonthlyRetentionTrend :data="monthlyStats"/>
      </section>

    </section>

  </main>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';

import StabilityDonut from '@/features/retention-support/components/StabilityDonut.vue';
import DeptStabilityBar from '@/features/retention-support/components/DeptStabilityBar.vue';
import MetricCardGroup from '@/features/retention-support/components/MetricCardGroup.vue';
import MonthlyRetentionTrend from '@/features/retention-support/components/MonthlyRetentionTrend.vue';

import {
  getDepartments,
  getPositions,
} from '@/features/works/api.js';

import {
  getRetentionRounds,
  getRetentionOverview,
  getOverallStabilityDistribution,
  getDepartmentStabilityDistribution,
  getMonthlyRetentionTimeseries,
  downloadRetentionPredictionExcel,
} from '@/features/retention-support/api.js';
import {useToast} from 'vue-toastification';

const toast = useToast();
// ────────── 상태 ──────────
const filterValues = ref({});
const filterOptions = ref([]);

const averageScore = ref(0);
const employeeCount = ref(0);
const stableRate = ref(0);
const riskRate = ref(0);

const overallDistribution = ref({});
const departmentDistribution = ref([]);
const monthlyStats = ref([]);

// ────────── 초기 진입 ──────────
onMounted(async () => {
  await initFilterOptions();
  await handleSearch(filterValues.value);
});

// ────────── 필터 초기화 ──────────
async function initFilterOptions() {
  const roundRes = await getRetentionRounds({size: 100});
  const rounds = roundRes?.content ?? [];

  const roundOptions = rounds.map(r => ({
    label: `${r.roundNo} 회차 (${r.year}-${String(r.month).padStart(2, '0')})`,
    value: r.roundId,
  }));

  const latestRoundId = rounds[0]?.roundId ?? null;

  const deptRes = await getDepartments();
  const deptTree = deptRes.data?.departmentInfoDTOList ?? [];

  const positions = await getPositions();

  filterOptions.value = [
    {
      key: 'roundId',
      label: '회차',
      icon: 'fa-rotate',
      type: 'select',
      options: roundOptions,
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: deptTree,
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positions.map(pos => pos.name)],
    },
  ];

  filterValues.value = {
    roundId: latestRoundId,
    deptId: null,
    positionId: null,
  };
}

// ────────── 검색 핸들러 ──────────
async function handleSearch(values) {
  const params = normalizeParams(values);

  try {
    const overview = await getRetentionOverview(params);

    averageScore.value = overview?.averageScore ?? 0;
    employeeCount.value = overview?.totalEmpCount ?? 0;
    stableRate.value = overview?.stabilitySafeRatio ?? 0;
    riskRate.value = overview?.stabilityRiskRatio ?? 0;

    overallDistribution.value = await getOverallStabilityDistribution(params);
    departmentDistribution.value = await getDepartmentStabilityDistribution(params);
    monthlyStats.value = await getMonthlyRetentionTimeseries(params);
  } catch (e) {
    toast.error('통계 정보를 불러오는 데 실패했습니다.');
  }
}

// ────────── 엑셀 다운로드 ──────────
async function handleDownload() {
  try {
    toast.success('엑셀 다운로드가 시작되었습니다.');
    const params = normalizeParams(filterValues.value);
    const blob = await downloadRetentionPredictionExcel(params);

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retention-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('엑셀 다운로드 중 오류가 발생했습니다.');
  }
}

// ────────── 유틸 ──────────
function normalizeParams(values) {
  const normalized = {...values};

  // positionId: "전체" → null
  if (normalized.positionId && normalized.positionId !== '전체') {
    const selected = filterOptions.value.find(opt => opt.key === 'positionId');
    const matched = selected?.options?.find(p => p === normalized.positionId);
    normalized.positionId = matched ?? null;
  } else {
    normalized.positionId = null;
  }

  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  return normalized;
}
</script>

<style scoped>
.content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}
.dashboard {
  display: flex;
  gap: 24px;
  flex-direction: column;
  align-items: center;
}
.chart-row {
  padding-right: 40px;
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* 2개의 열을 각 240px로 고정 */
  gap: 32px;
}

</style>
