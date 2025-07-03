<script setup>
import {computed, nextTick, onMounted, ref} from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import {getMyWorks} from "@/features/works/api.js";
import {getHolidaysPerMonth} from "@/features/company/api.js";

const BLUE = "#3b82f6"
const RED = "#ef4444"
const GREEN = "#10b981"

const calendarRef = ref(null)

const events = ref([]);
const params = ref({
  searchStartDate: null,
  searchEndDate: null
})
const holidays = ref([])

// 휴일 데이터를 이벤트로 변환하는 함수
const convertHolidayToEvent = (holiday) => ({
  title: holiday.holidayName,
  start: holiday.date,
  allDay: true,
  color: RED
})

const fetchHolidaysForMonth = async (yearMonth) => {
  const response = await getHolidaysPerMonth(yearMonth)

  holidays.value = response.holidayGetDTOList || []
}

const parseTitle = (item) => {
  if (item.typeName === 'VACATION') {
    return vacationType(item.vacationType)
  } else if (item.typeName === 'ADDITIONAL') {
    return workType(item.childTypeName)
  } else {
    return workType(item.typeName)
  }
}

const getColor = (item) => {
  switch (item.typeName) {
    case 'VACATION':
      return GREEN;
    default:
      return BLUE;
  }
}

const convertToEvent = (item) => ({
  title: parseTitle(item),
  start: item.startAt,
  end: item.endAt,
  color: getColor(item)
})

// 날짜 바뀔 때마다 데이터 다시 불러와서 이벤트 채워주는 함수
const handleDatesSet = async (info) => {
  params.value.searchStartDate = info.startStr
  params.value.searchEndDate = info.endStr

  const yearMonth = info.startStr.slice(0, 7) // yyyy-MM 형식
  await fetchHolidaysForMonth(yearMonth)

  const resp = await getMyWorks(params.value)
  const workEvents = resp.works.map(convertToEvent)
  const holidayEvents = holidays.value.map(convertHolidayToEvent)

  events.value = [...workEvents, ...holidayEvents]
}

const workType = (type) => ({
  WORK: '근무',
  REMOTE_WORK: '재택 근무',
  BUSINESS_TRIP: '출장',
  ADDITIONAL: '초과근무',
  OVERTIME: '연장근무',
  NIGHT: '야간근무',
  HOLIDAY: '휴일근무',
}[type] || type)

const vacationType = (type) => ({
  PAID_ETC: '기타 유급휴가',
  UNPAID_ETC: '기타 무급휴가',
  DAYOFF: '연차',
  AM_HALF_DAYOFF: '오전 반차',
  PM_HALF_DAYOFF: '오후 반차',
  REFRESH: '리프레시 휴가',
  MILITARY_TRAINING: '군 소집 훈련',
  LIFE_EVENT: '경조사',
}[type] || type)

onMounted(async () => {
  await nextTick();
  if (calendarRef.value) {
    calendarRef.value.getApi().updateSize();
  }
  // 초기에 첫 fetch를 위해 날짜 강제 세팅
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    const view = calendarApi.view;
    await handleDatesSet(view);
  }
});

// FullCalendar 옵션
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  selectable: true,
  height: 420,
  aspectRatio: 1.4,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    /* 주간 일간도 지원 가능하나, "월간 일정" 수정 필요 */
    // right: 'dayGridMonth dayGridWeek dayGridDay'
    right: ''
  },
  buttonText: {
    today: '오늘',
    month: '월'
  },
  events: events.value,
  datesSet: handleDatesSet
}));

</script>

<template>
  <main class="main">
    <div class="main-content">
      <div class="dashboard-layout">
        <aside class="dashboard-side">
          <div class="card profile-card">
            <div class="profile-avatar">
              <div class="avatar-circle">
                <i class="fas fa-user"></i>
              </div>
              <div class="status-indicator"></div>
            </div>

            <h2 class="profile-name">이수진</h2>
            <p class="profile-position">UX/UI 디자이너</p>

            <!-- Badges -->
            <div class="profile-badges">
              <span class="status-badge">재직중</span>
              <span class="department-badge">디자인팀</span>
            </div>
          </div>
          <div class="card attendance-info">
            <div class="side-section-title"><span class="material-icons">schedule</span>출퇴근 정보</div>
            <p><strong>출근 시간:</strong> 2025.06.08 오전 9:05</p>
            <p><strong>예상 퇴근 시간:</strong> 오후 6:30 <span
                style="color:var(--success); font-weight:500;">(초과근무 승인 반영)</span>
            </p>
          </div>
          <div class="card leave-info">
            <div class="side-section-title"><span class="material-icons"
                                                  style="color:var(--warning);">beach_access</span>잔여
              연차
            </div>
            <p><strong>남은 일수:</strong> <span style="color:var(--warning);font-weight:600;">15일</span></p>
            <div style="font-size: 13.3px; margin-top: 12px; color: var(--blue-400); font-weight:600;">
              이번달 연차/외근 일정
            </div>
            <ul class="leave-list">
              <li>6월 12일 (수) - <span style="color:var(--warning);font-weight:500;">연차</span></li>
              <li>6월 19일 (수) - <span style="color:var(--blue-400);font-weight:500;">외근 (고객사 방문)</span></li>
              <li>6월 28일 (금) - <span style="color:var(--warning);font-weight:500;">반차</span></li>
            </ul>
          </div>
          <div class="card">
            <div class="side-section-title"><span class="material-icons" style="color:var(--blue-400);">campaign</span>공지사항
            </div>
            <div class="notice-list">
              <div>
                <strong>운영 보고서 안내</strong><br>
                <small>운영팀 · 2024.12.30</small>
              </div>
              <div>
                <strong>6월 워크샵 사전 신청</strong><br>
                <small>총무팀 · 2024.06.01</small>
              </div>
            </div>
          </div>
        </aside>

        <!-- 메인 콘텐츠 -->
        <section class="dashboard-main">
          <!-- 달력 카드 -->
          <div class="card calendar-card">
            <div class="side-section-title">
              <span class="material-icons">event_note</span>월간 일정
            </div>
            <FullCalendar ref="calendarRef" :options="calendarOptions"/>
          </div>

          <!-- 결재문서 카드 -->
          <div class="card doc-card">
            <div class="side-section-title"><span class="material-icons">assignment</span>결재문서</div>
            <div class="doc-buttons">
              <button class="doc-btn"><span class="material-icons">hourglass_empty</span> 대기문서</button>
              <button class="doc-btn"><span class="material-icons">check_circle</span> 처리문서</button>
            </div>
          </div>
          <!-- KPI 카드 -->
          <div class="card kpi-card">
            <div class="side-section-title"><span class="material-icons">trending_up</span>KPI</div>
            <table class="kpi-table">
              <thead>
              <tr>
                <th>구분</th>
                <th>제목</th>
                <th>목표치</th>
                <th>진척도</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>업무</td>
                <td>매출 향상</td>
                <td>30%</td>
                <td>
                  <div class="kpi-progress-bar">
                    <div class="kpi-progress-inner accent" style="width:50%;"></div>
                  </div>
                  <span class="kpi-progress-label">15%</span>
                </td>
              </tr>
              <tr>
                <td>개인</td>
                <td>UI 개선안 제출</td>
                <td>5건</td>
                <td>
                  <div class="kpi-progress-bar">
                    <div class="kpi-progress-inner success" style="width:60%;"></div>
                  </div>
                  <span class="kpi-progress-label" style="color:var(--success);">3건</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>

/* ===== 헤더 ===== */
.header {
  width: 100%;
  height: var(--header-height);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0 2px 18px 0 rgba(50, 60, 90, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--gray-200);
}

.header .logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--blue-400);
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header .logo .material-icons {
  font-size: 2rem;
  color: var(--blue-400);
}

.header .user-menu {
  display: flex;
  align-items: center;
  gap: 18px;
}

.header .user-menu-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  font-size: 1.45rem;
  cursor: pointer;
  border-radius: 50%;
  padding: 3px 7px;
  transition: color 0.16s, background 0.13s;
}

.header .user-menu-btn:hover {
  background: var(--blue-100);
  color: var(--blue-400);
}

.header-profile {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--blue-100);
  padding: 7px 18px 7px 7px;
  border-radius: 30px;
}

.header-profile img {
  width: 37px;
  height: 37px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 10px 0 rgba(69, 111, 230, 0.10);
  border: 2px solid #fff;
}

.header-profile span {
  font-size: 1.08rem;
  font-weight: 600;
  color: var(--font-main);
}

/* ===== 레이아웃 ===== */
.dashboard-layout {
  display: flex;
  gap: 40px;
}

.dashboard-main {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.dashboard-side {
  width: 340px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 1100px) {
  .dashboard-layout {
    flex-direction: column;
    gap: 24px;
  }

  .dashboard-side, .dashboard-main {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 700px) {
  .dashboard-layout {
    padding: 16px 2vw 18px 2vw;
  }
}

/* ===== 카드 공통 ===== */
.card {
  background: #fff;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow);
  padding: 30px 30px 26px 30px;
  margin: 0;
  transition: box-shadow 0.17s, transform 0.13s;
  border: none;
  position: relative;
}

.card:hover {
  box-shadow: 0 13px 38px 0 rgba(50, 90, 180, 0.13);
  transform: translateY(-2px) scale(1.012);
}

/* ===== 프로필 카드 ===== */
.profile-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  margin-top: 12px;
  /*box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);*/
  text-align: center;
  /*position: relative;*/
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  /*background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);*/
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--blue-400);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.avatar-circle i {
  color: white;
  font-size: 32px;
}

.status-indicator {
  position: absolute;
  bottom: 16px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.profile-position {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 24px;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.status-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
  animation: pulse 2s infinite;
}

.department-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
}

/* ===== 공지/근태/연차 ===== */
.side-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--blue-400);
  font-size: 1.06rem;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 0;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notice-list strong {
  color: var(--blue-400);
  font-size: 15px;
  font-weight: 600;
}

.notice-list small {
  color: var(--gray-400);
  font-size: 12.5px;
  font-weight: 500;
}

.attendance-info p, .leave-info p {
  margin: 0 0 7px 0;
  font-size: 14.4px;
  color: var(--font-main);
}

.attendance-info strong {
  color: var(--blue-400);
  font-weight: 600;
}

.leave-list {
  padding-left: 18px;
  font-size: 13.8px;
  color: var(--font-sub);
  margin: 10px 0 0 0;
}

.leave-list li {
  margin-bottom: 2px;
  font-weight: 500;
}

/* ===== 메인 콘텐츠 ===== */
.calendar-card :deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  color: var(--blue-400);
  font-weight: 700;
}

.calendar-card {
  padding-bottom: 10px;
  overflow: hidden;
  width: 700px;
}

.calendar-card .side-section-title {
  margin-bottom: 12px;
}

/* KPI */
.kpi-card {
  padding-bottom: 20px;
}

table.kpi-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13.5px;
  margin-top: 12px;
  background: var(--gray-50);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(69, 111, 230, 0.07);
}

.kpi-table th, .kpi-table td {
  padding: 10px 8px;
  border: none;
  text-align: center;
}

.kpi-table th {
  background: var(--blue-100);
  color: var(--blue-400);
  font-weight: 700;
  font-size: 14.1px;
  border-bottom: 1px solid var(--gray-200);
}

.kpi-table tr:not(:last-child) td {
  border-bottom: 1px solid var(--gray-200);
}

.kpi-table td {
  color: var(--font-main);
  background: #fff;
  position: relative;
}

.kpi-progress-bar {
  width: 94%;
  height: 8.5px;
  background: var(--gray-100);
  border-radius: 7px;
  overflow: hidden;
  margin: 7px auto 0 auto;
}

.kpi-progress-inner {
  height: 100%;
  border-radius: 7px;
  background: var(--blue-400);
  transition: width .7s cubic-bezier(.5, 0, .2, 1);
}

.kpi-progress-inner.success {
  background: var(--success);
}

.kpi-progress-inner.accent {
  background: var(--warning);
}

.kpi-progress-inner.danger {
  background: var(--error);
}

.kpi-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-400);
  margin-top: 3px;
  display: inline-block;
}

/* 결재문서 */
.doc-card {
  padding-bottom: 22px;
}

.doc-buttons {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.doc-btn {
  flex: 1;
  padding: 13px 0;
  border: none;
  background: var(--blue-100);
  color: var(--blue-400);
  font-weight: 700;
  border-radius: 10px;
  font-size: 14.6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.2px;
  box-shadow: 0 1.5px 6px 0 rgba(69, 111, 230, 0.06);
  transition: background 0.16s, color 0.18s, box-shadow 0.18s;
}

.doc-btn .material-icons {
  font-size: 1.19em !important;
  vertical-align: middle;
}

.doc-btn:hover {
  background: var(--blue-400);
  color: #fff;
  box-shadow: 0 5px 18px 0 rgba(69, 111, 230, 0.13);
  transform: translateY(-1px) scale(1.01);
}

@media (max-width: 600px) {
  .profile-card {
    flex-direction: column;
    padding: 20px 4vw;
    gap: 13px;
    text-align: center;
  }

  .card {
    padding: 19px 7px 13px 7px;
  }

  .dashboard-layout {
    padding: 10px 1vw;
  }
}
</style>