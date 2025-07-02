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

export const getDownloadUrl = async (s3Key) => {
    const resp = await api.post("file/download-url", {key: s3Key});
    return resp.data.data.signedUrl;
}

export const createContract = async (req) => {
    const resp = await api.post('/contracts', req);
    return resp.data.data;
}