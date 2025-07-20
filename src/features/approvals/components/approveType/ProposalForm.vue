<script setup>
import { getFileUrl } from "@/features/common/api.js";
import {ref, onMounted, watch} from "vue";
import {generatePresignedUrl} from "@/features/announcement/api.js";
import dayjs from "dayjs";
import {useToast} from "vue-toastification";

/* 부모에게 받아온 데이터 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] },
  uploadedFiles: { type: Array, default: () => [] }
});

const toast = useToast();

/* 에러 메세지 */
const errors = ref({
  reason: ''
});

/* 파일과 관련된 변수들 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);
const uploadedFile = ref(null);

/* 파일 url 가져오기 */
async function fetchProposalFile() {
  if (!props.isReadOnly || props.approveFileDTO.length === 0) return;

  file.value = props.approveFileDTO[0];

  try {
    const resp = await getFileUrl({
      key: file.value.s3Key,
      fileName: file.value.name
    });

    signedUrl.value = resp.data.data.signedUrl;
    fileName.value = resp.data.data.fileName;

  } catch (err) {
    toast.error("파일 서명 URL 불러오기 실패:", err);
    signedUrl.value = null;
  }
}

/* 파일 다운하기  */
async function handleFileClick() {
  if (!signedUrl.value || !file.value) return;

  try {
    const response = await fetch(signedUrl.value);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName.value;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('파일 다운로드 중 오류가 발생했습니다.');
  }
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
    toast.error('파일 업로드 중 오류가 발생했습니다.');
  }
}

/* 파일 삭제하기 */
function removeFile() {
  uploadedFile.value = null;
  props.formData.file = null;
  props.formData.attachments = [];
}

/* 시간과 관련된 validation */
function validateForm() {
  errors.value = {
    reason: ''
  };

  const content = props.formData.content?.trim();

  if (!content) {
    errors.value.reason = '※ 품의서 내용 작성은 필수입니다.';
    return false;
  }

  errors.value.reason = '';

  return true;
}

watch(
  [
    () => props.formData.content
  ], () => {
    validateForm();}
  , { immediate: true }
);

onMounted(() => {
  fetchProposalFile();
  validateForm();

  if (!props.isReadOnly && props.uploadedFiles.length > 0) {
    uploadedFile.value = {
      name: props.uploadedFiles[0].name
    };
  }
});

defineExpose({
  validateForm
});

</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 1. 첨부파일 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl && isReadOnly">
          <span class="file-link" @click="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-if="isReadOnly && !signedUrl && !file">첨부파일 없음</div>

        <div v-if="!isReadOnly" class="upload-wrapper">
          <label class="upload-box">
            <i class="fas fa-upload file-icon"></i>
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

      <!-- 2. 품의 내역 -->
      <div class="form-group full-width">
        <label class="form-label required">품의 내역<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.content || "내용 없음" }}
        </div>
        <textarea v-else v-model="formData.content" class="form-textarea" required/>
        <p v-if="errors.reason && !isReadOnly" class="warning-text">{{ errors.reason }}</p>
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

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  min-height: 54px;
  white-space: pre-wrap;
}

.file-link {
  cursor: pointer;
}

.file-icon {
  margin-right: 5px;
  color: var(--blue-100);
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

.form-textarea {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-textarea {
  resize: vertical;
  min-height: 500px;
}

.asterisk {
  color: var(--error);
  margin-left: 4px;
}

.warning-text {
  margin-top: 5px;
  color: var(--error-500);
  font-size: 0.9rem;
  grid-column: 1 / -1;
}
</style>