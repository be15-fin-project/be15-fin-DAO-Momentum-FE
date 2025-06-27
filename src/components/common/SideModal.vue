<template>
  <div v-show="visible">
    <div class="modal-overlay active" @click="onClose"></div>
    <div class="modal-container active">
      <div class="modal-header">
        <h2 v-if="title">
          <i v-if="icon" :class="`header-icon fas ${icon}`"></i>
          {{ title }}
        </h2>
        <button class="modal-close" @click="onClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-content">
        <FormSection
            v-for="(section, idx) in sections"
            :key="idx"
            :title="section.title"
            :icon="section.icon"
            :layout="section.layout"
            :outer-class="section.outerClass"
        >
          <div v-for="(field, fieldIdx) in section.fields" :key="fieldIdx" class="form-group">
            <label class="form-label">{{ field.label }}</label>
            <input type="text" class="form-input" :value="field.value" disabled />
          </div>
        </FormSection>


      </div>

      <div class="modal-footer" v-if="showFooter">
        <BaseButton
            v-if="showReject"
            type="reject"
            icon="warning"
            @click="onClose"
        >
          {{ rejectText }}
        </BaseButton>

        <BaseButton
            v-if="showSubmit"
            type="submit"
            icon="paper-plane"
            @click="$emit('submit')"
        >
          {{ submitText }}
        </BaseButton>
      </div>


    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import FormSection from '@/components/common/FormSection.vue'

defineProps({
  visible: Boolean,
  title: String,
  icon: String,
  showFooter: { type: Boolean, default: true },
  showReject: { type: Boolean, default: true },
  showSubmit: { type: Boolean, default: true },
  rejectText: { type: String, default: '반려' },
  submitText: { type: String, default: '승인' },
  sections: {
    type: Array,
    default: () => [] // [{ title, icon, slot }]
  }
})

const emit = defineEmits(['close', 'reject', 'submit'])

function onClose() {
  emit('close')
}

</script>


<style scoped>
/* 모달 전체 영역 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(45, 55, 72, 0.7));
  backdrop-filter: blur(3px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 2000;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 40rem;
  max-width: 100%;
  background: #ffffff;
  z-index: 2001;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.modal-container.active {
  transform: translateX(0);
}

/* 헤더 */
.modal-header {
  background: var(--icon-gradient);
  color: #fff;
  padding: 28px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 16px;
}

.modal-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}


.modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

/* 본문 */
.modal-content {
  padding: 36px 32px 24px;
  flex: 1;
  overflow-y: auto;
}

/* 섹션 스타일 */
.form-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--icon-gradient);
  border-radius: 1px;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--icon-gradient);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* 폼 */
.form-grid {
  display: grid;
  gap: 24px;
}

.form-grid.two-column {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .form-grid.two-column {
    grid-template-columns: 1fr 1fr;
  }
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
  display: flex;
  align-items: center;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #1f2937;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
  font-style: italic;
}

/* 버튼 */
.btn-add-section {
  margin-bottom: 16px;
  background: none;
  color: #4f46e5;
  border: none;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-add-section:hover {
  color: #3730a3;
}

/* 리스트 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.detail-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.detail-list li:hover {
  background-color: #f3f4f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.detail-list .label {
  color: #4b5563;
  font-weight: 600;
}

.detail-list .value {
  color: #1f2937;
  font-weight: 500;
}

/* 첨부 */
.upload-box {
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  display: block;
}

.upload-box:hover {
  border-color: #a5b4fc;
}

.upload-box i {
  font-size: 1.8rem;
  color: #9ca3af;
  margin-bottom: 8px;
  display: block;
}

/* 하단 버튼 */
.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.modal-footer button {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-item {
  background: #f9f9fb;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.score-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 8px;
}

.score-label .score-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.score-label span {
  flex: 1;
}

.score-label strong {
  color: #5561f0;
}

.score-bar-wrap {
  height: 6px;
  background: #e0e0f0;
  border-radius: 3px;
  margin-bottom: 6px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  background: linear-gradient(to right, #7f9cf5, #5561f0);
  border-radius: 3px;
}

.score-desc {
  font-size: 13px;
  color: #666;
}

.type-single {
  background: #f0f7ff;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.type-badge {
  font-weight: 700;
  color: #3b82f6;
  background: #e0f2ff;
  padding: 4px 10px;
  border-radius: 20px;
}

</style>
