<template>
  <div class="pagination-wrapper">
    <button class="nav-btn" @click="prevPage">&lt;</button>
    <div class="slider-pagination" ref="pagination">
      <div class="slider-track" :style="{ left: trackLeft + 'px' }"></div>
      <button
          v-for="(page, index) in pages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(index)"
      >
        {{ page }}
      </button>
    </div>
    <button class="nav-btn" @click="nextPage">&gt;</button>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const pages = [1, 2, 3, 4, 5];
const currentPage = ref(3);
const trackLeft = ref(0);
const pagination = ref(null);

const updateSliderPosition = () => {
  nextTick(() => {
    const buttons = pagination.value.querySelectorAll('.page-btn');
    const activeBtn = buttons[currentPage.value - 1];
    const containerRect = pagination.value.getBoundingClientRect();
    const activeRect = activeBtn.getBoundingClientRect();
    const left = activeRect.left - containerRect.left + activeRect.width / 2 - 25;
    trackLeft.value = left;
  });
};

const goToPage = (index) => {
  currentPage.value = pages[index];
  updateSliderPosition();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    updateSliderPosition();
  }
};

const nextPage = () => {
  if (currentPage.value < pages.length) {
    currentPage.value++;
    updateSliderPosition();
  }
};

onMounted(() => {
  updateSliderPosition();
  window.addEventListener('resize', updateSliderPosition);
});
</script>

<style scoped>
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
