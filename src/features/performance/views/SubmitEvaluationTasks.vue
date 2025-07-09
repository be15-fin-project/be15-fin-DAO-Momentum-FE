<template>
  <main>
    <HeaderWithTabs
        :headerItems="[{ label: '평가 제출 목록', to: '/eval/submit', active: true }]"
        :showTabs="false"
    />

    <Filter
        :filters="filterOptions"
        v-model="filterValues"
        @search="handleSearch"
    />

    <BaseTable
        :columns="[
        { key: 'roundNo', label: '회차' },
        { key: 'formDisplayName', label: '평가 유형' },
        { key: 'targetName', label: '피평가자' },
        { key: 'dueDate', label: '마감일' },
        { key: 'showDetail', label: '제출' }
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
        v-model:visible="isModalOpen"
        title="평가 제출"
        icon="fa-clipboard-list"
        :form="submitForm"
        :sections="formSections"
        :showSubmit="true"
        submitLabel="제출하기"
        :showCancel="true"
        cancelLabel="취소"
        @submit="handleSubmit"
        @cancel="() => (isModalOpen = false)"
        @close="() => (isModalOpen = false)"
    />
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  getEvaluationTasks,
  getEvaluationRoundStatus,
  getEvaluationFormDetail,
  getEvaluationFormTree,
  getEvaluationFormProperties,
  submitEvaluation
} from '@/features/performance/api'
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import Filter from "@/components/common/Filter.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import SideModal from "@/components/common/SideModal.vue";

const toast = useToast()

const roundId = ref(null)
const currentPage = ref(1)
const pageSize = 10
const filterValues = ref({})
const pagination = ref({ currentPage: 1, totalPage: 1 })
const tasks = ref([])
const formTree = ref([])
const isModalOpen = ref(false)
const selectedTask = ref(null)
const formSections = ref([])
const submitForm = ref({})

const filterOptions = computed(() => [
  {
    key: 'formId',
    label: '폼 종류',
    icon: 'fa-file-signature',
    type: 'tree',
    options: formTree.value
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

function transformFormTree(rawTree) {
  return rawTree.map(type => ({
    typeId: type.typeId,
    deptId: type.typeId + 20,
    name: type.typeName,
    childDept: type.children.map(form => ({
      deptId: form.formId,
      name: form.description,
      formId: form.formId,
      typeId: type.typeId
    }))
  }))
}

function normalizeFilterParams(values) {
  const normalized = { ...values }

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

const mappedTableData = computed(() => {
  const allForms = formTree.value.flatMap(type => type.childDept || [])
  return tasks.value.map(row => {
    const matched = allForms.find(f => f.formId === row.formId)
    return {
      ...row,
      formDisplayName: matched?.name || row.formName,
      showDetail: !row.submitted
    }
  })
})

async function fetchTasks() {
  try {
    const params = { page: currentPage.value, size: pageSize, roundId: roundId.value }
    const { tasks: list, pagination: page } = await getEvaluationTasks(params)
    tasks.value = list.map(task => ({ ...task, dueDate: task.dueDate ?? task.startAt }))
    pagination.value = page
  } catch {
    tasks.value = []
    pagination.value = { currentPage: 1, totalPage: 1 }
    toast.error('목록을 불러오는 데 실패했습니다.')
  }
}

async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: pageSize,
    roundId: roundId.value
  }
  try {
    const { tasks: list, pagination: page } = await getEvaluationTasks(params)
    tasks.value = list.map(task => ({ ...task, dueDate: task.dueDate ?? task.startAt }))
    pagination.value = page
  } catch (e) {
    toast.error('검색 중 오류가 발생했습니다.')
    tasks.value = []
  }
}

async function openSubmitModal(row) {
  selectedTask.value = row
  isModalOpen.value = true

  try {
    const [detail, properties] = await Promise.all([
      getEvaluationFormDetail(row.formId, roundId.value),
      getEvaluationFormProperties({ formId: row.formId })
    ])

    const allForms = formTree.value.flatMap(type => type.childDept || [])
    const formDesc = allForms.find(f => f.formId === row.formId)?.name || row.formName
    const propertyMap = new Map(properties.map(p => [p.name, p.propertyId]))

    const baseInfo = {
      title: '평가 정보',
      icon: 'fa-info-circle',
      layout: 'two-column',
      fields: [
        { label: '회차', value: row.roundNo, type: 'input', editable: false },
        { label: '평가 유형', value: formDesc, type: 'input', editable: false },
        { label: '피평가자', value: row.targetName, type: 'input', editable: false }
      ]
    }

    const factors = detail.factors.filter(f => f.prompts?.length > 0).map(factor => ({
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

    const reason = {
      title: '평가 사유',
      icon: 'fa-comment-dots',
      layout: 'one-column',
      fields: [
        { label: '사유', key: 'reason', type: 'textarea', editable: true, value: '' }
      ]
    }

    formSections.value = [baseInfo, ...factors, reason]
    submitForm.value = {
      roundNo: row.roundNo,
      formName: formDesc,
      targetName: row.targetName,
      reason: ''
    }
  } catch (e) {
    toast.error('폼 상세 조회 중 오류가 발생했습니다.')
  }
}

async function handleSubmit() {
  try {
    const task = selectedTask.value
    const round = roundId.value
    // [1] 평가 문항에 대한 응답 섹션만 추출
    const responseSections = formSections.value.filter(s => s.title !== '평가 정보' && s.title !== '평가 사유')

    for (const section of responseSections) {
      for (const field of section.fields) {
        if (field.value == null) {
          // [2] 모든 문항 응답 여부 검증
          toast.error('모든 항목에 응답을 완료해 주세요.')
          return
        }
      }
    }

    // [3] 점수 계산 준비
    const factorData = await getEvaluationFormDetail(task.formId, round)
    const propertyMap = await getEvaluationFormProperties({ formId: task.formId }).then(list => new Map(list.map(p => [p.name, p.propertyId])))
    const factorScoreMap = new Map()

    // [4] 점수 수집 및 변환
    for (const section of responseSections) {
      const scores = []
      for (const field of section.fields) {
        const score = field.value
        const promptLabel = field.label
        const factor = factorData.factors.find(f => f.propertyName === section.title)
        const prompt = factor?.prompts?.find(p => p.content === promptLabel)
        if (!prompt) continue
        const converted = prompt.isPositive ? score + 1 : 8 - score
        scores.push(converted)
      }
      factorScoreMap.set(section.title, scores)
    }

    // [5] 요인별 점수 평균 → 백분율 변환
    const factorScores = []
    for (const [propertyName, scores] of factorScoreMap.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const percent = Math.round((avg / 7) * 100)
      const propertyId = propertyMap.get(propertyName)
      if (!propertyId) continue
      factorScores.push({ propertyId, score: percent })
    }

    // [6] 제출 페이로드 구성
    const payload = {
      roundId: round,
      formId: task.formId,
      targetId: task.targetEmpId,
      reason: submitForm.value.reason,
      factorScores
    }

    // [7] 서버에 제출 요청
    await submitEvaluation(payload)
    toast.success('평가가 성공적으로 제출되었습니다.')
    isModalOpen.value = false
    await fetchTasks()
  } catch {
    toast.error('제출 중 오류가 발생했습니다.')
  }
}

// 문항 순차 입력을 위한 포커스 인덱스
const focusIndex = ref(0)

function handleKeydown(e) {
  const key = e.key
  if (!/^[1-7]$/.test(key)) return

  const score = parseInt(key)

  // 평가 항목만 필터링 (평가 정보, 사유 제외)
  const responseSections = formSections.value.filter(s => s.title !== '평가 정보' && s.title !== '평가 사유')
  const allFields = responseSections.flatMap(s => s.fields)

  if (focusIndex.value < allFields.length) {
    allFields[focusIndex.value].value = score
    focusIndex.value += 1
  }
}

// 모달 열릴 때 키 입력 리스너 등록
watch(isModalOpen, (open) => {
  if (open) {
    focusIndex.value = 0
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})


watch(currentPage, () => handleSearch(filterValues.value))

onMounted(async () => {
  const status = await getEvaluationRoundStatus()
  if (status?.inProgress && status.roundId) roundId.value = status.roundId
  const rawTree = await getEvaluationFormTree()
  formTree.value = transformFormTree(rawTree)
  await handleSearch(filterValues.value)
  console.log('pagination state:', pagination.value)

})
</script>

<style scoped>
.list-table td:nth-last-child(1) button[action] {
  display: none;
}
</style>