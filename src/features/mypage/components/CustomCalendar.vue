<template>
  <div class="calendar-wrapper">
    <div class="calendar-header">

      <button class="week-button" @click="goWeekCalendar">
        <i class="fas fa-calendar-alt"></i>
      </button>
      <div class="day-button">

        <button class="header-button" @click="goToPrevMonth"><i class="fas fa-angle-left"></i></button>

        <div class="month-picker-container" @click.self="isMonthPickerOpen = false">
          <button class="month-label" @click="(e) => { e.stopPropagation(); isMonthPickerOpen = true }">
            {{ currentMonth.format('YYYY년 MM월') }}
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
                    @click="selectMonth(index)"
                    :class="{ active: index === currentMonth.month() && selectedYear === currentMonth.year() }"
                >
                  {{ index + 1 }}월
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

    <div class="calendar-grid calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <div
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        class="calendar-week-row"
    >
      <div
          v-for="day in week"
          :key="day.date"
          class="calendar-cell"
          :class="{ today: isToday(day.date), 'not-this-month': !day.inMonth }"
      >
        <div class="day-number">{{ dayjs(day.date).date() }}</div>
      </div>

      <!-- 이벤트 바 렌더링 -->
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
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const props = defineProps({events: Array})
const emit = defineEmits(['clickEvent', 'monthChanged'])

const currentMonth = ref(dayjs())
const selectedYear = ref(currentMonth.value.year())
const isMonthPickerOpen = ref(false)
const monthPickerRef = ref(null)

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const isToday = (date) => dayjs().format('YYYY-MM-DD') === date

const goToToday = () => {
  currentMonth.value = dayjs()
  selectedYear.value = currentMonth.value.year()
  emit('monthChanged', currentMonth.value)
}

const weeks = computed(() => {
  const start = currentMonth.value.startOf('month').startOf('week')
  const end = currentMonth.value.endOf('month').endOf('week')
  const days = []
  let date = start
  while (date.isSameOrBefore(end)) {
    days.push({date: date.format('YYYY-MM-DD'), inMonth: date.month() === currentMonth.value.month()})
    date = date.add(1, 'day')
  }
  const result = []
  for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))
  return result
})

const getEventIconClass = (typeName) => {
  switch (typeName) {
    case 'WORK':
      return 'fas fa-briefcase'
    case 'OVERTIME':
      return 'fas fa-clock'
    case 'VACATION':
      return 'fas fa-umbrella-beach'
    case 'BUSINESS_TRIP':
      return 'fas fa-plane-departure'
    case 'KPI':
      return 'fas fa-bullseye'
    case 'EVALUATION':
      return 'fas fa-clipboard-check'
    default:
      return 'fas fa-calendar-alt'
  }
}

const getEventRowsInWeek = (week) => {
  const weekStart = dayjs(week[0].date)
  const weekEnd = dayjs(week[6].date)

  const eventsInWeek = props.events.filter(event => {
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
      if (
          row.every(e =>
              dayjs(e.endDate).isBefore(eventStart, 'day') ||
              dayjs(e.startDate).isAfter(eventEnd, 'day')
          )
      ) {
        row.push({
          ...event,
          startDate: eventStart.format('YYYY-MM-DD'),
          endDate: eventEnd.format('YYYY-MM-DD'),
        })
        placed = true
        break
      }
    }
    if (!placed) {
      rows.push([{
        ...event,
        startDate: eventStart.format('YYYY-MM-DD'),
        endDate: eventEnd.format('YYYY-MM-DD'),
      }])
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
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  emit('monthChanged', currentMonth.value)
}

const goToNextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month')
  emit('monthChanged', currentMonth.value)
}

const changeYear = (offset) => {
  selectedYear.value += offset
}

const selectMonth = (monthIndex) => {
  currentMonth.value = dayjs(`${selectedYear.value}-${monthIndex + 1}-01`)
  emit('monthChanged', currentMonth.value)
  isMonthPickerOpen.value = false
}

// ✅ 전역 클릭 시 모달 닫힘 처리
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.day-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 1.2rem;
}

.header-button {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--blue-450);
}
.today-button,
.week-button {
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--blue-400);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--font-none);
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
  background: var(--font-none);
  margin-bottom: 2px;
  position: relative;
  min-height: 100px;
}

.calendar-cell {
  background: var(--color-surface);
  min-height: 100px;
  padding: 6px;
  position: relative;
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
</style>
