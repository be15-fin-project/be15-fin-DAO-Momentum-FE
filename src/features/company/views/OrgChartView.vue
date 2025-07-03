<template>
  <main class="main">
    <div id="sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <!-- 헤더 -->
        <section class="header-section">
          <div class="header-content">
            <div class="header-logo">
              <i class="fas fa-sitemap"></i>
            </div>
            <div>
              <h1 class="header-title">조직도</h1>
            </div>
          </div>
        </section>

        <!-- Main Grid -->
        <div class="main-grid">
          <!-- Organization Tree -->
          <section class="org-tree-section">
            <div class="card slide-in">
              <header class="card-header">
                <i class="fas fa-folder-tree card-icon"></i>
                <h2 class="card-title">조직 구조</h2>
              </header>
              <nav class="breadcrumb">
                <span
                    v-for="(crumb, index) in breadcrumb"
                    :key="index"
                    :class="['breadcrumb-item', { active: index === breadcrumb.length - 1 }]"
                >
                  {{ crumb }}
                  <i
                      v-if="index !== breadcrumb.length - 1"
                      class="fas fa-chevron-right breadcrumb-separator"
                  ></i>
                </span>
              </nav>
              <Tree :nodes="nodes" :config = "config" @node-focus ="selectDepartment"/>
            </div>
          </section>

          <!-- Department Info -->
          <section class="dept-info-section">
            <div class="card fade-in">
              <header class="card-header">
                <i class="fas fa-info-circle card-icon"></i>
                <h2 class="card-title">부서 정보</h2>
              </header>
              <div class="dept-info-grid">
                <div class="dept-stats-section">
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-card-icon icon-bg-blue">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="stat_num">
                        <div class="stat-label">총 구성원</div>
                        <div class="stat-number">{{ members.length }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="dept-details">
                    <div class="dept-detail-item">
                      <div class="dept-detail-label">
                        <i class="fas fa-building icon-purple"></i>
                        <span>부서명</span>
                      </div>
                      <span class="dept-detail-value">{{ department.name }}</span>
                    </div>
                    <div class="dept-detail-item">
                      <div class="dept-detail-label">
                        <i class="fas fa-phone icon-blue"></i>
                        <span>연락처</span>
                      </div>
                      <span class="dept-detail-value">{{ department.contact }}</span>
                    </div>
                    <div class="dept-detail-item">
                      <div class="dept-detail-label">
                        <i class="fas fa-calendar-plus icon-green"></i>
                        <span>생성일</span>
                      </div>
                      <span class="dept-detail-value">{{ department.createdAt }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Members List -->
          <section class="members-section">
            <div class="card fade-in">
              <header class="card-header">
                <i class="fas fa-users card-icon"></i>
                <h2 class="card-title">구성원</h2>
              </header>
              <div class="members-content">
                <div v-if="members.length === 0" class="empty-state">
                  <i class="fas fa-user-friends"></i>
                  <p>구성원이 없습니다</p>
                </div>
                <div
                    v-else
                    v-for="member in members"
                    :key="member.id"
                    :class="['member-item', { manager: member.deptHead }]"
                >
                  <div v-if="member.deptHead" class="manager-badge">팀장</div>
                  <div class="member-header">
                    <div :class="['member-avatar', { manager: member.deptHead }]"></div>
                    <div class="member-info">
                      <h4 class="member-name">{{ member.name }}</h4>
                      <p class="member-position">{{ member.position }}</p>
                    </div>
                  </div>
                  <div class="member-contacts">
                    <div class="member-contact">
                      <i class="fas fa-envelope"></i>
                      <span>{{ member.email }}</span>
                    </div>
                    <div class="member-contact">
                      <i class="fas fa-phone"></i>
                      <span>{{ member.contact }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {fetchDepartmentInfo, fetchDepartments} from "@/features/company/api.js";
import '@/assets/css/index.css'
import '@/assets/css/orgChartTransition.css'
import "vue3-treeview/dist/style.css";
import Tree from "vue3-treeview";

const nodes = ref({});
const config = ref({
    roots: []
});
const selectedDeptId = ref(null);
const breadcrumb = ref([]);
const department = ref({
  name:'',
  contact:'',
  createdAt:''
});
const members = ref([]);

// 2. Breadcrumb 만들기 함수
function getBreadcrumb() {
  const breadcrumb = [];

  console.log(nodes.value);
  console.log(selectedDeptId.value)
  console.log(nodes.value);
  let current = nodes.value[selectedDeptId.value];
  console.log(current);
  while (current) {
    breadcrumb.unshift(current.text);
    current = nodes.value[current.parent];
  }

  return breadcrumb;
}

function convertDeptTreeToMap(data) {
  const treeMap = {};
  const rootIds = [];

  function traverse(node) {
    const id = String(node.deptId);
    const children = (node.childDept || []).map(child => String(child.deptId));

    treeMap[id] = {
      text: node.name,
      children,
      state: {
        opened: true
      }
    };

    if (Array.isArray(node.childDept)) {
      node.childDept.forEach(traverse);
    }
  }

  data.forEach(rootNode => {
    const rootId = String(rootNode.deptId);
    rootIds.push(rootId);
    traverse(rootNode);
  });

  return {
    treeMap,
    rootIds
  };
}

const selectDepartment = (eventPayload) => {
  selectedDeptId.value = eventPayload.id;
  getDepartmentInfo();
  breadcrumb.value = getBreadcrumb();
  console.log(breadcrumb.value);
}

const getDepartments = async () =>{
  try{
    const response = await fetchDepartments();
    const { treeMap, rootIds } = convertDeptTreeToMap(response.data.departmentInfoDTOList);
    nodes.value = treeMap;
    config.value.roots = rootIds;
  }catch(error){
    console.error("트리 에러 ",error)
  }
}

const getDepartmentInfo = async () => {
  try{
    const response = await fetchDepartmentInfo(selectedDeptId.value);
    department.value = response.data.data.departmentDetailDTO;
    members.value = response.data.data.departmentMemberDTOList;
  }catch(error){
    console.error("부서 정보 조회 실패 : ", error);
  }
}

onMounted(async () => {
  await getDepartments();
})

</script>

<style scoped>

.main-content {
  width:100%;
  padding:20px;
}

/* 헤더 영역 */
.header-section {
  width:100%;
  margin-bottom: 2.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-logo {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--icon-gradient);
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(120, 127, 245, 0.08);
}

.header-logo i {
  color: #fff;
  font-size: 2rem;
}

.header-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--font-main);
  margin: 0 0 0.2rem 0;
}

.header-description {
  color: var(--font-sub);
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 0.01em;
  font-weight: 500;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  height: calc(100vh - 200px);
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 350px 1fr 350px;
  }
}

.card {
  background: #fff;
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-subtle);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--font-main);
}

.card-icon {
  color: var(--blue-400);
  font-size: 1.125rem;
}

/* 대신 내용만 이동하도록 아래 추가 */
.org-item:hover .org-item-content {
  transform: translateX(4px);
  transition: transform 0.3s ease;
}

.org-item.active .org-item-name {
  color: var(--blue-400);
  font-weight: 600;
}


/* Department Info Styles */
.dept-info-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.dept-stats-section {
  flex: 0 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  background: var(--blue-50);
  border: 1px solid var(--blue-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.icon-bg-blue {
  background: #e9f2fe;
  color: #3868b9;
}

.stat-card-icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.55rem;
  box-shadow: 0 2px 8px 0 rgba(56, 104, 185, 0.08);
}
.stat_num {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--main-color);
  margin-bottom: 4px;
  display: block;
}

.stat-label {
  color: var(--font-sub);
  font-size: 0.875rem;
  font-weight: 500;
}

.dept-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dept-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.dept-detail-item:last-child {
  border-bottom: none;
}

.dept-detail-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-detail-label span {
  color: var(--font-main);
  font-weight: 500;
}

.dept-detail-value {
  color: var(--font-sub);
  font-weight: 600;
}

/* Members List Styles */
.members-content {
  overflow-y: auto;
  height: calc(100% - 80px);
  padding-right: 8px;
}

.member-item {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--blue-100);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 8px 12px rgba(56, 104, 185, 0.10);
}

.member-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.member-item.manager {
  /*background: var(--blue-200);*/
  border-color: var(--blue-400);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--blue-200);
}

.member-avatar.manager {
  background: var(--blue-400);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 700;
  color: var(--font-main);
  margin-bottom: 2px;
}

.member-position {
  color: var(--blue-400);
  font-size: 0.875rem;
  font-weight: 500;
}

.member-contacts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--font-sub);
}

.member-contact i {
  width: 12px;
  text-align: center;
}

.member-contact span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--blue-400);
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

.empty-state i {
  font-size: 3rem;
  color: var(--gray-500);
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--font-sub);
  font-size: 1rem;
}

/* Icon Colors */
.icon-purple {
  color: var(--blue-400);
}

.icon-blue {
  color: var(--blue-400);
}

.icon-green {
  color: var(--success);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  min-height:40px;
  background: var(--blue-50);
  border-radius: 8px;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: var(--font-sub);
}

.breadcrumb-item.active {
  color: var(--blue-400);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--gray-500);
}
.members-content::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}
.members-content::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}

.members-content::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* Animation */
.slide-in {
  animation: slideIn 0.6s ease-out;
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
