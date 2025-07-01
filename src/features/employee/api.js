import api from '@/api/axios.js'

export const getEmployees = async (params) => {
    const resp = await api.get("/employees", { params });
    return resp.data.data;
}

export const getEmployeeDetails = async (empId) => {
    const resp = await api.get($`/employees/{empId}`);
    return resp.data.data;
}

export const createEmployee = async (req) => {
    const resp = await api.post('/employees', req);
    return resp.data.data;
}