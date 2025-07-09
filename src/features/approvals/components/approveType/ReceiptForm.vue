<script setup>
import {onMounted, ref, watchEffect} from "vue";
import {getFileUrl} from "@/features/common/api.js";
import {generatePresignedUrl} from "@/features/announcement/api.js";
import {getOcrApi} from "@/features/approvals/api.js";

/* 파일과 관련된 변수들 */
const imageUrl = ref(null);
const fileName = ref(null);
const uploadedFile = ref(null);
const previewUrl = ref(null); // 미리보기용 url (업로드 시점에 미리 보기)

/* ocr api 다 불러와지는 동안 로딩되도록 설정 */
const isOcrLoading = ref(false);

/* 금액 포맷을 위한 변수 (','를 넣기 위함) */
const formattedAmount = ref('');

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

      console.log(resp.data.data);
      imageUrl.value = resp.data.data.signedUrl;
      fileName.value = resp.data.data.fileName;
    } catch (err) {
      console.error('파일 이미지 URL 불러오기 실패:', err);
      imageUrl.value = null;
    }
  } else {
    imageUrl.value = null;
  }
}

watchEffect(() => {
  const file = props.approveFileDTO[0];
  if (props.isReadOnly && file && file.s3Key) {
    fetchReceiptImage();
  }
});

/* 파일 업로드 하기 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg'];

  if (!validTypes.includes(file.type)) {
    alert('PNG 또는 JPG 파일만 업로드할 수 있습니다.');
    return;
  }

  uploadedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);

  try {
  /* 1. 업로드용 presigned url 생성 */
    const res = await generatePresignedUrl({
      fileName: file.name,
      contentType: file.type,
      prefixType: 'approve'
    });

    const { presignedUrl, s3Key } = res.data.data;

    /* 2. s3 key를 받아오기 위한 요청  */
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    /* 3. 첨부파일 정보 저장 */
    props.formData.attachments = [{
      name: file.name,
      s3Key,
      type: file.type.split('/')[1] || ''
    }];

    isOcrLoading.value = true;

    // 4. OCR 요청
    const formData = new FormData();
    formData.append('file', file);

    const ocrRes = await getOcrApi(formData);
    const data = ocrRes.data.data;

    // 5. OCR 응답을 formData에 반영
    props.formData.storeName = data.storeName || '';
    props.formData.address = data.address || '';
    props.formData.usedAt = data.usedAt || '';
    props.formData.amount = data.amount || '';

  } catch (err) {
    console.error("파일 업로드 실패:", err);
    alert("파일 업로드 중 오류가 발생했습니다.");
  } finally {
    isOcrLoading.value = false;
  }
}

/* 파일 삭제하기 */
function removeFile() {
  uploadedFile.value = null;
  previewUrl.value = null;
  imageUrl.value = null;
  props.formData.file = null;
}

onMounted(fetchReceiptImage);
</script>

<template>
  <div class="form-section">
    <div v-if="isOcrLoading" class="ocr-loading-overlay">
      <span class="spinner" /> 영수증 내용을 불러오는 중...
    </div>
    <div class="receipt-layout">
      <!-- 1. 영수증 이미지 -->
      <div class="image-wrapper" v-if="previewUrl || imageUrl">
        <img :src="previewUrl || imageUrl" alt="영수증 미리보기" />
      </div>

      <div class="form-group receipt-file">
        <div v-if="!isReadOnly && !previewUrl" class="upload-wrapper">
          <label class="upload-box">
            <i class="fas fa-upload"></i>
            <span class="upload-text">
              {{ uploadedFile ? uploadedFile.name : '파일을 선택하거나 클릭하세요' }}
            </span>
            <input type="file" @change="handleFileUpload" accept="*/*" hidden />
          </label>

          <div v-if="uploadedFile" class="file-preview">
            <i class="fas fa-paperclip file-icon"></i>
            {{ uploadedFile.name }}
            <i class="fas fa-times remove-icon" @click="removeFile"></i>
          </div>
        </div>
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
          <div v-if="isReadOnly" class="readonly-box">{{ formData.address || '입력 없음' }}</div>
          <input v-else v-model="formData.address" type="text" class="form-input" required />
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

.upload-wrapper,
.image-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px dashed var(--gray-200);
  border-radius: 10px;
  padding: 24px;
  background-color: #f9fafb;
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

.upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-box {
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.2s ease;
  background-color: #f9fafb;
}

.upload-box i {
  font-size: 1.5rem;
  color: var(--blue-100);
  margin-bottom: 8px;
  display: block;
}

.upload-text {
  font-size: 0.95rem;
  color: var(--gray-600);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--gray-800);
}

.ocr-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: var(--gray-700);
  backdrop-filter: blur(2px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 3px solid var(--gray-300);
  border-top-color: var(--gray-600);
  border-radius: 50%;
  margin-right: 10px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>