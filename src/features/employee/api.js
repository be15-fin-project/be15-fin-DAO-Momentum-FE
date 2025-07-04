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

export const getContracts = async (params) => {
    const resp = await api.get("/contracts", {params});
    return resp.data.data;
}

export const createContract = async (req) => {
    const resp = await api.post('/contracts', req);
    return resp.data.data;
}

export const getAppoints = async (params) => {
    const resp = await api.get("/employees/appoints", {params})
    return resp.data.data;
}

export const createAppoint = async (req) => {
    const resp = await api.post('/employees/appoints', req);
    return resp.data.data;
}