import { ref } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

// API 임포트
import { getMyWorks } from '@/features/works/api.js'
import { getHolidaysPerMonth } from '@/features/company/api.js'
import { getEvaluationRounds } from '@/features/performance/api.js'
import { getMyKpiDashboard } from '@/features/performance/api.js'

export function useCalendarEvents() {
    const workEvents = ref([])
    const holidayEvents = ref([])
    const evaluationEvents = ref([])
    const kpiEvents = ref([])

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

    const getColor = (item) => {
        switch (item.typeName) {
            case 'VACATION': return 'var(--success)'
            default: return 'var(--blue-400)'
        }
    }

    const parseTitle = (item) => {
        if (item.typeName === 'VACATION') return vacationType(item.vacationType)
        if (item.typeName === 'ADDITIONAL') return workType(item.childTypeName)
        return workType(item.typeName)
    }

    const workType = (type) => ({
        WORK: '근무', REMOTE_WORK: '재택 근무', BUSINESS_TRIP: '출장', ADDITIONAL: '초과근무',
        OVERTIME: '연장근무', NIGHT: '야간근무', HOLIDAY: '휴일근무'
    })[type] || type

    const vacationType = (type) => ({
        PAID_ETC: '기타 유급휴가', UNPAID_ETC: '기타 무급휴가', DAYOFF: '연차', AM_HALF_DAYOFF: '오전 반차',
        PM_HALF_DAYOFF: '오후 반차', REFRESH: '리프레시 휴가', MILITARY_TRAINING: '군 소집 훈련', LIFE_EVENT: '경조사'
    })[type] || type

    const convertHolidayToEvent = (holiday) => ({
        title: holiday.holidayName,
        startDate: holiday.date,
        endDate: holiday.date,
        color: 'var(--error)',
        typeName: '휴일'
    })

    const convertEvaluationToEvent = (round) => ({
        title: `평가기간 (${round.roundNo}회차)`,
        startDate: round.startAt,
        endDate: round.endAt,
        color: 'var(--warning)',
        typeName: '평가'
    })

    const getKpiColor = (statusType, progress, deadline) => {
        const now = dayjs()
        const isDeadlinePassed = deadline && dayjs(deadline).isBefore(now, 'day')

        if (statusType === 'PENDING') return 'var(--label-pending)'
        if (statusType === 'ACCEPTED') {
            if (isDeadlinePassed && progress < 100) return 'var(--warning)'
            if (progress === 100) return 'var(--green-200)'
            if (progress >= 75) return 'var(--blue-400)'
            if (progress >= 50) return 'var(--blue-200)'
            if (progress >= 25) return 'var(--blue-100)'
            return 'var(--gray-300)'
        }

        return 'var(--gray-200)'
    }

    const fetchCalendarEvents = async (month) => {
        const start = dayjs(month).startOf('month').subtract(7, 'day').startOf('week').format('YYYY-MM-DD')
        const end = dayjs(month).endOf('month').endOf('week').format('YYYY-MM-DD')
        const yearMonth = dayjs(month).format('YYYY-MM')

        // 휴일
        const holidayResp = await getHolidaysPerMonth(yearMonth)
        holidayEvents.value = (holidayResp.holidayGetDTOList || []).map(convertHolidayToEvent)

        // 근무
        const workResp = await getMyWorks({ searchStartDate: start, searchEndDate: end })
        workEvents.value = (workResp.works || []).map(convertWorkToEvent)

        // 평가
        const evalResp = await getEvaluationRounds()
        evaluationEvents.value = (evalResp.list || [])
            .filter(round => dayjs(round.endAt).isAfter(start) && dayjs(round.startAt).isBefore(end))
            .map(convertEvaluationToEvent)

        // KPI
        const kpiResp = await getMyKpiDashboard({ startDate: start, endDate: end, limit: 50 })
        kpiEvents.value = (kpiResp || []).map(kpi => ({
            ...kpi,
            title: kpi.goal,
            typeName: 'KPI',
            color: getKpiColor(kpi.statusType, kpi.kpiProgress, kpi.deadline),
            startDate: kpi.createdAt,
            endDate: kpi.deadline
        }))

        return [...workEvents.value, ...holidayEvents.value, ...evaluationEvents.value, ...kpiEvents.value]
    }

    return {
        fetchCalendarEvents,
        workEvents,
        holidayEvents,
        evaluationEvents,
        kpiEvents
    }
}
