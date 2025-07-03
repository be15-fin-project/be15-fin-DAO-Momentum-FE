<script setup>
import {computed, defineEmits, defineProps, watch} from 'vue'
import CommonModal from '@/components/common/CommonModal.vue'

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
      <div v-if="!isAttended" class="attendance-text">
        <h3>출근을 등록합니다.</h3>
        현재 시각: {{ formatTime(now) }}
      </div>

      <div v-else class="attendance-text">
        <h3>퇴근을 등록합니다.</h3>
        <p>
          출근 일시: {{ formatTime(startTime) || '-' }} <br/>
          퇴근 일시: {{ formatTime(endTime) || '-' }} <br/>
          휴게시간: {{ formatDuration(breakTime) }} <br/>
          근무시간: {{ formatDuration(workTime) }}
        </p>
      </div>
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

:deep(.modal-buttons) {
  display: flex;
  gap: 12px;                   /* 버튼 사이 간격 */
  width: 100%;
  margin-top: 8px;             /* 버튼 위 여백 */
}
</style>
