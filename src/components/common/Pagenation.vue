<template>
  <div class="pagination-wrapper">
    <button class="nav-btn" @click="prevPage">&lt;</button>
    <div class="slider-pagination" ref="pagination">
      <div class="slider-track" :style="{ left: trackLeft + 'px' }"></div>
      <button
          v-for="(page, index) in pages"
          :key="page"
          class="page-btn"
          :class="{ active: modelValue === page }"
          @click="goToPage(index)"
      >
        {{ page }}
      </button>
    </div>
    <button class="nav-btn" @click="nextPage">&gt;</button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  pages: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['update:modelValue']);

const trackLeft = ref(0);
const pagination = ref(null);

const updateSliderPosition = () => {
  nextTick(() => {
    const buttons = pagination.value?.querySelectorAll('.page-btn') || [];
    const activeIndex = props.pages.findIndex((p) => p === props.modelValue);
    const activeBtn = buttons[activeIndex];
    if (!activeBtn) return;

    const containerRect = pagination.value.getBoundingClientRect();
    const activeRect = activeBtn.getBoundingClientRect();
    const left = activeRect.left - containerRect.left + activeRect.width / 2 - 25;
    trackLeft.value = left;
  });
};

const goToPage = (index) => {
  emit('update:modelValue', props.pages[index]);
};

const prevPage = () => {
  const idx = props.pages.findIndex((p) => p === props.modelValue);
  if (idx > 0) emit('update:modelValue', props.pages[idx - 1]);
};

const nextPage = () => {
  const idx = props.pages.findIndex((p) => p === props.modelValue);
  if (idx < props.pages.length - 1) emit('update:modelValue', props.pages[idx + 1]);
};

watch(() => props.modelValue, updateSliderPosition);
watch(() => props.pages, updateSliderPosition);

onMounted(() => {
  updateSliderPosition();
  window.addEventListener('resize', updateSliderPosition);
});
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.slider-pagination {
  position: relative;
  border-radius: 40px;
  padding: 12px 20px;
  display: flex;
  gap: 10px;
}

.page-btn {
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  z-index: 2;
  position: relative;
  transition: 0.3s ease;
}

.page-btn.active {
  font-weight: bold;
  color: var(--label-color);
}

.slider-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 50px;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-lg);
  transition: left 0.4s ease;
  z-index: 1;
}

.nav-btn {
  background-color: transparent;
  border: none;
  padding: 10px 14px;
  font-size: 1.1rem;
  border-radius: var(--card-radius);
  cursor: pointer;
  transition: background 0.3s ease;
}

.nav-btn:hover {
  background: var(--blue-50);
  box-shadow: var(--shadow-lg);
}
</style>
