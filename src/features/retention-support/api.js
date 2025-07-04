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
