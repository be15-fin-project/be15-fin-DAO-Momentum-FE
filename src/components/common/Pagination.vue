<template>
  <div class="pagination-wrapper">
    <button class="nav-btn" @click="prevPage">&lt;</button>
    <div class="slider-pagination" ref="pagination">
      <div class="slider-track" :style="{ left: trackLeft + 'px' }"></div>
      <template v-for="(page, index) in visiblePages" :key="index">
        <span v-if="page === '...'" class="ellipsis">...</span>
        <button
            v-else
            class="page-btn"
            :class="{ active: modelValue === page }"
            @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </template>
    </div>
    <button class="nav-btn" @click="nextPage">&gt;</button>
  </div>

</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';

const props = defineProps({
  totalPages: {
    type: Number,
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

// 페이지 배열 계산
const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.modelValue;
  const delta = 2;

  if (total <= 10) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  pages.push(1); // 항상 첫 페이지

  let left = current - delta;
  let right = current + delta;

  if (left <= 2) {
    left = 2;
    right = left + 4;
  }
  if (right >= total - 1) {
    right = total - 1;
    left = right - 4;
  }

  if (left > 2) {
    pages.push('...');
  }

  for (let i = left; i <= right; i++) {
    if (i > 1 && i < total) {
      pages.push(i);
    }
  }

  if (right < total - 1) {
    pages.push('...');
  }

  if (total > 1) {
    pages.push(total); // 항상 마지막 페이지
  }

  return pages;
});


const updateSliderPosition = () => {
  nextTick(() => {
    const buttons = pagination.value?.querySelectorAll('.page-btn') || [];
    let activeIndex = 0;

    for (let i = 0; i < visiblePages.value.length; i++) {
      const p = visiblePages.value[i];
      if (p === '...') continue;
      if (p === props.modelValue) break;
      activeIndex++;
    }

    const activeBtn = buttons[activeIndex];
    if (!activeBtn || !pagination.value) return;

    const containerRect = pagination.value.getBoundingClientRect();
    const activeRect = activeBtn.getBoundingClientRect();

    const zoom = 0.8; // 전체 페이지에 적용된 zoom 값
    const trackWidth = 50;

    //  zoom 비율 보정
    const left = ((activeRect.left - containerRect.left) / zoom) + (activeRect.width / 2 / zoom) - (trackWidth / 2);

    trackLeft.value = left;
  });
};


const goToPage = (page) => {
  if (page === '...') return;
  emit('update:modelValue', page);
};

const prevPage = () => {
  if (props.modelValue > 1) emit('update:modelValue', props.modelValue - 1);
};

const nextPage = () => {
  if (props.modelValue < props.totalPages) emit('update:modelValue', props.modelValue + 1);
};

watch(() => props.modelValue, updateSliderPosition);
watch(() => props.totalPages, updateSliderPosition);

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
  border-radius: var(--radius-xl);
  padding: 12px 20px;
  display: flex;
  gap: 10px;
}

.page-btn {
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-size: 1rem;
  border-radius: var(--radius-xl);
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
.ellipsis {
  padding: 10px 12px;
  color: #aaa;
  user-select: none;
}

</style>
