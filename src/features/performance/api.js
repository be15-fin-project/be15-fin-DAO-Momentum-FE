import api from '@/api/axios.js';


// ==================================================
// KPI 대시보드 API
// ==================================================

// KPI 대시보드 내 KPI 내역 조회
export async function getMyKpiDashboard(params) {
    const res = await api.get('/kpi/dashboard', { params });
    return res.data.data;
}

// KPI 통계 조회
export async function getKpiStatistics(params) {
    const res = await api.get('/kpi/statistics', { params });
    return res.data.data;
}

// KPI 시계열 통계 조회
export async function getKpiTimeseries(params) {
    const res = await api.get('/kpi/timeseries', { params });
    return res.data.data;
}

// KPI 목록 조회
export async function getKpiList(params) {
    const res = await api.get('/kpi/list', { params });
    return res.data.data;
}

// KPI 엑셀 다운로드
export async function getKpiExcelDownload(params) {
    const res = await api.get('/kpi/excel', {
        params,
        responseType: 'blob' // 반드시 blob으로 지정
    });
    return res.data;
}

// KPI 상세 조회
export async function getKpiDetail(kpiId) {
    const res = await api.get(`/kpi/${kpiId}`);
    return res.data.data;
}

// 사원별 KPI 요약 조회
export async function getEmployeeKpiSummary(params) {
    const res = await api.get('/kpi/employee-summary', { params });
    return res.data.data;
}


// ==================================================
// 개인 KPI 대시보드 API
// ==================================================

// 나의 KPI 통계 조회
export async function getMyKpiStatistics(params) {
    const res = await api.get('/kpi/my-statistics', { params });
    return res.data.data;
}

// 나의 KPI 시계열 조회
export async function getMyKpiTimeseries(params) {
    const res = await api.get('/kpi/my-timeseries', { params });
    return res.data.data;
}

// 나의 KPI 목록 조회
export async function getMyKpiList(params) {
    const res = await api.get('/kpi/my-list', { params });
    return res.data.data;
}

// KPI 등록 (제출)
export async function createMyKpi(payload) {
    const res = await api.post('/kpi', payload);
    return res.data.data;
}

// KPI 진척도 최신화
export async function updateKpiProgress(kpiId, payload) {
    const res = await api.patch(`/kpi/${kpiId}/progress`, payload);
    return res.data;
}

// KPI 회수
export async function withdrawKpi(kpiId) {
    const res = await api.delete(`/kpi/${kpiId}/withdraw`);
    return res.data;
}

// KPI 취소 요청
export async function deleteKpi(kpiId, payload) {
    const res = await api.delete(`/kpi/${kpiId}`, { data: payload });
    return res.data;
}

// 하급자 KPI 요청 목록 조회
export async function getKpiRequests(params) {
    const res = await api.get('/kpi/requests', { params });
    return res.data;
}

// KPI 승인/반려 처리
export async function approveKpi(kpiId, approved, reason = '') {
    const res = await api.patch(`/kpi/${kpiId}/approval`, { approved, reason });
    return res.data;
}

// KPI 취소 승인/반려 처리
export async function approveKpiCancel(kpiId, approved, reason = '') {
    const res = await api.patch(`/kpi/${kpiId}/cancel/approval`, { approved, reason });
    return res.data;
}


// ==================================================
// 사원 간 평가 API (Peer Evaluation)
// ==================================================

// 사원 간 평가 목록 조회
export async function getPeerEvaluations(params) {
    const res = await api.get('/evaluation/results/peer', { params });
    return res.data.data;
}

// 사원 간 평가 상세 조회
export async function getPeerEvaluationDetail(resultId) {
    const res = await api.get(`/evaluation/results/peer/${resultId}`);
    return res.data.data;
}

// 사원 간 평가 엑셀 다운로드
export async function getPeerExcelDownload(params) {
    const res = await api.get('/evaluations/excel/peer', {
        params,
        responseType: 'blob'
    });
    return res.data;
}


// ==================================================
// 조직 평가 API (Org Evaluation)
// ==================================================

// 조직 평가 목록 조회
export async function getOrgEvaluations(params) {
    const res = await api.get('/evaluation/results/org', { params });
    return res.data.data;
}

// 조직 평가 상세 조회
export async function getOrgEvaluationDetail(resultId) {
    const res = await api.get(`/evaluation/results/org/${resultId}`);
    return res.data.data;
}

// 조직 평가 엑셀 다운로드
export async function getOrgExcelDownload(params) {
    const res = await api.get('/evaluations/excel/org', {
        params,
        responseType: 'blob'
    });
    return res.data;
}


// ==================================================
// 자가 진단 평가 API (Self Evaluation)
// ==================================================

// 자가 진단 평가 목록 조회
export async function getSelfEvaluations(params) {
    const res = await api.get('/evaluation/results/self', { params });
    return res.data.data;
}

// 자가 진단 평가 상세 조회
export async function getSelfEvaluationDetail(resultId) {
    const res = await api.get(`/evaluation/results/self/${resultId}`);
    return res.data.data;
}

// 자가 진단 평가 엑셀 다운로드
export async function getSelfExcelDownload(params) {
    const res = await api.get('/evaluations/excel/self', {
        params,
        responseType: 'blob'
    });
    return res.data;
}


// ==================================================
// 평가 관리 API (평가 회차 등)
// ==================================================

// 평가 진행 여부 조회
export async function getEvaluationRoundStatus() {
    const res = await api.get('/evaluations/roundStatus')
    return res.data.data
}


// 평가 종류(폼 타입) 조회
export async function getEvaluationFormTypes(params) {
    const res = await api.get('/evaluations/forms', { params });
    return res.data.data;
}

// 평가 회차 번호 목록 조회 (간단 조회용)
export async function getEvaluationRoundNos() {
    const res = await api.get('/evaluations/roundNo');
    return res.data.data;
}

// 평가 회차 목록 조회 (필터 + 페이징)
export async function getEvaluationRounds(params) {
    const res = await api.get('/evaluations/rounds', { params });
    return res.data.data;
}

// 평가 회차 등록
export async function createEvaluationRound(payload) {
    const res = await api.post('/evaluations/rounds', payload);
    return res.data.data;
}

// 평가 회차 수정
export async function updateEvaluationRound(roundId, payload) {
    const res = await api.patch(`/evaluations/rounds/${roundId}`, payload);
    return res.data.data;
}

// 평가 회차 삭제
export async function deleteEvaluationRound(roundId) {
    const res = await api.delete(`/evaluations/rounds/${roundId}`);
    return res.data.data;
}

// 인사 평가 기준 상세 조회 (등급 비율 + 항목 가중치)
export async function getHrEvaluationCriteria(roundNo) {
    const res = await api.get(`/evaluations/hr/${roundNo}/criteria`);
    return res.data.data;
}

// ==================================================
// 평가 제출 API (평가 제출 목록 조회 등)
// ==================================================

// 평가 종류 트리 조회
export async function getEvaluationFormTree() {
    const res = await api.get('/evaluations/form-tree');
    return res.data.data;
}

// 평가 제출 목록 조회
export async function getEvaluationTasks(params) {
    const res = await api.get('/evaluation/tasks', { params });
    return res.data.data;
}

// 평가 제출 상세 조회
export async function getEvaluationFormDetail(formId, roundId) {
    const res = await api.get(`/eval-forms/${formId}`, {
        params: { roundId }
    });
    return res.data.data;
}

// 평가 종류별 요인 목록 조회
export async function getEvaluationFormProperties(params) {
    const res = await api.get('/evaluations/form-property', { params });
    return res.data.data;
}

// 다면 평가 제출
export async function submitEvaluation(payload) {
    const res = await api.post('/evaluations/submit', payload);
    return res.data.data;
}


// ==================================================
// 인사 평가 내역 조회 API (평가 제출 목록 조회 등)
// ==================================================

// 인사 평가 내역 목록 조회
export async function getMyHrEvaluations(params) {
    const res = await api.get('/evaluations/hr', { params });
    return res.data.data;
}

// 인사 평가 상세 조회
export async function getMyHrEvaluationDetail(resultId) {
    const res = await api.get(`/evaluations/hr/${resultId}`);
    return res.data.data;
}

// ==================================================
// 인사 평가 이의제기 API
// ==================================================

// 인사 평가 이의 제기 제출
export async function submitHrObjection(evaluationId, payload) {
    const res = await api.post(`/hr-objections/${evaluationId}`, payload);
    return res.data.data;
}

// 인사 평가 이의 제기 삭제
export async function deleteHrObjection(objectionId) {
    const res = await api.delete(`/hr-objections/${objectionId}`);
    return res.data.data;
}

// 이의제기 요청 목록 조회 (팀장)
export async function getHrObjectionRequests(params) {
    const res = await api.get('/hr-objections/requests', { params });
    return res.data.data;
}

// 이의제기 요청 상세 조회 (팀장)
export async function getHrObjectionRequestDetail(objectionId) {
    const res = await api.get(`/hr-objections/requests/${objectionId}`);
    return res.data.data;
}

// 나의 이의제기 목록 조회 (사원)
export async function getMyHrObjections(params) {
    const res = await api.get('/hr-objections/my', { params });
    return res.data.data;
}

// 나의 이의제기 상세 조회 (사원)
export async function getMyHrObjectionDetail(objectionId) {
    const res = await api.get(`/hr-objections/my/${objectionId}`);
    return res.data.data;
}

// 이의제기 승인/반려 처리 (팀장)
export async function processHrObjection(payload) {
    const res = await api.patch('/hr-objections/process', payload);
    return res.data.data;
}
