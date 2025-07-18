<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import dayjs from 'dayjs';

/* 부모에게 받아온 부분 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});

/* 에러 메세지 */
const errors = ref({
  startDate: '',
  endDate: '',
  time: '',
  reason: ''
});

// 연장 근무 옵션
const workTypeOptions = [
  { value: 'OVERTIME', label: '연장 근무' },
  { value: 'NIGHT', label: '야간 근무' },
  { value: 'HOLIDAY', label: '휴일 근무' }
];

defineExpose({
  validateForm
});

// 시작 관련 로컬 state
const startDate = computed({
  get: () => getDateOnly(props.formData.startAt),
  set: (val) => updateDateTime('startAt', val, startHour.value, startMinute.value)
});

const startHour = computed({
  get: () => getHour(props.formData.startAt) || '00',
  set: (val) => updateDateTime('startAt', startDate.value, val, startMinute.value)
});

const startMinute = computed({
  get: () => getMinute(props.formData.startAt) || '00',
  set: (val) => updateDateTime('startAt', startDate.value, startHour.value, val)
});

// 추가
const startTime = computed({
  get: () => getTimeOnly(props.formData.startAt),
  set: (val) => {
    if (!startDate.value || !val) return;
    props.formData.startAt = `${startDate.value}T${val}:00`;
  }
});

// 종료 관련 로컬 state
const endDate = computed({
  get: () => getDateOnly(props.formData.endAt),
  set: (val) => updateDateTime('endAt', val, endHour.value, endMinute.value)
});

const endHour = computed({
  get: () => getHour(props.formData.endAt)|| '00',
  set: (val) => updateDateTime('endAt', endDate.value, val, endMinute.value)
});

const endMinute = computed({
  get: () => getMinute(props.formData.endAt)|| '00',
  set: (val) => updateDateTime('endAt', endDate.value, endHour.value, val)
});

const endTime = computed({
  get: () => getTimeOnly(props.formData.endAt),
  set: (val) => {
    if (!endDate.value || !val) return;
    props.formData.endAt = `${endDate.value}T${val}:00`;
  }
});

// 기존 getHour, getMinute 통합 유틸
function getTimeOnly(dateTimeString) {
  return dateTimeString?.split('T')[1]?.slice(0, 5) || '';
}

// watch로 조합
watch([startDate, startHour, startMinute], ([date, hour, minute]) => {
  updateDateTime('startAt', date, hour, minute);
});

watch([endDate, endHour, endMinute], ([date, hour, minute]) => {
  updateDateTime('endAt', date, hour, minute);
});

// 시간 바뀔 때도 조합해서 반영
watch([startHour, startMinute], ([h, m]) => {
  updateDateTime('startAt', startDate.value, h, m);
});

// 유틸 함수들
function getHour(dateTimeString) {
  return dateTimeString?.split('T')[1]?.split(':')[0] ?? '';
}

function getMinute(dateTimeString) {
  const minute = dateTimeString?.split('T')[1]?.split(':')[1];
  return minute === undefined ? '' : minute;
}

function getDateOnly(dateTimeString) {
  return dateTimeString?.split('T')[0] || '';
}

function updateDateTime(field, date, hour, minute) {
  if (!date || hour === '' || minute === '') {
    return;
  }
  props.formData[field] = `${date}T${hour}:${minute}:00`;
}

/* 시간과 관련된 validation */
function validateForm() {
  errors.value = {
    startDate: '',
    endDate: '',
    time: '',
    reason: ''
  };

  const start = props.formData.startAt ? dayjs(props.formData.startAt) : null;
  const end = props.formData.endAt ? dayjs(props.formData.endAt) : null;
  const reason = props.formData.reason?.trim();

  if (!start || !end) {
    if (!start) errors.value.startDate = '※ 시작 날짜 및 시간이 필요합니다.';
    if (!end) errors.value.endDate = '※ 종료 날짜 및 시간이 필요합니다.';
    return false;
  }

  const totalMinutes = end.diff(start, 'minute');

  if (totalMinutes <= 0) {
    errors.value.time = '※  종료 시간은 시작 시간 이후여야 합니다.';
    return false;
  }

  // 다음날 오전 6시 이후 불가
  if (!end.isSame(start, 'day') && end.hour() >= 6) {
    errors.value.time = '※ 종료 시간은 다음날 오전 6시 이전이어야 합니다.';
    return false;
  }

  let breakMinutes = 0;

  if (totalMinutes < 240) {
    // 4시간 미만: 휴게 시간 없음, 허용됨
    breakMinutes = 0;
  } else if (totalMinutes >= 240 && totalMinutes < 270) {
    // 4시간 ~ 4시간 29분: 실근무가 4시간 이상인데 휴게 시간 부여 기준 안 됨 → 불가
    errors.value.time = '※ 4시간 30분 이상 근무 부터 30분 휴게시간으로 초과근무가 인정됩니다.';
    return false;
  } else if (totalMinutes >= 270 && totalMinutes < 480) {
    // 4시간 30분 ~ 8시간 미만
    breakMinutes = 30;
  } else if (totalMinutes >= 480 && totalMinutes < 540) {
    // 8시간 ~ 9시간 미만
    errors.value.time = '※ 9시간 이상 근무 부터 1시간 휴게시간으로 초과근무가 인정됩니다.';
    return false;
  } else if (totalMinutes >= 540 && totalMinutes <= 720) {
    // 9시간 ~ 12시간
    breakMinutes = 60;
  } else {
    errors.value.time = '※ 잔류 시간은 최대 12시간까지 허용됩니다.';
    return false;
  }

  props.formData.breakTime = breakMinutes;

  if (!reason) {
    errors.value.reason = '※ 초과근무 사유는 필수 항목입니다.';
    return false;
  }

  return true;
}

watch(
  [
    () => props.formData.startAt,
    () => props.formData.endAt,
    () => props.formData.reason
  ], () => {
  validateForm();}
  , { immediate: true }
);

onMounted(validateForm);
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 시작 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작 날짜<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getDateOnly(formData.startAt) || '입력 없음' }}
          </div>
          <input v-else v-model="startDate" type="date" class="form-input" />
          <p v-if="errors.startDate" class="form-error">{{ errors.startDate }}</p>
        </div>
        <!-- 시작 시간 -->
        <div class="form-group">
          <label class="form-label required">시작 시간<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.startAt) }}시 {{ getMinute(formData.startAt) }}분
          </div>
          <div v-else class="time-select">
            <input
              class="form-input"
              type="time"
              v-model="startTime"
              required
            />
          </div>
        </div>
      </div>

      <!-- 종료 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">종료 날짜<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getDateOnly(formData.endAt) || '입력 없음' }}
          </div>
          <input v-else v-model="endDate" type="date" class="form-input" />
          <p v-if="errors.endDate" class="form-error">{{ errors.endDate }}</p>
        </div>

        <!-- 종료 시간 -->
        <div class="form-group">
          <label class="form-label required">종료 시간<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.endAt) }}시 {{ getMinute(formData.endAt) }}분
          </div>
          <div v-else class="time-select">
            <input
              class="form-input"
              type="time"
              v-model="endTime"
              required
            />
          </div>
          <p v-if="errors.time" class="form-error">{{ errors.time }}</p>
        </div>
      </div>

      <!-- 휴게 시간 -->
      <div class="form-group full-width">
        <label class="form-label required">휴게 시간<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.breakTime ?? '입력 없음' }}</div>
        <input
          v-else
          type="number"
          class="form-input"
          v-model.number="formData.breakTime"
          min="0"
          max="90"
          step="30"
        />
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
        <label class="form-label required">초과 근무 사유<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else class="form-textarea" v-model="formData.reason" />
        <p v-if="errors.reason" class="form-error">{{ errors.reason }}</p>
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

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
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

.form-error {
  color: var(--error);
  font-size: 0.85rem;
  margin-top: 4px;
}

.asterisk {
  color: var(--error);
  margin-left: 4px;
}
</style>
