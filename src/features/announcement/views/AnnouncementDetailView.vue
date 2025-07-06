<template>
  <main class="main">
    <div class="main-section">
      <div class="main-header">
        <div class="header-area">
          <div class="page-header">
            <h1 class="page-title active">공지 사항 상세</h1>
          </div>
          <div class="header-buttons">
            <button class="btn btn-secondary" @click="goBack">
              <i class="fas fa-list"></i>
              목록으로
            </button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="form-card" v-if="detail">
          <!-- 작성자 정보 카드 -->
          <div class="form-group author-card relative">
            <div class="author-header">
              <div class="author-title">
                <i class="fas fa-user-circle"></i>
                <span>작성자 정보</span>
              </div>

              <!-- 수정/삭제 토글 버튼 -->
              <div v-if="canEditOrDelete" class="action-toggle-wrapper">
                <button class="btn-action-toggle" @click="toggleActions">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div v-if="showActions" class="action-menu" ref="actionMenuRef">
                  <button class="action-item btn-edit" @click="handleEdit">공지 수정</button>
                  <button class="action-item btn-delete" @click="handleDelete">공지 삭제</button>
                </div>
              </div>
            </div>

            <div class="author-grid">
              <div class="author-item">
                <div class="label">이름</div>
                <div class="value">{{ detail.employeeName }}</div>
              </div>
              <div class="author-item">
                <div class="label">소속</div>
                <div class="value">{{ detail.departmentName }}</div>
              </div>
              <div class="author-item">
                <div class="label">직위</div>
                <div class="value">{{ detail.positionName }}</div>
              </div>
              <div class="author-item">
                <div class="label">작성일</div>
                <div class="value">{{ new Date(detail.createdAt).toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <!-- 제목 -->
          <div class="form-group">
            <div class="detail-label">제목</div>
            <div class="detail-title">{{ detail.title }}</div>
          </div>

          <!-- 내용 -->
          <div class="form-group">
            <div class="detail-label">내용</div>
            <div class="detail-content">{{ detail.content }}</div>
          </div>

          <!-- 첨부파일 -->
          <div class="form-group" v-if="detail.attachments?.length">
            <div class="detail-label">첨부파일</div>
            <div class="attached-files">
              <button
                  v-for="file in detail.attachments"
                  :key="file.url"
                  class="file-button"
                  @click="handleDownload(file)"
              >
                <i :class="getFileIcon(file.name)"></i> {{ file.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import {ref, onMounted, computed, onBeforeUnmount} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {deleteAnnouncement, getAnnouncementDetail} from '@/features/announcement/api';
import { getFileUrl } from '@/features/common/api.js';
import { useAuthStore } from '@/stores/auth.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const detail = ref(null);
const showActions = ref(false);
const actionMenuRef = ref(null); // 드롭다운 메뉴

const fetchDetail = async () => {
  try {
    const res = await getAnnouncementDetail(route.params.announcementId);
    detail.value = res.data?.data?.announcement;
  } catch (err) {
    console.error('공지사항 상세 조회 실패:', err);
  }
};

onMounted(() => {
  fetchDetail();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const goBack = () => {
  router.push('/announcement');
};

const handleDownload = async (file) => {
  try {
    const res = await getFileUrl({ key: file.url, fileName: file.name });
    const signedUrl = res.data.data.signedUrl;

    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error(`다운로드 실패: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('파일 다운로드 실패:', err);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};

const handleDelete = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await deleteAnnouncement(route.params.announcementId);
      alert('공지사항이 삭제되었습니다.');
      router.push('/announcement');
    } catch (err) {
      console.error('공지 삭제 실패:', err);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    }
  }
};

const handleEdit = () => {
  router.push(`/announcement/edit/${route.params.announcementId}`);
};

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
  if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
  return 'fas fa-paperclip';
};

const canEditOrDelete = computed(() =>
    detail.value &&
    (
        authStore.userId === detail.value.empId ||
        authStore.userRole.includes('MASTER')
    )
);

const toggleActions = (event) => {
  event.stopPropagation(); // 버튼 클릭 시 외부 클릭으로 인식되지 않도록
  showActions.value = !showActions.value;
};

const handleClickOutside = (e) => {
  if (showActions.value && actionMenuRef.value && !actionMenuRef.value.contains(e.target)) {
    showActions.value = false;
  }
};
</script>

<style scoped>
.main {
  padding: 0;
}

.main-section {
  width: 100%;
}

.main-header {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-area {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.author-card {
  border: 1px solid var(--gray-200);
  background-color: var(--gray-50);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 32px;
}

.author-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--font-main);
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.author-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: var(--font-main);
}

.author-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.author-item .label {
  font-size: 13px;
  color: var(--font-sub);
  margin-bottom: 4px;
}

.author-item .value {
  font-size: 15px;
  color: var(--font-main);
  font-weight: 500;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--font-main);
  margin-bottom: 8px;
}

.header-buttons .btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  color: var(--font-sub);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.header-buttons .btn:hover {
  background: var(--gray-200);
  color: var(--font-main);
}

.content-area {
  padding: 0 32px 32px 32px;
}

.form-card {
  background: white;
  border-radius: var(--card-radius, 12px);
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
  padding: 40px;
  animation: fadeInUp 0.5s ease;
}

.form-group {
  margin-bottom: 32px;
}

.detail-label {
  font-weight: 600;
  color: var(--font-main);
  margin-bottom: 4px;
  font-size: 15px;
}

.detail-title,
.detail-content {
  background: var(--gray-50);
  padding: 16px 20px;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 16px;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-content {
  min-height: 200px;
}

.attached-files .file-button {
  display: inline-flex;
  align-items: center;
  background: var(--blue-50);
  padding: 10px 16px;
  border-radius: 8px;
  margin-right: 12px;
  margin-top: 8px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.attached-files .file-button i {
  margin-right: 8px;
}

.attached-files .file-button:hover {
  background: var(--blue-100);
}

.meta-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 16px;
}
.meta-item .label {
  font-weight: 500;
  color: var(--font-sub);
  margin-right: 6px;
}
.meta-item .value {
  color: var(--font-main);
}

/* --- 드롭다운 관련 --- */
.action-toggle-wrapper {
  position: relative;
}

.btn-action-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--font-sub);
}

.action-menu {
  position: absolute;
  top: 32px;
  right: 0;
  width: 120px;
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.action-item {
  all: unset;
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  color: var(--font-main);
}

.action-item:hover {
  background-color: var(--gray-100);
}
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-edit {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-header,
  .content-area {
    padding: 20px;
  }

  .form-card {
    padding: 24px;
  }

  .header-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

