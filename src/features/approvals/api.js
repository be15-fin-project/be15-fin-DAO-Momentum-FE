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