// useAttendance.js
import {reactive, ref} from "vue";
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
            console.log(resp)
            todaysWork.value = resp.attendance
            isAttended.value = !!todaysWork.value
            hasAmHalfDayoff.value = !!resp.amHalfDayoff
            hasPmHalfDayoff.value = !!resp.pmHalfDayoff
            hasDayoff.value = !!resp.dayoff
            hasVacation.value = !!resp.vacation
            hasApprovedWork.value = !!resp.approvedWork
            isWeekend.value = resp.isWeekend
            isHoliday.value = resp.isHoliday
        } catch (e) {
            console.error('출근 상태 조회 실패', e)
        }
    }

    async function updateClockInfo(referenceTime = new Date()) {
        if (!todaysWork.value || !todaysWork.value.startAt) {
            Object.assign(clockInfo, {
                now: referenceTime,
                startTime: null,
                endTime: null,
                breakTime: 0,
                workTime: 0
            })
            return
        }

        const start = new Date(todaysWork.value.startAt)
        start.setSeconds(0, 0)
        const now = new Date(referenceTime)
        now.setSeconds(0, 0)

        const companyStartTime = await getStartTime()
        const [h, m] = companyStartTime.split(':').map(Number)

        let companyEndAt = new Date()
        if (hasPmHalfDayoff.value) {
            companyEndAt.setHours(h + 4, m + 30, 0, 0)
        } else {
            companyEndAt.setHours(h + 9, m, 0, 0)
        }

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

    const handleCreateAttendance = async () => {
        isLoading.value = true;
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
        if (hasDayoff.value || hasVacation.value || hasApprovedWork.value) {
            toast.error("이미 승인된 근무 또는 휴가가 존재합니다.")
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
        handleCreateAttendance,
        closeAttendanceModal,
        fetchTodayAttendance,
        stopClockUpdater,
        getStartTime
    }
}
