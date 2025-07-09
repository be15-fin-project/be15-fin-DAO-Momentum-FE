<script setup>
import {computed, onMounted, ref} from 'vue';
import {getFileUrl} from "@/features/common/api.js";

/* 파일과 관련된 변수들 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);
const uploadedFile = ref(null);

/* 부모에게 전달 받은 값들 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
});

/* 출장 유형 옵션 */
const typeOptions = [
  { label: '국내 출장', value: 'DOMESTIC' },
  { label: '해외 출장', value: 'INTERNATIONAL' }

];

/* 수정시 날짜 관련 유효성을 체크하는 부분 */
const isInvalidDateRange = computed(() => {
  return form.value.startDate && form.value.endDate && form.value.endDate < form.value.startDate;
});

/* 파일 url을 가져오기 위한 함수 */
async function fetchBusinessTripFile() {
  if (!props.isReadOnly || props.approveFileDTO.length === 0) return;

  file.value = props.approveFileDTO[0];
  console.log(file.value.fileName)

  try {
    const resp = await getFileUrl({
      key: file.value.s3Key,
      fileName: file.value.name
    });

    signedUrl.value = resp.data.data.signedUrl;
    fileName.value = resp.data.data.fileName;

  } catch (err) {
    console.error("파일 서명 URL 불러오기 실패:", err);
    signedUrl.value = null;
  }
}

/* 파일 다운로드 하기 (클릭시 작동) */
function handleFileClick() {
  if (!signedUrl.value || !file.value) return;

  const link = document.createElement("a");
  link.href = signedUrl.value;
  link.download = file.value.originalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* 파일 업로드 하기 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFile.value = file;

  /* 업로드용 presigned url 요청 */
  try {
    const res = await generatePresignedUrl({
      fileName: file.name,
      contentType: file.type,
      prefixType: 'approve'
    });

    const { presignedUrl, s3Key } = res.data.data;

    /* S3 업로드 */
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    /* 첨부파일 정보 저장 */
    props.formData.attachments = [{
      name: file.name,
      s3Key,
      type: file.type.split('/')[1] || ''
    }];

  } catch (err) {
    console.error("파일 업로드 실패:", err);
    alert("파일 업로드 중 오류가 발생했습니다.");
  }
}

/* 파일 삭제하기 */
function removeFile() {
  uploadedFile.value = null;
  props.formData.file = null;
}

onMounted(fetchBusinessTripFile);
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 1. 출장 유형 -->
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

      <!-- 2. 출장 장소 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 장소</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.place || '입력 없음' }}
        </div>
        <input v-else type="text" v-model="formData.place" class="form-input" required />
      </div>

      <!-- 3. 출장 기간 -->
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

      <!-- 4. 출장 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 사유</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.reason || '입력 없음' }}
        </div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required></textarea>
      </div>

      <!-- 5. 예상 비용 -->
      <div class="form-group full-width">
        <label class="form-label required">예상 비용 (원)</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.cost ? formData.cost.toLocaleString() + ' 원' : '입력 없음' }}
        </div>
        <input v-else type="number" min="0" v-model="formData.cost" class="form-input" required />
      </div>

      <!-- 6. 첨부 파일 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl&&isReadOnly">
          <span class="file-link" @click="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-if="isReadOnly">첨부파일 없음</div>

        <div v-if="!isReadOnly" class="upload-wrapper">
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

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-textarea:focus,
select.form-input:focus {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.file-link {
  cursor: pointer;
}

.file-icon {
  margin-right: 5px;
  color: var(--blue-100);
}

.warning-text {
  color: var(--error-500);
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  min-height: 54px;
  white-space: pre-wrap;
}

.upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-box {
  border: 2px dashed var(--gray-200);
  border-radius: 10px;
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

.file-icon {
  color: var(--blue-100);
}
</style>