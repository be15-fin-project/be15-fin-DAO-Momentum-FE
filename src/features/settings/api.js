import api from '@/api/axios.js'

export const putCompany = async (req) => {
    return await api.put("/company", req);
}

export const postDepartment = async (req) => {
    return await api.post("/departments",req);
}

export const putDepartment = async (req) => {
    return await api.put("/departments",req);
}

export const deleteDepartment = async (deptId) => {
    return await api.delete(`/departments/${deptId}`);
}