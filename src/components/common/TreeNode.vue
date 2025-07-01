<template>
  <div class="tree-node">
    <button
        class="tree-node-btn"
        :class="{ active: selectedId === node.deptId }"
        @click.stop="emit('select', node.deptId)"
    >
      {{ node.name }}
    </button>

    <div v-if="node.childDept?.length" class="tree-children">
      <TreeNode
          v-for="child in node.childDept"
          :key="child.deptId"
          :node="child"
          :selected-id="selectedId"
          @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: Object,
  selectedId: Number,
});
const emit = defineEmits(['select']);
</script>

<style scoped>
.tree-node {
  margin-left: 8px;
}

.tree-node-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-800);
  text-align: left;
  width: 100%;
}

.tree-node-btn.active {
  font-weight: bold;
  background-color: var(--blue-100);
}

.tree-children {
  margin-left: 12px;
  border-left: 1px dashed var(--gray-300);
  padding-left: 8px;
}
</style>
