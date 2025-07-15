<template>
  <div class="calendar-wrapper">
    <!-- 헤더 -->
    <div class="calendar-header">
      <button class="week-button" @click="toggleWeekMode">
        <i class="fas fa-calendar-alt"></i>
        {{ isWeekMode ? '주간' : '월간' }}
      </button>

      <div class="day-button">
        <button class="header-button" @click="goToPrevMonth"><i class="fas fa-angle-left"></i></button>

        <!-- 월/주차 선택 모달 -->
        <div class="month-picker-container" @click.self="isMonthPickerOpen = false">
          <button class="month-label" @click="(e) => { e.stopPropagation(); isMonthPickerOpen = true }">
            {{ getMonthLabel }}
          </button>

          <div v-if="isMonthPickerOpen" class="month-picker-inline" ref="monthPickerRef">
            <div class="month-picker" @click.stop>
              <div class="year-select">
                <button @click="changeYear(-1)">‹</button>
                <span>{{ selectedYear }}년</span>
                <button @click="changeYear(1)">›</button>
              </div>

              <div class="months-grid">
                <button
                    v-for="(month, index) in 12"
                    :key="index"
                    @click="selectMonthForWeek(index)"
                    :class="{ active: index === selectedMonth }"
                >
                  {{ index + 1 }}월
                </button>
              </div>

              <div v-if="isWeekMode && selectedMonth !== null" class="weeks-row">
                <button
                    v-for="(week, index) in getWeeksOfMonth(selectedYear, selectedMonth + 1)"
                    :key="index"
                    @click="selectWeek(selectedYear, selectedMonth + 1, index)"
                >
                  {{ index + 1 }}주차
                </button>
              </div>
            </div>
          </div>
        </div>

        <button class="header-button" @click="goToNextMonth"><i class="fas fa-angle-right"></i></button>
      </div>

      <button class="today-button" @click="goToToday">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <!-- 요일 헤더 -->
    <div class="calendar-grid calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- 월간 보기 -->
    <template v-if="!isWeekMode">
      <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="calendar-week-row">
        <div
            v-for="day in week"
            :key="day.date"
            class="calendar-cell"
            :class="{ today: isToday(day.date), 'not-this-month': !day.inMonth }"
        >
          <div class="day-number">{{ dayjs(day.date).date() }}</div>
        </div>

        <template v-for="(row, rowIndex) in getEventRowsInWeek(week)">
          <div
              v-for="(event, eventIndex) in row"
              :key="`${event.title}-${event.startDate}-${event.endDate}-row-${rowIndex}-i-${eventIndex}`"
              class="event-bar"
              :style="getEventStyle(event, week, rowIndex)"
              @click="$emit('clickEvent', event)"
          >
            <i :class="getEventIconClass(event.typeName)" class="event-icon"></i>
            {{ event.title }}
          </div>
        </template>
      </div>
    </template>

    <!-- 주간 보기 -->
    <template v-else>
      <div class="calendar-week-row week-mode">
        <div
            v-for="day in getCurrentWeek"
            :key="day.date"
            class="calendar-cell week-mode-cell"
            :class="{ today: isToday(day.date), 'not-this-month': !day.inMonth }"
        >
          <div class="day-number">{{ dayjs(day.date).date() }}</div>
        </div>

        <template v-for="(row, rowIndex) in getEventRowsInWeek(getCurrentWeek)">
          <div
              v-for="(event, eventIndex) in row"
              :key="`${event.title}-${event.startDate}-${event.endDate}-row-${rowIndex}-i-${eventIndex}`"
              class="event-bar"
              :style="getEventStyle(event, getCurrentWeek, rowIndex)"
              @click="$emit('clickEvent', event)"
          >
            <i :class="getEventIconClass(event.typeName)" class="event-icon"></i>
            {{ event.title }}
          </div>
        </template>
      </div>

      <!-- 범례 -->
      <div class="legend">
        <span class="legend-item"><i class="fas fa-circle" style="color: var(--label-pending)"></i> 대기</span>
        <span class="legend-item">
          <i class="fas fa-circle" style="color: var(--gray-300)"></i>
          <i class="fas fa-circle" style="color: var(--blue-100)"></i>
          <i class="fas fa-circle" style="color: var(--blue-200)"></i>
          <i class="fas fa-circle" style="color: var(--blue-400)"></i> 진행 중
        </span>
        <span class="legend-item"><i class="fas fa-circle" style="color: var(--green-200)"></i> 완료</span>
        <span class="legend-item"><i class="fas fa-circle" style="color: var(--warning)"></i> 기한 초과</span>
        <span class="legend-item"><i class="fas fa-circle" style="color: var(--success)"></i> 달성</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const props = defineProps({ events: Array })
const emit = defineEmits(['clickEvent', 'monthChanged'])

const currentMonth = ref(dayjs())
const selectedYear = ref(currentMonth.value.year())
const isMonthPickerOpen = ref(false)
const isWeekMode = ref(false)
const monthPickerRef = ref(null)
const selectedMonth = ref(null)

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const isToday = (date) => dayjs().format('YYYY-MM-DD') === date

const goToToday = () => {
  currentMonth.value = dayjs()
  selectedYear.value = currentMonth.value.year()
  emit('monthChanged', currentMonth.value)
}

const toggleWeekMode = () => {
  isWeekMode.value = !isWeekMode.value
  selectedMonth.value = null
  emit('monthChanged', currentMonth.value)
}

const getMonthLabel = computed(() => {
  const base = currentMonth.value.format('YYYY년 MM월')
  return isWeekMode.value ? `${base} ${selectedWeekIndex.value + 1}주차` : base
})

const weeks = computed(() => {
  const start = currentMonth.value.startOf('month').startOf('week')
  const end = currentMonth.value.endOf('month').endOf('week')
  const days = []
  let date = start
  while (date.isSameOrBefore(end)) {
    days.push({ date: date.format('YYYY-MM-DD'), inMonth: date.month() === currentMonth.value.month() })
    date = date.add(1, 'day')
  }
  return Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))
})

const selectedWeekIndex = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month').startOf('week')
  const startOfWeek = currentMonth.value.startOf('week')
  const diff = startOfWeek.diff(startOfMonth, 'week')
  return diff >= 0 ? diff : 0
})

const getCurrentWeek = computed(() => {
  const start = currentMonth.value.startOf('week')
  return Array.from({ length: 7 }, (_, i) => {
    const date = start.add(i, 'day')
    return {
      date: date.format('YYYY-MM-DD'),
      inMonth: date.month() === currentMonth.value.month()
    }
  })
})

const getEventIconClass = (typeName) => {
  return {
    WORK: 'fas fa-briefcase',
    REMOTE_WORK: 'fas fa-home',
    ADDITIONAL: 'fas fa-clock', // 초과 근무 (연장, 야간, 휴일 근무 포괄)
    VACATION: 'fas fa-umbrella-beach',
    BUSINESS_TRIP: 'fas fa-plane-departure',
    KPI: 'fas fa-tasks',
    평가: 'fas fa-clipboard-check'
  }[typeName] || 'fas fa-calendar-alt'
}

const getEventRowsInWeek = (week) => {
  const weekStart = dayjs(week[0].date)
  const weekEnd = dayjs(week[6].date)

  const eventsInWeek = props.events.filter(event => {
    if (!isWeekMode.value && event.typeName === 'KPI') return false
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)
    return end.isSameOrAfter(weekStart, 'day') && start.isSameOrBefore(weekEnd, 'day')
  })

  const rows = []
  for (const event of eventsInWeek) {
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)
    const eventStart = start.isBefore(weekStart) ? weekStart : start
    const eventEnd = end.isAfter(weekEnd) ? weekEnd : end
    let placed = false
    for (const row of rows) {
      if (row.every(e =>
          dayjs(e.endDate).isBefore(eventStart, 'day') ||
          dayjs(e.startDate).isAfter(eventEnd, 'day')
      )) {
        row.push({ ...event, startDate: eventStart.format('YYYY-MM-DD'), endDate: eventEnd.format('YYYY-MM-DD') })
        placed = true
        break
      }
    }
    if (!placed) {
      rows.push([{ ...event, startDate: eventStart.format('YYYY-MM-DD'), endDate: eventEnd.format('YYYY-MM-DD') }])
    }
  }
  return rows
}

const getEventStyle = (event, week, rowIndex) => {
  const weekStart = dayjs(week[0].date)
  const start = dayjs(event.startDate)
  const end = dayjs(event.endDate)
  const offset = start.diff(weekStart, 'day')
  const span = end.diff(start, 'day') + 1
  return {
    backgroundColor: event.color,
    position: 'absolute',
    left: `${(offset / 7) * 100}%`,
    width: `${(span / 7) * 100}%`,
    top: `${rowIndex * 26 + 28}px`,
    zIndex: 2
  }
}

const goToPrevMonth = () => {
  currentMonth.value = isWeekMode.value
      ? currentMonth.value.subtract(1, 'week')
      : currentMonth.value.subtract(1, 'month')
  emit('monthChanged', currentMonth.value)
}

const goToNextMonth = () => {
  currentMonth.value = isWeekMode.value
      ? currentMonth.value.add(1, 'week')
      : currentMonth.value.add(1, 'month')
  emit('monthChanged', currentMonth.value)
}

const selectMonthForWeek = (monthIndex) => {
  const newMonth = dayjs(`${selectedYear.value}-${monthIndex + 1}-01`)
  currentMonth.value = newMonth
  emit('monthChanged', newMonth)

  if (!isWeekMode.value) {
    // 월간 모드일 경우: 바로 닫고 selectedMonth는 사용하지 않음
    isMonthPickerOpen.value = false
    selectedMonth.value = null
    return
  }

  // 주간 모드일 경우: 주차 선택 활성화
  selectedMonth.value = monthIndex
}


const getWeeksOfMonth = (year, month) => {
  const firstDay = dayjs(`${year}-${month}-01`).startOf('week')
  const lastDay = dayjs(`${year}-${month}-01`).endOf('month').endOf('week')
  const totalDays = lastDay.diff(firstDay, 'day') + 1
  return Array.from({ length: Math.ceil(totalDays / 7) })
}

const selectWeek = (year, monthIndex, weekIndex) => {
  const firstCalendarDay = dayjs(`${year}-${monthIndex}-01`).startOf('week')
  const selectedWeekStart = firstCalendarDay.add(weekIndex * 7, 'day')
  currentMonth.value = selectedWeekStart
  selectedYear.value = selectedWeekStart.year()
  isMonthPickerOpen.value = false
  selectedMonth.value = null
  emit('monthChanged', currentMonth.value)
}

const changeYear = (offset) => {
  selectedYear.value += offset
}

const handleClickOutside = (e) => {
  if (isMonthPickerOpen.value && monthPickerRef.value && !monthPickerRef.value.contains(e.target)) {
    isMonthPickerOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.day-button {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 1.2rem;
  padding-right: 3rem;
}

.header-button, .today-button, .week-button {
  font-size: 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--blue-450);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-weekdays {
  margin-bottom: 6px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  background: var(--color-muted-light);
  padding: 10px 0;
}

.calendar-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  position: relative;
  min-height: 100px;
}

.calendar-week-row.week-mode {
  min-height: 140px;
}

.calendar-cell {
  background: var(--color-surface);
  padding: 6px;
  min-height: 100px;
  position: relative;
}

.calendar-cell.week-mode-cell {
  min-height: 380px;
}

.calendar-cell.today {
  background: var(--blue-50);
  border: 2px solid var(--blue-450);
}

.calendar-cell.not-this-month {
  color: var(--gray-300);
  background: var(--gray-50);
}

.day-number {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.event-bar {
  font-size: 0.75rem;
  padding: 4px 6px;
  border-radius: 4px;
  color: var(--color-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  height: 24px;
}

.event-bar .event-icon {
  margin-right: 4px;
}

.month-label {
  background: none;
  border: none;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--font-color);
  cursor: pointer;
}

.month-picker-container {
  position: relative;
}

.month-picker {
  background: var(--color-surface);
  padding: 20px;
  border-radius: 8px;
  width: 260px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.year-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.year-select button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.months-grid button {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  border-radius: 4px;
  cursor: pointer;
}

.months-grid button.active {
  background: var(--blue-400);
  color: var(--color-surface);
  font-weight: bold;
}

.month-picker-inline {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.fa-calendar-alt {
  margin-right: 4px;
}

.weeks-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  border-top: 1px solid var(--gray-200);
  padding-top: 10px;
}

.weeks-row button {
  padding: 4px 8px;
  font-size: 0.85rem;
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  border-radius: 4px;
  cursor: pointer;
}

.weeks-label {
  width: 100%;
  font-weight: bold;
  margin-bottom: 6px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin: 12px 0;
  align-items: center;
  justify-content: flex-end;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--font-sub);
  white-space: nowrap;
}

</style>
