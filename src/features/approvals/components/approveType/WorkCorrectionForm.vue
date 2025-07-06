<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 기존 출퇴근 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">기존 출근 일시</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.beforeStartAt || '입력 없음' }}
          </div>
          <input
            v-else
            v-model="formData.beforeStartAt"
            type="datetime-local"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label required">기존 퇴근 일시</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.beforeEndAt || '입력 없음' }}
          </div>
          <input
            v-else
            v-model="formData.beforeEndAt"
            type="datetime-local"
            class="form-input"
            required
          />
        </div>
      </div>

      <!-- 수정 출퇴근 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">수정 출근 일시</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.afterStartAt || '입력 없음' }}
          </div>
          <input
            v-else
            v-model="formData.afterStartAt"
            type="datetime-local"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label required">수정 퇴근 일시</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.afterEndAt || '입력 없음' }}
          </div>
          <input
            v-else
            v-model="formData.afterEndAt"
            type="datetime-local"
            class="form-input"
            required
          />
        </div>
      </div>

      <!-- 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">출퇴근 정정 사유</label>
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

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-input,
.form-textarea {
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

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
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
</style>
