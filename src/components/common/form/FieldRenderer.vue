<template xmlns="">
  <div class="form-group">
    <label class="form-label" :class="{ required: field.required }">
      {{ field.label }}
    </label>

    <template v-if="field.type === 'scoreChart'">
      <ScoreBarChart
          :scores="field.value"
          :editable="!readonly && field.editable"
      />
    </template>

    <SliderGroup
        v-else-if="field.type === 'sliderGroup'"
        v-model="model[field.key]"
        :handles="field.handles"
        :initial="model[field.key] ?? field.initial"
        :labels="field.labels"
        :icons="field.icons"
        :readonly="readonly"
        :editable="!readonly && field.editable"
        :disabled="readonly || !field.editable"
    />

    <LikertScale
        v-else-if="field.type === 'likert'"
        v-model="field.value"
        labelClass="text-lg text-blue-600 mb-2"
        :min="field.min ?? 1"
        :max="field.max ?? 7"
        :labels="field.labels ?? ['매우 불만족','매우 만족']"
        :readonly="readonly || !field.editable"
    />

    <RadarChart
        v-if="field.type === 'radarChart'"
        :labels="field.value.labels"
        :values="field.value.scores"
        :editable="isEditMode"
    />

    <MemberPickerField
        v-else-if="field.type === 'memberPicker'"
        v-model="model[field.key]"
        :field="field"
        :readonly="readonly"
    />

    <ProgressTimeline
        v-if="field.type === 'progressTimeline'"
        v-model="model[field.key]"
        :kpiProgress="model.kpiProgress"
        :editable="!readonly && field.editable"
    />

    <!-- 읽기 전용 -->
    <div
        v-else-if="(readonly || !field.editable) && !['sliderGroup', 'likert', 'radarChart', 'progressTimeline', 'scoreChart', 'memberPicker'].includes(field.type)"
        class="form-input readonly"
        v-html="field.type === 'html' ? field.value : (field.value ?? model[field.key] ?? '')"
    />



    <!-- 입력 가능 -->
    <template v-else>
      <input
          v-if="field.type === 'input'"
          type="text"
          class="form-input"
          v-model="model[field.key]"
          :placeholder="field.placeholder || field.label"
      />
      <template v-if="field.type === 'html'">
        <div class="html-field" v-html="field.value" />
      </template>
      <input
          v-else-if="field.type === 'number'"
          type="number"
          class="form-input"
          v-model="model[field.key]"
          :placeholder="field.placeholder || field.label"
          @input="onPositiveIntegerInput(field.key)"
          inputmode="numeric"
          min="0"
      />
      <input
          v-else-if="field.type === 'date'"
          type="date"
          class="form-input"
          v-model="model[field.key]"
      />
      <!-- file -->
      <div v-else-if="field.type === 'file'" class="form-input file-upload">
        <label for="file-input" class="file-label">
          <input
              id="file-input"
              type="file"
              @change="onFileChange"
          />
        </label>
      </div>
      <textarea
          v-else-if="field.type === 'textarea'"
          class="form-textarea"
          v-model="model[field.key]"
          :placeholder="field.placeholder || field.label"
      />
      <select
          v-else-if="field.type === 'select'"
          class="form-select"
          v-model="model[field.key]"
          :value="field.value"
      >
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </template>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import SliderGroup from "@/components/common/form/SliderGroup.vue";
import LikertScale from "@/components/common/form/LikertScale.vue";
import RadarChart from "@/components/common/form/RadarChart.vue";
import ProgressTimeline from "@/components/common/form/ProgressTimeline.vue";
import ScoreBarChart from "@/components/common/form/ScoreBarChart.vue";
import MemberPickerField from "@/components/common/form/MemberPickerField.vue";

const props = defineProps({
  field: Object,
  model: Object,
  readonly: Boolean
});

const emit = defineEmits(['file-change']);

const { model, field } = props;

// null, undefined, 빈 문자열일 때 대체 표시값
const displayValue = computed(() => {
  const raw = props.model?.[props.field.key];
  return raw !== null && raw !== undefined && raw !== '' ? raw : '-';
});
const onPositiveIntegerInput = (key) => {
  const value = model[key];

  // 숫자 아닌 것 제거 + 0 이상 정수만 유지
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, ''); // 숫자만 남김
    model[key] = cleaned;
  }

  // 혹시 string -> number 변환 필요 시
  // model[key] = cleaned !== '' ? parseInt(cleaned, 10) : '';
};

const fileState = ref({});

const onFileChange = (e) => {
  const file = e.target.files[0];
  console.log('FieldRenderer: selected file:', file);
  if (!file) return;
  emit('file-change', { fieldKey: field.key, file });
};


const scoreWidth = computed(() => {
  const raw = props.field.value ?? props.model?.[props.field.key];
  const num = parseInt(raw);
  return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
});

function getValueByPath(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((o, k) => o[k] ??= {}, obj);
  target[lastKey] = value;
}

</script>

<style scoped>
.readonly {
  background: var(--color-background);
  border: 1px solid var(--color-muted);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-sub);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.form-label.required::after {
  content: '*';
  color: var(--error-500);
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid var(--color-muted);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: var(--color-surface);
  color: var(--color-text-main);
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--gray-400);
  font-style: italic;
}
.score-bar-wrapper {
  background: var(--color-muted-light);
  border-radius: var(--radius-ss);
  height: 36px;
  position: relative;
  overflow: hidden;
}

.score-bar {
  background: var(--icon-gradient);
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 12px;
  color: var(--color-surface);
  font-weight: 600;
  transition: width 0.3s ease;
  border-radius: var(--radius-ss);
}

.score-value {
  position: relative;
  z-index: 2;
}
.html-field {
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 14px;
}

</style>
