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

const emit = defineEmits(['update:modelValue']);

const internalModel = ref({ ...props.modelValue });

watch(() => props.modelValue, (newVal) => {
  internalModel.value = { ...newVal };
});

const update = (key, value) => {
  internalModel.value[key] = value;
  emit('update:modelValue', { ...internalModel.value });
};

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
  emit('update:modelValue', { ...internalModel.value });
});

</script>

<template>
  <section class="progress-timeline">
    <div class="timeline">
      <div
          v-for="step in steps"
          :key="step.percent"
          class="step"
          :class="step.status"
      >
        <div class="circle">{{ step.percent }}%</div>
        <div class="content-box">
          <div class="step-title">
            <template v-if="editable">
              <input
                  v-model="modelValue[`progress${step.percent}`]"
                  class="editable-input"
              />
            </template>
            <template v-else>
              {{ step.label }}
            </template>
          </div>
          <div
              class="badge"
              :class="badgeClass(step.status)"
              v-html="statusHtml(step.status)"
          />
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
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--gray-300);
}

.step {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.circle {
  position: absolute;
  left: 0;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background-color: var(--gray-500);
  color: var(--color-surface);
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step.completed .circle {
  background-color: var(--green-250);
}
.step.in-progress .circle {
  background-color: var(--purple-100);
}
.step.pending .circle {
  background-color: var(--gray-400);
}

.content-box {
  background: var(--color-surface);
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  flex-grow: 1;
  margin-left: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-900);
}

.badge {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-max);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.badge.done {
  background: var(--color-muted-light);
  color: var(--green-300);
}
.badge.doing {
  background: var(--color-muted-light);
  color: var(--purple-500);
}
.badge.waiting {
  background: var(--color-muted-light);
  color: var(--gray-500);
}

.editable-input {
  font-size: 16px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius-ss);
  border: 1px solid var(--color-surface);
  width: 100%;
}
.editable-input:focus {
  outline: none;
  border-bottom: 1px solid var(--gray-500)
}
</style>
