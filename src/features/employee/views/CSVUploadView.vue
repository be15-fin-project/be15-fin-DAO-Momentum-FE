<template>
  <main>
    <HeaderWithTabs :headerItems="[
        { label: 'CSV 등록', to: '/employees/csv', event: 'click', active: true },
    ]"
        :submitButtons="[{ label: '뒤로 가기', icon: 'fa-arrow-left', event:'click', value: 'back', variant: 'white' }]"
        :showTabs="false"
        @click="handleClick"
    />

    <section class="csv-upload-layout">
      <!-- 좌측 영역 -->
      <div class="left-panel">
        <FieldCard
            title="필수 입력 항목"
            layout="two-column"
            :fields="requiredFields"
        />
        <FieldCard
            title="선택 입력 항목 (미입력 시 기본값 적용)"
            layout="two-column"
            :fields="optionalFields"
        />
        <NoticeCard :title="'기본값 안내'" :notices="csvDefaults"/>
      </div>

      <!-- 우측 영역 -->
      <div class="right-panel">
        <DownloadCard @download="downloadTemplate"/>
        <UploadCard
            :file="file"
            :fileName="fileName"
            :fileSize="fileSize"
            :uploading="uploading"
            @select-file="handleFile"
            @remove-file="removeFile"
            @start-upload="uploadCSV"
        />
        <NoticeCard
            :icon="'fa-exclamation-triangle'"
            :title="'주의사항'"
            :notices="csvNotices"
        />
      </div>
    </section>
  </main>
</template>

<script setup>
import {ref} from 'vue'
import FieldCard from '@/features/employee/components/FieldCard.vue'
import NoticeCard from '@/features/employee/components/NoticeCard.vue'
import DownloadCard from '@/features/employee/components/DownloadCard.vue'
import UploadCard from '@/features/employee/components/UploadCard.vue'
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue"

import {createEmployees, getCSVTemplate} from '@/features/employee/api'
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";

const router = useRouter()

const toast = useToast();
const file = ref(null)
const fileName = ref('')
const fileSize = ref('')
const uploading = ref(false)
// const uploadProgress = ref(0)

const requiredFields = [
  {key: 'name', icon: 'fa-user', type: 'input', label: '이름', placeholder: '사원 이름', required: true},
  {key: 'email', icon: 'fa-envelope', label: '이메일', placeholder: 'gildong@example.com', required: true},
  {key: 'position', icon: 'fa-star', label: '직위', placeholder: '시스템에 등록된 직위명', required: true},
  {key: 'birthDate', icon: 'fa-birthday-cake', label: '생년월일', placeholder: 'YYYY-MM-DD', required: true},
  {key: 'phone', icon: 'fa-phone', label: '연락처', placeholder: '010-0000-0000', required: true},
  {key: 'address', icon: 'fa-map-marker-alt', label: '주소', placeholder: '거주지 주소 (도로명 주소)', required: true},
  {key: 'gender', icon: 'fa-map-marker-alt', label: '성별', placeholder: 'M 또는 F (남성, 여성)', required: true},
]

const optionalFields = [
  {key: 'empNo', icon: 'fa-id-badge', label: '사번', placeholder: '사번'},
  {key: 'department', icon: 'fa-building', label: '부서', placeholder: '시스템에 등록된 부서명'},
  {key: 'status', icon: 'fa-building', label: '재직 상태', placeholder: '재직, 휴직, 퇴사 중 하나'},
  {key: 'hireDate', icon: 'fa-calendar', label: '입사일', placeholder: 'YYYY-MM-DD'},
  {key: 'dayoff', icon: 'fa-clock', label: '부여 연차 시간 (예: 15일 -> 120)', placeholder: '숫자 입력'},
  {key: 'refresh', icon: 'fa-parasol', label: '부여 리프레시 휴가 일수', placeholder: '숫자 입력'},
]

const csvDefaults = [
  {icon: 'fa-info-circle', color: 'blue', text: '사번: 시스템 계산값'},
  {icon: 'fa-info-circle', color: 'blue', text: '부서: 없음'},
  {icon: 'fa-info-circle', color: 'blue', text: '재직 상태: 재직'},
  {icon: 'fa-info-circle', color: 'blue', text: '입사일: CSV 등록일'},
  {icon: 'fa-info-circle', color: 'blue', text: '부여 연차 시간: 입사일에 따른 자동 계산값 (근로기준법 상 최솟값)'},
  {icon: 'fa-info-circle', color: 'blue', text: '부여 리프레시 휴가 일수: 입사일에 따른 자동 계산값 (회사 정책에 따라 자동 계산)'},
  {icon: 'fa-shield-alt', color: 'gray', text: '리프레시 휴가 일수: 3년차 3일, 5년차 5일, 10년차 10일, 그 외 0일'}
]

const csvNotices = [
  {icon: 'fa-check-circle', color: 'green', text: '엑셀에서 CSV 양식 파일 수정 후 바로 저장하면 데이터가 깨질 수 있습니다. "다른 이름으로 저장"하세요.'},
  {icon: 'fa-check-circle', color: 'green', text: '파일 형식: "CSV UTF-8(쉼표로 분리)"'},
  {icon: 'fa-check-circle', color: 'green', text: 'CSV 양식 파일의 헤더와 값 입력 순서가 일치해야 합니다.'},
  {icon: 'fa-check-circle', color: 'green', text: '주어진 입력 양식을 지키지 않으면 업로드가 불가능합니다.'}
]

function handleFile(f) {
  if (!f || !f.name?.endsWith('.csv')) {
    toast.error('CSV 파일만 업로드 가능합니다.')
    return
  }

  file.value = f
  fileName.value = f.name
  fileSize.value = formatFileSize(f.size)
}

function removeFile() {
  file.value = null
  fileName.value = ''
  fileSize.value = ''
  // uploadProgress.value = 0
}

async function uploadCSV() {
  if (!file.value || uploading.value) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file.value)

  try {
    await createEmployees(formData)
    toast.success('CSV 파일이 성공적으로 업로드되었습니다!')
    removeFile()
  } catch (err) {
    toast.error('업로드 중 오류가 발생했습니다.')
  } finally {
    uploading.value = false
  }
}

function formatFileSize(bytes) {
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

async function downloadTemplate() {
  try {
    const resp = await getCSVTemplate()
    const signedUrl = resp.signedUrl
    const fileName = resp.fileName

    const link = document.createElement('a')
    link.href = signedUrl
    link.download = fileName
    link.click()
  } catch (e) {
    toast.error('CSV 템플릿 다운로드에 실패했습니다.')
    console.error(e)
  }
}

function handleClick(event) {
  if (event.value === 'back') {
    router.push('/employees')
  }
}
</script>

<style scoped>
.csv-upload-layout {
  display: grid;
  grid-template-columns: 11fr 9fr;
  gap: 32px;
  padding: 0 40px;
  margin-top: 32px;
  margin-bottom: 48px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 반응형 */
@media (max-width: 1024px) {
  .csv-upload-layout {
    grid-template-columns: 1fr;
  }
}
</style>
