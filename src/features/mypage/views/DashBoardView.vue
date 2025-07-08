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
          <span class="material-icons">event_note</span>{{ currentMonth.format('YYYY년 MM월') }} 일정
        </div>

        <CustomCalendar
            :events="events"
            @clickEvent="handleEventClick"
            @monthChanged="handleMonthChange"
        />
      </div>

      <DocumentCard/>

      <KpiCard :kpis="[
        {
          category: '업무', title: '매출 향상', goal: '30%', progress: 50, progressLabel: '15%', variant: 'accent'
        },
        {
          category: '개인', title: 'UI 개선안 제출', goal: '5건', progress: 60, progressLabel: '3건', variant: 'success'
        }
      ]"/>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

// 컴포넌트 임포트
import ProfileCard from '@/features/mypage/components/ProfileCard.vue'
import AttendanceInfoCard from '@/features/mypage/components/AttendanceInfoCard.vue'
import VacationInfoCard from '@/features/mypage/components/VacationInfoCard.vue'
import DocumentCard from '@/features/mypage/components/DocumentCard.vue'
import KpiCard from '@/features/mypage/components/KpiCard.vue'
import NoticeCard from '@/features/mypage/components/NoticeCard.vue'
import CalendarAttendanceModal from '@/features/works/components/CalendarAttendanceModal.vue'
import CustomCalendar from '@/features/mypage/components/CustomCalendar.vue'

// API
import { getMyWorks } from '@/features/works/api.js'
import { getHolidaysPerMonth } from '@/features/company/api.js'
import { getEvaluationRounds } from '@/features/performance/api.js'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

// 상태
const currentMonth = ref(dayjs())
const events = ref([])
const holidays = ref([])
const evaluationRounds = ref([])
const params = ref({ searchStartDate: null, searchEndDate: null })

const showCalendarModal = ref(false)
const selectedAttendance = ref(null)
const isWork = computed(() => selectedAttendance.value?.typeName === 'WORK')
const router = useRouter()

// 이벤트 클릭 핸들링
const handleEventClick = (event) => {
  selectedAttendance.value = event
  if (event.typeName === '평가') {
    const today = dayjs()
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)

    if (today.isBetween(start, end, null, '[]')) {
      // 오늘이 평가 기간에 포함되면 제출 페이지로 이동
      router.push('/eval/submit')
    }
    return
  }

  if (event.typeName !== '휴일') {
    showCalendarModal.value = true
  }
}

// 교정 요청 페이지 이동
const goToCorrectionPage = () => {
  const workId = selectedAttendance.value?.workId
  if (workId) {
    router.push({ name: 'WorkCorrectionRequest', query: { workId } })
  }
}

// 달 변경 핸들링
const handleMonthChange = async (month) => {
  currentMonth.value = month

  const start = month.startOf('month').subtract(7, 'day').startOf('week').format('YYYY-MM-DD')
  const end = month.endOf('month').endOf('week').format('YYYY-MM-DD')
  params.value.searchStartDate = start
  params.value.searchEndDate = end

  const yearMonth = month.format('YYYY-MM')
  const holidayResp = await getHolidaysPerMonth(yearMonth)
  holidays.value = holidayResp.holidayGetDTOList || []

  const workResp = await getMyWorks(params.value)
  const workEvents = workResp.works.map(convertWorkToEvent)
  const holidayEvents = holidays.value.map(convertHolidayToEvent)

  await loadEvaluationRounds()
  const evaluation = evaluationEvents.value

  events.value = [...workEvents, ...holidayEvents, ...evaluation]
}

// 평가 회차 로딩
const loadEvaluationRounds = async () => {
  try {
    const res = await getEvaluationRounds()
    evaluationRounds.value = res.list || []
  } catch (e) {
    console.error('평가 회차 불러오기 실패:', e)
    evaluationRounds.value = []
  }
}

// 평가 기간 이벤트 변환
const evaluationEvents = computed(() => {
  return evaluationRounds.value
      .filter(round => {
        if (!round.startAt || !round.endAt) return false
        const start = dayjs(round.startAt)
        const end = dayjs(round.endAt)
        return (
            start.isBefore(params.value.searchEndDate) &&
            end.isAfter(dayjs(params.value.searchStartDate))
        )
      })
      .map(round => ({
        title: `평가기간 (${round.roundNo}회차)`,
        startDate: round.startAt,
        endDate: round.endAt, // 끝일 포함
        color: 'var(--warning)',
        typeName: '평가'
      }))
})

// 근무 이벤트 변환
const convertWorkToEvent = (item) => ({
  title: parseTitle(item),
  startDate: item.startAt,
  endDate: item.endAt,
  startTime: item.startAt,
  endTime: item.endAt,
  color: getColor(item),
  workId: item.workId,
  typeName: item.typeName,
  vacationType: item.vacationType,
  childTypeName: item.childTypeName,
  breakTime: item.breakTime,
  workTime: item.workTime
})

// 휴일 이벤트 변환
const convertHolidayToEvent = (holiday) => ({
  title: holiday.holidayName,
  startDate: holiday.date,
  endDate: holiday.date,
  color: 'var(--error)',
  typeName: '휴일'
})

// 이벤트 타이틀 변환
const parseTitle = (item) => {
  if (item.typeName === 'VACATION') return vacationType(item.vacationType)
  if (item.typeName === 'ADDITIONAL') return workType(item.childTypeName)
  return workType(item.typeName)
}

// 색상
const getColor = (item) => {
  switch (item.typeName) {
    case 'VACATION': return 'var(--success)'
    default: return 'var(--blue-400)'
  }
}

// 시간 포맷팅
function formatTime(datetime) {
  if (!datetime) return '-'
  return dayjs(datetime).format('YYYY.MM.DD HH:mm')
}

// 시간 길이 포맷팅
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [`${h && `${h}시간`}`, `${m && `${m}분`}`].filter(Boolean).join(' ') || '0분'
}

// 더미 데이터
const profile = {
  name: '이수진', position: 'UX/UI 디자이너', status: '재직중', department: '디자인팀'
}

const attendance = {
  startTime: '2025.06.08 오전 9:05', endTime: '오후 6:30', note: '초과근무 승인 반영'
}

const vacationInfo = {
  remainingDays: 15,
  vacations: [
    { date: '6월 12일 (수)', label: '연차', colorStyle: 'color:var(--warning);font-weight:500;' },
    { date: '6월 19일 (수)', label: '외근 (고객사 방문)', colorStyle: 'color:var(--blue-400);font-weight:500;' },
    { date: '6월 28일 (금)', label: '반차', colorStyle: 'color:var(--warning);font-weight:500;' }
  ]
}

// 유형 변환
const workType = (type) => ({
  WORK: '근무', REMOTE_WORK: '재택 근무', BUSINESS_TRIP: '출장', ADDITIONAL: '초과근무',
  OVERTIME: '연장근무', NIGHT: '야간근무', HOLIDAY: '휴일근무'
})[type] || type

const vacationType = (type) => ({
  PAID_ETC: '기타 유급휴가', UNPAID_ETC: '기타 무급휴가', DAYOFF: '연차', AM_HALF_DAYOFF: '오전 반차',
  PM_HALF_DAYOFF: '오후 반차', REFRESH: '리프레시 휴가', MILITARY_TRAINING: '군 소집 훈련', LIFE_EVENT: '경조사'
})[type] || type

// 최초 실행
onMounted(() => handleMonthChange(currentMonth.value))
</script>

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