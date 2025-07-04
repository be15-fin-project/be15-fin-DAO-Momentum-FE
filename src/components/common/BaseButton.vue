<!-- BaseButton.vue -->
<template>
  <button
      type="button"
      :class="buttonClass"
      @click="handleClick"
  >
    <i v-if="icon" :class="`fas fa-${icon}`"></i>
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: { type: String, default: 'default' },
    icon: { type: String, default: '' },
  },
  methods: {
    handleClick(event) {
      this.$emit('button-click', event);
    },
  },
  computed: {
    buttonClass() {
      return [
        'btn-action',
        {
          'btn-submit': this.variant === 'submit',
          'btn-cancel': this.variant === 'cancel',
          'btn-reject': this.variant === 'reject',
          'btn-edit': this.variant === 'edit',
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
  background: var(--color-surface);
  color: var(--gray-500);
  border: 2px solid var(--color-muted);
}

.btn-cancel:hover {
  background: var(--color-background);
  color: var(--gray-700);
  transform: translateY(-1px);
}

/* 제출/승인 */
.btn-submit {
  background: var(--approve-gradient);
  color: var(--color-surface);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* 반려 */
.btn-reject {
  background: var(--reject-gradient);
  color: var(--color-surface);
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.35);
}

/* 수정 */
.btn-edit {
  background: var(--edit-gradient);
  color: var(--color-surface);
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.35);
}
</style>
