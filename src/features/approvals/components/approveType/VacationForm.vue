<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {getFileUrl} from "@/features/common/api.js";

/* 파일과 관련된 변수들 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);

/* 부모에게 전달 받은 데이터 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false },
  approveFileDTO: { type: Array, default: () => [] }
});

/* 휴가 종류 매핑하기 위한 부분 */
const vacationTypeOptions = [
  { label: '기타 유급휴가', value: 'PAID_ETC' },
  { label: '기타 무급휴가', value: 'UNPAID_ETC' },
  { label: '연차', value: 'DAYOFF' },
  { label: '오전 반차', value: 'AM_HALF_DAYOFF' },
  { label: '오후 반차', value: 'PM_HALF_DAYOFF' },
  { label: '리프레시 휴가', value: 'REFRESH' },
  { label: '군 소집 훈련', value: 'MILITARY_TRAINING' },
  { label: '경조사', value: 'LIFE_EVENT' }
];

/* 반차인 경우 - 오전 반차, 오후 반차 */
const isHalfDay = computed(() =>
  props.formData.vacationType === 'AM_HALF_DAYOFF' ||
  props.formData.vacationType === 'PM_HALF_DAYOFF'
);

/* 오전 반차와 오후 반차 각각 시간 표시하기 */
const halfDayTimeRange = computed(() => {
  if (props.formData.vacationType === 'AM_HALF_DAYOFF') return '09:00 ~ 13:00';
  if (props.formData.vacationType === 'PM_HALF_DAYOFF') return '14:00 ~ 18:00';
  return '';
});

/* 시간 검사 : 끝나는 시간이 시작 시간보다 빠르면 안됨 */
const isInvalidDateRange = computed(() => {
  return !isHalfDay.value &&
    props.formData.startDate &&
    props.formData.endDate &&
    props.formData.endDate < props.formData.startDate;
});


/* 만약 반차인 경우에는 시작 날짜와 끝나는 날짜가 같으므로 이 부분 처리하기 */
watch(() => props.formData.vacationType, (newType) => {
  if (newType === 'AM_HALF_DAYOFF' || newType === 'PM_HALF_DAYOFF') {
    props.formData.endDate = props.formData.startDate;
  }
});

watch(() => props.formData.startDate, (newDate) => {
  if (isHalfDay.value) {
    props.formData.endDate = newDate;
  }
});

/* 파일 url을 가져오기 위한 함수 */
async function fetchVacationFile() {
  if (!props.isReadOnly || props.approveFileDTO.length === 0) return;

  /* 문서는 하나이기 때문에 하나만 가져오게 설정함 */
  file.value = props.approveFileDTO[0];
  console.log(file.value.fileName)

  try {
    const resp = await getFileUrl({
      key: file.value.s3Key,
      fileName: file.value.name
    });

    signedUrl.value = resp.data.data.signedUrl;
    fileName.value = resp.data.data.fileName;

  } catch (err) {
    console.error("파일 서명 URL 불러오기 실패:", err);
    signedUrl.value = null;
  }
}

/* 파일 다운로드 하기 (클릭시 작동) */
function handleFileClick() {
  if (!signedUrl.value || !file.value) return;

  const link = document.createElement("a");
  link.href = signedUrl.value;
  link.download = file.value.originalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(fetchVacationFile);
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 1. 휴가 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 유형</label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ vacationTypeOptions.find(o => o.value === formData.vacationType)?.label || '선택되지 않음' }}
        </div>
        <select v-else v-model="formData.vacationType" class="form-input" required>
          <option disabled value="">선택하세요</option>
          <option v-for="option in vacationTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 2. 휴가 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.startDate || '입력 없음' }}</div>
          <input v-else type="date" v-model="formData.startDate" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label required">종료일</label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.endDate || '입력 없음' }}</div>
          <input
            v-else
            type="date"
            v-model="formData.endDate"
            class="form-input"
            :readonly="isHalfDay"
            :disabled="isHalfDay"
            required
          />
        </div>
      </div>

      <!-- 반차 시간대 -->
      <p v-if="isHalfDay && !isReadOnly" class="info-text">
        ※ 반차 시간대: {{ halfDayTimeRange }}
      </p>

      <!-- 날짜 오류 -->
      <p v-if="isInvalidDateRange && !isReadOnly" class="warning-text">
        ※ 종료일은 시작일보다 빠를 수 없습니다.
      </p>

      <!-- 3. 휴가 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 사유</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required />
      </div>

      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl">
          <span class="file-link" @click="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-else>첨부파일 없음</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
<style scoped>
.form-section {
  margin-bottom: 40px;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.form-input,
.form-textarea,
select.form-input {
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
.form-textarea:focus,
select.form-input:focus {
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

.file-link {
  cursor: pointer;
}

.file-icon {
  margin-right: 5px;
  color: var(--blue-100);
}

.warning-text {
  color: var(--error-500);
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}

.info-text {
  color: var(--blue-300);
  font-size: 0.9rem;
  margin-top: -12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
}
</style>
