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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAnnouncementDetail } from '@/features/announcement/api';
import {getFileUrl} from "@/features/common/api.js";

const route = useRoute();
const router = useRouter();

const detail = ref(null);

const fetchDetail = async () => {
  try {
    const res = await getAnnouncementDetail(route.params.announcementId);
    detail.value = res.data?.data?.announcement;
  } catch (err) {
    console.error('공지사항 상세 조회 실패:', err);
  }
};

// s3 Key를 통해 cloudfront signedurl 반환받고 다운로드
// ✅ fetch + blob + download 적용
const handleDownload = async (file) => {
  try {
    // s3Key와 fileName을 전송하여 Cloudfront SignedUrl을 받아옴
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

    URL.revokeObjectURL(blobUrl); // 메모리 정리
  } catch (err) {
    console.error('파일 다운로드 실패:', err);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};

onMounted(fetchDetail);

const goBack = () => {
  router.push('/announcement');
};

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
  if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
  return 'fas fa-paperclip';
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

.detail-title {
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
  background: var(--gray-50);
  padding: 16px 20px;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 16px;
  white-space: pre-wrap;
  word-break: break-word;
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
