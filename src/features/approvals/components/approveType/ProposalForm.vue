<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
});

// 이미지 확장자 판별
const isImage = (fileName) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 품의 내역 -->
      <div class="form-group full-width">
        <label class="form-label required">품의 내역</label>
        <div class="readonly-box">
          {{ formData.content || '내용 없음' }}
        </div>
      </div>

      <!-- 첨부파일 영역 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <ul class="file-list readonly-box">
          <li v-for="file in approveFileDTO" :key="file.id" class="file-item">
            <a :href="file.url" download target="_blank">{{ file.originalFileName }}</a>
            <div v-if="isImage(file.originalFileName)">
              <img :src="file.url" class="image-preview" alt="preview" />
            </div>
          </li>
        </ul>
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
  color: #374151;
  margin-bottom: 8px;
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  min-height: 54px;
  white-space: pre-wrap;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  margin-bottom: 12px;
}

.file-item a {
  font-size: 0.95rem;
  color: #2563eb;
  text-decoration: underline;
  margin-right: 8px;
}

.image-preview {
  display: block;
  max-width: 300px;
  margin-top: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
</style>