<script setup>
import {computed, watch, ref, onMounted} from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      progress25: '',
      progress50: '',
      progress75: '',
      progress100: ''
    })
  },
  kpiProgress: {
    type: Number,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const internalModel = ref({...props.modelValue})

watch(() => props.modelValue, (newVal) => {
  internalModel.value = {...newVal}
})

const update = (key, value) => {
  internalModel.value[key] = value
  emit('update:modelValue', {...internalModel.value})
}

const steps = computed(() => {
  const progress = props.kpiProgress ?? 0

  const getStatus = (threshold) => {
    if (progress >= threshold) return 'completed'
    if (progress >= threshold - 25) return 'in-progress'
    return 'pending'
  }

  return [25, 50, 75, 100].map((percent) => ({
    percent,
    label: internalModel.value[`progress${percent}`] ?? '',
    status: getStatus(percent)
  }))
})

const badgeClass = (status) => ({
  completed: 'done',
  'in-progress': 'doing',
  pending: 'waiting'
}[status])

const statusHtml = (status) => ({
  completed: '<i class="fas fa-check-circle"></i> 완료',
  'in-progress': '<i class="fas fa-spinner fa-spin"></i> 진행중',
  pending: '<i class="fas fa-hourglass-half"></i> 대기'
}[status])

onMounted(() => {
  emit('update:modelValue', {...internalModel.value})
})
</script>

<template>
  <section class="progress-timeline">
    <div class="timeline">
      <div
          class="step"
          v-for="step in steps"
          :key="step.percent"
          :class="step.status"
      >
        <div class="dot"></div>

        <!-- 퍼센트 뱃지 + 컨텐츠를 세로로 묶기 -->
        <div class="right-content">
          <div class="percent-badge" :class="step.status">
            {{ step.percent }}%
          </div>

          <div class="content">
            <div class="top-row">
              <div class="title">
                <template v-if="editable">
                  <input
                      class="editable-input"
                      :value="internalModel[`progress${step.percent}`]"
                      @input="update(`progress${step.percent}`, $event.target.value)"
                  />
                </template>
                <template v-else>
                  {{ step.label }}
                </template>
              </div>
              <div class="badge" :class="badgeClass(step.status)" v-html="statusHtml(step.status)"/>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.progress-timeline {
  margin-top: 24px;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  row-gap: 2.5rem;
}

.step {
  display: grid;
  grid-template-columns: 40px auto 1fr;
  align-items: center;
  column-gap: 0.5rem;
  position: relative;
}

.step {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: flex-start;
  column-gap: 0.5rem;
  position: relative;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 25px;
  left: 19px;
  width: 2px;
  height: calc(100% + 2.5rem - 15px);
  background-color: #e5e7eb;
  z-index: 0;
}

/* 상태별 dot */
.step.completed .dot {
  background: var(--green-250);
  box-shadow: 0 0 0 5px var(--label-approved);
}

.step.in-progress .dot {
  background: var(--purple-50);
  box-shadow: 0 0 0 5px var(--purple-10); /* 연보라 테두리 */
}

.step.pending .dot {
  background: var(--gray-300);
  box-shadow: 0 0 0 5px var(--gray-100); /* 연회색 테두리 */
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--color-muted-light);
  margin: 3px auto 0 auto;
  z-index: 1;
}

/* 상태별 퍼센트 뱃지 */
.percent-badge {
  display: inline-block;
  width: fit-content;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background-color: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.percent-badge.completed {
  background-color: #dcfce7;
  border-color: #bbf7d0;
  color: #15803d;
}

.percent-badge.in-progress {
  background-color: #ede9fe;
  border-color: #c4b5fd;
  color: #6b21a8;
}

.percent-badge.pending {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}

.content {
  background: var(--color-surface);
  padding: 1rem 1.5rem;
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.badge {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge.done {
  background: var(--success-50);
  color: var(--green-250);
}

.badge.doing {
  background: var(--purple-10);
  color: var(--purple-800);
}

.badge.waiting {
  background: var(--color-muted-light);
  color: var(--gray-500);
}

.editable-input {
  font-size: 1rem;
  font-weight: 500;
  width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-ss);
}

.editable-input:focus {
  outline: none;
  border-color: var(--purple-100);
}
</style>
