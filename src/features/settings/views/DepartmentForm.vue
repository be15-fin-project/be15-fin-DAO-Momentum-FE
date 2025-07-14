<script setup>
import OrgTree from "@/features/company/components/OrgTree.vue";
import {computed, onMounted, reactive, ref, watch} from "vue";
import DepartmentInfoCard from "@/features/company/components/DepartmentInfoCard.vue";
import {fetchDepartmentInfo, fetchDepartments} from "@/features/company/api.js";
import SideModal from "@/components/common/SideModal.vue";
import {useToast} from "vue-toastification";
import {deleteDepartment, postDepartment, putDepartment} from "@/features/settings/api.js";
import MemberList from "@/features/company/components/MemberList.vue";
import CommonModal from "@/components/common/CommonModal.vue";

const toast = useToast()

const departmentInfoDTOList = ref([])
const selectedDeptId = ref(null);
const department = ref({
  name:'',
  contact:'',
  createdAt:''
});
const members = ref([]);
const deptCreateModalVisible = ref(false);
const deptUpdateModalVisible = ref(false);
const deptDeleteModalVisible = ref(false);
const createReq = reactive({
  name: '',
  parentDeptId: '',
  contact: ''
});

const updateReq = reactive({
  name: '',
  parentDeptId: '',
  contact: '',
  deptHeadId:''
});

const initialReq = {
  name: '',
  contact: '',
  parentDeptId: ''
};

const createModalSections = computed(() => [{
  title: '부서 생성',
  icon: 'fa-info-circle',
  layout: 'one-column',
  fields:[{
    key: 'name', type: 'input', label: '부서명', editable: true, required: true
  },
    {
      key: 'parentDeptId', type: 'deptList', label: '상위부서', required: true,
      editable: true, list: departmentInfoDTOList.value
    },
    {
      key: 'contact', type: 'input', label: '연락처', editable: true, required: true
    }
  ]
}]);

const deptHeadOptions = computed(() => [
  { label: '없음', value: 'null' },
  ...members.value.map(member => ({
    label: member.name,
    value: String(member.empId)
  }))
]);

const updateModalSections = computed(() => [{
  title: '부서 수정',
  icon: 'fa-info-circle',
  layout: 'one-column',
  fields:[{
    key: 'name', type: 'input', label: '부서명', editable: true, required: true
  },
    {
      key: 'parentDeptId', type: 'deptList', label: '상위부서', required: true,
      editable: true, list: departmentInfoDTOList.value
    },
    {
      key: 'contact', type: 'input', label: '연락처', editable: true, required: true
    },
    {
      key:'deptHeadId',type:'select', label:'부서장', editable: true, required: true, value: updateReq.deptHeadId , options: deptHeadOptions.value
    }
  ]
}]);

//부서 선택
const selectDepartment = (deptId) => {
  selectedDeptId.value = deptId;
  getDepartmentInfo();
}

//모달 처리
const handleUpdateModal = () => {
  if(selectedDeptId.value===null)
    toast.error('부서를 선택해주세요')
  else
    deptUpdateModalVisible.value = true;
}

const handleDeleteModal = () => {
 if(selectedDeptId.value===null)
   toast.error('부서를 선택해주세요')
  else
  deptDeleteModalVisible.value = true;
}

//부서 등록 처리
const handleRegisterSubmit = async (form) => {
  try{
    await postDepartment(form);
    toast.success('부서 생성을 완료했습니다.')
    await getDepartments();
    // ✅ reactive 객체 초기화
    Object.assign(createReq, initialReq);
    deptCreateModalVisible.value = false;
  }catch(e){
    toast.error('부서 생성에 실패했습니다.')
  }
}

//부서 수정 처리
const handleUpdateSubmit = async (form) =>{
  try{
    if(form.deptHeadId==='null')
      form.deptHeadId = null;
    form['deptId'] = selectedDeptId;
    await putDepartment(form);
    toast.success('부서를 수정했습니다.');
    await handleAfterUpdate()
  }catch(e){
    toast.error('부서 수정에 실패했습니다.');
  }
}

const handleAfterUpdate = async () => {
  Object.assign(updateReq, initialReq);
  await getDepartments();
  deptUpdateModalVisible.value = false;
  await getDepartmentInfo(selectedDeptId.value);
}

//부서 삭제 처리
const handleDelete = async () => {
  try{
    await deleteDepartment(selectedDeptId.value);
    toast.success('부서를 삭제했습니다.')
    await handleAfterDelete();
  }catch(e){
    toast.error('부서 삭제에 실패했습니다.');
  }
  deptDeleteModalVisible.value=false;
}

const handleAfterDelete = async () => {
  await getDepartments();
  department.value = {};
  members.value = [];
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
      updateReq.name = newDept.name;
      updateReq.parentDeptId = newDept.parentDeptId;
      updateReq.contact = newDept.contact;

      const head = newMembers.find(member => member.deptHead === true);
      updateReq.deptHeadId = head ? String(head.empId) : null;
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
  await getDepartments();
})

</script>

<template>
  <div class = "dept-card">
    <div class="button-section">
      <button class="dept-create-button" @click="deptCreateModalVisible=true">부서 생성</button>
    </div>
    <div class="main-grid">
      <!-- Organization Tree -->
      <OrgTree :dtoList = "departmentInfoDTOList" @selectDept = "selectDepartment" />

      <!-- Department Info -->
      <DepartmentInfoCard :department="department"
                          :members="members"
                          :editable="true"
                          @edit="handleUpdateModal"
                          @delete="handleDeleteModal"/>

      <MemberList :members="members"/>
    </div>
    <SideModal
        :visible="deptCreateModalVisible"
        @close="deptCreateModalVisible=false"
        title="부서 생성"
        icon="fas fa-info-circle card-icon"
        v-model:form="createReq"
        :sections = "createModalSections"
        @submit="handleRegisterSubmit(createReq)"
    />
    <SideModal
        :visible="deptUpdateModalVisible"
        @close="deptUpdateModalVisible=false"
        title="부서 수정"
        icon="fas fa-info-circle card-icon"
        v-model:form="updateReq"
        :sections = "updateModalSections"
        @edit="handleUpdateSubmit(updateReq)"
        :showEdit="true"
        :showSubmit="false"
    />
    <CommonModal
        :visible="deptDeleteModalVisible"
        :confirmVisible="true"
        @cancel="deptDeleteModalVisible = false"
        @confirm="handleDelete"
        :confirmText="'삭제'"
        :cancelText="'취소'"
    >
      <template #default>
        <p><strong>이 부서를 삭제하시겠습니까?</strong></p>
        <p style="margin-top: 8px; font-size: 0.9rem;">
          삭제된 부서는 복구할 수 없습니다.
        </p>
      </template>
    </CommonModal>

  </div>
</template>

<style scoped>
.dept-card{
  height:100%;
}

.main-grid {
  display: grid;
  grid-template-columns: 350px 1fr 350px;
  gap: 24px;
  height:100%;
}

.button-section{
  display:flex;
  height: fit-content;
  justify-content: flex-end;
  padding:8px;
}

.dept-create-button{
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-ss);
  border: 1px solid var(--gray-300);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  background: var(--blue-300);
  color: var(--color-surface);
}
</style>