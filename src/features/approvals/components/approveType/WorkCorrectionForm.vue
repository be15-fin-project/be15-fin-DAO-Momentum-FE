<script setup>
import { getMyWorks } from "@/features/works/api.js";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import { useRoute } from 'vue-router';

const route = useRoute();

/* 일 목록 가져오는 변수 */
const workList = ref([]);
const selectedWorkId = ref("");

/* 드롭다운 상태 */
const showWorkDropdown = ref(false);
const dropdownRef = ref(null); // 드롭다운 감지용

/* 유효성 에러 메시지 */
const errors = ref({
  workId: '',
  time: '',
  reason: ''
});

/* 변경되는 시간 */
const startTime = ref('');
const endTime = ref('');
const fixedDate = ref(''); // YYYY-MM-DD 형태

/* 오늘부터 2주일 전까지만 조회하게 설정 */
const today = new Date();
const oneWeekAgo = new Date();
oneWeekAgo.setDate(today.getDate() - 14);

/* 부모에게서 받아온 값*/
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false }
})

/* 선택된 근무 항목의 라벨 */
const selectedWorkLabel = computed(() => {
  const selected = workList.value.find(w => w.workId === selectedWorkId.value);
  return selected ? `${selected.startAt.replace('T', ' ')} ~ ${selected.endAt.replace('T', ' ')}` : '기존 출근 정보를 선택하세요.';
});

/* 날짜를 조회할 때 'T' 제외 하기 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/* 기존 근무 선택 변경 시 처리*/
watch(selectedWorkId, (id) => {
  if (!id) return;

  const selectedWork = workList.value.find(w => w.workId === id);
  if (selectedWork) {
    const date = selectedWork.startAt.split('T')[0];
    fixedDate.value = date;
    updateBeforeTimes(selectedWork);
  }
});

// 날짜 + 시간 합쳐서 formData 반영
watch([startTime, endTime, fixedDate], () => {
  if (startTime.value && fixedDate.value)
    props.formData.afterStartAt = `${fixedDate.value}T${startTime.value}`;

  if (endTime.value && fixedDate.value)
    props.formData.afterEndAt = `${fixedDate.value}T${endTime.value}`;
});

/* 유효성 검사 */
watch([startTime, endTime, selectedWorkId, () => props.formData.reason], () => {
  validateForm();
});

function validateForm() {
  errors.value = { workId: '', time: '', reason: '' };

  if (!startTime.value || !endTime.value) {
    errors.value.time = '※ 출근 시간과 퇴근 시간을 모두 입력해주세요.';
  } else if (startTime.value >= endTime.value) {
    errors.value.time = '※ 퇴근 시간은 출근 시간보다 늦어야 합니다.';
  }

  if (!props.formData.reason?.trim()) {
    errors.value.reason = '※ 출퇴근 정정 사유를 입력해주세요.';
  }

  return !errors.value.workId && !errors.value.time && !errors.value.reason;
}

/* 드롭다운에서 바깥 영역을 클릭 시 닫힐 수 있게 설정 */
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showWorkDropdown.value = false;
  }
}

/* 사원의 근무 목록 불러오기 */
async function fetchMyWorks() {
  try {

    const payload = {
      rangeStartDate: formatDate(oneWeekAgo),
      rangeEndDate: formatDate(today)
    };

    const res = await getMyWorks(payload);
    const works = res?.works || [];

    workList.value = works;

    // 1. route에 workId 쿼리 파라미터가 있을 경우 
    const passedWorkId = route.query.workId;
    const foundByQuery = works.find(w => String(w.workId) === String(passedWorkId));

    if (foundByQuery) {
      selectedWorkId.value = foundByQuery.workId;
      updateBeforeTimes(foundByQuery);
      fixedDate.value = foundByQuery.startAt.split('T')[0];
    }

    // 2. 수정 모드일 경우: beforeStartAt과 beforeEndAt이 일치하는 work 찾기
    if (!selectedWorkId.value && props.formData.beforeStartAt) {
      const matched = works.find(w =>
        w.startAt === props.formData.beforeStartAt &&
        w.endAt === props.formData.beforeEndAt
      );

      if (matched) {
        selectedWorkId.value = matched.workId;
        fixedDate.value = matched.startAt.split('T')[0];
      }

      if (props.formData.afterStartAt) {
        const [date, time] = props.formData.afterStartAt.split('T');
        fixedDate.value = date;
        startTime.value = time;
      }

      if (props.formData.afterEndAt) {
        endTime.value = props.formData.afterEndAt.split('T')[1];
      }
    }

  } catch (e) {
    console.error('근무 정보를 불러오는데 오류가 발생했습니다.', e)
  }
}

/* 이전 시간을 업데이트 하는 로직 */
function updateBeforeTimes(work) {
  props.formData.workId = selectedWorkId.value;
  props.formData.beforeStartAt = work.startAt;
  props.formData.beforeEndAt = work.endAt;
}

/* 드롭다운 내부에서 선택 시 처리 */
function selectWork(workId) {
  selectedWorkId.value = workId;
  showWorkDropdown.value = false;
}

/* 마운트 되는 시점에 가져오기 */
onMounted(() => {
  fetchMyWorks();
  validateForm();
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 1. 기존 출퇴근 -->
      <div v-if="!isReadOnly" class="form-row">
        <div class="form-group full-width">
          <label class="form-label required">기존 근무<span class="asterisk"> *</span></label>
          <div class="dropdown-wrapper" ref="dropdownRef">
            <button class="dropdown-btn" @click="showWorkDropdown = !showWorkDropdown">
              {{ selectedWorkLabel }}
              <i class="fas fa-chevron-down icon"></i>
            </button>
            <div class="dropdown" v-if="showWorkDropdown">
              <button
                v-for="work in workList"
                :key="work.workId"
                @click="selectWork(work.workId)"
                :class="{ active: selectedWorkId === work.workId }"
              >
                {{ work.startAt.replace('T', ' ') }} ~ {{ work.endAt.replace('T', ' ') }}
              </button>
            </div>
          </div>
        </div>
        <p class="info-text">※ 14일 이내 출퇴근 기록만 수정할 수 있습니다. </p>
      </div>
      <div v-else class="form-row">
        <div class="form-group">
          <label class="form-label required">기존 출근 일시<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
          <div class="readonly-box">
            {{ formData.beforeStartAt.replace('T', ' ') || '입력 없음' }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label required">기존 퇴근 일시<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
          <div class="readonly-box">
            {{ formData.beforeEndAt.replace('T', ' ') || '입력 없음' }}
          </div>
        </div>
      </div>

      <!-- 2. 수정 출근 / 퇴근 일시 -->
      <div class="form-row">
        <!-- 수정 출근 -->
        <div class="form-group">
          <label class="form-label required">수정 출근 일시<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.afterStartAt.replace('T', ' ') || '입력 없음' }}
          </div>
          <div v-else class="time-picker-wrapper">
            <input
              class="form-input"
              type="date"
              :value="fixedDate"
              disabled
            />
            <input
              class="form-input"
              type="time"
              v-model="startTime"
              required
            />
          </div>
          <p v-if="!isReadOnly && errors.time" class="warning-text">{{ errors.time }}</p>
        </div>

        <!-- 수정 퇴근 -->
        <div class="form-group">
          <label class="form-label required">수정 퇴근 일시<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.afterEndAt.replace('T', ' ') || '입력 없음' }}
          </div>
          <div v-else class="time-picker-wrapper">
            <input
              class="form-input"
              type="date"
              :value="fixedDate"
              disabled
            />
            <input
              class="form-input"
              type="time"
              v-model="endTime"
              required
            />
          </div>
        </div>
      </div>

      <!-- 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">출퇴근 정정 사유<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.reason || '입력 없음' }}
        </div>
        <textarea
          v-else
          v-model="formData.reason"
          class="form-textarea"
          required
        ></textarea>
        <p v-if="errors.reason" class="warning-text">{{ errors.reason }}</p>

      </div>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  margin-bottom: 40px;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-input,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  white-space: pre-wrap;
  min-height: 44px;
}

.warning-text,.info-text {
  font-size: 0.9rem;
  grid-column: 1 / -1;
}

.warning-text {
  margin-top: 5px;
  color: var(--error-500);
}

.info-text {
  margin-top: -12px;
  color: var(--blue-300);
}

.time-picker-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.time-picker-wrapper .form-input[type="date"],
.time-picker-wrapper .form-input[type="time"] {
  max-width: 140px;
  width: 100%;
  min-width: 0;
}

.asterisk {
  color: var(--error);
  margin-left: 4px;
}

.dropdown-wrapper {
  position: relative;
}

.dropdown-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--gray-800);
  cursor: pointer;
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  width: 100%;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.dropdown button {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  font-size: 0.95rem;
  border: none;
  background: none;
  color: var(--gray-800);
  cursor: pointer;
}
.dropdown button:hover,
.dropdown button.active {
  background-color: var(--blue-100);
  font-weight: 600;
}
</style>