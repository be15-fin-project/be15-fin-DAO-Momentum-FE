<template>
  <div>
    <!-- Header Section -->
    <div class="main-header">
      <div class="header-area">
        <div class="page-header">
          <router-link
              v-for="(item, idx) in headerItems"
              :key="idx"
              :to="item.to"
              class="router-link page-title"
          >
            <h1 :class="{ active: item.active }">{{ item.label }}</h1>
          </router-link>
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

    <!-- Navigation Tabs -->
    <nav class="tab-nav" v-if="showTabs">
      <div class="tab-nav-container">
        <div class="tab-list">
          <router-link
              v-for="tab in tabs"
              :key="tab.label"
              class="tab-button"
              :class="{ active: tab.label === activeTab }"
              :to="tab.to"
              @click="$emit('tabSelected', tab.label)"
          >
            <i :class="['fas', tab.icon]" v-if="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

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
  },
  activeTab: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['tabSelected', 'openModal']);

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
.header-buttons button.bg-green-600 {
  background: var(--green-100);
  border: none;
  color: var(--color-surface);
}
.header-buttons button.bg-green-600:hover {
  background: var(--green-200);
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

.button-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tab-nav {
  box-shadow: var(--tab-shadow);
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
  color: var(--gray-500);
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
  color: var(--gray-700);
}

.tab-button i {
  font-size: 0.875rem;
}

.tab-button.active {
  color: var(--blue-300);
  border-bottom: 2px solid var(--blue-300);
}

.router-link {
  all: unset;
  cursor: pointer;
}
</style>
