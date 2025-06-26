<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <span class="material-symbols-rounded">domain</span>
        </div>
        <h2 class="sidebar-title">Momentum</h2>
      </div>
      <span class="top-icons">
        <button class="side-btn">출근</button>
        <button class="sidebar-toggle">
          <span class="material-symbols-rounded notification-icon">notifications</span>
        </button>
      </span>
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span class="material-symbols-rounded">menu</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="(menu, index) in menuItems" :key="index">

        <!-- 메뉴에 subItems가 있을 경우 (드롭다운) -->
        <template v-if="menu.subItems">
          <a
              href="#"
              class="sidebar-item"
              @click.prevent="toggleSubmenu(index)"
              :class="{ active: openSubmenu === index || isSubmenuActive(menu.subItems) }"
          >
            <span class="material-symbols-rounded">{{ menu.icon }}</span>
            <span class="sidebar-label">{{ menu.label }}</span>
            <span class="material-symbols-rounded sidebar-sub-toggle"
                  :class="{ open: openSubmenu === index || isSubmenuActive(menu.subItems) }">chevron_right</span>
          </a>
          <div class="sidebar-indent" :class="{ open: openSubmenu === index || isSubmenuActive(menu.subItems) }">
            <a
                v-for="(sub, i) in menu.subItems"
                :key="i"
                :href="sub.hrefs[0]"
                class="sidebar-item"
                :class="{ active: isActive(sub.hrefs) }"
            >
              {{ sub.label }}
            </a>
          </div>
        </template>

        <!-- 메뉴에 subItems가 없는 경우 (단일 링크 메뉴) -->
        <template v-else>
          <a
              :href="menu.hrefs[0]"
              class="sidebar-item"
              :class="{ active: isActive(menu.hrefs) }"
          >
            <span class="material-symbols-rounded">{{ menu.icon }}</span>
            <span class="sidebar-label">{{ menu.label }}</span>
          </a>
        </template>
      </div>

    </nav>

    <div class="sidebar-footer">
      <a href="../setting/setting.html" class="sidebar-item">
        <span class="material-symbols-rounded">settings</span>
        <span class="sidebar-label">설정</span>
      </a>
      <a href="../common/login.html" class="sidebar-item">
        <span class="material-symbols-rounded">logout</span>
        <span class="sidebar-label">로그아웃</span>
      </a>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      collapsed: false,
      openSubmenu: null,
      menuItems: [
        {
          label: '회사 정보',
          icon: 'apartment',
          subItems: [
            { label: '회사 정보', hrefs: ['../company/company-info.html'] },
            { label: '조직도', hrefs: ['../company/org-chart.html'] }
          ]
        },
        {
          label: '사원 관리',
          icon: 'group',
          subItems: [
            { label: '사원 목록 조회', hrefs: ['../employee/employees.html'] },
            { label: '인사 발령 내역', hrefs: ['../employee/appointment.html'] },
            { label: '계약서 내역', hrefs: ['../employee/contracts-admin.html'] }
          ]
        },
        {
          label: '근태 관리',
          icon: 'schedule',
          hrefs: ['../attendance/attendance.html']
        },
        {
          label: '내 정보',
          icon: 'person',
          subItems: [
            { label: '대시보드', hrefs: ['../mypage/dashboard.html'] },
            { label: '내 정보 조회', hrefs: ['../mypage/profile.html'] },
            { label: '계약서 내역 조회', hrefs: ['../mypage/contracts.html'] }
          ]
        },
        {
          label: '결재 관리',
          icon: 'task',
          subItems: [
            { label: '전체 결재 내역', hrefs: ['../approval/history.html'] },
            { label: '문서함', hrefs: ['../approval/inbox.html'] }
          ]
        },
        {
          label: '평가 관리',
          icon: 'bar_chart',
          subItems: [
            { label: 'KPI 분석', hrefs: ['../performance/kpi-overview.html'] },
            { label: 'KPI 조회', hrefs: ['../performance/kpi-list.html'] },
            { label: 'KPI 요청 관리', hrefs: ['../performance/kpi-requests.html'] },
            { label: '평가 관리', hrefs: ['../performance/eval-manage.html'] },
            { label: '다면 평가 제출', hrefs: ['../performance/eval-submit.html'] },
            { label: '인사 평가 조회', hrefs: ['../performance/eval-me.html'] },
            { label: '이의 제기 조회', hrefs: ['../performance/eval-objection.html'] }
          ]
        },
        {
          label: '근속 지원',
          icon: 'support_agent',
          subItems: [
            { label: '근속 전망', hrefs: ['../retention/risk-dash.html'] },
            { label: '면담 기록', hrefs: ['../retention/risk-contact.html'] }
          ]
        },
        {
          label: '공지 관리',
          icon: 'campaign',
          hrefs: ['../notice/notice.html']
        }

      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.collapsed = !this.collapsed;
      this.openSubmenu = null;
    },
    toggleSubmenu(index) {
      this.openSubmenu = this.openSubmenu === index ? null : index;
    },
    isActive(hrefs) {
      const current = window.location.pathname;
      if (!Array.isArray(hrefs)) hrefs = [hrefs];
      return hrefs.some(href => current.endsWith(href.replace('../', '/')));
    },
    isSubmenuActive(subItems) {
      return subItems.some(item => this.isActive(item.hrefs));
    }
  }

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');

.sidebar {
  width: 22rem;
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
.sidebar.collapsed { width: 5rem; }

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


.sidebar.collapsed {
  width: 5rem;
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
.sidebar.collapsed .sidebar-indent {
  display: none;
}

.sidebar.collapsed .sidebar-item {
  justify-content: center;
}

.sidebar.collapsed .sidebar-item i {
  margin-right: 0;
}
/* 사이드바가 접혔을 때, 우측 화살표 아이콘만 숨김 */
.sidebar.collapsed .sidebar-sub-toggle {
  display: none;
}
.sidebar.collapsed .sidebar-logo {
  display: none;
}
.sidebar.collapsed .side-btn {
  display: none;
}
.sidebar.collapsed .notification-icon {
  display: none;
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
