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
        :preserveKeys="['roundId']"
        @search="handleSearch"
    />

    <section class="content">
      <div class="narrow">
        <StabilityDonut :distribution="overallDistribution"/>
      </div>
      <div class="wide">
        <DeptStabilityBar :data="departmentDistribution"/>
      </div>
      <div class="narrow">
        <MetricCardGroup
            :employeeCount="employeeCount"
            :averageScore="averageScore"
            :stableRate="stableRate"
            :riskRate="riskRate"/>
      </div>
      <div class="wide">
        <MonthlyRetentionTrend :data="monthlyStats"/>
      </div>

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
  const deptDistParams = { ...params, deptId: null }; // 부서 ID 제거

  try {
    const overview = await getRetentionOverview(params);

    averageScore.value = overview?.averageScore ?? 0;
    employeeCount.value = overview?.totalEmpCount ?? 0;
    stableRate.value = overview?.stabilitySafeRatio ?? 0;
    riskRate.value = overview?.stabilityRiskRatio ?? 0;

    overallDistribution.value = await getOverallStabilityDistribution(params);
    departmentDistribution.value = await getDepartmentStabilityDistribution(deptDistParams);
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
  grid-template-columns: 1fr 2fr; /* 왼쪽은 좁게, 오른쪽은 넓게 */
  gap: 2rem;
  padding: 0 40px;
}

.narrow {
  grid-column: 1;
}

.wide {
  grid-column: 2;
}

</style>
