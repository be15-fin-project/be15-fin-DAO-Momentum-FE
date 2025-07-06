import api from '@/api/axios.js'

// ==================================================
// 근속 통계 API (Retention Statistics)
// ==================================================

// 근속 지수 개요 조회
export async function getRetentionOverview(params) {
    const res = await api.get('/retention/statistics/overview', { params });
    return res.data.data;
}

// 전체 근속 안정성 비율 조회
export async function getOverallStabilityDistribution(params) {
    const res = await api.get('/retention/statistics/stability-distribution/overall', { params });
    return res.data.data;
}

// 부서별 안정성 분포 조회
export async function getDepartmentStabilityDistribution(params) {
    const res = await api.get('/retention/statistics/stability-distribution', { params });
    return res.data.data;
}

// ==================================================
// 근속 전망 엑셀 다운로드 API
// ==================================================

// 근속 전망 엑셀 다운로드
export async function downloadRetentionPredictionExcel(params) {
    const res = await api.get('/retention-supports/excel', {
        params,
        responseType: 'blob' // 파일 다운로드를 위해 blob 지정
    });
    return res.data;
}

// ==================================================
// 근속 전망 회차 API
// ==================================================

// 근속 전망 회차 목록 조회
export async function getRetentionRounds(params) {
    const res = await api.get('/retention/rounds', { params });
    return res.data.data;
}

// 근속 전망 회차 등록
export async function createRetentionForecastRound(payload) {
    const res = await api.post('/retention-forecasts', payload);
    return res.data.data;
}

// ==================================================
// 근속 전망 조회 API
// ==================================================

// 근속 전망 목록 조회
export async function getRetentionForecasts(params) {
    const res = await api.get('/retention/forecast', { params });
    return res.data.data;
}

// 근속 전망 상세 조회
export async function getRetentionForecastDetail(retentionId) {
    const res = await api.get(`/retention/${retentionId}`);
    return res.data.data;
}

// ==================================================
// 면담 기록 내역 조회 API
// ==================================================

// 면담 기록 목록 조회
export async function getRetentionContacts(params) {
    const res = await api.get('/retention/contact', { params });
    return res.data.data;
}

// 면담 상세 조회
export async function getRetentionContactDetail(retentionId) {
    const res = await api.get(`/retention/contact/${retentionId}`);
    return res.data.data;
}

// 면담 보고 등록
export async function submitRetentionResponse(retentionId, response) {
    const res = await api.post(`/retention-contacts/${retentionId}/response`, {
        response
    });
    return res.data.data;
}

// ==================================================
// 면담 요청 내역 조회 API
// ==================================================

// 나에게 전달된 면담 요청 내역 조회 (상급자용)
export async function getMyRetentionContacts(params) {
    const res = await api.get('/retention/contact/my', { params });
    return res.data.data;
}


// 면담 요청 등록
export async function createRetentionContact(payload) {
    const res = await api.post('/retention-contacts', payload);
    return res.data.data;
}

// 면담 요청 삭제
export async function deleteRetentionContact(retentionId) {
    const res = await api.delete(`/retention-contacts/${retentionId}`);
    return res.data.data;
}

// 면담 기록 피드백 등록
export async function submitRetentionFeedback(retentionId, feedback) {
    const res = await api.post(`/retention-contacts/${retentionId}/feedback`, {
        feedback
    });
    return res.data.data;
}
