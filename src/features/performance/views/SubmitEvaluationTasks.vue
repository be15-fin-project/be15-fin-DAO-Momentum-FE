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
import { ref, onMounted, watch, computed } from 'vue'
import {
  getEvaluationFormTypes,
  getEvaluationTasks,
  getEvaluationFormDetail,
  submitEvaluation,
  getEvaluationFormTree
} from '@/features/performance/api.js'

import HeaderWithTabs from '@/components/common/HeaderWithTabs.vue'
import EmployeeFilter from '@/components/common/Filter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SideModal from '@/components/common/SideModal.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roundId = computed(() => route?.state?.roundId ?? null)
const currentPage   = ref(1)
const pageSize      = 10
const filterValues  = ref({})
const tasks         = ref([])
const pagination    = ref({ currentPage: 1, totalPage: 1 })

const isModalOpen   = ref(false)
const selectedTask  = ref(null)
const formSections  = ref([])
const formTree = ref([])
const selectedFormId = ref(null)
const submitForm = ref({});

// 필터 UI 설정
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
  const normalized = { ...values }

  if (normalized.submitted === '제출') normalized.submitted = true
  else if (normalized.submitted === '미제출') normalized.submitted = false
  else delete normalized.submitted

  // formTree에서 formId와 typeId 분기 처리
  const selectedId = values.formId

  const typeMatch = formTree.value.find(type => type.deptId === selectedId)
  if (typeMatch) {
    // type 노드 선택됨
    normalized.typeId = typeMatch.typeId
    normalized.formId = null
  } else {
    // form 노드 선택됨
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

  console.log('[정규화된 파라미터]', normalized)
  return normalized
}



async function fetchTasks() {
  try {
    const params = { page: currentPage.value, size: pageSize, roundId: roundId.value }
    const res    = await getEvaluationTasks(params)
    const { tasks: apiTasks, pagination: apiPage } = res.get

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
const mappedTableData = computed(() => {
  const allForms = formTree.value.flatMap(type => type.childDept  || [])
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
  console.log('▶ 호출됨:', row);
  selectedTask.value = row;
  isModalOpen.value  = true;

  try {
    const data = await getEvaluationFormDetail(row.formId, roundId.value);

    const allForms = formTree.value.flatMap(type => type.childDept  || []);
    const formDesc = allForms.find(f => f.formId === row.formId)?.description || row.formName;

    formSections.value = [
      {
        title: '평가 정보',
        icon: 'fa-info-circle',
        layout: 'two-column',
        fields: [
          { label: '회차',    value: row.roundNo,      type: 'input', editable: false },
          { label: '폼 이름',  value: formDesc,         type: 'input', editable: false },
          { label: '피평가자', value: row.targetName,   type: 'input', editable: false },
        ]
      },
      {
        title: '문항',
        icon: 'fa-question-circle',
        layout: 'one-column',
        fields: data.factors.flatMap(factor =>
            factor.prompts.map((p, idx) => ({
              key:     `q_${factor.propertyName}_${idx}`,
              label:   p.content,
              type:    'likert',
              min:     1,
              max:     7,
              labels:  ['매우 불만족','매우 만족'],
              editable: true,
              value:   null
            }))
        )
      },
      {
        title: '평가 사유',
        icon: 'fa-comment-dots',
        layout: 'one-column',
        fields: [
          { label: '사유', value: row.reason, type: 'input', editable: true }
        ]
      }
    ];

    submitForm.value = {
      roundNo:    row.roundNo,
      formName:   formDesc,
      targetName: row.targetName
    };
  } catch (e) {
    console.error('폼 상세 조회 실패:', e);
  }
}

async function handleSubmit() {
  const payload = {
    typeId:    selectedTask.value.typeId,
    formId:    selectedTask.value.formId,
    roundId:   roundId.value,
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
  const rawTree = await getEvaluationFormTree();
  formTree.value = transformFormTree(rawTree);
  await handleSearch(filterValues.value);
})

</script>

<style scoped>
/* action 버튼 숨기기: submitted가 true면 빈 셀 */
.list-table td:nth-last-child(1) button[action] {
  display: none;
}
</style>
