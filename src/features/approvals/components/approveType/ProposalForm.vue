<script setup>
import { getFileUrl } from "@/features/common/api.js";
import { ref, onMounted } from "vue";

/* 부모에게 받아온 데이터 */
const props = defineProps({
  formData: { type: Object, required: true },
  isReadOnly: { type: Boolean, default: true },
  approveFileDTO: { type: Array, default: () => [] }
});

/* 파일과 관련된 변수 */
const file = ref(null);
const signedUrl = ref(null);
const fileName = ref(null);

/* 파일 url 가져오기 */
async function fetchProposalFile() {
  if (!props.isReadOnly || props.approveFileDTO.length === 0) return;

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

/* 파일 다운하기  */
function handleFileClick() {
  if (!signedUrl.value || !file.value) return;

  const link = document.createElement("a");
  link.href = signedUrl.value;
  link.download = file.value.originalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(fetchProposalFile);
</script>

<template>
  <div class="form-section">
    <div class="form-grid">
      <!-- 1. 첨부파일 -->
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

      <!-- 2. 품의 내역 -->
      <div class="form-group full-width">
        <label class="form-label required">품의 내역</label>
        <div class="readonly-box">
          {{ formData.content || "내용 없음" }}
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

.readonly-box {
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--gray-800);
  min-height: 54px;
  white-space: pre-wrap;
}

.file-link {
  cursor: pointer;
}

.file-icon {
  margin-right: 5px;
  color: var(--blue-100);
}
</style>