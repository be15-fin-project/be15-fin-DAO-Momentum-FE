<script setup>
import Tree from "vue3-treeview";
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  list: Array,
  showNull: { type: Boolean, default: true },
  nullLabel: { type: String, default: '부서 없음' },
  defaultLabel: { type: String, default: '부서 선택' },
});
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const treeNodes = ref({});
const treeConfig = ref({ roots: [] });
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const onDeptSelect = (eventPayload) => {
  emit('update:modelValue', eventPayload.id);
  isOpen.value = false;
};

function TreeToMap(data) {
  const treeMap = {};
  const rootIds = [];

  // "상위 부서 없음" 항목 추가
  const noneId = null;
  treeMap[noneId] = {
    text: props.nullLabel,
    children: [],
    state: { opened: false }
  };

  if (props.showNull) {
    rootIds.push(noneId);
  }

  function traverse(node, parent = null) {
    const id = String(node.deptId);
    const children = (node.childDept || []).map(child => String(child.deptId));

    treeMap[id] = {
      text: node.name,
      children,
      parent,
      state: { opened: true }
    };

    (node.childDept || []).forEach(child => traverse(child, id));
  }

  data.forEach(rootNode => {
    const rootId = String(rootNode.deptId);
    rootIds.push(rootId);
    traverse(rootNode);
  });

  treeNodes.value = treeMap;
  treeConfig.value.roots = rootIds;
}

watch(() => props.list, (newVal) => {
  if (Array.isArray(newVal)) {
    TreeToMap(newVal);
  }
}, { immediate: true });

const selectedLabel = computed(() => {
  if (props.modelValue === null) return props.nullLabel;
  const id = String(props.modelValue);
  return treeNodes.value[id]?.text || '';
});

// 외부 클릭 시 닫기
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

</script>

<template>
  <div class="dropdown-wrapper" ref="dropdownRef">
    <div class="dropdown-input" @click="toggleDropdown">
      {{ selectedLabel || defaultLabel }}
      <i class="fas fa-chevron-down" :class="{ open: isOpen }"></i>
    </div>

    <div v-if="isOpen" class="dropdown-panel">
      <Tree :nodes="treeNodes" :config="treeConfig" @node-focus="onDeptSelect" />
    </div>
  </div>
</template>

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-input {
  padding: 14px 16px;
  border: 2px solid var(--color-muted);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--color-text-main);
  font-family: inherit;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.dropdown-input:focus,
.dropdown-input:focus-visible,
.dropdown-input:focus-within {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 2px solid var(--color-muted);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  z-index: 100;
}


.arrow {
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}


</style>