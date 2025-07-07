<!-- 작은 모달 -->
<script setup>
import {nextTick, watch} from 'vue'
import BaseButton from "@/components/common/BaseButton.vue";

const props = defineProps({
  visible: {type: Boolean, required: true},
  cancelText: {type: String, default: '닫기'},
  confirmVisible: {type: Boolean, default: false},
  confirmText: {type: String, default: '확인'}
})

const emit = defineEmits(['confirm', 'cancel'])

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

// 모달 열릴 때 자동 포커스
function focusModal() {
  nextTick(() => {
    const modal = document.querySelector('.modal')
    if (modal) modal.focus()
  })
}

watch(() => props.visible, (val) => {
  if (val) focusModal()
})

</script>

<template>
  <div
      v-if="visible"
      class="modal"
      tabindex="0"
      @keydown.enter="handleConfirm"
      @keydown.esc="handleCancel"
      @click.self="handleCancel"
  >
    <div class="modal-content">
      <slot/>
      <div class="modal-buttons">
        <BaseButton
            icon="paper-plane"
            v-if="confirmVisible"
            variant="submit"
            @button-click="handleConfirm"
        >
          {{ confirmText }}
        </BaseButton>
        <BaseButton
            variant="cancel"
            icon="rotate-left"
            @button-click="handleCancel"
        >
          {{ cancelText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  outline: none;
}

.modal-content {
  width: 30rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  background-color: var(--color-surface);
  margin: 15% auto;
  padding: 60px 40px 50px 40px;
  border-radius: 12px;
  text-align: center;
}

.modal-content p {
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
  white-space: pre-line;
  word-break: keep-all;
}

.modal-buttons {
  width: 85%;
  display: flex;
  justify-content: space-evenly;
  gap: 2rem;
}

.modal-buttons button {
  width: 100%;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.cancel-btn, .confirm-btn {
  width: 70px;
  border: none;
  background-color: var(--color-badge-text);
  color: var(--color-surface);
}
</style>
