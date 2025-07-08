<script setup>
import {computed, readonly, ref, watch, watchEffect} from 'vue'

const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});

const localFormData = ref({ ...props.formData })

const emit = defineEmits(['update:formData']);

// formData 갱신 함수
function updateField(field, value) {
  localFormData.value[field] = value;
}
watch(localFormData, () => {
  emit('update:formData', { ...localFormData.value });
}, { deep: true });


// 시간 옵션
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minuteOptions = ['00', '30'];

// 날짜/시간 처리 함수
function getHour(dateTimeString) {
  return dateTimeString?.split('T')[1]?.split(':')[0] || '';
}

function getMinute(dateTimeString) {
  return dateTimeString?.split('T')[1]?.split(':')[1] || '';
}

function getDateOnly(dateTimeString) {
  return dateTimeString?.split('T')[0] || '';
}

function updateDateTime(field, date, hour, minute) {
  if (!date || hour === '' || minute === '') return;
  const newDateTime = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  updateField(field, newDateTime);
}

// 시작 시간 computed
const startDate = computed({
  get: () => getDateOnly(props.formData.startAt),
  set: val => updateDateTime('startAt', val, getHour(props.formData.startAt), getMinute(props.formData.startAt))
});
const startHour = computed({
  get: () => getHour(props.formData.startAt),
  set: val => updateDateTime('startAt', getDateOnly(localFormData.value.startAt), val, getMinute(localFormData.value.startAt))
});
const startMinute = computed({
  get: () => getMinute(props.formData.startAt),
  set: val => updateDateTime('startAt', getDateOnly(props.formData.startAt), getHour(props.formData.startAt), val)
});

// 종료 시간 computed
const endDate = computed({
  get: () => getDateOnly(props.formData.endAt),
  set: val => updateDateTime('endAt', val, getHour(props.formData.endAt), getMinute(props.formData.endAt))
});
const endHour = computed({
  get: () => getHour(props.formData.endAt),
  set: val => updateDateTime('endAt', getDateOnly(props.formData.endAt), val, getMinute(props.formData.endAt))
});
const endMinute = computed({
  get: () => getMinute(props.formData.endAt),
  set: val => updateDateTime('endAt', getDateOnly(props.formData.endAt), getHour(props.formData.endAt), val)
});

// 에러 메시지
const startError = ref('');
const endError = ref('');
const breakError = ref('');
const reasonError = ref('');

// 유효성 검사
watchEffect(() => {
  if (props.isReadOnly) return;

  const { startAt, endAt, reason, breakTime } = localFormData.value;

  startError.value = '';
  endError.value = '';
  breakError.value = '';
  reasonError.value = '';

  if (!startAt) startError.value = '시작 시간은 필수입니다.';
  if (!endAt) endError.value = '종료 시간은 필수입니다.';
  if (!reason || reason.trim() === '') reasonError.value = '초과 근무 사유는 필수입니다.';

  if (!startAt || !endAt) return;
  const start = new Date(startAt);
  const end = new Date(endAt);
  const totalMinutes = (end - start) / 1000 / 60;

  if (start >= end) {
    endError.value = '시작 시간은 종료 시간보다 빨라야 합니다.';
  } else if (totalMinutes === 240) {
    endError.value = '정확히 4시간 근무는 불가능합니다. (4시간 초과 시 30분 휴게 필수)';
  } else if (totalMinutes % 30 !== 0) {
    endError.value = '근무 시간은 30분 단위로 설정해야 합니다.';
  } else if (totalMinutes > 720) {
    endError.value = '최대 12시간(720분)까지 근무 가능합니다.';
  } else if (end.getHours() >= 6 && start.toDateString() !== end.toDateString()) {
    endError.value = '종료 시간은 다음날 오전 6시 이전이어야 합니다.';
  }

  if (breakTime % 30 !== 0) {
    breakError.value = '휴게 시간은 30분 단위로 입력해야 합니다.';
  }
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 시작 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작 날짜<span class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getDateOnly(formData.startAt) || '입력 없음' }}
          </div>
          <input v-else type="date" v-model="startDate" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label required">시작 시간<span class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.startAt) }}시 {{ getMinute(formData.startAt) }}분
          </div>
          <div v-else class="time-select">
            <select v-model="startHour" class="form-input" required>
              <option value="">시 선택</option>
              <option v-for="h in hourOptions" :key="h" :value="h">{{ h }}시</option>
            </select>
            <select v-model="startMinute" class="form-input" required>
              <option value="">분 선택</option>
              <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}분</option>
            </select>
          </div>
          <p v-if="startError" class="error-text">{{ startError }}</p>
        </div>
      </div>

      <!-- 종료 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">종료 날짜<span class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">{{ getDateOnly(formData.endAt) }}</div>
          <input v-else type="date" v-model="endDate" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label required">종료 시간<span class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.endAt) }}시 {{ getMinute(formData.endAt) }}분
          </div>
          <div v-else class="time-select">
            <select v-model="endHour" class="form-input" required>
              <option value="">시 선택</option>
              <option v-for="h in hourOptions" :key="h" :value="h">{{ h }}시</option>
            </select>
            <select v-model="endMinute" class="form-input" required>
              <option value="">분 선택</option>
              <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}분</option>
            </select>
          </div>
          <p v-if="endError && !isReadOnly " class="error-text">{{ endError }}</p>
        </div>
      </div>

      <!-- 휴게 시간 -->
      <div class="form-group full-width">
        <label class="form-label required">휴게 시간<span class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.breakTime }}</div>
        <div v-else>
          <input type="number" class="form-input" v-model="formData.breakTime" required min="0" />
          <p v-if="breakError" class="error-text">{{ breakError }}</p>
        </div>
      </div>

      <!-- 근무 유형 -->
      <div v-if="isReadOnly" class="form-group full-width">
        <label class="form-label required">초과 근무 유형</label>
        <div class="readonly-box">
          {{ (Array.isArray(formData.workTypes) ? formData.workTypes : [formData.workTypes])
          .map(type => workTypeOptions.find(o => o.value === type)?.label)
          .filter(Boolean)
          .join(', ') || '선택 안됨' }}
        </div>
      </div>

      <!-- 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">초과 근무 사유<span class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required></textarea>
        <p v-if="reasonError" class="error-text">{{ reasonError }}</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.form-section {
  margin-bottom: 40px;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
select.form-input {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.time-select {
  display: flex;
  gap: 8px;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  white-space: pre-wrap;
  min-height: 44px;
}

.error-text {
  color: var(--error);
  font-size: 0.85rem;
  margin-top: 6px;
}

.asterisk {
  color: var(--error);
  margin-left: 4px;
}
</style>
