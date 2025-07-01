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

</script>

<template>
  <div>
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
      </div>
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

.router-link {
  all: unset;
  cursor: pointer;
}
</style>
