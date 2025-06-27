<template>
  <div>
    <!-- Header Section (Always Rendered) -->
    <div class="main-header">
      <div class="header-area">
        <div class="page-header">
          <h1
              v-for="(item, idx) in headerItems"
              :key="idx"
              class="page-title"
              :class="{ active: item.active }"
          >
            <a :href="item.href">{{ item.label }}</a>
          </h1>
        </div>
        <div class="header-buttons" v-if="submitButtons && submitButtons.length">
          <button
              v-for="(button, index) in submitButtons"
              :key="index"
              :class="resolveButtonClass(button.variant)"
              @click="$emit(button.event || 'openModal', button)"
          >
            <i :class="['fas', button.icon || 'fa-file-signature']"></i>
            {{ button.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs (Optional) -->
    <nav class="tab-nav" v-if="showTabs">
      <div class="tab-nav-container">
        <div class="tab-list">
          <a
              v-for="tab in tabs"
              :key="tab.label"
              class="tab-button"
              :class="{ active: activeTab === tab.label }"
              :href="tab.href"
          >
            <i :class="['fas', tab.icon]" v-if="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </a>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

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
const emit = defineEmits(['tabSelected', 'openModal']);

const activeTab = ref(props.tabs[0]?.label || '');

function resolveButtonClass(variant) {
  switch (variant) {
    case 'green': return 'bg-green-600';
    case 'blue': return 'bg-blue-600';
    default: return '';
  }
}
</script>

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
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.header-buttons button i {
  margin-right: 8px;
}
.header-buttons button.bg-green-600 {
  background: #16a34a;
  border: none;
  color: #fff;
}
.header-buttons button.bg-green-600:hover {
  background: #15803d;
}
.header-buttons button.bg-blue-600 {
  background: #2563eb;
  border: none;
  color: #fff;
}
.header-buttons button.bg-blue-600:hover {
  background: #1d4ed8;
}
.header-buttons button:hover:not(.bg-blue-600):not(.bg-green-600) {
  background: #f3f4f6;
}

.button-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tab-nav {
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.tab-nav-container {
  padding: 0 40px;
}

.tab-list {
  display: flex;
  position: relative;
  gap: 32px;
}

.tab-button {
  padding: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
  text-decoration: none;
}

.tab-button:hover {
  color: #374151;
}

.tab-button i {
  font-size: 0.875rem;
}

.tab-button.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}
</style>
