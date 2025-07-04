import api from '@/api/axios.js'

export function loginUser(data) {
    return api.post('/employees/login', data);
}

export function refreshUserToken() {
    return api.post(`/employees/refresh`);
}

export function logoutUser() {
    return api.post(`/employees/logout`);
}

export function forgetPassword(data) {
    return api.post('/employees/reset-password/request',data);
}

export function resetPassword(data) {
    return api.post('/employees/reset-password',data);
}

/*
* s3에 저장된 파일을 가져오는 api
* */
export function getFileUrl({ key, fileName }) {
    return api.post('/file/download-url', {key, fileName});
}