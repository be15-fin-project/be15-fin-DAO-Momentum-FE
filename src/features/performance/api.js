import api from '@/api/axios.js'

// KPI 대시보드
// KPI 통계 조회
export async function getKpiStatistics(params) {
    const res = await api.get('/kpi/statistics', { params });
    return res.data.data;
}

export async function getKpiTimeseries(params) {
    const res = await api.get('/kpi/timeseries', { params });
    return res.data.data;
}

// KPI 목록 조회
export async function getKpiList(params) {
    const res = await api.get('/kpi/list', { params });
    return res.data.data;
}
// KPI 엑셀 다운로드
export async function getKpiExcelDownload(params) {
    const res = await api.get('/kpi/excel', {
        params,
        responseType: 'blob' // 반드시 blob으로 지정해야 엑셀로 다운로드됨
    });
    return res.data; // Blob 데이터
}

// KPI 상세 조회
export async function getKpiDetail(kpiId) {
    const res = await api.get(`/kpi/${kpiId}`);
    return res.data.data;
}

// 사원별 KPI 요약 조회
export async function getEmployeeKpiSummary(params) {
    const res = await api.get('/kpi/employee-summary', {params});
    return res.data.data;
}

// ---------- 사원 개인 KPI 대시보드 API ----------

// 자신의 KPI 통계 조회
export async function getMyKpiStatistics(params) {
    const res = await api.get('/kpi/my-statistics', { params });
    return res.data.data;
}

export async function getMyKpiTimeseries(params) {
    const res = await api.get('/kpi/my-timeseries', { params });
    return res.data.data;
}

// 자신의 KPI 목록 조회
export async function getMyKpiList(params) {
    const res = await api.get('/kpi/my-list', { params });
    return res.data.data;
}


// KPI 제출
export async function createMyKpi(payload) {
    const res = await api.post('/kpis', payload);
    return res.data.data;
}

// KPI 진척도 최신화 (PATCH)
export async function updateKpiProgress(kpiId, payload) {
    const res = await api.patch(`/kpis/${kpiId}/progress`, payload);
    return res.data;
}

// KPI 취소 요청 (DELETE)
export async function deleteKpi(kpiId, payload) {
    const res = await api.delete(`/kpis/${kpiId}`, { data: payload });
    return res.data;
}

// 하급자 KPI 요청 목록 조회
export async function getKpiRequests(params) {
    const res = await api.get('/kpi/requests', { params });
    return res.data;
}

// KPI 제출 승인/반려
export async function approveKpi(kpiId, approved, reason = '') {
    const res = await api.patch(`/kpis/${kpiId}/approval`, {
        approved, reason
    });
    return res.data;
}

// KPI 취소 승인/반려
export async function approveKpiCancel(kpiId, approved, reason = '') {
    const res = await api.patch(`/kpis/${kpiId}/cancel/approval`, {
        approved, reason
    });
    return res.data;
}

// 사원 간 평가 목록 조회
export async function getPeerEvaluations(params) {
    const res = await api.get('/evaluation/results/peer', { params });
    return res.data.data;
}

// 사원 간 평가 엑셀 다운로드
export async function getPeerExcelDownload(params) {
    const res = await api.get('/evaluations/excel/peer', {
        params,
        responseType: 'blob' // 반드시 blob으로 지정해야 엑셀로 다운로드됨
    });
    return res.data; // Blob 데이터
}

// 평가 종류 조회
export async function getEvaluationFormTypes(params) {
    const res = await api.get('/evaluations/forms', { params });
    return res.data.data;
}

// 평가 회차 번호 조회
export async function getEvaluationRoundNos() {
    const res = await api.get('/evaluations/roundNo');
    return res.data.data;
}

// 사원 간 평가 상세 조회
export async function getPeerEvaluationDetail(resultId) {
    const res = await api.get(`/evaluation/results/peer/${resultId}`);
    return res.data.data;
}

