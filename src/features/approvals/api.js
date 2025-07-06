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

/* 6. 결재 문서 승인/반려 */
export function approveOrReject(approvalConfirmRequest) {
    return api.patch(`/approval/decision`, approvalConfirmRequest);
}

