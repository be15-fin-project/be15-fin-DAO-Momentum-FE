<script setup>
import { getFileUrl } from "@/features/common/api.js";
import { ref, onMounted } from "vue";
import {generatePresignedUrl} from "@/features/announcement/api.js";

/* 부모에게 받아온 데이터 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
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

/* 파일 다운하기  */
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

onMounted(fetchProposalFile);
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 1. 첨부파일 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl&&isReadOnly">
          <span class="file-link" @click="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-if="isReadOnly&&!file">첨부파일 없음</div>

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
        <label class="form-label required">품의 내역<span class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.content || "내용 없음" }}
        </div>
        <textarea v-else v-model="formData.content" class="form-textarea" required/>
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

.asterisk {
  color: var(--error);
  margin-left: 4px;
}
</style>