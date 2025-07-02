<template>
  <div class="likert-scale">
    <label v-if="label" :class="['likert-label', labelClass]">{{ label }}</label>

    <div class="dot-button-group">
      <button
          v-for="n in range"
          :key="n"
          class="dot-button"
          :class="{ selected: selectedValue === n }"
          :disabled="readonly"
          @click="select(n)"
      ></button>
    </div>

    <div class="dot-number-labels">
      <span v-for="n in range" :key="n">{{ n }}</span>
    </div>

    <div class="end-labels">
      <span class="label-left">{{ labels[0] }}</span>
      <span class="label-right">{{ labels[1] }}</span>
    </div>
  </div>
</template>

<script setup>
import {computed, watchEffect} from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 4
  },
  label: {
    type: String,
    default: ''
  },
  labelClass: {
    type: [String, Array, Object],
    default: ''
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 7
  },
  labels: {
    type: Array,
    default: () => ['매우 불만족', '매우 만족']
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

function select(num) {
  if (!props.readonly) {
    emit('update:modelValue', num);
  }
}

const selectedValue = computed(() => props.modelValue ?? 4);

const range = Array.from({ length: props.max - props.min + 1 }, (_, i) => i + props.min);


watchEffect(() => {
  if (props.modelValue == null && !props.readonly) {
    emit('update:modelValue', 4); // 혹은 props.defaultValue 같은 걸 따로 둘 수도 있음
  }
});
</script>

<style scoped>
.likert-scale {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 1rem 0;
  padding-bottom: 3rem;
}

.likert-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-sub);
}

.dot-button-group {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
}

.dot-button-group::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: var(--color-muted);
  z-index: 0;
}

.dot-button {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-muted);
  color: var(--basic);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.dot-button:hover:not(:disabled) {
  transform: scale(1.2);
}

.dot-button.selected {
  background: var(--blue-300);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  transform: scale(1.3);
}

.dot-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dot-number-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  font-size: 0.75rem;
  color: var(--color-text-sub);
}

.end-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-sub);
  padding: 0 1rem;
}
</style>
