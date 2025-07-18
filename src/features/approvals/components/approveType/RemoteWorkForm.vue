<script setup>
import {computed, onMounted, ref, watch} from 'vue';

const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false }
});

/* 유효성 검사 메세지 */
const errors = ref({
  startDate: '',
  endDate: '',
});

/* 유효성 검사 함수 */
function validateForm() {
  errors.value = {
    startDate: '',
    endDate: '',
  };

  if (!props.formData.startDate) {
    errors.value.startDate = '※ 시작일은 필수입니다.';
  }

  if (!props.formData.endDate) {
    errors.value.endDate = '※ 종료일은 필수입니다.';
  }

  if (
    props.formData.startDate &&
    props.formData.endDate &&
    props.formData.endDate < props.formData.startDate
  ) {
    errors.value.endDate = '종료일은 시작일보다 빠를 수 없습니다.';
  }

  return Object.values(errors.value).every((e) => !e);
}

watch(
  () => [props.formData.startDate, props.formData.endDate, props.formData.reason],
  () => {
    validateForm();
  },
  { immediate: true }
);

onMounted(validateForm);

defineExpose({
  validateForm
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 재택 근무 기간 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일<span v-if="!isReadOnly" class="asterisk"> *</span></label>
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
          <p v-if="errors.startDate" class="warning-text">{{ errors.startDate }}</p>
        </div>

        <div class="form-group">
          <label class="form-label required">종료일<span v-if="!isReadOnly" class="asterisk"> *</span></label>
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
          <p v-if="errors.endDate" class="warning-text">{{ errors.endDate }}</p>
        </div>
      </div>

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
  color: var(--gray-700);
  margin-bottom: 8px;
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

.warning-text {
  margin-top: 5px;
  color: var(--error-500);
  font-size: 0.9rem;
  grid-column: 1 / -1;
}

.asterisk {
  color: var(--error);
  margin-left: 4px;
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
