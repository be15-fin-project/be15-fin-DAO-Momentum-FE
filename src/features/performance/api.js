import api from '@/api/axios.js'

export async function getKpiStatistics(params) {
    const res = await api.get('/kpi/statistics', { params });
    return res.data.data;
}

export async function getKpiTimeseries(params) {
    const res = await api.get('/kpi/timeseries', { params });
    return res.data.data;
}

export async function getKpiList(params) {
    const res = await api.get('/kpi/list', { params });
    return res.data.data;
}
