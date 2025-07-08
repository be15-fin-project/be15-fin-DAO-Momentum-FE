<template>
  <div class="tree-node">
    <div class="tree-header">
      <!-- prettier 아이콘 (lucide-styled or font-awesome) -->
      <i
          v-if="hasChildren"
          :class="[
          'fas',
          isExpanded ? 'fa-chevron-down' : 'fa-chevron-right',
          'toggle-icon'
        ]"
          @click.stop="isExpanded = !isExpanded"
      ></i>

      <!-- 텍스트 선택 -->
      <span
          class="tree-label"
          :class="{ active: selectedId === node.deptId }"
          @click.stop="emit('select', node.deptId, node.name)"
      >
        {{ node.name }}
      </span>
    </div>

    <div v-if="isExpanded && hasChildren" class="tree-children">
      <TreeNode
          v-for="child in node.childDept"
          :key="child.deptId"
          :node="child"
          :selected-id="selectedId"
          :depth="depth + 1"
          @select="(id, name) => emit('select', id, name)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: Object,
  selectedId: Number,
  depth: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(['select']);

const isExpanded = ref(props.depth === 0);
const hasChildren = computed(() => props.node?.childDept?.length > 0);
</script>

<style scoped>
.tree-node {
  margin: 0 8px;
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.toggle-icon {
  font-size: 13px;
  color: var(--blue-400);
  cursor: pointer;
  width: 18px;
  text-align: center;
}

.tree-label {
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-800);
  white-space: nowrap;
  width: fit-content;
  padding: 2px 4px;
  border-radius: 4px;
}

.tree-label.active {
  font-weight: bold;
  background-color: var(--blue-100);
}

.tree-children {
  margin-left: 16px;
  border-left: 1px dashed var(--gray-300);
  padding-left: 8px;
}
</style>
