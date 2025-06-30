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
