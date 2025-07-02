<template>
  <div class="slider-group">
    <!-- 항상 슬라이더 DOM을 렌더하며, disabled 상태에 따라 움직임만 제어 -->
    <div
        ref="slider"
        :key="editable"
        class="slider-container"
        :class="{ disabled: disabled || !editable }"
    ></div>

    <div class="progress-grid">
      <div
          class="progress-item"
          v-for="(val, idx) in segmentValues"
          :key="idx"
      >
        <div class="progress-inner">
          <div class="progress-label">
            <i :class="['fas', icons[idx] || 'fa-circle', 'icon-performance']" />
            <span>{{ labels[idx] || `구간 ${idx + 1}` }}</span>
          </div>
          <span class="weight-badge">{{ val }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

const props = defineProps({
  initial:   { type: Array,  required: true },
  labels:    { type: Array,  default: () => [] },
  icons:     { type: Array,  default: () => [] },
  editable:  { type: Boolean, default: true },
  disabled:  { type: Boolean, default: false }
});

const emit = defineEmits(['update']);

const slider = ref(null);
let sliderInstance = null;
const segmentValues = ref([]);

// 세그먼트 계산 및 핸들 위치 변환 함수 (기존 유지)
function calculateSegments(values) {
  const rounded = values.map((v) => Math.round(v));
  const segments = [];
  for (let i = 0; i < rounded.length; i++) {
    segments.push(i ? rounded[i] - rounded[i - 1] : rounded[0]);
  }
  segments.push(100 - rounded[rounded.length - 1]);
  return segments;
}
function getHandlePositions(segments) {
  const positions = [];
  let sum = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    sum += segments[i];
    positions.push(sum);
  }
  return positions;
}
function buildConnectArray(handleCount) {
  return Array(handleCount + 1).fill(true);
}

function createSlider() {
  if (!slider.value) return;
  if (sliderInstance) {
    sliderInstance.destroy();
    sliderInstance = null;
  }

  const positions = getHandlePositions(props.initial);
  noUiSlider.create(slider.value, {
    start:   positions,
    connect: buildConnectArray(positions.length),
    range:   { min: 0, max: 100 },
    step:    1,
    behaviour: 'drag'
  });
  sliderInstance = slider.value.noUiSlider;

  // 슬라이더 움직임 제한: disabled 또는 !editable 시 pointer-events CSS로 제어
  sliderInstance.on('update', (vals) => {
    const nums = vals.map((v) => parseInt(v, 10));
    const newSegments = calculateSegments(nums);
    segmentValues.value = newSegments;
    emit('update', newSegments);
  });

  segmentValues.value = props.initial;
}

onMounted(() => {
  segmentValues.value = props.initial;
  nextTick(createSlider);
});

watch(
    () => props.initial,
    (nv) => {
      segmentValues.value = nv;
      nextTick(createSlider);
    }
);

watch(
    () => props.editable,
    () => {
      // DOM 재렌더링이 끝난 다음에 슬라이더 생성
      nextTick(createSlider);
    }
);
</script>

<style scoped>
:deep(.noUi-connect) {
  background-color: var(--blue-200);
}
.slider-container {
  margin: 20px 0;
}
.slider-container.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.progress-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 1rem;
}
.progress-item {
  padding: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid #e0d5f9;
  background: var(--gray-50);
}
.progress-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--gray-600);
}
.progress-label i {
  margin-right: 0.5rem;
  font-size: 1rem;
  color: var(--blue-400);
}
.weight-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--gray-700);
  background: var(--basic);
  border: 1px solid var(--gray-300);
}
</style>
