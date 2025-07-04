<script setup>
import { computed } from 'vue';

const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
});

// 출장 유형 옵션
const typeOptions = [
  { label: '국내 출장', value: 'DOMESTIC' },
  { label: '해외 출장', value: 'INTERNATIONAL' }

];

const isInvalidDateRange = computed(() => {
  return form.value.startDate && form.value.endDate && form.value.endDate < form.value.startDate;
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 출장 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 유형</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ typeOptions.find(option => option.value === formData.type)?.label || '선택되지 않음' }}
        </div>
        <select v-else v-model="formData.type" class="form-input" required>
          <option disabled value="">선택하세요</option>
          <option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 출장 장소 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 장소</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.place || '입력 없음' }}
        </div>
        <input v-else type="text" v-model="formData.place" class="form-input" required />
      </div>

      <!-- 출장 기간 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.startDate || '입력 없음' }}
          </div>
          <input v-else type="date" v-model="formData.startDate" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label required">종료일</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.endDate || '입력 없음' }}
          </div>
          <input v-else type="date" v-model="formData.endDate" class="form-input" required />
        </div>
      </div>

      <!-- 출장 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 사유</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.reason || '입력 없음' }}
        </div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required></textarea>
      </div>

      <!-- 예상 비용 -->
      <div class="form-group full-width">
        <label class="form-label required">예상 비용 (원)</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.cost ? formData.cost.toLocaleString() + ' 원' : '입력 없음' }}
        </div>
        <input v-else type="number" min="0" v-model="form.cost" class="form-input" required />
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

.warning-text {
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  min-height: 54px;
  white-space: pre-wrap;
}
</style>