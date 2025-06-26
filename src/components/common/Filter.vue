<!-- src/components/common/Filter.vue -->
<template>
  <div class="filter-group">
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
              style="width: 100%; padding: 8px 12px; border: none;"
          />
        </template>
        <template v-else>
          <button
              v-for="option in filter.options"
              :key="option"
              @click="selectOption(filter.key, option)"
          >
            {{ option }}
          </button>
        </template>
      </div>
    </div>

    <button class="filter-btn" @click="$emit('search', localValues)">
      <i class="fas fa-search icon"></i>
      <span>검색</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  filters: Array,
  modelValue: Object,
});
const emit = defineEmits(['update:modelValue', 'search']);

const localValues = ref({ ...props.modelValue });
const activeDropdown = ref(null);

function toggleDropdown(index) {
  activeDropdown.value = activeDropdown.value === index ? null : index;
}

function selectOption(key, value) {
  localValues.value[key] = value;
  emitChange();
}

function emitChange() {
  emit('update:modelValue', { ...localValues.value });
}

watch(() => props.modelValue, (newVal) => {
  localValues.value = { ...newVal };
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #f9fafb;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 160px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
  color: #374151;
  cursor: pointer;
}

.dropdown button:hover {
  background-color: #f3f4f6;
}

.icon {
  color: #6b7280;
}

/* 입력형 필터 (사번, 이름, 날짜) */
.filter-box input.filter-input,
.filter-box select.filter-input {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  min-width: 140px;
  height: 38px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-box input.filter-input:focus,
.filter-box select.filter-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

/* 날짜 필터 간 간격 조정 */
.filter-box input[type="date"].filter-input {
  width: 130px;
  margin: 0 4px;
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
