<script setup>
import {computed, reactive, watch} from 'vue'
import CommonModal from '@/components/common/CommonModal.vue'
import FieldRenderer from "@/components/common/FieldRenderer.vue";
import FormSection from "@/components/common/form/FormSection.vue";

const props = defineProps({
  visible: Boolean,
  isAttended: Boolean,
  clockInfo: Object,
  formatTime: Function,
  formatDuration: Function,
})

const now = computed(() => props.clockInfo.now ?? null)
const startTime = computed(() => props.clockInfo.startTime ?? null)
const endTime = computed(() => props.clockInfo.endTime ?? null)
const breakTime = computed(() => props.clockInfo?.breakTime ?? 0)
const workTime = computed(() => props.clockInfo?.workTime ?? 0)

watch(() => props.clockInfo, (newVal) => {
  console.log('clockInfo changed', newVal)
})

const emit = defineEmits(['confirm', 'cancel'])

const readonly = true
const model = reactive({
  now: '',
  startTime: '',
  endTime: '',
  breakTime: '',
  workTime: '',
})

watch(() => props.clockInfo, () => {
  model.now = props.formatTime(now.value) || '-'
  model.startTime = props.formatTime(startTime.value) || '-'
  model.endTime = props.formatTime(endTime.value) || '-'
  model.breakTime = props.formatDuration(breakTime.value)
  model.workTime = props.formatDuration(workTime.value)
}, { immediate: true , deep: true})

const fields = computed(() =>
    props.isAttended
        ? [
          { key: 'startTime', label: '출근 일시', type: 'input' },
          { key: 'endTime', label: '퇴근 일시', type: 'input' },
          { key: 'breakTime', label: '휴게시간', type: 'input' },
          { key: 'workTime', label: '근무시간', type: 'input' },
        ]
        : [
          { key: 'now', label: '현재 시각', type: 'input' },
          { key: 'endTime', label: '예상 퇴근 일시', type: 'input' },
        ]
)
</script>

<template>
  <CommonModal
      class="attendance-modal"
      :visible="visible"
      :confirm-visible="true"
      :confirm-text="'등록'"
      @confirm="$emit('confirm')"
      @cancel="$emit('cancel')"
  >
    <template #default>
      <FormSection
          :fields="fields"
          :layout="'two-column'"
      >
        <template #title>
          <h3 class="section-title">{{ isAttended ? '퇴근' : '출근' }} 등록</h3>
        </template>

        <FieldRenderer
          v-for="field in fields"
          :key="field.key"
          :field="field"
          :model="model"
          :readonly="readonly"
          >
          {{ field.key }} : {{ model[field.key] }}
        </FieldRenderer>
      </FormSection>
    </template>
  </CommonModal>
</template>

<style scoped>
.attendance-text {
  color: black;
  white-space: pre-line;
  font-size: 1rem; /* 필요한 크기 맞춰서 조절 */
  line-height: 1.5;
  padding: 0.5rem 1rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

:deep(.modal-buttons) {
  display: flex;
  gap: 12px;                   /* 버튼 사이 간격 */
  width: 100%;
  margin-top: 8px;             /* 버튼 위 여백 */
}

:deep(.modal-content) {
  /*display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  background-color: #fff;
  margin: 15% auto;

  border-radius: 12px;*/
  padding: 40px;
  width: 500px;
  /*
  text-align: center;*/
}
</style>
