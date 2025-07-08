<script setup>
import { computed, reactive, watch } from 'vue'
import CommonModal from '@/components/common/CommonModal.vue'
import AttendanceCard from '@/features/works/components/AttendanceCard.vue'
import dayjs from "dayjs";

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
  workTime: '',
})

watch(() => props.attendanceData, () => {
  const a = props.attendanceData || {}
  model.startTime = props.formatTime(a.startTime) || '--:--'
  model.endTime = props.formatTime(a.endTime) || '--:--'
  model.breakTime = a.breakTime || 0
  model.workTime = a.workTime || 0
}, { immediate: true, deep: true })

const formattedStart = computed(() =>
    model.startTime ? dayjs(model.startTime ).format('HH : mm') : '--:--'
)
const formattedEnd = computed(() =>
    model.endTime ? dayjs(model.endTime).format('HH : mm') : '--:--'
)

const formattedWork = computed(() => convertMinutesToHours(model.workTime))
const formattedBreak = computed(() => convertMinutesToHours(model.breakTime))

function convertMinutesToHours(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}


const currentDate = computed(() => {
  const raw = props.attendanceData?.startTime
  return raw
      ? dayjs(raw).format('YYYY년 M월 D일 dddd')
      : '--'
})

</script>

<template>
  <CommonModal
      class="calendar-attendance-modal"
      :visible="visible"
      :confirm-visible="isWork"
      cancel-text="닫기"
      confirm-text="출퇴근 정정"
      @cancel="$emit('close')"
      @confirm="$emit('editRequest')"
  >
    <AttendanceCard
        :current-date="currentDate"
        :startTime="formattedStart"
        :endTime="formattedEnd"
        :breakHours="formattedBreak"
        :workHours="formattedWork"
        mode="calendar"
    />
  </CommonModal>
</template>

<style scoped>
.calendar-attendance-modal {
  max-width: 400px;
}
</style>
