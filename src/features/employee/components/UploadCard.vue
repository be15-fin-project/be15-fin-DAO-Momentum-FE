<template>
  <div>
    <!-- 1) FormSection 헤더 -->
    <FormSection
        title="CSV 파일 업로드"
        icon="fa-upload"
        layout="one-column"
        :step="5"
    >

    <!-- 2) 드래그·클릭 업로드 영역 -->
    <div
        class="upload-area"
        :class="{ 'drag-over': dragOver }"
        @click="$refs.fileInput.click()"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
    >
      <i class="fas fa-cloud-upload-alt upload-icon"></i>
      <p class="upload-text">파일을 드래그하거나 클릭해 선택하세요</p>
      <p class="upload-subtext">CSV 파일만 등록 가능 (최대 10MB)</p>
      <input
          ref="fileInput"
          type="file"
          accept=".csv"
          class="hidden-input"
          @change="onSelect"
      />
    </div>

    <!-- 3) 선택된 파일 정보 -->
    <div v-if="file" class="file-info">
      <div class="file-details">
        <div>
          <p class="file-name">{{ fileName }}</p>
          <p class="file-size">{{ fileSize }}</p>
        </div>
        <button class="remove-btn" @click="$emit('remove-file')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 4) 업로드 시작 버튼 -->
    <BaseButton
        variant="submit"
        icon="upload"
        class="start-btn"
        :disabled="!file || uploading"
        @button-click="$emit('start-upload')"
    >
      업로드 시작
    </BaseButton>
    </FormSection>


    <!-- 5) 진행 상태 -->
    <div v-if="uploading" class="progress-section">
      <div class="progress-bar-wrapper">
        <span class="progress-label">진행률</span>
        <span class="progress-percent">{{ uploadProgress }}%</span>
        <div class="progress-track">
          <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
      <p class="progress-status">{{ uploadStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FormSection from '@/components/common/form/FormSection.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  file:       Object,
  fileName:   String,
  fileSize:   String,
  uploading:  Boolean,
  uploadProgress: Number,
  uploadStatus:   String,
})

const emit = defineEmits(['select-file', 'remove-file', 'start-upload'])
const dragOver = ref(false)

function onSelect(e) {
  const f = e.target.files[0]
  emit('select-file', f)
}

function onDrop(e) {
  dragOver.value = false
  const f = e.dataTransfer.files[0]
  emit('select-file', f)
}
</script>

<style scoped>
.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.upload-area.drag-over {
  background: #f1f5f9;
  border-color: #64748b;
}

.upload-icon {
  font-size: 2.5rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}
.upload-text {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}
.upload-subtext {
  font-size: 0.875rem;
  color: #6b7280;
}
.hidden-input {
  display: none;
}

.file-info {
  margin: 1rem 0;
  padding: 0.75rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.file-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.file-name {
  font-weight: 500;
  color: #1f2937;
}
.file-size {
  font-size: 0.875rem;
  color: #4b5563;
}
.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1rem;
}
.remove-btn:hover {
  color: #b91c1c;
}

.start-btn {
  width: 100%;
  margin-top: 0.75rem;
  justify-content: center;
}

.progress-section {
  margin-top: 1rem;
}
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.progress-label {
  font-size: 0.875rem;
  color: #4b5563;
}
.progress-percent {
  font-size: 0.875rem;
  color: #4b5563;
  margin-left: auto;
}
.progress-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 1rem;
}
.progress-fill {
  height: 100%;
  background: #64748b;
  transition: width 0.3s ease;
}
.progress-status {
  font-size: 0.875rem;
  color: #4b5563;
}

.card-shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
