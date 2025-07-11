import api from '@/api/axios.js'

//회사 api
export const putCompany = async (req) => {
    return await api.put("/company", req);
}

//부서 api
export const postDepartment = async (req) => {
    return await api.post("/departments",req);
}

export const putDepartment = async (req) => {
    return await api.put("/departments",req);
}

export const deleteDepartment = async (deptId) => {
    return await api.delete(`/departments/${deptId}`);
}

//직위 api
export const getPositions = async () => {
    return await api.get("/position");
}

export const postPosition = async (req) => {
    return await api.post("/position",req);
}

export const putPosition = async (req) => {
    return await api.put("/position",req);
}

export const deletePosition = async (positionId) => {
    return await api.delete(`/position/${positionId}`);
}
