<template>
  <aside :class="['sidebar', { collapsed }]">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <span class="material-symbols-rounded">domain</span>
        </div>
        <h2 class="sidebar-title">Momentum</h2>
      </div>
      <span class="top-icons">
        <button class="side-btn" @click="handleCreateAttendance" :disabled="isLoading">
  {{ isAttended ? '퇴근' : '출근' }}
</button>
        <button class="sidebar-toggle" @click="toggleAlertPanel">
  <span class="material-symbols-rounded notification-icon">notifications</span>
</button>
      </span>
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span class="material-symbols-rounded">menu</span>
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
              <span class="material-symbols-rounded">{{ menu.icon }}</span>
              <span class="sidebar-label">{{ menu.label }}</span>
              <span
                  class="material-symbols-rounded sidebar-sub-toggle"
                  :class="{ open: openSubmenu === index || isSubmenuActive(menu.subItems) }"
              >
                chevron_right
              </span>
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
              <span class="material-symbols-rounded">{{ menu.icon }}</span>
              <span class="sidebar-label">{{ menu.label }}</span>
            </router-link>
          </template>
        </template>
      </div>
    </nav>

    <!--  출퇴근 모달  -->
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
        <span class="material-symbols-rounded">settings</span>
        <span class="sidebar-label">설정</span>
      </router-link>
      <div class="sidebar-item" @click="handleLogout">
        <span class="material-symbols-rounded">logout</span>
        <span class="sidebar-label">로그아웃</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useAuthStore} from '@/stores/auth.js'
import {logoutUser} from '@/features/common/api.js'
import router from '@/router/index.js'
import {useRoute} from 'vue-router'
import AlertPanel from "@/components/common/AlertPanel.vue";
import {endWork, startWork} from "@/features/works/api.js";
import AttendanceModal from "@/features/works/components/AttendanceModal.vue";
import {useToast} from "vue-toastification";
import {useAttendance} from "@/features/works/composable/useAttendance.js";

const authStore = useAuthStore()
const route = useRoute()
const {userRole} = storeToRefs(authStore)
const toast = useToast()

const collapsed = ref(false)
const openSubmenu = ref(null)
const currentUserRoles = ref(['HR_MANAGER', 'MANAGER'])

/* 출퇴근 관련 */
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
} = useAttendance();

const showAlertPanel = ref(false)

const menuItems = [
  {
    label: '회사 정보',
    icon: 'apartment',
    subItems: [
      {label: '회사 정보', hrefs: ['../company/company-info']},
      {label: '조직도', hrefs: ['../company/org-chart']}
    ]
  },
  {
    label: '사원 관리',
    icon: 'group',
    subItems: [
      {label: '사원 목록 조회', hrefs: ['../employees']},
      {label: '인사 발령 내역', hrefs: ['../employee/appointment']},
      {label: '계약서 목록 조회', hrefs: ['../contracts']}
    ],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '근태 관리',
    icon: 'schedule',
    hrefs: ['../works'],
    requireRole: ['MASTER', 'HR_MANAGER']
  },
  {
    label: '내 정보',
    icon: 'person',
    subItems: [
      {label: '대시보드', hrefs: ['../mypage/dashboard']},
      {label: '내 정보 조회', hrefs: ['../mypage/profile']},
      {label: '계약서 내역 조회', hrefs: ['../mypage/contracts']}
    ]
  },
  {
    label: '결재 관리',
    icon: 'task',
    subItems: [
      {
        label: '전체 결재 내역',
        hrefs: ['../approvals'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {label: '문서함', hrefs: ['../approval/inbox']}
    ]
  },
  {
    label: '평가 관리',
    icon: 'bar_chart',
    subItems: [
      {
        label: 'KPI 분석',
        hrefs: ['../kpi/statics', '../kpi/employee-kpis', '../kpi/employee-detail'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {label: 'KPI 조회', hrefs: ['../kpi/list']},
      {
        label: 'KPI 요청 관리',
        hrefs: ['../kpi/requests'],
        requireRole: ['MANAGER']
      },
      {
        label: '평가 관리',
        hrefs: ['../eval/manage', '../eval/manage-org', '../eval/manage-self', '../eval/round'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {label: '다면 평가 제출', hrefs: ['../eval/submit']},
      {label: '인사 평가 조회', hrefs: ['../hr/list']},
      {
        label: '이의 제기 관리',
        hrefs: ['../hr/objections'],
        requireRole: ['MANAGER']
      }
    ]
  },
  {
    label: '근속 지원',
    icon: 'support_agent',
    subItems: [
      {
        label: '근속 전망',
        hrefs: ['../retention/risk-dash'],
        requireRole: ['MASTER', 'HR_MANAGER']
      },
      {
        label: '면담 기록',
        hrefs: (role) =>
            ['MASTER', 'HR_MANAGER'].includes(role)
                ? ['../retention/admin-contact']
                : ['MANAGER'].includes(role)
                    ? ['../retention/user-contact']
                    : [],
        requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
      }
    ],
    requireRole: ['MASTER', 'HR_MANAGER', 'MANAGER']
  },
  {
    label: '공지 관리',
    icon: 'campaign',
    hrefs: ['../notice/notice']
  }
]

// 마운트
onMounted(async () => {
  await getStartTime()
  await fetchTodayAttendance()
})

onUnmounted(() => {
  stopClockUpdater()
});

// Methods
function toggleSidebar() {
  collapsed.value = !collapsed.value
  openSubmenu.value = null
}

function toggleSubmenu(index) {
  openSubmenu.value = openSubmenu.value === index ? null : index
}

function resolveRoute(hrefs) {
  if (typeof hrefs === 'function') {
    for (const role of userRole.value) {
      try {
        const resolved = hrefs(role)
        if (resolved?.length > 0) return resolved[0]
      } catch (e) {
        console.warn('resolveRoute error:', e)
      }
    }
    return '/'
  }
  return Array.isArray(hrefs) && hrefs.length > 0 ? hrefs[0] : '/'
}

function resolveRouteList(hrefs) {
  if (typeof hrefs === 'function') {
    for (const role of userRole.value) {
      try {
        const resolved = hrefs(role)
        if (resolved?.length > 0) return resolved
      } catch (e) {
        console.warn('resolveRouteList error:', e)
      }
    }
    return []
  }
  return Array.isArray(hrefs) ? hrefs.filter(Boolean) : []
}

function resolveHrefList(hrefs) {
  if (typeof hrefs === 'function') {
    for (const role of userRole.value) {
      try {
        const resolved = hrefs(role)
        if (resolved?.length > 0) return resolved
      } catch (e) {
        console.warn('resolveHrefList error:', e)
      }
    }
    return []
  }
  return Array.isArray(hrefs) ? hrefs.filter(Boolean) : []
}

function isActive(hrefs) {
  const currentPath = route.path
  if (!Array.isArray(hrefs)) hrefs = [hrefs]
  return hrefs.some(href => currentPath.endsWith(href.replace('../', '/')))
}

function isSubmenuActive(subItems) {
  return subItems.some(
      (item) => isAllowed(item) && isActive(resolveHrefList(item.hrefs))
  )
}

function isAllowed(item) {
  if (!item) return false;

  // 권한 없으면 모두 허용
  if (!item.requireRole || item.requireRole.length === 0) {
    return true;
  }

  // 현재 사용자 역할이 하나라도 포함되면 true
  return item.requireRole.some((required) => userRole.value.includes(required));
}


function hasVisibleSubItems(menu) {
  if (!menu?.subItems) return false
  return menu.subItems.some((sub) => isAllowed(sub))
}

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (e) {
    console.error('로그아웃 API 실패', e)
  }
  authStore.clearAuth()
  router.push('/login')
}

function toggleAlertPanel() {
  showAlertPanel.value = !showAlertPanel.value
}

/* 근태 로직 */
const submitAttendance = async () => {
  isLoading.value = true;
  try {
    if (!isAttended.value) {
      await startWork();
    } else {
      await endWork();
    }
    await fetchTodayAttendance(); // 출/퇴근 상태 최신화
    toast.success("출퇴근 등록 완료");
    closeAttendanceModal()
  } catch (e) {
    toast.error("근태 처리 실패", e);
  } finally {
    isLoading.value = false;
  }
}

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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');

.sidebar {
  width: 23rem;
  min-width: 23rem;
  max-width: 25rem;
  background: var(--side-background);
  color: var(--basic);
  height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

/* 기존 CSS 그대로 유지 */
.sidebar.collapsed {
  width: 4.8rem;
  min-width: 4.8rem
}

.side-btn {
  background: var(--main-color);
  color: var(--basic);
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.sidebar .top-icons {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: var(--basic);
  cursor: pointer;
  font-size: 1rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto; /* 이 영역만 스크롤 */
  padding: 20px 0;
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
  transition: background 0.2s, color 0.2s;
}

.sidebar-item:hover {
  cursor: pointer;
  background-color: var(--gray-600);
  color: var(--basic);
}

.sidebar-item.active {
  background-color: var(--gray-600);
  color: var(--basic);
}

.sidebar-item.highlighted {
  background-color: var(--blue-300);
  color: var(--basic);
}

/* 서브 메뉴의 active (더 연하게) */
.sidebar-indent .sidebar-item.active {
  background-color: var(--gray-700); /* 좀 더 연한 회색 */
  color: var(--gray-50); /* 연한 흰색 계열 */
}

.sidebar-indent {
  padding-left: 1rem;
  display: none;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-indent.open {
  display: flex;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
}

/* Collapsed 상태 처리 */
.sidebar.collapsed .sidebar-label,
.sidebar.collapsed .sidebar-title,
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

.sidebar-toggle .material-symbols-rounded {
  transition: transform 0.3s ease;
}

.sidebar.collapsed .sidebar-toggle .material-symbols-rounded {
  transform: rotate(180deg);
}

.sidebar-sub-toggle {
  margin-left: auto;
  transition: transform 0.2s ease;
  transform: rotate(0deg); /* 닫힌 상태 */
}

.sidebar-item.active .sidebar-sub-toggle {
  transform: rotate(90deg); /* 열린 상태: 아래 방향 */
}
</style>
