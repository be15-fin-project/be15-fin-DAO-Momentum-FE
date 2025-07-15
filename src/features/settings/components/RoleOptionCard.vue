<script setup>

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object, // ✅ 배열 아님
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
});


const emit = defineEmits(['update:modelValue','update']);

const onCheckboxChange = (event, roleId) => {
  const currentRoles = Array.isArray(props.modelValue.roles)
      ? [...props.modelValue.roles]
      : [];

  const isChecked = event.target.checked;

  if (isChecked && !currentRoles.includes(roleId)) {
    currentRoles.push(roleId);
  } else if (!isChecked && currentRoles.includes(roleId)) {
    currentRoles.splice(currentRoles.indexOf(roleId), 1);
  }

  emit('update:modelValue', {
    ...props.modelValue, // 기존 데이터 보존
    roles: currentRoles  // roles만 업데이트
  });
};
</script>

<template>
  <div class="card slide-in">
    <header class="card-header">
      <h2 class="card-title">사원 권한</h2>
    </header>

    <div v-if="modelValue===null" class="empty-state">
      <i class="fas fa-user-friends icon-bg-blue"></i>
      <p>선택된 권한이 없습니다</p>
    </div>

    <div v-else class="permission-group">
      <div
          v-for="opt in field.options"
          :key="opt.id"
          class="permission-card"
          :class="String(opt.id)"
      >
        <div class="card-info">
          <h4 class="card-title">{{ opt.label }}</h4>
        </div>
        <label class="toggle-switch">
          <input
              type="checkbox"
              :value="opt.id"
              :checked="modelValue.roles.includes(Number(opt.id))"
              :disabled="readonly || !field.editable"
              @change="onCheckboxChange($event, opt.id)"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class = "submitSection">
        <div class="button-section">
          <button class="dept-create-button" @click="emit('update')">권한 수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-subtle);
  height: 100%;
  transition: box-shadow 0.3s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--font-main);
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--font-sub);
  font-size: 1rem;
}

.icon-bg-blue {
  color: var(--blue-450);
}

.permission-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.permission-card:hover {
  background-color: #f3f3f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px; width: 20px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--purple-500);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.submitSection{
  display:flex;
  justify-content: flex-end;
}

.button-section{
  display:flex;
  height: fit-content;
  justify-content: flex-end;
  padding:8px;
}

.dept-create-button{
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-ss);
  border: 1px solid var(--gray-300);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  background: var(--blue-300);
  color: var(--color-surface);
}

.slide-in {
  animation: slideInFromBottom 0.8s ease-in-out;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(-20px); /* 왼쪽에서 시작 */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* 원래 위치로 */
  }
}

</style>