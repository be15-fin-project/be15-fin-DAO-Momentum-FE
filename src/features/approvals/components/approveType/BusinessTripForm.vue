<script setup>
import {computed, onMounted, onBeforeUnmount, ref, watch} from 'vue';
import {getFileUrl} from "@/features/common/api.js";
import {generatePresignedUrl} from "@/features/announcement/api.js";
import {useToast} from "vue-toastification";

/* 파일과 관련된 변수들 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);
const uploadedFile = ref(null);

const toast = useToast();

/* 드롭다운 관련 변수 */
const isDropdownOpen = ref(false);

/* 부모에게 전달 받은 값들 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
});

/* 출장 유형 옵션 */
const typeOptions = [
  { label: '국내 출장', value: 'DOMESTIC' },
  { label: '해외 출장', value: 'INTERNATIONAL' }
]

/* 비용 format */
const formattedCost = computed({
  get() {
    if (props.formData.cost == null || isNaN(props.formData.cost)) return '';
    return Number(props.formData.cost).toLocaleString();
  },
  set(val) {
    // 쉼표 제거 후 숫자로 변환
    const number = Number(val.replaceAll(',', ''));
    props.formData.cost = isNaN(number) ? 0 : number;
  }
});

/* 에러 메세지 변수들 */
const errors = ref({
  type: '',
  place: '',
  startDate: '',
  endDate: '',
  reason: '',
  cost: ''
});

/* 에러 유효성 검증 하기 */
function validateBusinessTripForm() {
  errors.value = {
    type: '',
    place: '',
    startDate: '',
    endDate: '',
    reason: '',
    cost: ''
  };

  if (!props.formData.type) {
    errors.value.type = '※ 출장 유형을 선택하세요.';
  }

  if (!props.formData.place?.trim()) {
    errors.value.place = '※ 출장 장소를 입력하세요.';
  }

  if (!props.formData.startDate) {
    errors.value.startDate = '※ 시작일을 입력하세요.';
  }

  if (!props.formData.endDate) {
    errors.value.endDate = '※ 종료일을 입력하세요.';
  }

  if (
    props.formData.startDate &&
    props.formData.endDate &&
    props.formData.endDate < props.formData.startDate
  ) {
    errors.value.endDate = '※ 종료일은 시작일보다 빠를 수 없습니다.';
  }

  if (!props.formData.reason?.trim()) {
    errors.value.reason = '※ 출장 사유를 입력하세요.';
  }

  if (props.formData.cost < 0) {
    errors.value.cost = '※ 비용은 0원 이상이어야 합니다.';
  }

  return Object.values(errors.value).every(e => !e);
}

watch(
  () => [
    props.formData.type,
    props.formData.place,
    props.formData.startDate,
    props.formData.endDate,
    props.formData.reason,
    props.formData.cost
  ],
  () => {
    validateBusinessTripForm();
  },
  { immediate: true }
);

/* 파일 url을 가져오기 위한 함수 */
async function fetchBusinessTripFile() {
  if (!props.isReadOnly || props.approveFileDTO.length === 0) return;

  file.value = props.approveFileDTO[0];

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
    toast.error("파일 업로드 중 오류가 발생했습니다.");
  }
}

/* 파일 삭제하기 */
function removeFile() {
  uploadedFile.value = null;
  props.formData.file = null;
}

/* 바깥 영역 클릭 시 드롭다운이 사라지게 하기 */
function handleClickOutside() {
  isDropdownOpen.value = false;
}

onMounted(() => {
  fetchBusinessTripFile();
  document.addEventListener('click', handleClickOutside);
  validateBusinessTripForm();
  if (props.formData.cost == null) { // 비용 기본값은 0원으로 설정
    props.formData.cost = 0;
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="form-section">
    <div class="form-grid">

      <!-- 1. 출장 유형 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 유형<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ typeOptions.find(option => option.value === formData.type)?.label || '선택되지 않음' }}
        </div>
        <div v-else class="dropdown-wrapper" @click.stop>
          <button class="dropdown-btn" @click="formData.typeDropdownOpen = !formData.typeDropdownOpen">
            {{ typeOptions.find(option => option.value === formData.type)?.label || '출장 유형 선택' }}
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown" v-if="formData.typeDropdownOpen">
            <button
              v-for="option in typeOptions"
              :key="option.value"
              :class="{ active: formData.type === option.value }"
              @click="formData.type = option.value; formData.typeDropdownOpen = false"
            >
              {{ option.label }}
            </button>
          </div>
          <p v-if="errors.type" class="warning-text">{{ errors.type }}</p>
        </div>
      </div>

      <!-- 2. 출장 장소 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 장소<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.place || '입력 없음' }}
        </div>
        <input v-else type="text" v-model="formData.place" class="form-input" required />
        <p v-if="errors.place" class="warning-text">{{ errors.place }}</p>
      </div>

      <!-- 3. 출장 기간 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">시작일<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.startDate || '입력 없음' }}
          </div>
          <input v-else type="date" v-model="formData.startDate" class="form-input" required />
          <p v-if="errors.startDate" class="warning-text">{{ errors.startDate }}</p>
        </div>
        <div class="form-group">
          <label class="form-label required">종료일<span v-if="!isReadOnly" class="asterisk"> *</span></label>
          <div v-if="isReadOnly" class="readonly-box">
            {{ formData.endDate || '입력 없음' }}
          </div>
          <input v-else type="date" v-model="formData.endDate" class="form-input" required />
          <p v-if="errors.endDate" class="warning-text">{{ errors.endDate }}</p>
        </div>
      </div>

      <!-- 4. 출장 사유 -->
      <div class="form-group full-width">
        <label class="form-label required">출장 사유<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.reason || '입력 없음' }}
        </div>
        <textarea v-else v-model="formData.reason" class="form-textarea" required></textarea>
        <p v-if="errors.reason" class="warning-text">{{ errors.reason }}</p>
      </div>

      <!-- 5. 예상 비용 -->
      <div class="form-group full-width">
        <label class="form-label required">예상 비용 (원)<span v-if="!isReadOnly" class="asterisk"> *</span></label>
        <div v-if="isReadOnly" class="readonly-box">
          {{ formData.cost ? formData.cost.toLocaleString() + ' 원' : '0원' }}
        </div>
        <input
          v-else
          type="text"
          v-model="formattedCost"
          class="form-input"
          required
        />
        <p v-if="errors.cost" class="warning-text">{{ errors.cost }}</p>
      </div>

      <!-- 6. 첨부 파일 -->
      <div class="form-group full-width">
        <label class="form-label">첨부파일</label>
        <div class="readonly-box" v-if="file && signedUrl&&isReadOnly">
<span class="file-link" @click.stop.prevent="handleFileClick">
            <i class="fas fa-download file-icon"></i>
              {{ fileName }}
          </span>
        </div>
        <div class="readonly-box" v-if="isReadOnly && !file">첨부파일 없음</div>

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

.form-input:focus,
.form-textarea:focus,
select.form-input:focus {
  outline: none;
  border-color: var(--purple-50);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.file-link {
  cursor: pointer;
}

.file-icon {
  margin-right: 5px;
  color: var(--blue-100);
}

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  min-height: 54px;
  white-space: pre-wrap;
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

.warning-text {
  margin-top: 5px;
  color: var(--error-500);
  font-size: 0.9rem;
  grid-column: 1 / -1;
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