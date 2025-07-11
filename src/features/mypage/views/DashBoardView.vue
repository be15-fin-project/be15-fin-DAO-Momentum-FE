<template>
  <div class="dashboard-layout">
    <aside class="dashboard-side">
      <ProfileCard v-bind="profile"/>
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
        <CustomCalendar
            :events="events"
            @clickEvent="handleEventClick"
            @monthChanged="handleMonthChange"
        />
      </div>

      <DocumentCard/>

      <KpiCard :kpis="kpis" @clickKpi="handleKpiClick"/>
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
import { useCalendarEvents } from '@/features/mypage/useCalendarEvents.js'
import { getMyKpiDashboard } from '@/features/performance/api.js'

// 컴포넌트
import ProfileCard from '@/features/mypage/components/ProfileCard.vue'
import VacationInfoCard from '@/features/mypage/components/VacationInfoCard.vue'
import DocumentCard from '@/features/mypage/components/DocumentCard.vue'
import KpiCard from '@/features/mypage/components/KpiCard.vue'
import NoticeCard from '@/features/mypage/components/NoticeCard.vue'
import CalendarAttendanceModal from '@/features/works/components/CalendarAttendanceModal.vue'
import CustomCalendar from '@/features/mypage/components/CustomCalendar.vue'

// 상태 및 로직
const currentMonth = ref(dayjs())
const events = ref([])
const kpis = ref([])

const showCalendarModal = ref(false)
const selectedAttendance = ref(null)
const isWork = computed(() => selectedAttendance.value?.typeName === 'WORK')
const router = useRouter()

// Calendar 공통 이벤트 로직 불러오기
const { fetchCalendarEvents, kpiEvents } = useCalendarEvents()

// 이벤트 클릭 핸들링
const handleEventClick = (event) => {
  selectedAttendance.value = event

  if (event.typeName === '평가') {
    const today = dayjs()
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)
    if (today.isBetween(start, end, null, '[]')) {
      router.push('/eval/submit')
    }
    return
  }

  if (event.typeName === 'KPI') {
    router.push({ path: '/kpi/kpi-list', query: { kpiId: event.kpiId } })
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
  events.value = await fetchCalendarEvents(month)

  const startDate = month.startOf('month').format('YYYY-MM-DD')
  const endDate = month.endOf('month').format('YYYY-MM-DD')
  const rawKpis = await getMyKpiDashboard({ startDate, endDate, limit: 3 })

  // KPI 데이터를 카드에서 사용 가능한 형식으로 가공
  kpis.value = rawKpis.map((item) => ({
    kpiId: item.kpiId,
    title: item.goal,
    goal: item.goalValue + '%',
    progress: item.kpiProgress,
    progressLabel: item.kpiProgress + '%',
    variant: getProgressVariant(item.kpiProgress),
    statusType: item.statusType,
    deadline: item.deadline
  }))

}

function getProgressVariant(progress) {
  if (progress === 0) return 'danger'
  if (progress >= 100) return 'success'
  if (progress >= 50) return 'accent'
  return '' // 기본 파란색
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

const vacationInfo = {
  remainingDays: 15,
  vacations: [
    { date: '6월 12일 (수)', label: '연차', colorStyle: 'color:var(--warning);font-weight:500;' },
    { date: '6월 19일 (수)', label: '외근 (고객사 방문)', colorStyle: 'color:var(--blue-400);font-weight:500;' },
    { date: '6월 28일 (금)', label: '반차', colorStyle: 'color:var(--warning);font-weight:500;' }
  ]
}

const handleKpiClick = (kpiId) => {
  if (kpiId) {
    router.push({ path: '/kpi/kpi-list', query: { kpiId } })
  }
}

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
