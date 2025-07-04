<script setup>
import { computed } from 'vue';

const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});

const isInvalidDateRange = computed(() => {
  return (
    props.formData.startDate &&
    props.formData.endDate &&
    props.formData.endDate < props.formData.startDate
  );
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 재택 근무 기간 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.startDate || '입력 없음' }}
          </div>
          <input
            v-else
            type="date"
            v-model="formData.startDate"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label required">종료일</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.endDate || '입력 없음' }}
          </div>
          <input
            v-else
            type="date"
            v-model="formData.endDate"
            class="form-input"
            required
          />
        </div>
      </div>

      <!-- 날짜 유효성 메시지 -->
      <p v-if="isInvalidDateRange && !isReadOnly" class="warning-text">
        ※ 종료일은 시작일보다 빠를 수 없습니다.
      </p>

      <!-- 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">재택 사유</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.reason || '입력 없음' }}
        </div>
        <textarea
          v-else
          v-model="formData.reason"
          class="form-textarea"
          required
        ></textarea>
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
.form-textarea {
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
.form-textarea:focus {
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
  white-space: pre-wrap;
  min-height: 44px;
}
</style>
