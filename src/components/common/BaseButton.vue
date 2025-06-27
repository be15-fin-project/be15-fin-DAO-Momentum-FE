<template>
  <button
      :class="buttonClass"
      @click="$emit('click')"
  >
    <i v-if="icon" :class="`fas fa-${icon}`"></i>
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'default', // 'submit' | 'cancel' | 'reject' 등
    },
    icon: {
      type: String,
      default: '', // ex: 'paper-plane', 'times'
    },
  },
  computed: {
    buttonClass() {
      return [
        'btn-action',
        {
          'btn-submit': this.type === 'submit',
          'btn-cancel': this.type === 'cancel',
          'btn-reject': this.type === 'reject',
        },
      ];
    },
  },
};
</script>

<style scoped>
.btn-action {
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

/* 취소 */
.btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
  transform: translateY(-1px);
}

/* 제출/승인 */
.btn-submit {
  background: linear-gradient(to right, #10b981, #059669); /* var(--approve-gradient) */
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* 반려 */
.btn-reject {
  background: linear-gradient(to right, #ef4444, #dc2626); /* var(--reject-gradient) */
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.35);
}
</style>
