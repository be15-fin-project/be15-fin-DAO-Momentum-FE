import api from '@/api/axios.js'

/* 1. 전체 결재 내역 불러오기 */
export function getAnnouncementList(searchRequest) {
    return api.get('/announcement', {
        params: searchRequest
    });
}

/* 2. 공지사항 상세 조회 */
export function getAnnouncementDetail(announcementId) {
    return api.get(`/announcement/${announcementId}`);
}