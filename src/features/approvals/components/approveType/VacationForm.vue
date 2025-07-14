<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { getFileUrl } from "@/features/common/api.js";
import { generatePresignedUrl } from "@/features/announcement/api.js";
import { getRemainDayOff, getRemainRefresh } from "@/features/approvals/api.js";
import {useToast} from "vue-toastification";

/* 파일과 관련된 변수들 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);
const uploadedFile = ref(null);

const toast = useToast();

/* 부모에게 전달 받은 데이터 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: false },
  approveFileDTO: { type: Array, default: () => [] }
});

/* 휴가 종류 매핑하기 위한 부분 */
const vacationTypeOptions = [
  { label: '기타 유급휴가', value: 1, enum: 'PAID_ETC' },
  { label: '기타 무급휴가', value: 2, enum: 'UNPAID_ETC' },
  { label: '연차', value: 3, enum: 'DAYOFF' },
  { label: '오전 반차', value: 4, enum: 'AM_HALF_DAYOFF' },
  { label: '오후 반차', value: 5, enum: 'PM_HALF_DAYOFF' },
  { label: '리프레시 휴가', value: 6, enum: 'REFRESH' },
  { label: '군 소집 훈련', value: 7, enum: 'MILITARY_TRAINING' },
  { label: '경조사', value: 8, enum: 'LIFE_EVENT' }
];

/* 반차인 경우 - 오전 반차, 오후 반차 */
const isHalfDay = computed(() => {
  const typeId = props.formData.vacationTypeId;

  // 오전 반차: 4, 오후 반차: 5
  return typeId === 4 || typeId === 5;
});

/* 오전 반차와 오후 반차 각각 시간 표시하기 */
const halfDayTimeRange = computed(() => {
  const type = props.formData.vacationType;
  const typeId = props.formData.vacationTypeId;

  if (type === 'AM_HALF_DAYOFF' || typeId === 4) return '09:00 ~ 13:30';
  if (type === 'PM_HALF_DAYOFF' || typeId === 5) return '13:30 ~ 18:00';
  return '';
});

/* 에러 메세지*/
const vacationTypeError = ref(null);
const startDateError = ref(null);
const endDateError = ref(null);

/* vacationTypeId 감시 */
watch(() => props.formData.vacationTypeId, (newVal) => {
  vacationTypeError.value = newVal ? '' : '※ 휴가 유형을 선택해주세요.';
}, { immediate: true });

/* startDate 감시 */
watch(() => props.formData.startDate, (newVal) => {
  startDateError.value = newVal ? '' : '※ 시작일을 입력해주세요.';

  // 시작일 변경 시 종료일도 검사 (범위 검증)
  if (
    newVal &&
    props.formData.endDate &&
    props.formData.endDate < newVal
  ) {
    endDateError.value = '※ 종료일은 시작일보다 빠를 수 없습니다.';
  } else if (props.formData.endDate) {
    endDateError.value = '';
  }
}, { immediate: true });

/* endDate 검사 */
watch(() => props.formData.endDate, (newVal) => {
  if (!newVal) {
    endDateError.value = '※ 종료일을 입력해주세요.';
  } else if (
    props.formData.startDate &&
    newVal < props.formData.startDate
  ) {
    endDateError.value = '※ 종료일은 시작일보다 빠를 수 없습니다.';
  } else {
    endDateError.value = '';
  }
}, { immediate: true });

/* 반차인 경우에는 시작 날짜와 끝나는 날짜가 같을 수 있게 설정 */
watch(
  () => props.formData.startDate,
  (newStart) => {
    if (isHalfDay.value && newStart) {
      props.formData.endDate = newStart;
    }
  }
);

/* 잔여 연차와 리프레시 휴가 변수 */
const remainDayOff = ref(null);
const remainRefresh = ref(null);

const requestedDays = computed(() => {
  if (isHalfDay.value) return 0.5;

  const { startDate, endDate } = props.formData;
  if (!startDate || !endDate) return 0;

  return countWeekdays(startDate, endDate);
});

/* 휴가 수 제한 하기 */
const exceedVacationLimit = computed(() => {
  const typeId = props.formData.vacationTypeId;
  if (!typeId) return false;

  const selected = vacationTypeOptions.find(o => o.value === typeId);
  if (!selected) return false;

  const typeEnum = selected.enum;

  if (typeEnum === 'DAYOFF' && requestedDays.value > remainDayOff.value.replace('일', '') * 1) {
    return '※ 신청 일수가 잔여 연차보다 많습니다.';
  }

  if (typeEnum === 'REFRESH' && requestedDays.value > remainRefresh.value.replace('일', '') * 1) {
    return '※ 신청 일수가 잔여 리프레시 휴가보다 많습니다.';
  }

  return '';
});

/* 평일 수 계산 함수 */
function countWeekdays(start, end) {
  let count = 0;
  const current = new Date(start);

  while (current <= new Date(end)) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/* 잔여 연차와 잔여 리프레시 휴가를 가져오기 */
async function fetchRemainVacation() {
  try {
    const dayOff = await getRemainDayOff();
    const refresh = await getRemainRefresh();

    console.log(dayOff.data.data);
    remainDayOff.value = dayOff.data.data.remainingDayoffHours/8 + '일';
    remainRefresh.value = refresh.data.data.remainingRefreshDays +'일';

  } catch (err) {
    console.error("잔여 휴가 불러오기 실패:", err);
  }
}

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
async function handleFileClick() {
  if (!signedUrl.value || !file.value) return;

  try {
    const response = await fetch(signedUrl.value);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName.value;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("파일 다운로드 실패:", err);
    toast.error('파일 다운로드 중 오류가 발생했습니다.');
  }
}

/* 파일 업로드 하기 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFile.value = file;

  /* 업로드용 presigned url 요청 */
  try {
    const res = await generatePresignedUrl({
      fileName: file.name,
      contentType: file.type,
      prefixType: 'approve'
    });

    const { presignedUrl, s3Key } = res.data.data;

    /* S3 업로드 */
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    /* 첨부파일 정보 저장 */
    props.formData.attachments = [{
      name: file.name,
      s3Key,
      type: file.type.split('/')[1] || ''
    }];

  } catch (err) {
    console.error("파일 업로드 실패:", err);
    toast.error('파일 업로드 중 오류가 발생했습니다.');
  }
}

/* 파일 삭제하기 */
function removeFile() {
  uploadedFile.value = null;
  props.formData.file = null;
}

/* 드롭 다운 관련 요소 */
const showVacationDropdown = ref(false);

function toggleVacationDropdown() {
  showVacationDropdown.value = !showVacationDropdown.value;
}

function selectVacationType(option) {
  props.formData.vacationTypeId = option.value;
  showVacationDropdown.value = false;
}

const selectedVacationLabel = computed(() => {
  return vacationTypeOptions.find(opt => opt.value === props.formData.vacationTypeId)?.label || '휴가 종류를 선택하세요.';
});

onMounted(() => {
  fetchVacationFile();
  fetchRemainVacation();
});
</script>

<template>
  <div class="form-section">
    <!-- 1. 남은 연차, 리프레시 휴가 -->
    <div class="form-grid">
      <div v-if="!isReadOnly" class="form-row">
        <div class="form-group">
          <label class="form-label required">잔여 연차 </label>
          <div class="readonly-box">{{ remainDayOff }}</div>
        </div>

        <div class="form-group">
          <label class="form-label required">잔여 리프레시 휴가</label>
          <div class="readonly-box">{{ remainRefresh }}</div>
        </div>
      </div>

      <!-- 2. 휴가 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 유형<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ vacationTypeOptions.find(o => o.enum === formData.vacationType)?.label || '선택되지 않음' }}
        </div>
        <div v-else class="dropdown-wrapper">
          <button class="dropdown-btn" @click="toggleVacationDropdown">
            {{ selectedVacationLabel }}
            <i class="fas fa-chevron-down icon"></i>
          </button>
          <div class="dropdown" v-if="showVacationDropdown">
            <button
              v-for="option in vacationTypeOptions"
              :key="option.value"
              :class="{ active: formData.vacationTypeId === option.value }"
              @click="selectVacationType(option)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <p v-if="!isReadOnly && vacationTypeError" class="warning-text">{{ vacationTypeError }}</p>
      </div>

      <!-- 3. 휴가 날짜 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">{{ formData.startDate || '입력 없음' }}</div>
          <input v-else type="date" v-model="formData.startDate" class="form-input" required />
         <p v-if="!isReadOnly && startDateError" class="warning-text">{{ startDateError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label required">종료일<span v-if="!isReadOnly"  class="asterisk"> *</span></label>
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
          <p v-if="!isReadOnly && endDateError" class="warning-text">{{ endDateError }}</p>
        </div>
      </div>

      <p v-if="!isReadOnly && exceedVacationLimit" class="warning-text">{{ exceedVacationLimit }}</p>

      <p v-if="halfDayTimeRange" class="info-text">
        ※ 반차 시간대: {{ halfDayTimeRange }}
      </p>

      <!-- 4. 휴가 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">휴가 사유</label>
        <div v-if="isReadOnly" class="readonly-box">{{ formData.reason || '입력 없음' }}</div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required />
      </div>

      <!-- 5. 첨부파일 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl&&isReadOnly">
          <span class="file-link" @click="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-if="isReadOnly">첨부파일 없음</div>

        <div v-if="!isReadOnly" class="upload-wrapper">
          <label class="upload-box">
            <i class="fas fa-upload"></i>
            <span class="upload-text">
              {{ uploadedFile ? uploadedFile.name : '파일을 선택하거나 클릭하세요' }}
            </span>
            <input type="file" @change="handleFileUpload" accept="*/*" hidden />
          </label>

          <div v-if="uploadedFile" class="file-preview">
            <i class="fas fa-paperclip file-icon"></i>
            {{ uploadedFile.name }}
            <i class="fas fa-times remove-icon" @click="removeFile"></i>
          </div>
        </div>
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

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
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

.remove-icon {
  color: var(--blue-100);
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

.upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-box {
  border: 2px dashed var(--gray-200);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.2s ease;
  background-color: #f9fafb;
}

.upload-box i {
  font-size: 1.5rem;
  color: var(--blue-100);
  margin-bottom: 8px;
  display: block;
}

.upload-text {
  font-size: 0.95rem;
  color: var(--gray-600);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--gray-800);
}

.file-icon {
  color: var(--blue-100);
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
