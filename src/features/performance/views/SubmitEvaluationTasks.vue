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
        { key: 'formDisplayName',    label: '폼 이름' },
        { key: 'targetName',         label: '피평가자' },
        { key: 'dueDate',            label: '마감일' },
        { key: 'action',             label: '제출' }
      ]"
        :rows="mappedTableData"
        @click-action="row => !row.submitted && openSubmitModal(row)"
    />

    <Pagination
        v-if="pagination.totalPage >= 1"
        :total-pages="pagination.totalPage"
        v-model="currentPage"
    />

    <SideModal
        :visible="isModalOpen"
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
import { ref, onMounted, watch, computed } from 'vue'
import {
  getEvaluationFormTypes,
  getEvaluationTasks,
  getEvaluationFormDetail,
  submitEvaluation
} from '@/features/performance/api.js'

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue'
import EmployeeFilter from '@/components/common/Filter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SideModal from '@/components/common/SideModal.vue'

const currentPage   = ref(1)
const pageSize      = 10
const filterValues  = ref({})
const tasks         = ref([])
const pagination    = ref({ currentPage: 1, totalPage: 1 })

const isModalOpen   = ref(false)
const selectedTask  = ref(null)
const formSections  = ref([])
const formTypeList  = ref([])

// 폼 종류 조회
const fetchFormTypes = async () => {
  formTypeList.value = await getEvaluationFormTypes()
}

// 필터 UI 설정
const filterOptions = computed(() => [
  {
    key: 'formId',
    label: '폼 종류',
    icon: 'fa-file-signature',
    type: 'select',
    options: ['전체', ...formTypeList.value.map(f => f.description)],
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
  const normalized = { ...values }

  if (normalized.submitted === '제출')      normalized.submitted = true
  else if (normalized.submitted === '미제출') normalized.submitted = false
  else delete normalized.submitted

  if (normalized.formId && normalized.formId !== '전체') {
    const match = formTypeList.value.find(f =>
        f.name === normalized.formId || f.description === normalized.formId
    )
    normalized.formId = match?.formId ?? null
  } else {
    normalized.formId = null
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
    const params = { page: currentPage.value, size: pageSize }
    const res    = await getEvaluationTasks(params)
    const { tasks: apiTasks, pagination: apiPage } = res

    tasks.value = apiTasks.map(item => ({
      ...item,
      dueDate: item.dueDate ?? item.startAt
    }))

    pagination.value = {
      currentPage: apiPage.currentPage,
      totalPage:   apiPage.totalPage
    }
  } catch {
    tasks.value      = []
    pagination.value = { currentPage: 1, totalPage: 1 }
  }
}

// tasks 기반으로 매핑, formDisplayName 사용
const mappedTableData = computed(() =>
    tasks.value.map(row => {
      const form = formTypeList.value.find(f => f.name === row.formName)
      return {
        ...row,
        formDisplayName: form?.description || row.formName
      }
    })
)

async function handleSearch(values) {
  const params = {
    ...normalizeFilterParams(values),
    page: currentPage.value,
    size: pageSize
  }

  try {
    const res = await getEvaluationTasks(params)
    const { tasks: apiTasks, pagination: apiPage } = res

    tasks.value = apiTasks.map(item => ({
      ...item,
      dueDate: item.dueDate ?? item.startAt
    }))

    pagination.value = {
      currentPage: apiPage.currentPage,
      totalPage:   apiPage.totalPage
    }
  } catch (e) {
    console.error('검색 실패:', e)
    tasks.value = []
  }
}

async function openSubmitModal(row) {
  selectedTask.value = row
  isModalOpen.value  = true

  const { form, questions } = await getEvaluationFormDetail(
      row.formId,
      row.roundId
  )

  formSections.value = [
    {
      title: '평가 정보',
      icon: 'fa-info-circle',
      layout: 'two-column',
      fields: [
        { label: '회차',    value: row.roundNo,      type: 'input', editable: false },
        { label: '폼 이름', value: form.description, type: 'input', editable: false },
        { label: '피평가자', value: row.targetName,   type: 'input', editable: false },
        { label: '마감일',  value: row.dueDate,       type: 'input', editable: false }
      ]
    },
    {
      title: '문항',
      icon: 'fa-question-circle',
      layout: 'one-column',
      fields: questions.map(q => ({
        label:    q.prompt,
        key:      `q_${q.questionId}`,
        type:     'sliderGroup',
        initial:  0,
        handles: [0, q.maxScore],
        editable: true
      }))
    }
  ]
}

async function handleSubmit() {
  const payload = {
    formId:    selectedTask.value.formId,
    roundId:   selectedTask.value.roundId,
    targetNo:  selectedTask.value.targetNo,
    responses: formSections.value
        .find(s => s.title === '문항')
        .fields.map(f => ({
          questionId: Number(f.key.split('_')[1]),
          score:      f.value
        }))
  }

  await submitEvaluation(payload)
  isModalOpen.value = false
  await fetchTasks()
}

watch(currentPage, () => handleSearch(filterValues.value))

onMounted(async () => {
  await Promise.all([fetchFormTypes(), handleSearch(filterValues.value)])})
</script>

<style scoped>
/* action 버튼 숨기기: submitted가 true면 빈 셀 */
.list-table td:nth-last-child(1) button[action] {
  display: none;
}
</style>
