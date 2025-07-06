<template>
  <div class="form-wrapper">
    <div class="form-card">
      <form @submit.prevent="onSubmit">
        <!-- 제목 -->
        <div class="form-group">
          <label for="title" class="form-label">
            제목 <span class="required" v-if="!isEdit">*</span>
          </label>
          <input
              type="text"
              id="title"
              v-model="form.title"
              class="form-input"
              :placeholder="isEdit ? '' : '공지사항 제목을 입력하세요'"
              :required="!isEdit"
              :disabled="isEdit"
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
            <div class="uploaded-file" v-for="(file, idx) in form.files" :key="idx">
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
            <i class="fas fa-times"></i> 취소
          </button>
          <button type="submit" class="btn btn-primary">
            <i :class="isEdit ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
            {{ isEdit ? '수정 완료' : '작성 완료' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  form: Object,
  isEdit: Boolean,
  onSubmit: Function,
})

const isDragging = ref(false)
const router = useRouter()

const handleFileChange = (event) => {
  props.form.files.push(...event.target.files)
}

const handleDrop = (event) => {
  isDragging.value = false
  props.form.files.push(...event.dataTransfer.files)
}

const removeFile = (idx) => {
  props.form.files.splice(idx, 1)
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

const goBack = () => {
  router.push('/announcement')
}
</script>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 32px 32px 32px;
}

.form-card {
  width: 100%;
  max-width: 800px;
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
</style>
