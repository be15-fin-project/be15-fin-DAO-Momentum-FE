// useAttendance.js
import {computed, reactive, ref} from "vue";
import {fetchCompanyInfo} from "@/features/company/api.js";
import {getMyTodaysAttendance} from "@/features/works/api.js";
import {useToast} from "vue-toastification";

export function useAttendance() {
    const todaysWork = ref(null)
    const isAttended = ref(false)
    const hasAmHalfDayoff = ref(false)
    const hasPmHalfDayoff = ref(false)
    const hasDayoff = ref(false)
    const hasVacation = ref(false)
    const hasApprovedWork = ref(false)
    const isWeekend = ref(false)
    const isHoliday = ref(false)
    const showAttendanceModal = ref(false)
    const toast = useToast()

    const isLoading = ref(false)

    const workAlreadyEnded = computed(() => {
        return !!(todaysWork.value?.endPushedAt)
    })

    const clockInfo = reactive({
        now: null,
        startTime: null,
        endTime: null,
        breakTime: 0,
        workTime: 0
    })

    let timer = null
    let cachedStartTime = null

    async function getStartTime() {
        if (cachedStartTime) return cachedStartTime
        const resp = await fetchCompanyInfo()
        cachedStartTime = resp.data.companyInfoDTO.workStartTime
        return cachedStartTime
    }

    async function fetchTodayAttendance() {
        try {
            const resp = await getMyTodaysAttendance()
            todaysWork.value = resp.attendance
            isAttended.value = !!todaysWork.value
            hasAmHalfDayoff.value = !!resp.amHalfDayoff
            hasPmHalfDayoff.value = !!resp.pmHalfDayoff
            hasDayoff.value = !!resp.dayoff
            hasVacation.value = !!resp.vacation
            hasApprovedWork.value = !!resp.approvedWork
            isWeekend.value = resp.weekend
            isHoliday.value = resp.holiday
        } catch (e) {
            console.error('출근 상태 조회 실패', e)
        }
    }

    async function updateClockInfo(referenceTime = new Date()) {
        const companyStartTime = await getStartTime()
        const [h, m] = companyStartTime.split(':').map(Number)

        let companyEndAt = new Date()
        if (hasPmHalfDayoff.value) {
            companyEndAt.setHours(h + 4, m + 30, 0, 0)
        } else {
            companyEndAt.setHours(h + 9, m, 0, 0)
        }

        if (!todaysWork.value || !todaysWork.value.startAt) {
            Object.assign(clockInfo, {
                now: referenceTime,
                startTime: null,
                endTime: companyEndAt, // 예상 퇴근 일시
                breakTime: 0,
                workTime: 0
            })
            return
        }

        const start = new Date(todaysWork.value.startAt)
        start.setSeconds(0, 0)
        const now = new Date(referenceTime)
        now.setSeconds(0, 0)

        const endAt = new Date(Math.min(now, companyEndAt))
        const diffMins = Math.floor((endAt - start) / 60000)

        let breakMinutes = 0
        if (diffMins >= 510) breakMinutes = 60
        else if (diffMins >= 240) breakMinutes = 30

        Object.assign(clockInfo, {
            now,
            startTime: start,
            endTime: endAt,
            breakTime: breakMinutes,
            workTime: diffMins - breakMinutes
        })
    }

    const attendanceStatus = computed(() => {
        // 1. 휴일이나 주말
        if (isWeekend.value || isHoliday.value) {
            return 'DONE'
        }

        // 2. 승인된 근무/휴가
        if (hasDayoff.value || hasVacation.value || hasApprovedWork.value) {
            return 'DONE'
        }

        if (!isAttended.value) {
            return 'NEED_START' // 출근 등록 필요
        } else if (isAttended.value && !workAlreadyEnded.value) {
            return 'NEED_END' // 퇴근 등록 필요
        } else {
            return 'DONE' // 퇴근 완료
        }
    })

    const attendanceIconClass = computed(() => {
        let baseClass = ''

        if (attendanceStatus.value === 'NEED_END') {
            baseClass = 'fas fa-hourglass-end'
        } else if (attendanceStatus.value === 'NEED_START') {
            baseClass = 'fas fa-briefcase'
        } else {
            baseClass = 'fas fa-home'
        }

        const pulse = attendanceStatus.value === 'NEED_START'
        const shake = attendanceStatus.value === 'NEED_END'
        return [baseClass, {'pulse-icon': pulse }, {'shake-icon': shake}]
    })

    const handleCreateAttendance = async () => {
        isLoading.value = true;
        const hasTwoHalfDayoffs = !!hasAmHalfDayoff.value && !!hasPmHalfDayoff.value;
        if (isWeekend.value) {
            toast.error("승인 없는 주말 근무는 불가능합니다.")
            isLoading.value = false;
            return
        }
        if (isHoliday.value) {
            toast.error("승인 없는 휴일 근무는 불가능합니다.")
            isLoading.value = false;

            return
        }
        if (hasDayoff.value || hasVacation.value || hasApprovedWork.value || hasTwoHalfDayoffs) {
            toast.error("이미 승인된 근무 또는 휴가가 존재합니다.")
            isLoading.value = false;

            return
        }
        if (workAlreadyEnded.value) {
            toast.error("이미 퇴근 등록된 근무일입니다.")
            isLoading.value = false;

            return
        }
        startClockUpdater()
        await updateClockInfo(new Date())
        openAttendanceModal()
        isLoading.value = false;
    }

    function startClockUpdater() {
        // 1) 기존 타이머 있으면 정리
        if (timer) {
            clearTimeout(timer)
            clearInterval(timer)
        }

        // 2) 지금 시각
        const now = new Date()
        // 다음 “분”의 0초까지 남은 밀리초 계산
        const msToNextMinute =
            (60 - now.getSeconds()) * 1000
            - now.getMilliseconds()

        // 3) 그 시점에 한 번만 updateClockInfo 실행하고,
        //    이후 매 60초마다 실행하기
        timer = setTimeout(() => {
            updateClockInfo(new Date())

            // 이후엔 정확히 매분 0초마다 실행
            timer = setInterval(() => {
                updateClockInfo(new Date())
            }, 60_000)
        }, msToNextMinute)
    }

    function stopClockUpdater() {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    function openAttendanceModal() {
        showAttendanceModal.value = true
    }

    function closeAttendanceModal() {
        stopClockUpdater()
        showAttendanceModal.value = false
    }

    return {
        todaysWork,
        isAttended,
        hasDayoff,
        hasVacation,
        hasApprovedWork,
        isWeekend,
        isHoliday,
        isLoading,
        showAttendanceModal,
        clockInfo,
        workAlreadyEnded,
        attendanceStatus,
        attendanceIconClass,
        handleCreateAttendance,
        closeAttendanceModal,
        fetchTodayAttendance,
        stopClockUpdater,
        getStartTime
    }
}
