<template>
  <aside :class="['sidebar', { collapsed }]">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <button class="side-btn" @click="handleCreateAttendance" :disabled="isLoading">
            <i :class="[isAttended ? 'fas fa-hourglass-end' : 'fas fa-hourglass-start', 'shake-icon']"></i>
          </button>
        </div>
        <div class="profile-content">
          <h2 class="sidebar-title"> {{ profile.name }} </h2>
          <span class="profile-label">{{ profile.department }} / {{ profile.position }}</span>
        </div>
        <span class="top-icons">
        <button class="sidebar-toggle" @click="toggleAlertPanel">
          <i class="fas fa-bell notification-icon"></i>
        </button>
      </span>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i
            class="fas fa-bars"
            :class="{ 'rotate-icon': collapsed }"
        ></i>
      </button>
    </div>

    <!-- Alert Panel -->
    <AlertPanel :visible="showAlertPanel" @close="toggleAlertPanel"/>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div v-for="(menu, index) in menuItems" :key="index">
        <template v-if="isAllowed(menu)">
          <template v-if="menu.subItems && hasVisibleSubItems(menu)">
            <a
                href="#"
                class="sidebar-item"
                @click.prevent="toggleSubmenu(index)"
                :class="{ active: openSubmenu === index || isSubmenuActive(menu.subItems) }"
            >
              <i :class="['fas', menu.icon]"></i>
              <span class="sidebar-label">{{ menu.label }}</span>
              <i
                  class="fas fa-chevron-right sidebar-sub-toggle"
                  :class="{ open: openSubmenu === index || isSubmenuActive(menu.subItems) }"
              ></i>
            </a>

            <div
                class="sidebar-indent"
                :class="{ open: openSubmenu === index || isSubmenuActive(menu.subItems) }"
            >
              <template v-for="(sub, i) in menu.subItems" :key="i">
                <router-link
                    v-if="isAllowed(sub)"
                    :to="resolveRoute(sub.hrefs)"
                    class="sidebar-item"
                    :class="{
                      active: sub.activeMatch === 'startsWith'
                          ? getActiveMatch(sub)
                          : isActive(resolveRouteList(sub.hrefs))
                    }"
                >
                  {{ sub.label }}
                </router-link>
              </template>
            </div>
          </template>

          <template v-else-if="!menu.subItems">
            <router-link
                :to="resolveRoute(menu.hrefs)"
                class="sidebar-item"
                :class="{ active: isActive(resolveRouteList(menu.hrefs)) }"
            >
              <i :class="['fas', menu.icon]"></i>
              <span class="sidebar-label">{{ menu.label }}</span>
            </router-link>
          </template>
        </template>
      </div>
    </nav>


    <!-- Footer -->
    <div class="sidebar-footer">
      <router-link
          to="/setting"
          class="sidebar-item"
          :class="{ active: route.path.startsWith('/setting') }"
          v-if="userRole.includes('MASTER')"
      >
        <i class="fas fa-cog"></i>
        <span class="sidebar-label">설정</span>
      </router-link>

      <div class="sidebar-item" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="sidebar-label">로그아웃</span>
      </div>
    </div>
  </aside>


  <!-- 출퇴근 모달 -->
  <AttendanceModal
      :visible="showAttendanceModal"
      :clock-info="clockInfo"
      :format-time="formatTime"
      :format-duration="formatDuration"
      :mode="isAttended ? 'end' : 'start'"
      @confirm="submitAttendance"
      @cancel="closeAttendanceModal"
  />
</template>

<script setup>
/* ======================== 공통 모듈 ======================== */
import {ref, reactive, onMounted, onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import {storeToRefs} from 'pinia'
import router from '@/router'
import {useToast} from 'vue-toastification'

/* ======================== 외부 컴포넌트 ======================== */
import AlertPanel from '@/components/common/AlertPanel.vue'
import AttendanceModal from '@/features/works/components/AttendanceModal.vue'

/* ======================== 스토어 & API ======================== */
import {useAuthStore} from '@/stores/auth.js'
import {logoutUser} from '@/features/common/api.js'
import {startWork, endWork} from '@/features/works/api.js'
import {getEvaluationRoundStatus} from '@/features/performance/api.js'
import {useAttendance} from '@/features/works/composable/useAttendance.js'
import {fetchCompanyInfo} from "@/features/company/api.js";
import {fetchEmpInfo} from '@/features/mypage/api.js'

/* ======================== 기본 상태 ======================== */
const authStore = useAuthStore()
const {userRole} = storeToRefs(authStore)
const route = useRoute()
const toast = useToast()

const collapsed = ref(false)
const openSubmenu = ref(null)
const showAlertPanel = ref(false)
const roundStatus = ref({inProgress: false, roundId: null})
const companyName = ref('')

/* ======================== 출퇴근 상태 ======================== */
const profile = reactive({
  name: '',
  department: '',
  position: '',
})

const getProfile = async () => {
  try {
    const resp = await fetchEmpInfo()
    const emp = resp?.data?.data?.employeeDetails

    profile.name = emp.name
    profile.department = emp.deptName || '-'
    profile.position = emp.positionName || '-'
  } catch (e) {
    console.error("사원 정보 불러오기 실패", e)
  }
}

/* ======================== 출퇴근 상태 ======================== */
const {
  isAttended,
  isLoading,
  showAttendanceModal,
  clockInfo,
  handleCreateAttendance,
  closeAttendanceModal,
  fetchTodayAttendance,
  stopClockUpdater,
  getStartTime
} = useAttendance()

/* ======================== 메뉴 정의 (FA 아이콘 직접 입력) ======================== */
const menuItems = [
  {
    label: '회사 정보',
    icon: 'fa-city',
    subItems: [
      {label: '회사 정보', hrefs: ['/company/company-info']},
      {label: '조직도', hrefs: ['/company/org-chart']}
    ]
  },
  {
    label: '사원 관리',
    icon: 'fa-users',
    subItems: [
      {label: '사원 목록 조회', hrefs: ['/employees'], activeMatch: "startsWith"},
      {label: '인사 발령 내역 조회', hrefs: ['/appoints']},
      {label: '계약서 목록 조회', hrefs: ['/contracts']}
    ],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '근태 관리',
    icon: 'fa-clock',
    hrefs: ['/works'],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '내 정보',
    icon: 'fa-user',
    subItems: [
      {label: '대시보드', hrefs: ['/mypage/dashboard']},
      {label: '내 정보 조회', hrefs: ['/mypage/profile']},
      {label: '내 계약서 조회', hrefs: ['/mypage/my-contracts']}
    ]
  },
  {
    label: '결재 관리',
    icon: 'fa-tasks',
    subItems: [
      {
        label: '전체 결재 내역',
        hrefs: ['/approvals'],
        requireRole: ['MASTER', 'HR_MANAGER'],
        activeMatch: 'startsWith'
      },
      {
        label: '문서함',
        hrefs: ['/approval/inbox', '/approval/write'],
        activeMatch: 'startsWith'
      }
    ]
  },
  {
    label: '평가 관리',
    icon: 'fa-chart-bar',
    subItems: [
      {
        label: 'KPI 분석',
        hrefs: ['/kpi/statics', '/kpi/employee-kpis', '/kpi/employee-detail'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {label: 'KPI 조회', hrefs: ['/kpi/kpi-list']},
      {
        label: 'KPI 요청 관리',
        hrefs: ['/kpi/requests'],
        requireRole: ['MANAGER']
      },
      {
        label: '평가 관리',
        hrefs: ['/eval/manage-peer', '/eval/manage-org', '/eval/manage-self', '/eval/round'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {
        label: '다면 평가 제출',
        hrefs: ['/eval/submit'],
        required: () => roundStatus.value.inProgress === true
      },
      {label: '인사 평가 조회', hrefs: ['/hr/hr-list']},
      {
        label: '이의 제기 관리',
        hrefs: ['/hr/my-objection', '/hr/objection-requests']
      }
    ]
  },
  {
    label: '근속 지원',
    icon: 'fa-headset',
    subItems: [
      {
        label: '근속 전망',
        hrefs: ['/retention/prospect-dash', '/retention/prospect-employees', '/retention/prospect-rounds',],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {
        label: '면담 기록',
        hrefs: ['/retention/my-contacts', '/retention/contact-list'],
        requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
      }
    ],
    requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
  },
  {
    label: '공지사항',
    icon: 'fa-bullhorn',
    hrefs: ['/announcement']
  }
]

/* ======================== 유틸: 메뉴 접근 제어 및 라우팅 ======================== */
function isAllowed(item) {
  if (!item) return false
  if (typeof item.required === 'function' && !item.required()) return false
  if (!item.requireRole || item.requireRole.length === 0) return true
  return item.requireRole.some(role => userRole.value.includes(role))
}

function hasVisibleSubItems(menu) {
  return Array.isArray(menu?.subItems) && menu.subItems.some(isAllowed)
}

function resolveRoute(hrefs) {
  if (typeof hrefs === 'function') {
    const result = hrefs()
    if (result?.length > 0) {
      return {path: result[0], state: {roundId: roundStatus.value.roundId}}
    }
    return '/'
  }
  return Array.isArray(hrefs) && hrefs.length > 0 ? hrefs[0] : '/'
}

function resolveRouteList(hrefs) {
  return typeof hrefs === 'function'
      ? userRole.value.flatMap(role => hrefs(role) || []).filter(Boolean)
      : Array.isArray(hrefs) ? hrefs.filter(Boolean) : []
}

function isActive(hrefs) {
  const currentPath = route.path
  const list = Array.isArray(hrefs) ? hrefs : [hrefs]
  return list.some(href => currentPath.endsWith(href.replace('../', '/')))
}

function isActiveStartsWith(hrefs) {
  const currentPath = route.path
  const list = Array.isArray(hrefs) ? hrefs : [hrefs]
  return list.some(href => currentPath.startsWith(href.replace('../', '/')))
}

function getActiveMatch(item) {
  // 먼저 현재 라우트 출처를 확인
  const source = route.state?.source || route.query?.from

  // 출처와 메뉴 라벨 조합으로 분기 처리
  if (item.label === '전체 결재 내역' && source === 'approvals') {
    return isActiveStartsWith(['/approval/detail', '/approvals'])
  }

  if (item.label === '문서함' && source === 'inbox') {
    return isActiveStartsWith(['/approval/detail', '/approval/inbox', '/approval/write'])
  }

  // 그 외: activeMatch === 'startsWith' 여부로 처리
  if (item.activeMatch === 'startsWith') {
    return isActiveStartsWith(item.hrefs)
  }
}


function isSubmenuActive(subItems) {
  return subItems.some(item => isAllowed(item) && isActive(resolveRouteList(item.hrefs)))
}

/* ======================== UI 토글 ======================== */
function toggleSidebar() {
  collapsed.value = !collapsed.value
  openSubmenu.value = null
}

function toggleSubmenu(index) {
  openSubmenu.value = openSubmenu.value === index ? null : index
}

function toggleAlertPanel() {
  showAlertPanel.value = !showAlertPanel.value
}

/* ======================== 출퇴근 ======================== */
const submitAttendance = async () => {
  isLoading.value = true
  try {
    if (!isAttended.value) {
      await startWork()
    }
    if (isAttended.value) {
      await endWork()
    }
    await fetchTodayAttendance()
    toast.success('출퇴근 등록 완료')
    closeAttendanceModal()
  } catch (e) {
    const message = e?.response?.data?.message;
    toast.error(message || '출퇴근 처리 실패')
  } finally {
    isLoading.value = false
  }
}

function formatTime(datetime) {
  return datetime ? datetime.toLocaleString().slice(0, -3) : '-'
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  return parts.length ? parts.join(' ') : '0분';
}

/* ======================== 로그아웃 ======================== */
async function handleLogout() {
  try {
    await logoutUser()
  } catch (e) {
    console.error('로그아웃 실패:', e)
  }
  authStore.clearAuth()
  router.push('/login')
}

/* ======================== 초기 실행 ======================== */
onMounted(async () => {
  try {
    await getProfile()
    await getStartTime()
    await fetchTodayAttendance()
    const result = await getEvaluationRoundStatus()
    roundStatus.value = result || {inProgress: false, roundId: null}
    const companyInfo = await fetchCompanyInfo();
    companyName.value = companyInfo.data.companyInfoDTO.name;
  } catch (e) {
    console.error('초기 로딩 실패', e)
  }
})

onUnmounted(() => {
  stopClockUpdater()
})
</script>

<style scoped>
/* ================= 공통 레이아웃 ================= */
.sidebar {
  width: 23rem;
  min-width: 4.8rem;
  height: 100%;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  background: var(--side-background);
  color: var(--color-surface);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition:
      width 0.4s ease,
      transform 0.6s ease,
      padding 0.3s ease;
}

/* ================= 헤더 ================= */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.3rem;
  border-bottom: 3px dotted var(--gray-700);
}

.sidebar-brand {
  display: flex;
  align-items: center;
}

.sidebar-logo {
  width: 2.8rem;
  height: 2.8rem;
  background: var(--icon-gradient);
  border-radius: var(--radius-full);
  box-shadow: var(--filter-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.profile-content,
.sidebar-label,
.sidebar-indent {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(0);
  transition: max-width 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.profile-label {
  font-size: 0.8rem;
  color: var(--font-none);
}

.notification-icon {
  font-size: 18px;
}
/* ================= 토글 버튼 ================= */
.sidebar-toggle,
.side-btn {
  background: none;
  border: none;
  color: var(--color-surface);
  cursor: pointer;
  font-size: 1rem;
}

.side-btn {
  font-size: 20px;
}

.top-icons {
  display: flex;
  align-items: center;
  margin-left: 4.5rem;
}

/* ================= 내비게이션 ================= */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: var(--gray-300);
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: background 0.2s, color 0.2s;
}

.sidebar-item:hover,
.sidebar-item.active {
  background-color: var(--gray-600);
  color: var(--color-surface);
}

.sidebar-item.highlighted {
  background-color: var(--blue-300);
  color: var(--color-surface);
}

/* 서브 토글 아이콘 */
.sidebar-sub-toggle {
  margin-left: auto;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.sidebar-item.active .sidebar-sub-toggle {
  transform: rotate(90deg);
}

/* 서브메뉴 */
.sidebar-indent {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.sidebar-indent.open {
  max-height: 500px;
}

.sidebar-indent .sidebar-item.active {
  background-color: var(--gray-700);
  color: var(--gray-50);
}

/* ================= 푸터 ================= */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1.3rem;
  border-top: 3px dotted var(--gray-600);
}

/* ================= Collapsed 상태 ================= */
.sidebar.collapsed {
  width: 4.8rem;
}

.sidebar.collapsed .profile-content,
.sidebar.collapsed .sidebar-title,
.sidebar.collapsed .profile-label,
.sidebar.collapsed .sidebar-label,
.sidebar.collapsed .sidebar-indent,
.sidebar.collapsed .sidebar-sub-toggle,
.sidebar.collapsed .sidebar-logo,
.sidebar.collapsed .side-btn,
.sidebar.collapsed .notification-icon {
  display: none;
}

.sidebar.collapsed .sidebar-brand {
  width: 0;
  margin-left: 0;
  overflow: hidden;
}

.sidebar.collapsed .sidebar-item {
  justify-content: center;
}

.sidebar.collapsed .sidebar-item i {
  margin-right: 0;
}

.sidebar.collapsed .fa-bars::before {
  margin-left: 0.4rem;
}

.sidebar.collapsed .profile-content,
.sidebar.collapsed .sidebar-label {
  opacity: 0;
  max-width: 0;
}

/* ================= 아이콘 애니메이션 ================= */
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.fas.fa-bars {
  transition: transform 0.3s ease;
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

.shake-icon {
  animation: shake 1s infinite;
  display: inline-block;
}


</style>
