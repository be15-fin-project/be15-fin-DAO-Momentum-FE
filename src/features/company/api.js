import api from '@/api/axios.js'

export function fetchCompanyInfo() {
    return api.get('/company');
}
