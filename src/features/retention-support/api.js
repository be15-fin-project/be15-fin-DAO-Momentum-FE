import api from '@/api/axios.js'

// ==================================================
// 근속 통계 API (Retention Statistics)
// ==================================================

// 평균 근속 지수 조회
export async function getAverageRetentionScore(params) {
    const res = await api.get('/retention/statistics/average-score', { params });
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
    const res = await api.get('/retention/prediction/export', {
        params,
        responseType: 'blob' // 파일 다운로드를 위해 blob 지정
    });
    return res.data;
}
