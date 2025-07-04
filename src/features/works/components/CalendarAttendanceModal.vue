<script setup>
import { computed, reactive, watch } from 'vue'
import CommonModal from '@/components/common/CommonModal.vue'
import FieldRenderer from "@/components/common/form/FieldRenderer.vue"
import FormSection from "@/components/common/form/FormSection.vue"

const props = defineProps({
  visible: Boolean,
  attendanceData: Object,
  formatTime: Function,
  formatDuration: Function,
  isWork: Boolean,
})

const emit = defineEmits(['close', 'editRequest'])

const model = reactive({
  startTime: '',
  endTime: '',
  breakTime: '',
  workTime: ''
})

watch(() => props.attendanceData, () => {
  const a = props.attendanceData || {}
  model.startTime = props.formatTime(a.startTime) || '-'
  model.endTime = props.formatTime(a.endTime) || '-'
  model.breakTime = props.formatDuration(a.breakTime || 0)
  model.workTime = props.formatDuration(a.workTime || 0)
}, { immediate: true, deep: true })

// watch(() => props.isWork, val => {
//   console.log('CalendarAttendanceModal isWork prop:', val)
// }, { immediate: true })

const fields = computed(() => [
  { key: 'startTime', label: '출근 일시', type: 'input' },
  { key: 'endTime', label: '퇴근 일시', type: 'input' },
  { key: 'breakTime', label: '휴게시간', type: 'input' },
  { key: 'workTime', label: '근무시간', type: 'input' },
])
</script>

<template>
  <CommonModal
      class="calendar-attendance-modal"
      :visible="visible"
      :confirm-visible="isWork"
      cancel-text="닫기"
      confirm-text="출퇴근 정정 신청"
      @cancel="$emit('close')"
      @confirm="$emit('editRequest')"
  >
      <FormSection :fields="fields" layout="two-column">
        <template #title>
          <h3 class="section-title">출퇴근 상세 정보</h3>
        </template>
        <FieldRenderer
            v-for="field in fields"
            :key="field.key"
            :field="field"
            :model="model"
            :readonly="true"
        />
      </FormSection>
  </CommonModal>
</template>

<style scoped>
:deep(.modal-content) {
  padding: 40px;
  width: 500px;
}

:deep(.modal-buttons) {
  display: flex;
  gap: 12px;                   /* 버튼 사이 간격 */
  width: 100%;
  margin-top: 8px;             /* 버튼 위 여백 */
}
</style>