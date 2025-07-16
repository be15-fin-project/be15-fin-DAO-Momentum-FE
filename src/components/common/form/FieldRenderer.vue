<template xmlns="">
  <div class="form-group">
    <label class="form-label" :class="{ required: field.required }">
      {{ field.label }}
    </label>

    <template v-if="field.type === 'scoreChart'">
      <ScoreBarChart
          v-model="field.value"
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
        ref="likertEl"
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
        :readonly="readonly"
        :showTooltip="field.showTooltip ?? false"
    />

    <MemberPickerField
        v-else-if="field.type === 'memberPicker'"
        v-model="model[field.key]"
        :field="field"
        :readonly="readonly"
    />

    <RetentionScoreCard
        v-else-if="field.type === 'retentionCard'"
        :retentionScore="field.value.retentionScore"
        :retentionGrade="field.value.retentionGrade"
        :stabilityType="field.value.stabilityType"
        :factorGrades="field.value.factorGrades"
    />

    <FormNotice
        v-else-if="field.type === 'notice'"
        :content="field.value"
    />

    <ProgressTimeline
        v-if="field.type === 'progressTimeline'"
        v-model="model[field.key]"
        :kpiProgress="model.kpiProgress"
        :editable="!readonly && field.editable"
    />

    <!-- 읽기 전용 -->
    <div
        v-else-if="(readonly || !field.editable) && !['sliderGroup', 'likert', 'radarChart', 'progressTimeline', 'scoreChart', 'memberPicker', 'notice', 'retentionCard'].includes(field.type)"
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
        <div class="html-field" v-html="field.value"/>
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
          :ref="field.key === 'reason' ? 'reasonInput' : null"
      />
      <template v-else-if="field.type === 'checkbox-group'">
        <div v-if="field.style === 'permission'" class="permission-group">
          <div
              v-for="opt in field.options"
              :key="opt.value"
              class="permission-card"
              :class="opt.value.toLowerCase()"
          >
            <div class="card-header">
              <div class="card-icon">
                <i :class="getRoleIcon(opt.value) + ' icon'"></i>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ opt.label }}</h4>
                <p class="card-desc">{{ getRoleDescription(opt.value) }}</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input
                  type="checkbox"
                  :value="opt.value"
                  :checked="model[field.key]?.includes(opt.value)"
                  :disabled="readonly || !field.editable"
                  @change="onCheckboxChange($event, opt.value)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </template>
      <div
          v-else-if="field.type === 'select'"
          class="form-select custom-dropdown"
          :class="{ active: openDropdown === field.key }"
          @click.stop="toggleDropdown(field.key)"
          tabindex="0"
      >
        <div class="selected-option">
          {{ selectedOptionLabel(field.key) }}
          <i class="fas fa-chevron-down icon"></i>
        </div>

        <div v-if="openDropdown === field.key" class="dropdown">
          <div
              v-for="opt in field.options"
              :key="opt.value"
              :class="{ active: String(model[field.key]) === String(opt.value) }"
              @click.stop="selectOption(field.key, opt.value)"
              class="dropdown-item"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
      <DeptList
          v-else-if="field.type === 'deptList'"
          :list="field.list"
          :showNull="field.showNull ?? true"
          :nullLabel="field.nullLabel ?? '부서 없음'"
          :defaultLabel="field.defaultLabel ?? '부서 선택'"
          v-model="model[field.key]"
      />
    </template>
  </div>
</template>

<script setup>
import {computed, ref, onMounted, onBeforeUnmount} from 'vue';
import SliderGroup from "@/components/common/form/SliderGroup.vue";
import LikertScale from "@/components/common/form/LikertScale.vue";
import RadarChart from "@/components/common/form/RadarChart.vue";
import ProgressTimeline from "@/components/common/form/ProgressTimeline.vue";
import ScoreBarChart from "@/components/common/form/ScoreBarChart.vue";
import MemberPickerField from "@/components/common/form/MemberPickerField.vue";
import DeptList from "@/components/common/form/DeptList.vue";
import RetentionScoreCard from "@/components/common/form/RetentionScoreCard.vue";
import FormNotice from "@/components/common/form/FormNotice.vue";
const reasonInput = ref(null);

const props = defineProps({
  field: Object,
  model: Object,
  readonly: Boolean,
  setFieldRef: Function
});

const emit = defineEmits(['update:model', 'file-change']);

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

const onFileChange = (e) => {
  const file = e.target.files[0];
  console.log('FieldRenderer: selected file:', file);
  if (!file) return;
  emit('file-change', { fieldKey: props.field.key, file });
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

function getRoleIcon(role) {
  switch (role) {
    case 'MASTER':
      return 'fas fa-crown';
    case 'HR_MANAGER':
      return 'fas fa-users';
    case 'BOOKKEEPING':
      return 'fas fa-calculator';
    case 'MANAGER':
      return 'fas fa-user-tie';
    default:
      return 'fas fa-user';
  }
}

function getRoleDescription(role) {
  const map = {
    MASTER: '시스템 전체 권한 관리',
    HR_MANAGER: '인사 정보 열람 및 관리',
    BOOKKEEPING: '재무 출력 등록 및 조회',
    MANAGER: '팀 관리 및 승인 권한',
  };
  return map[role] ?? '';
}

function onCheckboxChange(e, value) {
  const arr = Array.isArray(model[field.key]) ? model[field.key] : [];

  if (e.target.checked) {
    if (!arr.includes(value)) arr.push(value);
  } else {
    const index = arr.indexOf(value);
    if (index > -1) arr.splice(index, 1);
  }

  model[field.key] = [...arr]; // 새 배열 대입하여 반응성 보장
  emit('update:model', { ...model });
}
const likertEl = ref(null);

onMounted(() => {
  if (props.field.type === 'likert' && props.setFieldRef) {
    props.setFieldRef(props.field.key, likertEl.value);
  }

  if (props.field.key === 'reason' && props.setFieldRef) {
    props.setFieldRef('reasonInput', reasonInput.value);
  }
});

const openDropdown = ref(null);

function toggleDropdown(key) {
  openDropdown.value = openDropdown.value === key ? null : key;
}

function selectOption(key, value) {
  props.model[key] = value;
  openDropdown.value = null;
}

function selectedOptionLabel(key) {
  const value = props.model[key];
  const option = props.field.options?.find(opt => String(opt.value) === String(value));
  return option?.label || '선택';
}

// 외부 클릭 시 닫기
function handleClickOutside(e) {
  if (!e.target.closest('.custom-dropdown')) {
    openDropdown.value = null;
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
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

.tree-trigger {
  /* form-select 스타일을 그대로 물려받고… */
  width: 100%; /* 칸 전체 너비 채우기 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
}

.tree-dropdown {
  width: 100%;
}

/* 체크박스 그룹 스타일 */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.permission-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* 카드 간 간격 */
}

.permission-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--color-muted);
  border-radius: 8px;
  background-color: #fff;

  width: calc(50% - 6px); /* 2열 배치, 좌우 간격 고려 */
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 20px;
  color: var(--purple-500);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--purple-500);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.custom-dropdown {
  position: relative;
  cursor: pointer;
  padding: 14px 16px;
  border: 2px solid var(--color-muted);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--color-text-main);
}

.custom-dropdown:focus,
.custom-dropdown:focus-within {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.selected-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 1000;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-muted);
  border-radius: var(--radius-sm);
  box-shadow: var(--dropdown-shadow);
  max-height: 240px;
  overflow-y: auto;
}

.dropdown::-webkit-scrollbar {
  width: 4px;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 0.95rem;
  cursor: pointer;
  color: var(--color-text-sub);
}

.dropdown-item.active {
  background-color: var(--blue-100);
  color: var(--gray-900);
  font-weight: 600;
}

.dropdown-item:hover {
  background-color: var(--gray-100);
}

.custom-dropdown.active {
  position: relative;
  z-index: 9999;
}
</style>
