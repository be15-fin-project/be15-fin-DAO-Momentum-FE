<script setup>
import ContactButton from "@/features/mypage/components/profile/ContactButton.vue";
import {computed, onMounted, reactive, ref, watch} from "vue";
import ProfileCard from "@/features/mypage/components/profile/ProfileCard.vue";
import InfoItem from "@/features/mypage/components/profile/InfoItem.vue";
import BasicInfo from "@/features/mypage/components/profile/BasicInfo.vue";
import HistoryInfo from "@/features/mypage/components/profile/HistoryInfo.vue";
import "@/assets/css/index.css";
import {fetchEmpInfo, putEmpInfo} from "@/features/mypage/api.js";
import SideModal from "@/components/common/SideModal.vue";
import {useToast} from "vue-toastification";

const toast = useToast()
const employeeDetails = ref({
      empId:20250001,
      empNo:'',
      name: '',
      email:'',
      gender:'',
      deptName:'',
      positionName: '',
      address:'',
      contact:'',
      status: '',
      department: '',
      joinDate:'',
      birthDate:''
    }
)

const employeeRecords = ref({});

const currentTab = ref('basic');

//사이드 모달 관련 변수
const modalVisible = ref(false);
const req = reactive({
  name: '',
  gender: '',
  address: '',
  contact: ''
});

const modalSections = computed(() => {
  return [{
  title: '개인정보 수정',
  icon: 'fa-info-circle',
  layout: 'one-column',
  fields:[
    {key: 'name', type: 'input', label: '이름', icon: 'fa-user',editable: true, required: true, value:req.name},
    {
      key: 'gender', type: 'select', label: '성별', icon: 'fa-filter',editable: true, required: true, options: [
        {label: '남', value: 'M'},
        {label: '여', value: 'F'}
      ]
    },
    {key: 'address', type: 'input', label: '주소', icon: 'fa-user',editable: true, required: true, value:req.address},
    {key: 'contact', type: 'input', label: '연락처', icon: 'fa-user',editable: true, required: true, value:req.contact}
  ]
  }
]});

const computedStatus = computed(() =>{
  //enum('EMPLOYED','ON_LEAVE','RESIGNED')
  switch(employeeDetails.value.status){
    case 'EMPLOYED':
      return '재직중'
    case 'ON_LEAVE':
      return '휴직중'
    case 'RESIGNED':
      return '퇴직'
  }

})

const getEmpInfo = async () => {
  try{
    const response = await fetchEmpInfo();
    employeeDetails.value = response.data.data.employeeDetails;
    employeeRecords.value = response.data.data.employeeRecords;
  }catch(error){
    console.log("에러 ",error)
  }

}

const handleRegisterSubmit = async(req) => {
  try{
    await putEmpInfo(req);
    toast.success('개인정보를 수정했습니다.!')
    modalVisible.value = false;
    getEmpInfo();

  }catch(e){

    toast.error('문제가 발생했습니다.')
  }
}

watch(
    () => employeeDetails.value,
    (newVal) => {
      req.name = newVal.name;
      req.gender = newVal.gender;
      req.address = newVal.address;
      req.contact = newVal.contact;
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
  await getEmpInfo();
})

</script>

<template>
  <section>
    <!-- Main Content -->
    <div class="main-content">
      <!-- Left left-profile -->
      <div class="main-header">
        <div class="header-content">
          <h1 class="header-title">직원 프로필</h1>
        </div>
      </div>
      <div class="container">
        <!-- Profile Section -->
        <div class="left-profile">
          <div class="left-profile-content">
            <!-- Profile Card -->
            <ProfileCard :name="employeeDetails.name" :department="employeeDetails.deptName" :position="employeeDetails.positionName" :status="computedStatus"/>
            <div class="contact-section">
              <contact-button  label = "email" :value="employeeDetails.email" icon="fas fa-envelope"/>
              <contact-button  label = "contact" :value="employeeDetails.contact" icon="fas fa-phone"/>
            </div>
            <!-- Quick Info Cards -->
            <div class="quick-info">
              <InfoItem :label="'사번'" :value="employeeDetails.empNo" :icon="'fas fa-fingerprint'"/>
              <InfoItem :label="'입사일'" :value="employeeDetails.joinDate" :icon="'fas fa-calendar-alt'"/>
              <InfoItem :label="'직위'" :value="employeeDetails.positionName" :icon="'fas fa-briefcase'"/>
            </div>
          </div>
        </div>
        <!-- Main Content Card -->
        <div class="content-card">
          <!-- Tabs -->
          <div class="tabs-header">
          <button
              class="tab-button"
              :class="{ 'tab-active': currentTab === 'basic' }"
              @click="currentTab = 'basic'"
          >
            <i class="fas fa-user-circle"></i>기본정보
          </button>
          <button
              class="tab-button"
              :class="{ 'tab-active': currentTab === 'history' }"
              @click="currentTab = 'history'"
          >
            <i class="fas fa-history"></i>이력정보
          </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content" id="basic-tab" v-if="currentTab==='basic'">
              <BasicInfo :info = "employeeDetails" @openModal="modalVisible=true"/>
          </div>

          <!-- History Info Tab -->
          <div class="tab-content" id="history-tab" v-else>
            <HistoryInfo :info = "employeeRecords"/>
          </div>
        </div>
      </div>
    </div>
    <SideModal
        :visible="modalVisible"
        @close="modalVisible=false"
        title="개인정보 수정"
        icon="fas fa-id-card"
        v-model:form="req"
        :sections = "modalSections"
        @submit="handleRegisterSubmit(req)"
    >
    </SideModal>
  </section>
</template>

<style scoped>
.main-content{
  padding-right: 16px;
  padding-left: 16px;
}

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  gap: 20px;
}

/* Left left-profile */
.left-profile {
  width: 600px;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.header-title {
  font-weight: 700;
  color: #1f2937;
}

.left-profile-content {
  flex: 1;
  padding: 24px;
}


.avatar-circle i {
  color: white;
  font-size: 32px;
}

/* Contact Section */
.contact-section {
  margin-bottom: 32px;
}

/* Quick Info Cards */
.quick-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-card {
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
}

/* Tabs */
.tabs-header {
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
}

.tab-button {
  flex: 1;
  padding: 20px 32px;
  text-align: center;
  font-weight: 600;
  background: transparent;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-bottom : none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 15px;
}

.tab-button:first-child {
  border-top-left-radius: 24px;
}

.tab-button:hover {
  color: #374151;
  background: #f3f4f6;
}

.tab-button.tab-active {
  background: var(--blue-400);
  color: white;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}

.tab-button i {
  margin-right: 12px;
}

/* Tab Content */
.tab-content {
  padding: 32px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>