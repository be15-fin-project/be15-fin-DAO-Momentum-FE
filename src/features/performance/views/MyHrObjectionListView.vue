<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '인사 평가 내역', to: '/hr/hr-list', active: true },
      ]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
        :tabs="tabOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
          { key: 'roundNo', label: '회차' },
          { key: 'evaluatedAt', label: '평가일' },
          { key: '업무 수행 역량', label: '업무 수행 역량' },
          { key: '협업 역량', label: '협업 역량' },
          { key: '자기관리 및 태도', label: '자기 관리 및 태도' },
          { key: '성장 의지', label: '성장 의지' },
          { key: '조직 기여도', label: '조직 기여도' },
          { key: 'KPI 성과관리', label: 'KPI 성과 관리' },
          { key: 'overallGrade', label: '등급' },
          { key: 'action', label: '상세' }
        ]"
        :rows="mappedTableData"
        @click-detail="openModalHandler"
    />


    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <SideModal
        :visible="isOpen"
        title="인사 평가 상세 정보"
        icon="fa-star-half-stroke"

        :sections="formSections"
        :showReject="!isRejecting && !selectedRow?.objectionSubmitted"
        :showSubmit="isRejecting"
        :showCancel="isRejecting"
        :submitText="'제출'"
        :rejectText="'이의제기'"

        @close="isOpen = false"
        @submit="handleSubmit"
        @reject="handleReject"
        @cancel="handleCancel"
        v-model:form="createForm"
    />

  </main>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue';
import {
  getEvaluationRounds,
  getMyHrObjections,
  getMyHrObjectionDetail,
  submitHrObjection, getEvaluationRoundNos,
} from '@/features/performance/api.js';

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue';
import EmployeeFilter from '@/components/common/Filter.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import SideModal from '@/components/common/SideModal.vue';


// 상태 변수
const currentPage = ref(1);
const filterValues = ref({ status: '승인' });
const tableData = ref([]);
const pagination = ref({currentPage: 1, totalPage: 1});

const isOpen = ref(false);
const isRejecting = ref(false);
const createForm = ref({reason: ''});
const formSections = ref([]);
const selectedRow = ref(null);
const roundOptions = ref([]);
const roundList = ref([]);
const filterOptions = ref([]);

const fetchRoundNos = async () => {
  roundList.value = await getEvaluationRoundNos();
};

// 필터 옵션 정의
const initFilters = () => {
};

// 필터 파라미터 정규화

filterOptions.value = [
  {
    key: 'roundNo',
    label: '회차',
    icon: 'fa-list-ol',
    type: 'select',
    options: ['전체', ...roundList.value.map(r => ({
      label: `${r.roundNo} 회차`,
      value: r.roundNo
    }))]
  },
  {
    key: 'date',
    label: '평가일',
    icon: 'fa-calendar-day',
    type: 'date-range',
  }
];

const tabOptions = [
  { key: 'status', label: '승인', value: '승인' },
  { key: 'status', label: '대기', value: '대기' },
  { key: 'status', label: '반려', value: '반려' }
];

function normalizeFilterParams(values) {
  const normalized = {...values};

  if (normalized.roundNo === '전체') {
    normalized.roundNo = null;
  }

  if (normalized.roundNo !== undefined && normalized.roundNo !== null) {
    normalized.roundId = Number(normalized.roundNo);
  }
  delete normalized.roundNo;


  if (normalized.date_start) {
    normalized.startDate = normalized.date_start;
    delete normalized.date_start;
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end;
    delete normalized.date_end;
  }


  // 상태 처리
  switch (normalized.status) {
    case '대기':
      normalized.statusId = 1;
      break;
    case '반려':
      normalized.statusId = 3;
      break;
    default:
      normalized.statusId = 2;
      break;
  }

  return normalized;
}


// 평가 목록 조회
async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: 10,
  };

  try {
    const res = await getMyHrObjections(params);
    const items = res.items ?? [];

    // 항목이 하나뿐이면 상세 요인 점수 포함
    if (items.length === 1 && Array.isArray(res.factorScores)) {
      items[0].factorScores = res.factorScores;
    }

    tableData.value = items;

    pagination.value = {
      currentPage: res.pagination?.currentPage || 1,
      totalPage: res.pagination?.totalPage || 1,
    };
  } catch (e) {
    console.error('인사 평가 내역 조회 실패:', e);
    tableData.value = [];
  }
}


// 표 데이터 가공
const mappedTableData = computed(() =>
    tableData.value.map(row => {
      const baseRow = {
        ...row,
        evaluatedAt: row.evaluatedAt?.split('T')[0] ?? '',
      };

      // 요인별 점수 병합
      if (row.factorScores) {
        row.factorScores.forEach(f => {
          baseRow[f.propertyName] = f.score;
        });
      }

      return baseRow;
    })
);


// 상세 모달 열기
async function openModalHandler(row) {
  try {
    const res = await getMyHrObjectionDetail(row.resultId);
    const {content, factorScores} = res;

    selectedRow.value = row;
    isOpen.value = true;
    isRejecting.value = false;
    createForm.value = {reason: ''};

    // 등급 비율 및 가중치 변환
    const weightSegments = [
      res.weightInfo?.weightPerform ?? 0,
      res.weightInfo?.weightTeam ?? 0,
      res.weightInfo?.weightAttitude ?? 0,
      res.weightInfo?.weightGrowth ?? 0,
      res.weightInfo?.weightEngagement ?? 0,
      res.weightInfo?.weightResult ?? 0,
    ];

    const gradeRatios = [
      res.rateInfo?.rateS ?? 0,
      res.rateInfo?.rateA ?? 0,
      res.rateInfo?.rateB ?? 0,
      res.rateInfo?.rateC ?? 0,
      res.rateInfo?.rateD ?? 0,
    ];

    // 기본 정보 섹션
    const baseSection = {
      title: '인사 평가 정보',
      icon: 'fa-clipboard-check',
      layout: 'two-column',
      fields: [
        {label: '회차', value: row.roundNo, type: 'input', editable: false},
        {label: '사원명', value: `${content.empName} (${content.empNo})`, type: 'input', editable: false},
        {label: '등급', value: content.overallGrade, type: 'input', editable: false},
        {label: '평가일', value: content.evaluatedAt?.split('T')[0], type: 'input', editable: false}
      ]
    };

    // 요인별 레이더 차트 섹션
    const radarSection = {
      title: '요인별 평가 결과',
      icon: 'fa-star-half-alt',
      layout: 'one-column',
      fields: [
        {
          label: '',
          type: 'radarChart',
          editable: false,
          value: {
            labels: factorScores.map(f => f.propertyName),
            scores: factorScores.map(f => f.score)
          }
        }
      ]
    }
    // 인사 평가 기준 섹션
    const weightSection = {
      title: '항목 가중치 (%)',
      icon: 'fa-weight-hanging',
      layout: 'one-column',
      fields: [{
        key: 'weightSegments',
        type: 'sliderGroup',
        initial: weightSegments,
        labels: ['성과', '팀워크', '태도', '성장', '몰입', '결과'],
        icons: ['fa-chart-line', 'fa-people-group', 'fa-thumbs-up', 'fa-seedling', 'fa-fire', 'fa-award'],
        editable: false
      }]
    };

    const gradeSection = {
      title: '등급 비율 (%)',
      icon: 'fa-percent',
      layout: 'one-column',
      fields: [{
        key: 'gradeRatios',
        type: 'sliderGroup',
        initial: gradeRatios,
        labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
        icons: ['fa-star', 'fa-medal', 'fa-user', 'fa-user-alt', 'fa-user-slash'],
        editable: false
      }]
    };


    formSections.value = [baseSection, radarSection, weightSection, gradeSection];
  } catch (err) {
    console.error('상세 조회 실패:', err);
    isOpen.value = false;
  }
}


// 이의제기 모드 진입
function handleReject() {
  if (isRejecting.value) return;
  isRejecting.value = true;

  formSections.value.push({
    title: '이의제기 사유',
    icon: 'fa-comment-dots',
    layout: 'one-column',
    fields: [
      {
        label: '사유',
        type: 'textarea',
        key: 'reason',
        required: true,
        editable: true,
        placeholder: '이의제기 사유를 입력하세요.',
      },
    ],
  });
}


// 이의제기 취소
function handleCancel() {
  isRejecting.value = false;
  createForm.value.reason = '';

  formSections.value = formSections.value.filter(
      section => section.title !== '이의제기 사유'
  );
}


// 이의제기 제출
async function handleSubmit() {
  const reason = createForm.value.reason?.trim();
  if (!reason) {
    alert('이의제기 사유를 입력해주세요.');
    return;
  }

  try {
    await submitHrObjection(selectedRow.value.resultId, {reason});

    alert('이의제기가 성공적으로 제출되었습니다.');
    isOpen.value = false;
    isRejecting.value = false;
    createForm.value = {reason: ''};
  } catch (e) {
    console.error('이의제기 제출 실패:', e);
    alert('이의제기 제출에 실패했습니다.');
  }
}


// 페이지 변경 감지
watch(currentPage, () => handleSearch(filterValues.value));


//  초기 로딩
onMounted(async () => {
  try {
    const res = await getEvaluationRounds({ page: 1, size: 100 });
    roundOptions.value = res.list.map(round => ({
      label: `${round.roundNo} 회`,
      value: round.roundNo
    }));

    await fetchRoundNos();  // roundList 채움
    initFilters();          // filterOptions.value 설정

    await handleSearch(filterValues.value); // 초기 상태 필터 반영
  } catch (e) {
    console.error('회차 목록 로딩 실패:', e);
  }
});

</script>
