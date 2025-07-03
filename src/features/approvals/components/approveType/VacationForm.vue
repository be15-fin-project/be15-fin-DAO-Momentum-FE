<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false },
  approveFileDTO: { type: Array, default: () => [] }
});

const vacationTypeOptions = [
  { label: '기타 유급휴가', value: 'PAID_ETC' },
  { label: '기타 무급휴가', value: 'UNPAID_ETC' },
  { label: '연차', value: 'DAYOFF' },
  { label: '오전 반차', value: 'AM_HALF_DAYOFF' },
  { label: '오후 반차', value: 'PM_HALF_DAYOFF' },
  { label: '리프레시 휴가', value: 'REFRESH' },
  { label: '군 소집 훈련', value: 'MILITARY_TRAINING' },
  { label: '경조사', value: 'LIFE_EVENT' }
];

const isHalfDay = computed(() =>
  props.formData.vacationType === 'AM_HALF_DAYOFF' ||
  props.formData.vacationType === 'PM_HALF_DAYOFF'
);

const halfDayTimeRange = computed(() => {
  if (props.formData.vacationType === 'AM_HALF_DAYOFF') return '09:00 ~ 13:00';
  if (props.formData.vacationType === 'PM_HALF_DAYOFF') return '14:00 ~ 18:00';
  return '';
});

const isInvalidDateRange = computed(() => {
  return !isHalfDay.value &&
    props.formData.startDate &&
    props.formData.endDate &&
    props.formData.endDate < props.formData.startDate;
});

watch(() => props.formData.vacationType, (newType) => {
  if (newType === 'AM_HALF_DAYOFF' || newType === 'PM_HALF_DAYOFF') {
    props.formData.endDate = props.formData.startDate;
  }
});

watch(() => props.formData.startDate, (newDate) => {
  if (isHalfDay.value) {
    props.formData.endDate = newDate;
  }
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 휴가 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 유형</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ vacationTypeOptions.find(o => o.value === formData.vacationType)?.label || '선택되지 않음' }}
        </div>
        <select v-else v-model="formData.vacationType" class="form-input" required>
          <option disabled value="">선택하세요</option>
          <option v-for="option in vacationTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 휴가 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.startDate || '입력 없음' }}</div>
          <input v-else type="date" v-model="formData.startDate" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label required">종료일</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.endDate || '입력 없음' }}</div>
          <input
            v-else
            type="date"
            v-model="formData.endDate"
            class="form-input"
            :readonly="isHalfDay"
            :disabled="isHalfDay"
            required
          />
        </div>
      </div>

      <!-- 반차 시간대 -->
      <p v-if="isHalfDay && !isReadOnly" class="info-text">
        ※ 반차 시간대: {{ halfDayTimeRange }}
      </p>

      <!-- 날짜 오류 -->
      <p v-if="isInvalidDateRange && !isReadOnly" class="warning-text">
        ※ 종료일은 시작일보다 빠를 수 없습니다.
      </p>

      <!-- 휴가 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 사유</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required />
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
  color: #374151;
  margin-bottom: 8px;
}
.form-input,
.form-textarea,
select.form-input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #1f2937;
  font-family: inherit;
}
.form-textarea {
  resize: vertical;
  min-height: 100px;
}
.form-input:focus,
.form-textarea:focus,
select.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}
.readonly-box {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  white-space: pre-wrap;
  min-height: 44px;
}
.warning-text {
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}
.info-text {
  color: #2563eb;
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}
</style>
