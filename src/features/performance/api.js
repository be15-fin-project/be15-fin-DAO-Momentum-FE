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

// KPI 상세 조회
export async function getKpiDetail(kpiId) {
    const res = await api.get(`/kpi/${kpiId}`);
    return res.data.data;
}