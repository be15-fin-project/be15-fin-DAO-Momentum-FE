import api from '@/api/axios.js'

export const getWorks = async (params) => {
    const resp = await api.get("/works", { params });
    return resp.data.data;
}

// 부서 트리 구조 조회
export async function getDepartments() {
    const res = await api.get('/departments');
    return res.data;
}

export const getPositions = async () => {
    const resp = await api.get("/position");
    return resp.data.data.positionDtoList;
}

export const getWorkTypes = async () => {
    const resp = await api.get("/works/types");
    return resp.data.data;
}

export const getVacationTypes = async () => {
    const resp = await api.get("/works/vacation-types");
    return resp.data.data.vacationTypes;
}

export const getWorkDetails = async (workId) => {
    const resp = await api.get(`/works/${workId}`);
    return resp.data.data.workDetails;
}