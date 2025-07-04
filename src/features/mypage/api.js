import api from '@/api/axios.js'

export async function fetchEmpInfo(){
    return await api.get(`/employees/me`);
}

export async function putEmpInfo(req){
    return await api.put('/employees/me',req);
}
