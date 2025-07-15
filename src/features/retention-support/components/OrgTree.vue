<script setup>
import { ref, onMounted, watch } from 'vue';
import Tree from "vue3-treeview";
import '@/assets/css/index.css'
import '@/assets/css/orgChartTransition.css'

const props = defineProps({
  dtoList: {
    type: Array,
    default: () => []
  },
  initialDeptId: [Number, String, null]
})
const emit = defineEmits(['selectDept'])

const selectedDeptId = ref(null);
const nodes = ref({});
const breadcrumb = ref([]);
const config = ref({
  roots: []
});

function TreeToMap(data) {
  const treeMap = {};
  const rootIds = [];

  function traverse(node, parent = null) {
    const id = String(node.deptId);
    const children = (node.childDept || []).map(child => String(child.deptId));

    treeMap[id] = {
      text: node.name,
      children,
      parent: parent, // breadcrumb를 위해 parent 추가
      state: {
        opened: true
      }
    };

    if (Array.isArray(node.childDept)) {
      node.childDept.forEach(child => traverse(child, id));
    }
  }

  data.forEach(rootNode => {
    const rootId = String(rootNode.deptId);
    rootIds.push(rootId);
    traverse(rootNode);
  });

  nodes.value = treeMap;
  config.value.roots = rootIds;
}

// 2. Breadcrumb 만들기 함수
function getBreadcrumb() {
  const breadcrumb = [];

  let current = nodes.value[selectedDeptId.value];
  if (!current) return [];

  while (current) {
    breadcrumb.unshift(current.text);
    current = nodes.value[current.parent];
  }

  return breadcrumb;
}

const selectDepartment = (eventPayload) => {
  Object.values(nodes.value).forEach(node => {
    if (node.state) node.state.selected = false;
  });

  const id = String(eventPayload.id);
  if (nodes.value[id]) {
    nodes.value[id].state.selected = true;
  }

  selectedDeptId.value = id;
  breadcrumb.value = getBreadcrumb();

  emit('selectDept', eventPayload.id);
};

watch(() => props.dtoList, (newData) => {
  if (newData && newData.length) {
    TreeToMap(newData);
  }
}, { immediate: true }); // 최초 호출도 포함

onMounted(() => {
  if (props.initialDeptId) {
    const id = String(props.initialDeptId);
    if (nodes.value[id]) {
      nodes.value[id].state.selected = true;
      selectedDeptId.value = id;
      breadcrumb.value = getBreadcrumb();
    }
    emit('selectDept', props.initialDeptId);
  }
});

</script>

<template>
  <section class="org-tree-section">
    <div class="card slide-in">
      <nav class="breadcrumb">
                <span
                    v-for="(crumb, index) in breadcrumb"
                    :key="index"
                    :class="['breadcrumb-item', { active: index === breadcrumb.length - 1 }]"
                >
                  {{ crumb }}
                  <i
                      v-if="index !== breadcrumb.length - 1"
                      class="fas fa-chevron-right breadcrumb-separator"
                  ></i>
                </span>
      </nav>
      <Tree :nodes="nodes" :config = "config" @node-focus ="selectDepartment"/>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-subtle);
  height: 100%;
}

.card-icon {
  color: var(--blue-400);
  font-size: 1.125rem;
}

.breadcrumb-item {
  color: var(--font-sub);
}

.breadcrumb-item.active {
  color: var(--blue-400);
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  min-height:40px;
  background: var(--blue-50);
  border-radius: 8px;
  font-size: 0.75rem;
}

.breadcrumb-item {
  color: var(--font-sub);
}

.breadcrumb-item.active {
  color: var(--blue-400);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--gray-500);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideInFromLeft 0.8s ease-in-out;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px); /* 왼쪽에서 시작 */
  }
  to {
    opacity: 1;
    transform: translateX(0); /* 원래 위치로 */
  }
}

</style>