<script setup>
const props = defineProps({
  headerItems: {
    type: Array,
    default: () => []
  },
  showTabs: {
    type: Boolean,
    default: true
  },
  submitButtons: {
    type: Array,
    default: () => []
  },
  tabs: {
    type: Array,
    default: () => []
  }
});

function resolveButtonClass(variant) {
  switch (variant) {
    case 'green': return 'bg-green-600';
    case 'blue': return 'bg-blue-600';
    default: return '';
  }
}
</script>

<template>
  <div class="main-header">
    <div class="header-area">
      <div class="page-header">
        <component
          v-for="(item, idx) in headerItems"
          :key="idx"
          :is="item.to ? 'router-link' : 'div'"
          :to="item.to"
          class="router-link page-title"
          @click="!item.to && $emit('tab-click', item.label)"
        >
          <h1 :class="{ active: item.active }">{{ item.label }}</h1>
        </component>
      </div>
      <router-link to="write" class="header-buttons" v-if="submitButtons && submitButtons.length">
        <button
          v-for="(button, index) in submitButtons"
          :key="index"
          :class="resolveButtonClass(button.variant)"
          @click="$emit(button.event || 'openModal', button)"
        >
          <i :class="['fas', button.icon || 'fa-file-signature']"></i>
          {{ button.label }}
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
  padding: 0 40px;
}

.header-area h1 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--font-main);
  margin: 0;
}

.header-area p {
  color: var(--label-color);
  margin: 8px 0 0 0;
  font-size: 1rem;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 40px;
}

.router-link {
  font-size: 2rem;
  font-weight: bold;
  text-decoration: none;
  color: var(--font-none);
  cursor: pointer;
}

.page-header h1 {
  color: var(--font-none);
}

.page-header .active {
  color: var(--font-main);
}

.page-title a {
  all: unset;
  cursor: pointer;
}

.header-buttons button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-ss);
  border: 1px solid var(--gray-300);
  background: var(--color-surface);
  color: var(--gray-700);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.header-buttons button i {
  margin-right: 8px;
}

.header-buttons button.bg-blue-600 {
  background: var(--blue-300);
  border: none;
  color: var(--color-surface);
}
.header-buttons button.bg-blue-600:hover {
  background: var(--blue-450);
}
.header-buttons button:hover:not(.bg-blue-600):not(.bg-green-600) {
  background: var(--color-muted-light);
}

.tab-button i {
  font-size: 0.875rem;
}

.router-link {
  all: unset;
  cursor: pointer;
}
</style>