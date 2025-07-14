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
        ref="modalRef"
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
// Imports
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue'
import Filter from '@/components/common/Filter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SideModal from '@/components/common/SideModal.vue'
import {
  getEvaluationTasks,
  getEvaluationRoundStatus,
  getEvaluationFormDetail,
  getEvaluationFormTree,
  getEvaluationFormProperties,
  submitEvaluation
} from '@/features/performance/api'

// Refs / Reactive State
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
const focusIndex = ref(0)
const modalRef = ref(null)

// Computed
const filterOptions = computed(() => [
  {
    key: 'formId',
    label: '폼 종류',
    icon: 'fa-file-signature',
    type: 'tree',
    options: formTree.value
  },
  {
    key: 'date',
    label: '기간',
    icon: 'fa-calendar-day',
    type: 'date-range'
  }
])

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

watch(currentPage, () => handleSearch(filterValues.value))
watch(isModalOpen, open => {
  if (open) {
    focusIndex.value = 0
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Methods
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
    const params = { page: currentPage.value, size: pageSize, roundId: roundId.value }
    const { tasks: list, pagination: page } = await getEvaluationTasks(params)
    tasks.value = list.map(task => {
      const baseDate = task.dueDate ?? task.startAt
      const date = new Date(baseDate)
      date.setDate(date.getDate() + 7)
      return { ...task, dueDate: date.toISOString().split('T')[0] }
    })
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
    tasks.value = list.map(task => {
      const baseDate = task.dueDate ?? task.startAt
      const date = new Date(baseDate)
      date.setDate(date.getDate() + 7)
      return { ...task, dueDate: date.toISOString().split('T')[0] }
    })
    pagination.value = page
  } catch {
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

    const noticeInfo = {
      title: '안내 사항',
      layout: 'one-column',
      fields: [
        {
          type: 'notice',
          value: `본 평가는 구성원의 업무 역량과 조직 기여도를 종합적으로 이해하고, <br>향후 인사 제도 운영 및 조직 관리 방안 수립 시 참고 자료로 활용됩니다.<br>
응답 내용은 절대적으로 비공개로 처리되며,<br>개별 평가 결과로 인해 인사상 불이익이 발생하지 않습니다.<br>
보다 신뢰도 높은 분석을 위해, <br>사실에 근거한 객관적이고 성실한 평가를 부탁드립니다.`,
          editable: false
        }
      ]
    }

    const baseInfo = {
      title: '평가 정보', icon: 'fa-info-circle', layout: 'two-column',
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
        key: `q_${row.formId}_${factor.propertyName}_${idx}`,
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
      title: '평가 사유', icon: 'fa-comment-dots', layout: 'one-column',
      fields: [
        { label: '사유', key: 'reason', type: 'textarea', editable: true, value: '' }
      ]
    }

    formSections.value = [noticeInfo, baseInfo, ...factors, reason]
    submitForm.value = {
      roundNo: row.roundNo,
      formName: formDesc,
      targetName: row.targetName,
      reason: ''
    }
  } catch {
    toast.error('폼 상세 조회 중 오류가 발생했습니다.')
  }
}

async function handleSubmit() {
  try {
    const task = selectedTask.value
    const round = roundId.value
    const responseSections = formSections.value.filter(s => s.title !== '평가 정보' && s.title !== '평가 사유')

    for (const section of responseSections) {
      for (const field of section.fields) {
        if (field.value == null) {
          toast.error('모든 항목에 응답을 완료해 주세요.')
          return
        }
      }
    }

    const factorData = await getEvaluationFormDetail(task.formId, round)
    const propertyMap = await getEvaluationFormProperties({ formId: task.formId }).then(list => new Map(list.map(p => [p.name, p.propertyId])))
    const factorScoreMap = new Map()

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

    const factorScores = []
    for (const [propertyName, scores] of factorScoreMap.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const percent = Math.round((avg / 7) * 100)
      const propertyId = propertyMap.get(propertyName)
      if (!propertyId) continue
      factorScores.push({ propertyId, score: percent })
    }

    const payload = {
      roundId: round,
      formId: task.formId,
      targetId: task.targetEmpId,
      reason: submitForm.value.reason,
      factorScores
    }

    await submitEvaluation(payload)
    toast.success('평가가 성공적으로 제출되었습니다.')
    isModalOpen.value = false
    await fetchTasks()
  } catch {
    toast.error('제출 중 오류가 발생했습니다.')
  }
}

function handleKeydown(e) {
  const key = e.key
  if (!/^[1-7]$/.test(key)) return

  const score = parseInt(key)
  const responseSections = formSections.value.filter(
      s => s.title !== '평가 정보' && s.title !== '평가 사유'
  )

  const likertFields = responseSections.flatMap(s =>
      s.fields.filter(f => f.type === 'likert')
  )

  if (focusIndex.value < likertFields.length) {
    const field = likertFields[focusIndex.value]
    field.value = score

    const isLast = focusIndex.value === likertFields.length - 1
    focusIndex.value += 1

    nextTick(() => {
      if (!isLast) {
        // 다음 Likert 항목으로 스크롤
        const refComponent = modalRef.value?.fieldRefs?.[field.key]
        let el = refComponent?.$el ?? refComponent
        el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      } else {
        // 마지막 항목 → 사유 입력칸으로 이동
        const reasonInput = modalRef.value?.fieldRefs?.['reasonInput']
        const el = reasonInput?.$el ?? reasonInput
        el?.focus?.()
      }
    })
  }

}

// Lifecycle
onMounted(async () => {
  const status = await getEvaluationRoundStatus()
  if (status?.inProgress && status.roundId) roundId.value = status.roundId
  const rawTree = await getEvaluationFormTree()
  formTree.value = transformFormTree(rawTree)
  await handleSearch(filterValues.value)
})
</script>

<style scoped>
.list-table td:nth-last-child(1) button[action] {
  display: none;
}
</style>