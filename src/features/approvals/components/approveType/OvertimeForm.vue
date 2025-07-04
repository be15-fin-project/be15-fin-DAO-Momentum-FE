<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});

const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

const workTypeOptions = [
  { label: '초과 근무', value: 'OVERTIME' },
  { label: '야간 근무', value: 'NIGHT' },
  { label: '휴일 근무', value: 'HOLIDAY' }
];

function getHour(dateTimeString) {
  if (!dateTimeString) return '--';
  return dateTimeString.split('T')[1]?.split(':')[0] || '--';
}

function getMinute(dateTimeString) {
  if (!dateTimeString) return '--';
  return dateTimeString.split('T')[1]?.split(':')[1] || '--';
}

function getDateOnly(dateTimeString) {
  if (!dateTimeString) return '';
  return dateTimeString.split('T')[0];
}
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 시작 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작 날짜</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getDateOnly(formData.startAt) || '입력 없음' }}
          </div>
<!--          <input v-else type="date" v-model="formData.startAt" class="form-input" required />-->
        </div>

        <div class="form-group">
          <label class="form-label required">시작 시간</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.startAt)  }}시 {{ getMinute(formData.startAt)  }}분
          </div>
<!--          <div v-else class="time-select">-->
<!--            <select v-model="formData.startAt" class="form-input" required>-->
<!--              <option value="">시 선택</option>-->
<!--              <option v-for="h in hourOptions" :key="h" :value="h">{{ h }}시</option>-->
<!--            </select>-->
<!--            <select v-model="formData.startAt" class="form-input" required>-->
<!--              <option value="">분 선택</option>-->
<!--              <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}분</option>-->
<!--            </select>-->
<!--          </div>-->
        </div>
      </div>

      <!-- 종료 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">종료 날짜</label>
          <div v-if="isReadOnly" class="readonly-box">{{ getDateOnly(formData.endAt) }}</div>
<!--          <input v-else type="date" v-model="formData.endAt" class="form-input" required />-->
        </div>

        <div class="form-group">
          <label class="form-label required">종료 시간</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ getHour(formData.endAt) }}시 {{ getMinute(formData.endAt) }}분
          </div>
<!--          <div v-else class="time-select">-->
<!--            <select v-model="formData.endHour" class="form-input" required>-->
<!--              <option value="">시 선택</option>-->
<!--              <option v-for="h in hourOptions" :key="h" :value="h">{{ h }}시</option>-->
<!--            </select>-->
<!--            <select v-model="formData.endMinute" class="form-input" required>-->
<!--              <option value="">분 선택</option>-->
<!--              <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}분</option>-->
<!--            </select>-->
<!--          </div>-->
        </div>
      </div>

      <!-- 휴게 시간 -->
      <div class="form-group full-width">
        <label class="form-label required">휴게 시간</label>
        <div class="readonly-box">
          {{ formData.breakTime }}
        </div>
      </div>

      <!-- 근무 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">초과 근무 유형</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ (Array.isArray(formData.workTypes) ? formData.workTypes : [formData.workTypes])
          .map(type => workTypeOptions.find(o => o.value === type)?.label)
          .filter(Boolean)
          .join(', ') || '선택 안됨' }}
        </div>
        <select v-else v-model="formData.workTypes" class="form-input" required>
          <option disabled value="">선택하세요</option>
          <option v-for="option in workTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">초과 근무 사유</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required></textarea>
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

.time-select {
  display: flex;
  gap: 8px;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f9fafb;
  font-size: 0.95rem;
  color: #1f2937;
  white-space: pre-wrap;
  min-height: 44px;
}
</style>
