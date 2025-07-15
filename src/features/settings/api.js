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

//권한 api
export const getRoles = async () => {
    return await api.get(`/employees/roles`);
}

export const getEmpRoles = async (empId) => {
    return await api.get(`/employees/${empId}/roles`);
}

export const putEmpRoles = async(req) => {
    return await api.put('employees/roles',req)
}

//휴일 관련 api
export const getHolidays = async (req) => {
    return await api.get('/holiday/admin', {
        params: req
    });
};

export const postHoliday = async (req) => {
    return await api.post('/holiday',req);
}

export const deleteHoliday = async (holidayId) => {
    return await api.delete(`/holiday/${holidayId}`);
}
