<!-- components/toast/DeleteConfirmToast.vue -->
<script setup>
const props = defineProps(['toastId', 'resolve']);
import { useToast } from 'vue-toastification';
const toast = useToast();

const confirm = (result) => {
  toast.dismiss(props.toastId);
  props.resolve(result);
};
</script>

<template>
  <div class="toast-content">
    <p class="toast-message">정말 삭제하시겠습니까?</p>
    <button class="toast-confirm-btn" @click="confirm(true)">
      <i class="fas fa-check"></i>
    </button>
  </div>
</template>

<style scoped>
.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 0 6px 8px;
  border-radius: var(--radius-ss);
  min-width: 250px;
}

.toast-message {
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.toast-confirm-btn {
  background-color: transparent;
  color: var(--color-surface);
  border: none;
  padding: 8px 8px;
  border-radius: var(--radius-ss);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-confirm-btn:hover {
  transform: scale(1.3);
}
</style>
