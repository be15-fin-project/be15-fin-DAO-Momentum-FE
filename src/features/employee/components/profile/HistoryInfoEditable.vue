<script setup>
import {computed, reactive, watch} from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SectionHeader from '@/features/mypage/components/profile/SectionHeader.vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  isEditing: Boolean
});

const isEditing = computed({
  get() {
    return props.isEditing
  },
  set(value) {
    emit('update:isEditing', value)
  }
})

const emit = defineEmits(['submit', 'cancel', 'update:isEditing'])

const sections = [
  {
    key: 'EDUCATION',
    title: '학력',
    icon: 'fas fa-graduation-cap',
    fields: ['학교명', '학과명', '입학일', '졸업일']
  },
  {
    key: 'CERTIFICATE',
    title: '자격증',
    icon: 'fas fa-certificate',
    fields: ['자격증명', '발급 기관', '취득일']
  },
  {
    key: 'AWARD',
    title: '수상 이력',
    icon: 'fas fa-award',
    fields: ['수상명', '수상 기관', '수상일']
  },
  {
    key: 'CAREER',
    title: '경력',
    icon: 'fas fa-briefcase',
    fields: ['직장명', '시작일', '종료일']
  }
]

const headersMap = {
  EDUCATION: ['학교명', '학과명', '입학일', '졸업일'],
  CERTIFICATE: ['자격증명', '발급 기관', '취득일'],
  AWARD: ['수상명', '수상 기관', '수상일'],
  CAREER: ['직장명', '시작일', '종료일']
}

const formData = reactive({
  EDUCATION: [],
  CERTIFICATE: [],
  AWARD: [],
  CAREER: []
})

const idsToDelete = new Set()

const addItem = (sectionKey) => {
  const fields = sections.find(s => s.key === sectionKey).fields
  const newItem = Object.fromEntries(fields.map(f => [f, '']))
  newItem.recordId = null // 새로 추가된 항목은 recordId 없음
  formData[sectionKey].push(newItem)
}

const removeItem = (sectionKey, index) => {
  const item = formData[sectionKey][index]
  if (item.recordId) {
    idsToDelete.add(item.recordId)
  }
  formData[sectionKey].splice(index, 1)
}

const handleSave = () => {
  emit('submit', formData, Array.from(idsToDelete))
  isEditing.value = false
}

const handleCancel = () => {
  emit('cancel')
}

watch(
    () => props.records,
    (newRecords) => {
      formData.EDUCATION = []
      formData.CERTIFICATE = []
      formData.AWARD = []
      formData.CAREER = []

      idsToDelete.clear()

      newRecords.forEach((item) => {
        switch (item.type) {
          case 'EDUCATION':
            formData.EDUCATION.push({
              recordId: item.recordId,
              학교명: item.organization,
              학과명: item.name,
              입학일: item.startDate,
              졸업일: item.endDate
            })
            break
          case 'CERTIFICATE':
            formData.CERTIFICATE.push({
              recordId: item.recordId,
              자격증명: item.name,
              "발급 기관": item.organization,
              취득일: item.startDate
            })
            break
          case 'AWARD':
            formData.AWARD.push({
              recordId: item.recordId,
              수상명: item.name,
              "수상 기관": item.organization,
              수상일: item.startDate
            })
            break
          case 'CAREER':
            formData.CAREER.push({
              recordId: item.recordId,
              직장명: item.organization,
              시작일: item.startDate,
              종료일: item.endDate
            })
            break
        }
      })
    },
    { immediate: true, deep: true }
)
</script>

<template>
  <div class="content-sections">
    <div v-for="(section, sectionIndex) in sections" :key="section.key" class="table-block">
      <div class="first-header">
        <SectionHeader :icon-class="section.icon" :title="section.title" />
        <template v-if="sectionIndex === 0 && !isEditing">
          <BaseButton
              icon="fas fa-edit"
              variant="edit"
              @click="emit('update:isEditing', true)"
          >인사 정보 수정</BaseButton>
        </template>

        <template v-if="isEditing">
          <button class="add-button" @click="addItem(section.key)">
            <i class="fas fa-plus-circle" />
          </button>
        </template>
      </div>
      <table class="info-table">
        <thead>
        <tr>
          <th v-for="header in headersMap[section.key]" :key="header">{{ header }}</th>
          <th v-if="isEditing" style="width: 40px;"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in formData[section.key]" :key="index">
          <td v-for="field in section.fields" :key="field">
            <template v-if="isEditing">
              <input
                  v-model="item[field]"
                  class="table-input"
                  :type="field.includes('일') ? 'date' : 'text'"
                  :placeholder="field"
                  :disabled="item.recordId !== undefined && item.recordId !== null"
              />
            </template>
            <template v-else>
              {{ item[field] }}
            </template>
          </td>
          <td v-if="isEditing">
            <button class="delete-button" @click="removeItem(section.key, index)">
              <i class="fas fa-minus-circle" />
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isEditing" class="form-actions">
      <BaseButton icon="fas fa-check" variant="edit" @click="handleSave"> 저장 </BaseButton>
      <BaseButton icon="fas fa-times" variant="cancel" @click="handleCancel"> 취소 </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.content-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.info-table th,
.info-table td {
  border: 1px solid #e5e7eb;
  padding: 10px;
  text-align: left;
}

.table-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.first-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  background: none;
  border: none;
  color: #10b981;
  font-size: 20px;
  cursor: pointer;
}

.delete-button {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.info-table th,
.info-table td {
  padding: 20px 24px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.info-table th {
  background: var(--blue-50);
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.info-table tr:hover {
  background: #f9fafb;
}

.info-table tr:last-child td {
  border-bottom: none;
}

.table-value {
  font-weight: 600;
  color: #1f2937;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}
</style>