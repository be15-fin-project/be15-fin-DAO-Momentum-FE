<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false },
  approveFileDTO: { type: Array, default: () => [] }
});

const receiptTypeOptions = [
  { label: '식비', value: 'MEALEXPENSE' },
  { label: '교통비', value: 'TRAVELEXPENSE' },
  { label: '물품 구입비', value: 'SUPPLYPURCHASE' },
  { label: '기타', value: 'MISCELLANEOUS' }
];
</script>

<template>
  <div class="form-section">
    <!-- 이미지 미리보기 -->
    <div class="image-preview" v-if="imageUrl">
      <img :src="imageUrl" alt="영수증 이미지" />
    </div>

    <div class="form-grid">
      <!-- 영수증 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">영수증 유형</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ receiptTypeOptions.find(opt => opt.value === formData.receiptType)?.label || '선택되지 않음' }}
        </div>
        <select v-else v-model="formData.receiptType" class="form-input" required>
          <option disabled value="">선택하세요</option>
          <option v-for="option in receiptTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 상호명 -->
      <div class="form-group full-width">
        <label class="form-label required">상호명</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.storeName || '입력 없음' }}</div>
        <input v-else v-model="formData.storeName" type="text" class="form-input" required />
      </div>

      <!-- 주소 -->
      <div class="form-group full-width">
        <label class="form-label required">주소</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.storeAddress || '입력 없음' }}</div>
        <input v-else v-model="formData.storeAddress" type="text" class="form-input" required />
      </div>

      <!-- 사용일 -->
      <div class="form-group full-width">
        <label class="form-label required">사용일</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.usedAt || '입력 없음' }}</div>
        <input v-else v-model="formData.usedAt" type="date" class="form-input" required />
      </div>

      <!-- 금액 -->
      <div class="form-group full-width">
        <label class="form-label required">금액 (원)</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.amount ? formData.amount.toLocaleString() + ' 원' : '입력 없음' }}
        </div>
        <input v-else v-model="formData.amount" type="number" min="0" class="form-input" required />
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-preview {
  margin-bottom: 16px;
  text-align: center;
}
.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
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
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
select.form-input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #1f2937;
  font-family: inherit;
}
.form-input:focus,
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
</style>
