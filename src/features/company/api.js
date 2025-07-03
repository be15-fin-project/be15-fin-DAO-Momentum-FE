import api from '@/api/axios.js'

export function fetchCompanyInfo() {
    return api.get('/company');
}

export async function fetchDepartments() {
    const res = await api.get('/departments');
    return res.data;
}

export function fetchDepartmentInfo(deptId){
    return api.get(`/departments/${deptId}`)
}

export async function getHolidaysPerMonth(yearMonth) {
    const resp = await api.get(`/holiday/calendar/${yearMonth}`)
    return resp.data.data;
}