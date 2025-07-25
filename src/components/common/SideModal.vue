<template>
  <div v-show="visible" class="modal-overlay"/>
  <Transition name="slide-modal">
    <div v-if="visible" class="modal-wrapper">
      <div v-show="visible" class="modal-in-overlay" @click="onClose"></div>
      <div class="modal-container">
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
          >
            <FieldRenderer
                v-for="(field, fIdx) in section.fields"
                :key="fIdx"
                :field="field"
                :model="form"
                :readonly="readonly"
                :setFieldRef="setFieldRef"
                :ref="field.key === 'reason' ? 'reasonInput' : null"
                @file-change="handleFileChange"
            />
          </FormSection>


        </div>

        <div class="modal-footer" v-if="showFooter">
          <BaseButton
              v-if="showCancel"
              variant="cancel"
              icon="rotate-left"
              :disabled="cancelDisabled"
              @click="$emit('cancel')"
          >
            {{ cancelText }}
          </BaseButton>
          <BaseButton
              v-if="showReject"
              variant="reject"
              icon="warning"
              :disabled="rejectDisabled"
              @click="$emit('reject')"
          >
            {{ rejectText }}
          </BaseButton>

          <BaseButton
              v-if="showEdit"
              variant="edit"
              icon="pencil-alt"
              @click="$emit('edit')"
          >
            {{ editText }}
          </BaseButton>

          <BaseButton
              v-if="showSubmit"
              variant="submit"
              icon="paper-plane"
              :disabled="submitDisabled"
              @click="$emit('submit')"
          >
            {{ submitText }}
          </BaseButton>

        </div>


      </div>
    </div>
  </Transition>
</template>


<script setup>
import FormSection from '@/components/common/form/FormSection.vue';
import FieldRenderer from '@/components/common/form/FieldRenderer.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import {watch, onMounted, onUnmounted, ref} from 'vue';

const initialized = ref(false);
const fieldRefs = ref({})

function setFieldRef(key, el) {
  if (el) fieldRefs.value[key] = el
}

defineExpose({fieldRefs})

function scrollToLikert(value) {
  const match = props.sections
      .flatMap(section => section.fields)
      .find(field => field.type === 'likert' && (field.value === value || form[field.key] === value));

  if (match && fieldRefs.value[match.key]) {
    fieldRefs.value[match.key].$el?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

const props = defineProps({
  visible: Boolean,
  title: String,
  icon: String,
  readonly: {type: Boolean, default: false},
  showFooter: {type: Boolean, default: true},
  showCancel: {type: Boolean, default: false},
  showReject: {type: Boolean, default: false},
  showEdit: {type: Boolean, default: false},
  showSubmit: {type: Boolean, default: true},
  cancelDisabled: {type: Boolean, default: false},
  submitDisabled: {type: Boolean, default: false},
  rejectDisabled: {type: Boolean, default: false},
  cancelText: {type: String, default: '취소'},
  rejectText: {type: String, default: '반려'},
  editText: {type: String, default: '수정'},
  submitText: {type: String, default: '저장'},
  sections: Array
});

const form = defineModel('form');
const emit = defineEmits(['close', 'reject', 'submit', 'cancel', 'edit', 'update:visible', 'file-change']);

function onClose() {
  emit('update:visible', false);
  emit('close');
}

function handleFileChange(file) {
  emit('file-change', file); // 외부 부모 컴포넌트로 이벤트 전달
}

watch(
    () => props.sections,
    (newSections) => {
      if (newSections?.length && form) {
        newSections.forEach((section) => {
          section.fields?.forEach((field) => {
            form[field.key] = field.value ?? '';
          });
        });
      }
    },
    {immediate: true}
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e) {
  if (!props.visible) return;
  const n = parseInt(e.key);
  if (n >= 1 && n <= 7) {
    scrollToLikert(n);
  }
}

</script>

<style scoped>
/* 모달 전체 영역 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 125vw;
  height: 125vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  z-index: 1998;
  /* 절대 애니메이션 없음 */
  transition: none !important;
}

/* 모달 전체 영역 */
.modal-in-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 125vw;
  height: 125vh;
  z-index: 1999;
}


.modal-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 40rem;
  max-width: 100%;
  background: var(--color-surface);
  z-index: 2001;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}


.modal-header {
  background: var(--icon-gradient);
  color: var(--color-surface);
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
  background: var(--modal-background);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  color: var(--color-surface);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: var(--close-background);
  transform: rotate(90deg);
}

.modal-content {
  padding: 36px 32px 24px;
  flex: 1;
  overflow-y: auto;
}

.modal-content::-webkit-scrollbar {
  width: 4px;
}

.form-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-muted);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--gradient-icon);
  border-radius: var(--radius-xs);
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--gradient-icon);
  color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.1rem;
  box-shadow: var(--shadow-lg);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

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

.btn-add-section {
  margin-bottom: 16px;
  background: none;
  color: var(--blue-400);
  border: none;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-add-section:hover {
  color: var(--blue-500);
}

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
  background: var(--color-background);
  border: 1px solid var(--color-muted);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.detail-list li:hover {
  background-color: var(--color-muted-light);
}

.detail-list .label {
  color: var(--color-text-sub);
  font-weight: 600;
}

.detail-list .value {
  color: var(--color-text-main);
  font-weight: 500;
}

.upload-box {
  border: 2px dashed var(--color-muted);
  border-radius: var(--radius-md);
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  display: block;
}

.upload-box:hover {
  border-color: var(--purple-50);
}

.upload-box i {
  font-size: 1.8rem;
  color: #9ca3af;
  margin-bottom: 8px;
  display: block;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid var(--color-muted);
  background: var(--color-background);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.modal-footer button {
  padding: 14px 28px;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
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
  color: var(--purple-100);
}

.score-bar-wrap {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-xs);
  margin-bottom: 6px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  background: var(--gradient-score-bar);
  border-radius: var(--radius-xs);
}

.score-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}

.type-single {
  background: var(--color-muted);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.type-badge {
  font-weight: 700;
  color: var(--color-badge-text);
  background: var(--color-badge-bg);
  padding: 4px 10px;
  border-radius: var(--radius-xl);
}

.modal-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 125vh;
  z-index: 1999;
  display: flex;
}

/* slide-modal 트랜지션 클래스는 modal-wrapper에 적용됨 */
.slide-modal-enter-active,
.slide-modal-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-modal-enter-from,
.slide-modal-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-modal-enter-to,
.slide-modal-leave-from {
  transform: translateX(0%);
  opacity: 1;
}

</style>
