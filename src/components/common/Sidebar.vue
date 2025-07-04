<template>
  <aside :class="['sidebar', { collapsed }]">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <i class="fas fa-building"></i>
        </div>
        <h2 class="sidebar-title">Momentum</h2>
      </div>
      <span class="top-icons">
        <button class="side-btn" @click="handleCreateAttendance" :disabled="isLoading">
          {{ isAttended ? '퇴근' : '출근' }}
        </button>
        <button class="sidebar-toggle" @click="toggleAlertPanel">
          <i class="fas fa-bell notification-icon"></i>
        </button>
      </span>
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i
            class="fas fa-bars"
            :class="{ 'rotate-icon': collapsed }"
        ></i>

      </button>
    </div>

    <!-- Alert Panel -->
    <AlertPanel :visible="showAlertPanel" @close="toggleAlertPanel" />

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
                    :class="{ active: isActive(resolveRouteList(sub.hrefs)) }"
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

    <!-- 출퇴근 모달 -->
    <AttendanceModal
        :visible="showAttendanceModal"
        :is-attended="isAttended"
        :clock-info="clockInfo"
        :format-time="formatTime"
        :format-duration="formatDuration"
        @confirm="submitAttendance"
        @cancel="closeAttendanceModal"
    />

    <!-- Footer -->
    <div class="sidebar-footer">
      <router-link to="/setting" class="sidebar-item">
        <i class="fas fa-cog"></i>
        <span class="sidebar-label">설정</span>
      </router-link>
      <div class="sidebar-item" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="sidebar-label">로그아웃</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
/* ======================== 공통 모듈 ======================== */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import router from '@/router'
import { useToast } from 'vue-toastification'

/* ======================== 외부 컴포넌트 ======================== */
import AlertPanel from '@/components/common/AlertPanel.vue'
import AttendanceModal from '@/features/works/components/AttendanceModal.vue'

/* ======================== 스토어 & API ======================== */
import { useAuthStore } from '@/stores/auth.js'
import { logoutUser } from '@/features/common/api.js'
import { startWork, endWork } from '@/features/works/api.js'
import { getEvaluationRoundStatus } from '@/features/performance/api.js'
import { useAttendance } from '@/features/works/composable/useAttendance.js'

/* ======================== 기본 상태 ======================== */
const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)
const route = useRoute()
const toast = useToast()

const collapsed = ref(false)
const openSubmenu = ref(null)
const showAlertPanel = ref(false)
const roundStatus = ref({ inProgress: false, roundId: null })

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
      { label: '회사 정보', hrefs: ['../company/company-info'] },
      { label: '조직도', hrefs: ['../company/org-chart'] }
    ]
  },
  {
    label: '사원 관리',
    icon: 'fa-users',
    subItems: [
      { label: '사원 목록 조회', hrefs: ['../employees'] },
      { label: '인사 발령 내역', hrefs: ['../appoints'] },
      { label: '계약서 목록 조회', hrefs: ['../contracts'] }
    ],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '근태 관리',
    icon: 'fa-clock',
    hrefs: ['../works'],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '내 정보',
    icon: 'fa-user',
    subItems: [
      { label: '대시보드', hrefs: ['../mypage/dashboard'] },
      { label: '내 정보 조회', hrefs: ['../mypage/profile'] },
      { label: '계약서 내역 조회', hrefs: ['../mypage/contracts'] }
    ]
  },
  {
    label: '결재 관리',
    icon: 'fa-tasks',
    subItems: [
      {
        label: '전체 결재 내역',
        hrefs: ['../approvals'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      { label: '문서함', hrefs: ['../approval/inbox'] }
    ]
  },
  {
    label: '평가 관리',
    icon: 'fa-chart-bar',
    subItems: [
      {
        label: 'KPI 분석',
        hrefs: ['../kpi/statics', '../kpi/employee-kpis', '../kpi/employee-detail'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      { label: 'KPI 조회', hrefs: ['../kpi/kpi-list'] },
      {
        label: 'KPI 요청 관리',
        hrefs: ['../kpi/requests'],
        requireRole: ['MANAGER']
      },
      {
        label: '평가 관리',
        hrefs: ['/eval/manage-peer', '../eval/manage-org', '../eval/manage-self', '../eval/round'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {
        label: '다면 평가 제출',
        hrefs: ['../eval/submit'],
        required: () => roundStatus.value.inProgress === true
      },
      { label: '인사 평가 조회', hrefs: ['../hr/hr-list'] },
      {
        label: '이의 제기 관리',
        hrefs: ['../hr/my-objection', '../hr/objection-requests']
      }
    ]
  },
  {
    label: '근속 지원',
    icon: 'fa-headset',
    subItems: [
      {
        label: '근속 전망',
        hrefs: ['../retention/prospect-dash', '../retention/prospect-employees', '../retention/prospect-rounds', ],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {
        label: '면담 기록',
        hrefs: ['../retention/my-contacts', '../retention/contact-list'],

        requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
      }
    ],
    requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
  },
  {
    label: '공지 관리',
    icon: 'fa-bullhorn',
    hrefs: ['../notice/notice']
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
      return { path: result[0], state: { roundId: roundStatus.value.roundId } }
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
    if (!isAttended.value) await startWork()
    else await endWork()
    await fetchTodayAttendance()
    toast.success('출퇴근 등록 완료')
    closeAttendanceModal()
  } catch (e) {
    toast.error('근태 처리 실패')
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
    await getStartTime()
    await fetchTodayAttendance()
    const result = await getEvaluationRoundStatus()
    roundStatus.value = result || { inProgress: false, roundId: null }
  } catch (e) {
    console.error('초기 로딩 실패', e)
  }
})

onUnmounted(() => {
  stopClockUpdater()
})
</script>

<style scoped>
/* ===== 공통 스타일 ===== */
.sidebar {
  width: 23rem;
  min-width: 4.8rem;
  height: 100vh;
  padding: 1.5rem;
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
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
}

.sidebar-logo {
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--blue-450);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--color-surface);
  font-size: 1rem;
  cursor: pointer;
}

.side-btn {
  background: var(--main-color);
  color: var(--color-surface);
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.top-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

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

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
}

/* ===== 메뉴 항목 ===== */
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

.sidebar-item:hover {
  background-color: var(--gray-600);
  color: var(--color-surface);
  cursor: pointer;
}

.sidebar-item.active {
  background-color: var(--gray-600);
  color: var(--color-surface);
}

.sidebar-item.highlighted {
  background-color: var(--blue-300);
  color: var(--color-surface);
}

.sidebar-sub-toggle {
  margin-left: auto;
  transition: transform 0.2s ease;
  transform: rotate(0deg); /* 닫힌 상태 */
}

.sidebar-item.active .sidebar-sub-toggle {
  transform: rotate(90deg); /* 열린 상태 */
}

/* ===== 서브 메뉴 ===== */
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

/* ===== Collapsed 상태 ===== */
.sidebar.collapsed {
  width: 4.8rem;
}

.sidebar.collapsed .sidebar-title,
.sidebar.collapsed .sidebar-label,
.sidebar.collapsed .sidebar-indent,
.sidebar.collapsed .sidebar-sub-toggle,
.sidebar.collapsed .sidebar-logo,
.sidebar.collapsed .side-btn,
.sidebar.collapsed .notification-icon {
  display: none;
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

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.fas.fa-bars {
  transition: transform 0.3s ease;
}
</style>
