<template>
  <main>
    <!-- 헤더 + 탭 -->
    <HeaderWithTabs
        :headerItems="[
        { label: '대시보드', to: '/retention/prospect-dash', active: false },
        { label: '근속 전망', to: '/retention/prospect-employees', active: true },
        { label: '전망 회차', to: '/retention/prospect-rounds', active: false }
      ]"
        :submitButtons="[{ label: '엑셀 다운로드', icon: 'fa-download', event: 'download', variant: 'white' }]"
        :showTabs="false"
        @download="handleDownload"
    />

    <!-- 필터 -->
    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <!-- 테이블 -->
    <BaseTable
        :columns="tableColumns"
        :rows="tableData"
        @click-detail="openDetail"
    />

    <!-- 페이지네이션 -->
    <Pagination
        v-if="pagination.totalPage >= 1"
        v-model="currentPage"
        :total-pages="pagination.totalPage"
    />

    <!-- 상세 모달 -->
    <SideModal
        :visible="isOpen"
        title="근속 전망 상세"
        icon="fa-chart-line"
        :sections="formSections"
        :showSubmit="false"
        @close="isOpen = false"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SideModal from '@/components/common/SideModal.vue';
import { getDepartments, getPositions } from '@/features/works/api.js';
import {
  getRetentionRounds,
  getRetentionForecasts,
  getRetentionForecastDetail,
  downloadRetentionPredictionExcel,
} from '@/features/retention-support/api.js';
import { useToast } from 'vue-toastification';

const toast = useToast();

const filterOptions = ref([]);
const departmentTree = ref([]);
const positionList = ref([]);
const filterValues = ref({});
const currentPage = ref(1);
const pagination = ref({ currentPage: 1, totalPage: 1 });
const tableData = ref([]);
const isOpen = ref(false);
const detailSections = ref([]);
const formSections = ref([]);

onMounted(async () => {
  const [deptRes, posRes] = await Promise.all([
    getDepartments(),
    getPositions()
  ]);
  departmentTree.value = deptRes.data?.departmentInfoDTOList || [];
  positionList.value = posRes;

  await initFilters();
  await handleSearch(filterValues.value);
});

watch(currentPage, () => handleSearch(filterValues.value));

const initFilters = async () => {
  const [deptRes, posRes, roundRes] = await Promise.all([
    getDepartments(),
    getPositions(),
    getRetentionRounds({ size: 100 }),
  ]);

  const deptTree = deptRes.data?.departmentInfoDTOList ?? [];
  const positions = posRes ?? [];
  const rounds = roundRes.content ?? [];

  const latestRoundId = rounds[0]?.roundId ?? null;

  filterOptions.value = [
    {
      key: 'roundId',
      label: '회차',
      icon: 'fa-rotate',
      type: 'select',
      options: rounds.map(r => ({
        label: `${r.roundNo} 회차 (${r.year}-${String(r.month).padStart(2, '0')})`,
        value: r.roundId
      }))
    },
    {
      key: 'deptId',
      label: '부서',
      icon: 'fa-building',
      type: 'tree',
      options: deptTree
    },
    {
      key: 'positionId',
      label: '직위',
      icon: 'fa-user-tie',
      type: 'select',
      options: ['전체', ...positions.map(p => p.name)]
    },
    {
      key: 'stabilityType',
      label: '유형',
      icon: 'fa-circle-half-stroke',
      type: 'select',
      options: [
        { label: '전체', value: null },
        { label: '안정형', value: 'STABLE' },
        { label: '주의형', value: 'WARNING' },
        { label: '불안정형', value: 'UNSTABLE' },
      ]
    },
  ];

  filterValues.value = { roundId: latestRoundId };
};

const normalizeParams = (values) => {
  const normalized = { ...values };

  // 직위 ID 변환
  if (normalized.positionId && normalized.positionId !== '전체') {
    const match = positionList.value.find(p => p.name === normalized.positionId);
    normalized.positionId = match?.positionId ?? null;
  } else {
    normalized.positionId = null;
  }

  // 부서 ID 형변환
  if (typeof normalized.deptId === 'string') {
    normalized.deptId = Number(normalized.deptId);
  }

  return normalized;
};


const handleSearch = async (values) => {
  const params = normalizeParams(values);
  params.page = currentPage.value;
  params.size = 10;

  try {
    const res = await getRetentionForecasts(params);
    tableData.value = res.items ?? [];
    pagination.value = res.pagination ?? { currentPage: 1, totalPage: 1 };
  } catch (err) {
    toast.error('근속 전망 목록을 불러오는 데 실패했습니다.');
  }
};

const tableColumns = [
  { key: 'profile', label: '#' },
  { key: 'empNo', label: '사번' },
  { key: 'empName', label: '이름' },
  { key: 'deptName', label: '부서명' },
  { key: 'positionName', label: '직위명' },
  { key: 'stabilityType', label: '안정성 유형' },
  { key: 'roundNo', label: '회차' },
  { key: 'action', label: '상세' },
];

const openDetail = async (row) => {
  try {
    const detail = await getRetentionForecastDetail(row.retentionId);

    formSections.value = [
      {
        title: '사원 정보',
        icon: 'fa-user',
        layout: 'two-column',
        fields: [
          { label: '이름', value: detail.empName, type: 'input', editable: false },
          { label: '부서', value: detail.deptName, type: 'input', editable: false },
          { label: '직위', value: detail.positionName, type: 'input', editable: false },
          { label: '근속 연수', value: `${detail.tenure}년`, type: 'input', editable: false },
        ],
      },
      {
        title: '근속 지표 점수',
        icon: 'fa-star-half-stroke',
        layout: 'one-column',
        fields: [
          {
            label: '',
            type: 'radarChart',
            editable: false,
            value: {
              labels: ['직무', '보상', '관계', '성장', '워라밸', '근속연수'],
              scores: [
                detail.jobScore,
                detail.compScore,
                detail.relationScore,
                detail.growthScore,
                detail.wlbScore,
                detail.tenureScore,
              ],
            }
          }
        ]
      },
      {
        title: '근속 지표 등급',
        icon: 'fa-chart-bar',
        layout: 'two-column',
        fields: [
          { label: '직무 만족도', value: detail.jobGrade, type: 'input', editable: false },
          { label: '보상 만족도', value: detail.compGrade, type: 'input', editable: false },
          { label: '관계 만족도', value: detail.relationGrade, type: 'input', editable: false },
          { label: '성장 만족도', value: detail.growthGrade, type: 'input', editable: false },
          { label: '워라밸 만족도', value: detail.wlbGrade, type: 'input', editable: false },
          { label: '근속 만족도', value: detail.tenureGrade, type: 'input', editable: false },
          { label: '종합 점수', value: detail.retentionScore, type: 'input', editable: false },
          { label: '근속 등급', value: detail.retentionGrade, type: 'input', editable: false },
          { label: '안정성 유형', value: detail.stabilityType, type: 'input', editable: false },
        ],
      }
    ];

    isOpen.value = true;
  } catch (err) {
    toast.error('상세 정보를 불러오는 데 실패했습니다.');
  }
};

const handleDownload = async () => {
  try {
    toast.success('엑셀 다운로드가 시작되었습니다.');
    const params = normalizeParams(filterValues.value);
    const blob = await downloadRetentionPredictionExcel(params);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retention-forecast-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('엑셀 다운로드 중 오류가 발생했습니다.');
  }
};
</script>
