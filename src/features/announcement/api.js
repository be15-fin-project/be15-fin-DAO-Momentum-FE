import api from '@/api/axios.js'

/* 1. 전체 공지사항 목록 불러오기 */
export function getAnnouncementList(searchRequest) {
    return api.get('/announcement', {
        params: searchRequest
    });
}

/* 2. 공지사항 상세 조회 */
export function getAnnouncementDetail(announcementId) {
    return api.get(`/announcement/${announcementId}`);
}

/**
 * 3. 공지사항 생성
 * @param {Object} payload
 * @param {string} payload.title - 공지사항 제목
 * @param {string} payload.content - 공지사항 내용
 * @param {Array<{ name: string, s3Key: string, type: string }>} payload.attachments - 첨부파일 리스트
 * @returns {Promise}
 */
export function createAnnouncement({ title, content, attachments }) {
    return api.post('/announcement', {
        title,
        content,
        attachments,
    });
}

/**
 * 4. 공지사항 수정
 * @param {number} announcementId
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} payload.content
 * @param {Array<{ name: string, s3Key: string, type: string }>} payload.attachments
 * @param {Array<number>} payload.remainFileIdList
 * @returns {Promise}
 */
export function modifyAnnouncement(announcementId, { title, content, attachments, remainFileIdList }) {
    return api.put(`/announcement/${announcementId}`, {
        title,
        content,
        attachments,
        remainFileIdList
    });
}

/**
 * 5. 공지사항 삭제
 * @param {number} announcementId
 * @returns {Promise}
 */
export function deleteAnnouncement(announcementId) {
    return api.delete(`/announcement/${announcementId}`);
}

// Presigned URL 요청 -> 공통으로 분리
export function generatePresignedUrl({ fileName, sizeInBytes, contentType, prefixType }) {
    return api.post('/file/presigned-url', {
        fileName,
        sizeInBytes,
        contentType,
        prefixType
    });
}