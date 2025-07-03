<!-- src/components/common/Filter.vue -->
<template>
  <div class="filter-group">

    <div v-if="tabs?.length" class="tabs">
      <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: localValues[tab.key] === tab.value }"
          @click="selectTab(tab.key, tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
        class="filter-box"
        v-for="(filter, index) in filters"
        :key="index"
    >
      <button class="filter-btn" @click.stop="toggleDropdown(index)">
        <i :class="['fas', filter.icon, 'icon']"></i>
        <span>{{ filter.label }}</span>
        <i class="fas fa-chevron-down icon"></i>
      </button>

      <div class="dropdown" v-show="activeDropdown === index">
        <template v-if="filter.type === 'input'">
          <input
              type="text"
              class="filter-input"
              :placeholder="filter.placeholder"
              v-model="localValues[filter.key]"
              @input="emitChange"
              @keyup.enter="handleInputEnter(index)"
              style="width: 100%; padding: 8px 12px; border: none;"
          />
        </template>
        <template v-if="filter.type === 'tree'">
          <div class="tree-dropdown">
            <TreeNode
                v-for="node in filter.options"
                :key="node.deptId"
                :node="node"
                :selected-id="localValues[filter.key]"
                :depth="0"
                @select="(id) => selectOption(filter.key, id)"
            />
          </div>
        </template>
        <template v-if="filter.type === 'date-range'">
          <div class="date-range">
            <label>시작일</label>
            <input
                type="date"
                class="filter-input"
                v-model="localValues[filter.key + '_start']"
                @input="emitChange"
            />
            <label style="margin-top: 8px;">종료일</label>
            <input
                type="date"
                class="filter-input"
                v-model="localValues[filter.key + '_end']"
                @input="emitChange"
            />
          </div>
        </template>
        <template v-if="filter.type === 'select'">
          <button
              v-for="option in filter.options"
              :key="typeof option === 'object' ? option.value : option"
              :class="{ active: String(localValues[filter.key]) === String(option) }"
              @click="selectOption(filter.key, option)"
          >
            {{ typeof option === 'object' ? option.label : option }}
          </button>
        </template>

        <template v-else-if="filter.type !== 'input' && filter.type !== 'date-range' && filter.type !== 'tree'">
          <button
              v-for="option in filter.options"
              :key="typeof option === 'object' ? option.value : option"
              :class="{ active: String(localValues[filter.key]) === String(option) }"
              @click="selectOption(filter.key, option)"
          >
            {{ typeof option === 'object' ? option.label : option }}
          </button>
        </template>


      </div>
    </div>

    <button class="filter-btn" @click="handleSearchClick">
      <i class="fas fa-search icon"></i>
      <span>검색</span>
    </button>

    <button class="filter-btn" @click="handleResetClick">
      <i class="fas fa-rotate-left icon"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import TreeNode from "@/components/common/TreeNode.vue";

const props = defineProps({
  filters: Array,
  tabs: Array,
  modelValue: Object,
});
const emit = defineEmits(['update:modelValue', 'search']);

const localValues = ref({});
watch(
    () => props.modelValue,
    (newVal) => {
      localValues.value = { ...newVal };
    },
    { immediate: true } // mount 시에도 바로 초기값 반영
);
const activeDropdown = ref(null);

function toggleDropdown(index) {
  activeDropdown.value = activeDropdown.value === index ? null : index;
}

function selectTab(key, value) {
  localValues.value[key] = value;
  emit('update:modelValue', { ...localValues.value }); // v-model 반영
  emit('search', { ...localValues.value }); // 검색 트리거
}

// function selectOption(key, value) {
//   localValues.value = {
//     ...localValues.value,
//     [key]: value,
//   };
//   emit('update:modelValue', { ...localValues.value });
//   activeDropdown.value = null;
// }

function selectOption(key, option) {
  const value = typeof option === 'object' && option !== null && 'value' in option
      ? option.value
      : option;

  localValues.value[key] = value;
  emit('update:modelValue', { ...localValues.value });
  emitChange();
  activeDropdown.value = null;
}

function emitChange() {
  emit('update:modelValue', { ...localValues.value });
}

watch(() => props.modelValue, (newVal) => {
  localValues.value = { ...newVal };
});

function handleClickOutside(e) {
  if (!e.target.closest('.filter-box')) {
    activeDropdown.value = null;
  }
}

function handleInputEnter(index) {
  emit('update:modelValue', { ...localValues.value }); // 값 저장
  activeDropdown.value = null; // 드롭다운 닫기
}

function handleSearchClick() {
  emit('update:modelValue', { ...localValues.value }); // modelValue 강제 동기화
  emit('search', { ...localValues.value });
}

function handleResetClick() {
  // 초기값 재설정
  localValues.value = {};
  emit('update:modelValue', {}); // 부모 컴포넌트에도 반영
  emit('search', {}); // 바로 검색도 실행 (필요 없다면 이 줄 제거)
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

</script>

<style scoped>
/* From the first HTML */
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 40px 0 3rem;
}

.filter-box {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--color-muted);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-sub);
  cursor: pointer;
}

.filter-btn:hover {
  background-color: var(--color-background);
}

/* 탭 */
.tabs {
  display: flex;
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--gray-300);
}
.tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-surface);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
}
.tabs button.active {
  background: var(--blue-400);
  border-radius: var(--radius-lg);
  color: var(--color-surface);
  border-color: var(--blue-200);
}

/* 드롭다운 */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 160px;
  background: var(--color-surface);
  border: 1px solid var(--color-muted);
  border-radius: var(--radius-ss);
  box-shadow: var(--dropdown-shadow);
  margin-top: 4px;
}

.dropdown.show {
  display: block;
}

.dropdown button {
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  background: none;
  color: var(--color-text-sub);
  cursor: pointer;
}

.dropdown button:hover {
  background-color: var(--color-muted-light);
}

.dropdown button.active {
  background-color: var(--blue-100);
  color: var(--gray-900);
  font-weight: 600;
}


.icon {
  color: var(--gray-500);
}

/* 입력형 필터 (사번, 이름, 날짜) */
.filter-box input.filter-input,
.filter-box select.filter-input {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  border: 1px solid var(--color-muted);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--gray-700);
  min-width: 140px;
  height: 38px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-box input.filter-input:focus,
.filter-box select.filter-input:focus {
  outline: none;
  border-color: var(--blue-300);
  box-shadow: var(--filter-shadow);
}

/* 날짜 필터 간 간격 조정 */
.filter-box input[type="date"].filter-input {
  width: 130px;
  margin: 0 4px;
}
.date-range {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
}

/* 셀렉트 드롭다운용 화살표 아이콘 유지 */
.filter-box select.filter-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px 16px;
  padding-right: 36px;
  cursor: pointer;
}

/* 반응형 대응 */
@media (max-width: 768px) {
  .filter-box input.filter-input,
  .filter-box select.filter-input {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
}

</style>
