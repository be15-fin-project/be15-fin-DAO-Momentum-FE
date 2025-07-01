import api from '@/api/axios.js'

export const getEmployees = async (params) => {
    const resp = await api.get("/employees", { params });
    return resp.data.data;
}