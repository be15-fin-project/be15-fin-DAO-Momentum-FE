<template>
  <main>
    <HeaderWithTabs
        :headerItems="[
        { label: '평가 제출 목록', to: '/eval/submit', active: true }
      ]"
        :showTabs="false"
    />

    <EmployeeFilter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
        { key: 'roundNo',            label: '회차' },
        { key: 'formDisplayName',    label: '평가 유형' },
        { key: 'targetName',         label: '피평가자' },
        { key: 'dueDate',            label: '마감일' },
        { key: 'action',             label: '제출' }
      ]"
        :rows="mappedTableData"
        @click-detail="row => !row.submitted && openSubmitModal(row)"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <SideModal
        :visible="isModalOpen"
        :form="submitForm"
        title="평가 제출"
        icon="fa-clipboard-list"
        :sections="formSections"
        :showSubmit="true"
        submitLabel="제출하기"
        :showCancel="true"
        cancelLabel="취소"
        @submit="handleSubmit"
        @cancel="isModalOpen = false"
        @close="isModalOpen = false"
    />
  </main>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import {
  getEvaluationRoundStatus,
  getEvaluationTasks,
  getEvaluationFormDetail,
  getEvaluationFormTree,
  getEvaluationFormProperties,
  submitEvaluation
} from '@/features/performance/api.js'

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue'
import EmployeeFilter from '@/components/common/Filter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SideModal from '@/components/common/SideModal.vue'

const roundId = ref(null);
const currentPage = ref(1)
const pageSize = 10
const filterValues = ref({})
const tasks = ref([])
const pagination = ref({currentPage: 1, totalPage: 1})

const isModalOpen = ref(false)
const selectedTask = ref(null)
const formSections = ref([])
const formTree = ref([])
const selectedFormId = ref(null)
const submitForm = ref({});

const filterOptions = computed(() => [
  {
    key: 'formId',
    label: '폼 종류',
    icon: 'fa-file-signature',
    type: 'tree',
    options: formTree.value,
  },
  {
    key: 'submitted',
    label: '제출 여부',
    icon: 'fa-check-circle',
    type: 'select',
    options: ['전체', '제출', '미제출']
  },
  {
    key: 'date',
    label: '기간',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
])

function normalizeFilterParams(values) {
  const normalized = {...values}

  if (normalized.submitted === '제출') normalized.submitted = true
  else if (normalized.submitted === '미제출') normalized.submitted = false
  else delete normalized.submitted

  const selectedId = values.formId
  const typeMatch = formTree.value.find(type => type.deptId === selectedId)
  if (typeMatch) {
    normalized.typeId = typeMatch.typeId
    normalized.formId = null
  } else {
    const allForms = formTree.value.flatMap(type => type.childDept || [])
    const formMatch = allForms.find(f => f.deptId === selectedId)
    if (formMatch) {
      normalized.formId = formMatch.formId
      normalized.typeId = formMatch.typeId
    } else {
      normalized.formId = null
      normalized.typeId = null
    }
  }

  if (normalized.date_start) {
    normalized.startDate = normalized.date_start
    delete normalized.date_start
  }
  if (normalized.date_end) {
    normalized.endDate = normalized.date_end
    delete normalized.date_end
  }

  return normalized
}

async function fetchTasks() {
  try {
    const params = {page: currentPage.value, size: pageSize, roundId: roundId.value}
    const res = await getEvaluationTasks(params)
    const {tasks: apiTasks, pagination: apiPage} = res.get

    tasks.value = apiTasks.map(item => ({
      ...item,
      dueDate: item.dueDate ?? item.startAt
    }))

    pagination.value = {
      currentPage: apiPage.currentPage,
      totalPage: apiPage.totalPage
    }
  } catch {
    tasks.value = []
    pagination.value = {currentPage: 1, totalPage: 1}
  }
}

const mappedTableData = computed(() => {
  const allForms = formTree.value.flatMap(type => type.childDept || [])
  return tasks.value.map(row => {
    const match = allForms.find(f => f.formId === row.formId)
    return {
      ...row,
      formDisplayName: match?.name || row.formName
    }
  })
})

async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: pageSize,
    roundId: roundId.value
  }

  try {
    const res = await getEvaluationTasks(params)
    const {tasks: apiTasks, pagination: apiPage} = res

    tasks.value = apiTasks.map(item => ({
      ...item,
      dueDate: item.dueDate ?? item.startAt
    }))

    pagination.value = {
      currentPage: apiPage.currentPage,
      totalPage: apiPage.totalPage
    }
  } catch (e) {
    console.error('검색 실패:', e)
    tasks.value = []
  }
}

async function openSubmitModal(row) {
  selectedTask.value = row;
  isModalOpen.value = true;

  try {
    const [data, properties] = await Promise.all([
      getEvaluationFormDetail(row.formId, roundId.value),
      getEvaluationFormProperties({formId: row.formId})
    ])

    const allForms = formTree.value.flatMap(type => type.childDept || [])
    const formDesc = allForms.find(f => f.formId === row.formId)?.name || row.formName

    const propertyMap = new Map(properties.map(p => [p.name, p.propertyId]))

    const baseInfoSection = {
      title: '평가 정보',
      icon: 'fa-info-circle',
      layout: 'two-column',
      fields: [
        {label: '회차', value: row.roundNo, type: 'input', editable: false},
        {label: '평가 유형', value: formDesc, type: 'input', editable: false},
        {label: '피평가자', value: row.targetName, type: 'input', editable: false},
      ]
    }

    const factorSections = data.factors
        .filter(f => f.prompts?.length > 0)
        .map(factor => ({
          title: factor.propertyName,
          icon: 'fa-question-circle',
          layout: 'one-column',
          fields: factor.prompts.map((p, idx) => ({
            key: `q_${factor.propertyName}_${idx}`,
            label: p.content,
            type: 'likert',
            min: 1,
            max: 7,
            labels: ['매우 불만족', '매우 만족'],
            editable: true,
            value: null
          }))
        }))

    const reasonSection = {
      title: '평가 사유',
      icon: 'fa-comment-dots',
      layout: 'one-column',
      fields: [
        {
          label: '사유',
          key: 'reason',
          type: 'textarea',
          editable: true,
          value: submitForm.value.reason
        }
      ]
    }

    formSections.value = [baseInfoSection, ...factorSections, reasonSection]

    submitForm.value = {
      roundNo: row.roundNo,
      formName: formDesc,
      targetName: row.targetName,
      reason: ''
    }
  } catch (e) {
    console.error('폼 상세 조회 실패:', e)
  }
}

async function handleSubmit() {
  try {
    const task = selectedTask.value;
    const round = roundId.value;

    // [1] 평가 문항에 대한 응답 섹션만 추출
    const responseSections = formSections.value.filter(
        s => s.title !== '평가 정보' && s.title !== '평가 사유'
    );

    // [2] 모든 문항 응답 여부 검증
    for (const section of responseSections) {
      for (const field of section.fields) {
        if (field.value == null) {
          alert('모든 항목에 응답을 완료해 주세요.');
          return;
        }
      }
    }

    // [3] 점수 계산 준비
    const factorScoreMap = new Map(); // key: propertyName, value: [점수1, 점수2, ...]
    const factorData = await getEvaluationFormDetail(task.formId, round);
    const propertyMap = await getEvaluationFormProperties({ formId: task.formId })
        .then(list => new Map(list.map(p => [p.name, p.propertyId])));

    // [4] 점수 수집 및 변환
    for (const section of responseSections) {
      const propertyName = section.title;
      const scores = [];

      for (const field of section.fields) {
        const score = field.value;
        const promptLabel = field.label;

        const thisFactor = factorData.factors.find(f => f.propertyName === propertyName);
        const thisPrompt = thisFactor?.prompts?.find(p => p.content === promptLabel);
        if (!thisPrompt) continue;

        const isPositive = thisPrompt.positive;
        const convertedScore = isPositive ? score : 7 - score;
        scores.push(convertedScore);
      }

      factorScoreMap.set(propertyName, scores);
    }

    // [5] 요인별 점수 평균 → 백분율 변환
    const factorScores = [];

    for (const [propertyName, scores] of factorScoreMap.entries()) {
      if (scores.length === 0) continue;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const percent = Math.round((avg / 7) * 100);
      const propertyId = propertyMap.get(propertyName);

      if (propertyId == null) {
        console.warn(`propertyId not found for ${propertyName}`);
        continue;
      }

      factorScores.push({
        propertyId,
        score: percent
      });
    }

    // [6] 제출 페이로드 구성
    const payload = {
      roundId: roundId.value,
      formId: task.formId,
      targetId: task.targetId,
      reason:submitForm.value.reason,
      factorScores
    };

    console.log('제출 payload:', JSON.stringify(payload, null, 2));

    // [7] 서버에 제출 요청
    const result = await submitEvaluation(payload);
    console.log('제출 성공 응답:', result);

    isModalOpen.value = false;
    await fetchTasks();

  } catch (e) {
    console.error('제출 실패:', e.response?.data || e);
    alert('제출 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
  }
}


function transformFormTree(rawTree) {
  return rawTree.map(type => ({
    typeId: type.typeId,
    deptId: type.typeId + 20,
    name: type.typeName,
    childDept: type.children.map(form => ({
      deptId: form.formId,
      name: form.description,
      childDept: [],
      formId: form.formId,
      typeId: type.typeId
    })),
  }))
}

watch(currentPage, () => handleSearch(filterValues.value))

onMounted(async () => {
  const status = await getEvaluationRoundStatus();
  if (status?.inProgress && status.roundId) {
    roundId.value = status.roundId;
  }

  const rawTree = await getEvaluationFormTree()
  formTree.value = transformFormTree(rawTree)
  await handleSearch(filterValues.value)
})
</script>


<style scoped>
/* action 버튼 숨기기: submitted가 true면 빈 셀 */
.list-table td:nth-last-child(1) button[action] {
  display: none;
}
</style>
