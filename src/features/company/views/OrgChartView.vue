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
          <OrgTree :dtoList = "departmentInfoDTOList" @selectDept = "selectDepartment"/>

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

         <MemberList :members="members" @click="clickEvent" :clickable="true"/>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {fetchDepartmentInfo, fetchDepartments} from "@/features/company/api.js";
import '@/assets/css/index.css'
import "vue3-treeview/dist/style.css";
import OrgTree from "@/features/company/components/OrgTree.vue";
import MemberList from "@/features/company/components/MemberList.vue";


const departmentInfoDTOList = ref([])
const selectedDeptId = ref(null);
const department = ref({
  name:'',
  contact:'',
  createdAt:''
});
const members = ref([]);


const selectDepartment = (deptId) => {
  selectedDeptId.value = deptId;
  getDepartmentInfo();
}

const getDepartments = async () =>{
  try{
    const response = await fetchDepartments();
    departmentInfoDTOList.value = response.data.departmentInfoDTOList;
  }catch(error){
    console.error("트리 에러 ",error)
  }
}

const getDepartmentInfo = async () => {
  try{
    const response = await fetchDepartmentInfo(selectedDeptId.value);
    department.value = response.data.data.departmentDetailDTO;
    members.value = response.data.data.departmentMemberDTOList;
    console.log(members.value)
  }catch(error){
    console.error("부서 정보 조회 실패 : ", error);
  }
}

const clickEvent = (empId) =>{
  console.log(empId);
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


.member-contact i {
  width: 12px;
  text-align: center;
}

.member-contact span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
