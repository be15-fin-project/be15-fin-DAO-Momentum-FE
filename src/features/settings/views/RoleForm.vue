<script setup>
import OrgTree from "@/features/company/components/OrgTree.vue";
import { onMounted, reactive, ref, watch} from "vue";
import {fetchDepartmentInfo, fetchDepartments} from "@/features/company/api.js";
import {useToast} from "vue-toastification";
import MemberList from "@/features/company/components/MemberList.vue";
import RoleOptionCard from "@/features/settings/components/RoleOptionCard.vue";
import {getEmpRoles, getRoles, putEmpRoles} from "@/features/settings/api.js";

const toast = useToast()

const departmentInfoDTOList = ref([])
const selectedDeptId = ref(null);
const department = ref({
  name:'',
  contact:'',
  createdAt:''
});
const members = ref([]);

const selectedEmpId = ref('');
const roles = ref([]);

const field = {
  key: 'roles', // model에서 사용할 key
  editable: true, // 체크박스 활성화 여부
  options: [ // 선택 가능한 role 목록
    { id: 1, label: '최고 관리자' },
    { id: 2, label: '인사관리자' },
    { id: 3, label: '재무 관리자' },
    { id: 4, label: '관리자' },
  ]
}


const formModel = ref(null); // [3, 4] 같은 숫자 ID만 저장


//부서 선택
const selectDepartment = (deptId) => {
  selectedDeptId.value = deptId;
  getDepartmentInfo();
}

//사원 선택
const handleSelectMember = async(empId) => {
  selectedEmpId.value=  empId;
  const response = await getEmpRoles(empId);
  roles.value = response.data.data.userRolesIds;
  formModel.value = {
    roles: response.data.data.userRolesIds
  };
  console.log(formModel.value.roles)
}

//화면 구성 처리
const getDepartmentInfo = async () => {
  try{
    const response = await fetchDepartmentInfo(selectedDeptId.value);
    department.value = response.data.data.departmentDetailDTO;
    members.value = response.data.data.departmentMemberDTOList;
  }catch(error){
    toast.error("부서 정보 조회 실패");
  }
}

//권한 수정 처리
const handleUpdateRoles = async() => {
  try{
    const req = {
      empId: selectedEmpId.value,
      userRoleIds:formModel.value.roles
    }
    console.log(req);
    await putEmpRoles(req);
    toast.success('권한 수정에 성공했습니다.')
    selectedEmpId.value = null;
  }catch(e){
    toast.error('권한 수정에 실패했습니다.')
  }

}

const getDepartments = async () =>{
  try{
    const response = await fetchDepartments();
    departmentInfoDTOList.value = response.data.departmentInfoDTOList;
  }catch(error){
    toast.error("부서 리스트 조회 실패");
  }
}

watch(
    [() => department.value, () => members.value],
    ([newDept, newMembers]) => {
      const head = newMembers.find(member => member.deptHead === true);
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
  await getDepartments();
})

</script>

<template>
  <div class = "dept-card">
    <div class="main-grid">
      <!-- Organization Tree -->
      <OrgTree :dtoList = "departmentInfoDTOList" @selectDept = "selectDepartment" />

      <MemberList :members="members" :clickable="true" @click="handleSelectMember"/>

      <RoleOptionCard :field="field" v-model="formModel"
                      :readonly="false"  @update="handleUpdateRoles"/>


    </div>
  </div>
</template>

<style scoped>
.dept-card{
  height:100%;
  margin:20px;
}

.main-grid {
  display: grid;
  grid-template-columns: 500px 1fr 500px;
  gap: 24px;
  height:100%;
}
</style>