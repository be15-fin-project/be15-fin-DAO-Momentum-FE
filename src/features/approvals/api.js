import api from '@/api/axios.js'

/* 1. 전체 결재 내역 불러오기 */
export function getApprovals(approveListRequest, pageRequest = {}) {
    return api.get('/admin/approval/documents', {
        params: {
            ...approveListRequest,
            ...pageRequest
        }
    });
}

/* 2. 받은 문서함 결재 내역 불러오기 */
export function getReceivedApprovals(approveListRequest, pageRequest = {}) {
    return api.get('/approval/documents/received', {
        params: {
            ...approveListRequest,
            ...pageRequest
        }
    });
}

/* 3. 보낸 문서함 결재 내역 불러오기 */
export function getSentApprovals(draftApproveListRequest, pageRequest = {}) {
    return api.get('/approval/documents/draft', {
        params: {
            ...draftApproveListRequest,
            ...pageRequest
        }
    });
}

/* 4. 결재 문서 상세 조회  */
export function getApprovalDetail(documentId) {
    return api.get(`/approval/documents/${documentId}`);
}

/* 5. 결재 문서 작성 */
export function submitApproval(request) {
    return api.post(`/approval/documents`, request);
}

/* 6. 영수증 ocr api 불러오기 */
export function getOcrApi(formData) {
    return api.post(`/approval/ocr/receipt`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/* 7. 사원의 연차 불러오기 */
export function getRemainDayOff() {
    return api.get(`/remaining/dayoff`)
}

/* 8. 사원의 리프레시 휴가 불러오기 */
export function getRemainRefresh() {
    return api.get(`/remaining/refresh`)
}

/* 9. 사원의 상사 불러오기 */
export function getEmployeeLeader() {
    return api.get(`/approval/leader`)
}

/* 10. 결재 문서 승인/반려 */
export function approveOrReject(approvalConfirmRequest) {
    return api.patch(`/approval/decision`, approvalConfirmRequest);
}

/* 11. 참조 문서 열람 */
export function checkApproval(documentId) {
    return api.patch(`/approval/documents/${documentId}/reference`)
}

/* 12. 결재 문서 회수 */
export function deleteApproval(documentId) {
    return api.delete(`/approval/documents/${documentId}`)
}

/* 13. 결재 문서 수정 */
export function updateApproval(request, documentId) {
    return api.put(`/approval/documents/${documentId}`, request)
}
