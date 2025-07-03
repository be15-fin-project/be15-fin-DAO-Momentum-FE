<script setup>
import {computed, ref} from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'

import ProfileCard from '@/features/mypage/components/ProfileCard.vue'
import AttendanceInfoCard from '@/features/mypage/components/AttendanceInfoCard.vue'
import VacationInfoCard from '@/features/mypage/components/VacationInfoCard.vue'
import {getMyWorks} from "@/features/works/api.js";
import {getHolidaysPerMonth} from "@/features/company/api.js";
import CalendarAttendanceModal from "@/features/works/components/CalendarAttendanceModal.vue";
import {useRouter} from "vue-router";
import DocumentCard from "@/features/mypage/components/DocumentCard.vue";
import KpiCard from "@/features/mypage/components/KpiCard.vue";
import NoticeCard from "@/features/mypage/components/NoticeCard.vue";

const BLUE = "#3b82f6"
const RED = "#ef4444"
const GREEN = "#10b981"

const events = ref([]);
const params = ref({
  searchStartDate: null,
  searchEndDate: null
})
const holidays = ref([])

const currentView = ref('dayGridMonth')
const titleHead = computed(() => {
  switch (currentView.value) {
    case 'dayGridMonth': return '월간 ';
    case 'dayGridWeek' : return '주간 ';
    case 'dayGridDay' : return '일일 ';
    default: return ''
  }
})

// 예시 데이터 (임시로 직접 주입)
const profile = {
  name: '이수진',
  position: 'UX/UI 디자이너',
  status: '재직중',
  department: '디자인팀'
}

const attendance = {
  startTime: '2025.06.08 오전 9:05',
  endTime: '오후 6:30',
  note: '초과근무 승인 반영'
}

const vacationInfo = {
  remainingDays: 15,
  vacations: [
    {date: '6월 12일 (수)', label: '연차', colorStyle: 'color:var(--warning);font-weight:500;'},
    {date: '6월 19일 (수)', label: '외근 (고객사 방문)', colorStyle: 'color:var(--blue-400);font-weight:500;'},
    {date: '6월 28일 (금)', label: '반차', colorStyle: 'color:var(--warning);font-weight:500;'}
  ]
}

/* 캘린더 모달 */
const showCalendarModal = ref(false)
const selectedAttendance = ref(null)
const isWork = computed(() => selectedAttendance.value?.typeName === 'WORK')

const handleEventClick = (info) => {
  const event = info.event

  selectedAttendance.value = {
    workId: event.extendedProps?.workId,
    typeName: event.extendedProps?.typeName,
    startTime: event.start,
    endTime: event.end,
    breakTime: event.extendedProps?.breakTime,
    workTime: event.extendedProps?.workTime,
    title: event.title,
    // 필요한 필드 더 추가 가능
  }

  if (selectedAttendance.value.typeName === '휴일') {
    return;
  }

  if (selectedAttendance.value.typeName !== 'WORK') {
    return;
  }
  console.log('선택된 이벤트:', selectedAttendance.value)
  console.log('typeName:', selectedAttendance.value?.typeName)
  showCalendarModal.value = true
}

/* TODO: workId를 실어서 출퇴근 정정 페이지로 이동 */
const router = useRouter()

const goToCorrectionPage = () => {
  const workId = selectedAttendance.value?.workId
  // if (!workId) return
  // router.push({ name: 'WorkCorrectionRequest', query: { date } })
}

// 휴일 데이터를 이벤트로 변환하는 함수
const convertHolidayToEvent = (holiday) => ({
  title: holiday.holidayName,
  start: holiday.date,
  allDay: true,
  color: RED,
  extendedProps: {
    typeName: '휴일', // "HOLIDAY"는 휴일 근무이므로 구별하기 위해 한글 사용
  }
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

const convertWorkToEvent = (item) => ({
  title: parseTitle(item),
  start: item.startAt,
  end: item.endAt,
  color: getColor(item),
  extendedProps: {
    workId: item.workId,
    typeName: item.typeName,
    vacationType: item.vacationType,
    childTypeName: item.childTypeName,
    breakTime: item.breakTime,
    workTime: item.workTime
  }
})

function formatTime(datetime) {
  if (!datetime) return '-';

  return datetime.toLocaleString().slice(0, -3);
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  return parts.length ? parts.join(' ') : '0분';
}

// 날짜 바뀔 때마다 데이터 다시 불러와서 이벤트 채워주는 함수
const handleDatesSet = async (info) => {
  params.value.searchStartDate = info.startStr
  params.value.searchEndDate = info.endStr

  currentView.value = info.view.type

  const yearMonth = info.startStr.slice(0, 7) // yyyy-MM 형식
  await fetchHolidaysForMonth(yearMonth)

  const resp = await getMyWorks(params.value)
  const workEvents = resp.works.map(convertWorkToEvent)
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

// FullCalendar 옵션
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  selectable: true,
  height: 600,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    /* 일단 잘 돼서 넣어둠. 문제 생기면 이거 지우고 아래 주석 풀어서 사용 (월간 일정만 보기) */
    right: 'dayGridMonth dayGridWeek dayGridDay'
    // right: ''
  },
  buttonText: {
    today: '오늘',
    month: '월'
  },
  events: events.value,
  datesSet: handleDatesSet,
  eventClick: handleEventClick,
}));

</script>

<template>
  <div class="dashboard-layout">
    <aside class="dashboard-side">
      <ProfileCard v-bind="profile"/>
      <AttendanceInfoCard v-bind="attendance"/>
      <VacationInfoCard v-bind="vacationInfo"/>

      <NoticeCard
          :notices="[
              { title: '운영 보고서 안내', meta: '운영팀 · 2024.12.30' },
              { title: '6월 워크샵 사전 신청', meta: '총무팀 · 2024.06.01' }
            ]"
      />
    </aside>

    <section class="dashboard-main">
      <div class="card calendar-card">
        <div class="side-section-title">
          <span class="material-icons">event_note</span>{{ titleHead }}일정
        </div>
        <FullCalendar :options="calendarOptions"/>
      </div>

      <!-- 결재문서 카드 -->
      <DocumentCard/>
      <!-- KPI 카드 -->
      <KpiCard
          :kpis="[
    {
      category: '업무',
      title: '매출 향상',
      goal: '30%',
      progress: 50,
      progressLabel: '15%',
      variant: 'accent'
    },
    {
      category: '개인',
      title: 'UI 개선안 제출',
      goal: '5건',
      progress: 60,
      progressLabel: '3건',
      variant: 'success'
    }
  ]"
      />
    </section>
  </div>

  <CalendarAttendanceModal
      :visible="showCalendarModal"
      :attendanceData="selectedAttendance"
      :isWork="isWork"
      :formatTime="formatTime"
      :formatDuration="formatDuration"
      @close="showCalendarModal = false"
      @editRequest="goToCorrectionPage"
  />
</template>

<style scoped>
/* ===== 레이아웃 ===== */
.dashboard-layout {
  display: flex;
  gap: 40px;
  padding: 40px;
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

/* ===== 메인 콘텐츠 ===== */
.calendar-card :deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  color: var(--blue-400);
  font-weight: 700;
}

.calendar-card {
  padding-bottom: 10px;
  overflow: hidden;
  width: 100%;
}

.calendar-card .side-section-title {
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .card {
    padding: 19px 7px 13px 7px;
  }

  .dashboard-layout {
    padding: 10px 1vw;
  }
}

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
</style>