<template>
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
          <DepartmentInfoCard :department="department" :members="members" />

         <MemberList :members="members" @click="clickEvent" :clickable="true"/>
        </div>
      </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {fetchDepartmentInfo, fetchDepartments} from "@/features/company/api.js";
import '@/assets/css/index.css'
import "vue3-treeview/dist/style.css";
import OrgTree from "@/features/company/components/OrgTree.vue";
import MemberList from "@/features/company/components/MemberList.vue";
import DepartmentInfoCard from "@/features/company/components/DepartmentInfoCard.vue";


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
  padding-left:40px;
  padding-right:40px;
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
    grid-template-columns: 1fr 2fr 1fr;
  }
}

.dept-detail-label span {
  color: var(--font-main);
  font-weight: 500;
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
