<template>
  <main class="main">
    <div class="main-section">
      <div class="main-header">
        <div class="header-area">
          <div class="page-header">
            <h1 class="page-title active">공지 사항 작성</h1>
          </div>
          <div class="header-buttons">
            <button class="btn btn-secondary" @click="goBack">
              <i class="fas fa-list"></i>
              목록으로
            </button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="form-card">
          <form @submit.prevent="handleSubmit">
            <!-- 제목 -->
            <div class="form-group">
              <label for="title" class="form-label">제목 <span class="required">*</span></label>
              <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  class="form-input"
                  placeholder="공지사항 제목을 입력하세요"
                  required
              />
            </div>

            <!-- 내용 -->
            <div class="form-group">
              <label for="content" class="form-label">내용 <span class="required">*</span></label>
              <textarea
                  id="content"
                  v-model="form.content"
                  class="form-input form-textarea"
                  placeholder="공지사항 내용을 입력하세요"
                  required
              ></textarea>
            </div>

            <!-- 첨부파일 -->
            <div class="form-group">
              <label class="form-label">첨부파일</label>
              <div
                  class="file-upload-area"
                  @click="$refs.fileInput.click()"
                  :class="{ dragover: isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
              >
                <div class="file-upload-icon">
                  <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="file-upload-text">파일을 선택하거나 여기에 끌어다 놓으세요</div>
                <div class="file-upload-hint">최대 10MB까지 업로드 가능합니다</div>
              </div>
              <input
                  type="file"
                  ref="fileInput"
                  class="file-input"
                  multiple
                  @change="handleFileChange"
              />
              <div class="uploaded-files">
                <div class="uploaded-file" v-for="(file, idx) in uploadedFiles" :key="idx">
                  <i class="fas fa-paperclip"></i>
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">({{ formatSize(file.size) }})</div>
                  <div class="remove-file" @click="removeFile(idx)">
                    <i class="fas fa-times"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="button-group">
              <button type="button" class="btn btn-secondary" @click="goBack">
                <i class="fas fa-times"></i>
                취소
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <i class="fas fa-paper-plane"></i>
                {{ isSubmitting ? '업로드 중...' : '작성 완료' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createAnnouncement, generatePresignedUrl } from "@/features/announcement/api.js"
import {useToast} from "vue-toastification";

const router = useRouter()
const toast = useToast()

const form = ref({
  title: '',
  content: '',
})

const isDragging = ref(false)
const isSubmitting = ref(false)

// 업로드 성공한 파일만 담을 배열
const uploadedFiles = ref([])

const getContentTypeWithCharset = (type) => {
  if (type.startsWith('text/') || type === 'text/csv') {
    return `${type}; charset=UTF-8`
  }
  return type
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  uploadFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  uploadFiles(files)
}

const uploadFiles = async (files) => {
  for (const file of files) {
    const contentType = getContentTypeWithCharset(file.type)

    try {
      const res = await generatePresignedUrl({
        fileName: file.name,
        sizeInBytes: file.size,
        contentType,
        prefixType: 'announcement',
      })

      const { presignedUrl, s3Key } = res.data.data

      await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      })

      uploadedFiles.value.push({
        name: file.name,
        s3Key,
        type: file.type,
        size: file.size,
      })
    } catch (err) {
      toast.error(`"${file.name}" 파일 업로드에 실패했습니다. 전체 등록이 중단됩니다.`)
    }
  }
}


const removeFile = (idx) => {
  uploadedFiles.value.splice(idx, 1)
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (uploadedFiles.value.some(f => !f.s3Key)) {
    toast.error('모든 파일이 정상적으로 업로드되지 않았습니다.')
    return
  }

  isSubmitting.value = true

  try {
    const res = await createAnnouncement({
      title: form.value.title,
      content: form.value.content,
      attachments: uploadedFiles.value.map(file => ({
        name: file.name,
        s3Key: file.s3Key,
        type: file.type,
      })),
    })

    const createdId = res.data.data.announcementId
    toast.success('공지사항이 등록되었습니다.')
    router.push(`/announcement/${createdId}`)
  } catch (err) {
    toast.error('공지사항 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/announcement')
}
</script>

<style scoped>
.main {
  padding: 0;
}

.main-section {
  width: 100%;
}

.main-header {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-area {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--font-main);
  margin-bottom: 8px;
}

.header-buttons .btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  color: var(--font-sub);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.header-buttons .btn:hover {
  background: var(--gray-200);
  color: var(--font-main);
}

.content-area {
  padding: 0 32px 32px 32px;
}

.form-card {
  background: white;
  border-radius: var(--card-radius, 12px);
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
  padding: 40px;
  animation: fadeInUp 0.5s ease;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--font-main);
  margin-bottom: 8px;
  font-size: 16px;
}

.required {
  color: var(--error);
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 16px;
  background: var(--gray-50);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--blue-400);
  background: white;
  box-shadow: 0 0 0 3px rgba(98, 142, 203, 0.1);
}

.form-textarea {
  min-height: 300px;
  resize: vertical;
  font-family: inherit;
}

/* File Upload */
.file-upload-area {
  border: 2px dashed var(--gray-300);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: var(--gray-50);
  transition: all 0.2s ease;
  cursor: pointer;
}

.file-upload-area:hover,
.file-upload-area.dragover {
  border-color: var(--blue-400);
  background: var(--blue-50);
}

.file-upload-icon {
  font-size: 48px;
  color: var(--gray-400);
  margin-bottom: 16px;
}

.file-upload-text {
  color: var(--font-sub);
  font-size: 16px;
  margin-bottom: 8px;
}

.file-upload-hint {
  color: var(--gray-500);
  font-size: 14px;
}

.file-input {
  display: none;
}

.uploaded-files {
  margin-top: 16px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--blue-50);
  border-radius: 8px;
  margin-bottom: 8px;
}

.uploaded-file i {
  color: var(--blue-400);
}

.file-name {
  flex: 1;
  color: var(--font-main);
  font-weight: 500;
}

.file-size {
  color: var(--font-sub);
  font-size: 14px;
}

.remove-file {
  color: var(--error);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 32px;
  border-top: 1px solid var(--border-subtle);
}

.btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: var(--main-color);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--blue-500);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--font-sub);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-200);
  color: var(--font-main);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-header,
  .content-area {
    padding: 20px;
  }

  .form-card {
    padding: 24px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>

