import api from '@/api/axios.js'

export const putCompany = async (req) => {
    return await api.put("/company", req);
}