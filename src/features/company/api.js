import api from '@/api/axios.js'

export async function fetchCompanyInfo() {
    return await api.get('/company');
}

export async function fetchDepartments() {
    const res = await api.get('/departments');
    return res.data;
}

export async function fetchDepartmentInfo(deptId){
    return await api.get(`/departments/${deptId}`)
}