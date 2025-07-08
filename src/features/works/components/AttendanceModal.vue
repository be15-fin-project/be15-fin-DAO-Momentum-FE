<script setup>
import { computed } from 'vue'
import CommonModal from '@/components/common/CommonModal.vue'
import AttendanceCard from '@/features/works/components/AttendanceCard.vue'

import dayjs from 'dayjs'
import 'dayjs/locale/ko'
dayjs.locale('ko')

const props = defineProps({
  visible: Boolean,
  isAttended: Boolean,
  clockInfo: Object,
  formatTime: Function,
  formatDuration: Function,
  mode: {
    type: String,
    default: 'start',
    validator: (val) => ['start', 'end'].includes(val),
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const now = computed(() => props.clockInfo?.now ?? null)
const startTime = computed(() => props.clockInfo?.startTime ?? null)
const endTime = computed(() => props.clockInfo?.endTime ?? null)
const breakTime = computed(() => props.clockInfo?.breakTime ?? 0)
const workTime = computed(() => props.clockInfo?.workTime ?? 0)

const confirmButtonText = computed(() =>
    props.mode === 'start' ? '출근 등록' : '퇴근 등록'
)

function convertMinutesToHours(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

const formattedNow = computed(() =>
    now.value ? dayjs(now.value).format('A h시 mm분') : '--:--'
)
const formattedStart = computed(() =>
    startTime.value ? dayjs(startTime.value).format('HH : mm') : '--:--'
)
const formattedEnd = computed(() =>
    endTime.value ? dayjs(endTime.value).format('HH : mm') : '--:--'
)
const formattedWork = computed(() => convertMinutesToHours(workTime.value))
const formattedBreak = computed(() => convertMinutesToHours(breakTime.value))
</script>

<template>
  <CommonModal
      class="attendance-modal"
      :visible="visible"
      :confirm-visible="true"
      :confirm-text="confirmButtonText"
      @confirm="$emit('confirm')"
      @cancel="$emit('cancel')"
  >
    <template #default>
      <AttendanceCard
          :currentTime="formattedNow"
          :current-date="new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })"
          :startTime="formattedStart"
          :endTime="formattedEnd"
          :workHours="formattedWork"
          :breakHours="formattedBreak"
          :mode="mode"
          @ready="$emit('confirm')"
          @register="$emit('confirm')"
          @cancel="$emit('cancel')"
      />
    </template>
  </CommonModal>
</template>

<style scoped>
.attendance-modal {
  max-width: 400px;
}
</style>
