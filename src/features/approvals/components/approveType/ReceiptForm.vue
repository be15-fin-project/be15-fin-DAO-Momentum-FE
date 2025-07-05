<script setup>
import {onMounted, ref, watch} from "vue";
import {getFileUrl} from "@/features/common/api.js";

const imageUrl = ref(null);

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

/* 영수증 이미지를 가져오는 api */
async function fetchReceiptImage() {
  if (props.isReadOnly && props.approveFileDTO.length > 0) {
    const file = props.approveFileDTO[0];

    try {
      const resp = await getFileUrl({
        key: file.s3Key,
        fileName: file.name
      });

      imageUrl.value = resp.data.data.signedUrl;
      console.log(imageUrl.value);
    } catch (err) {
      console.error('파일 이미지 URL 불러오기 실패:', err);
      imageUrl.value = null;
    }
  } else {
    imageUrl.value = null;
  }
}

watch(() => props.approveFileDTO, fetchReceiptImage, { immediate: true });

onMounted(fetchReceiptImage);
</script>
<template>
  <div class="form-section">
    <div class="receipt-layout">
      <!-- 1. 영수증 이미지 -->
      <div class="image-wrapper" v-if="imageUrl">
        <img :src="imageUrl" alt="영수증 이미지" />
      </div>

      <!-- 2. 영수증 내역 -->
      <div class="form-grid">
        <!-- 2-1. 영수증 유형 -->
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

        <!-- 2-2. 상호명 -->
        <div class="form-group full-width">
          <label class="form-label required">상호명</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.storeName || '입력 없음' }}</div>
          <input v-else v-model="formData.storeName" type="text" class="form-input" required />
        </div>

        <!-- 2-3. 주소 -->
        <div class="form-group full-width">
          <label class="form-label required">주소</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.storeAddress || '입력 없음' }}</div>
          <input v-else v-model="formData.storeAddress" type="text" class="form-input" required />
        </div>

        <!-- 2-4. 사용일 -->
        <div class="form-group full-width">
          <label class="form-label required">사용일</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.usedAt || '입력 없음' }}</div>
          <input v-else v-model="formData.usedAt" type="date" class="form-input" required />
        </div>

        <!-- 2-5. 금액 -->
        <div class="form-group full-width">
          <label class="form-label required">사용 금액 (원)</label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.amount ? formData.amount.toLocaleString() + ' 원' : '입력 없음' }}
          </div>
          <input v-else v-model="formData.amount" type="number" min="0" class="form-input" required />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-layout {
  display: flex;
  gap: 32px;
  align-items: stretch;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.image-wrapper {
  flex-shrink: 0;
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background-color: var(--gray-50);
  padding: 8px;
  border: 1px solid var(--gray-200);
}

.image-wrapper img {
  max-width: 100%;
  min-height: 100%;
  object-fit: contain;
  display: block;
}

.form-grid {
  flex: 1;
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

.form-input,
select.form-input {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  font-family: inherit;
}

.form-input:focus,
select.form-input:focus {
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