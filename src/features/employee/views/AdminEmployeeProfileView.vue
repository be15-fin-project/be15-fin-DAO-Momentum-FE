<script setup>
import ContactButton from "@/features/employee/components/profile/ContactButton.vue";
import {computed, onMounted, reactive, ref, watch} from "vue";
import ProfileCard from "@/features/employee/components/profile/ProfileCard.vue";
import InfoItem from "@/features/employee/components/profile/InfoItem.vue";
import BasicInfo from "@/features/employee/components/profile/BasicInfo.vue";
import SideModal from "@/components/common/SideModal.vue";
import {useToast} from "vue-toastification";
import {getEmployeeDetails, updateEmpInfo, updateEmpRecords} from "@/features/employee/api.js";
import {useRoute, useRouter} from "vue-router";
import HistoryInfoEditable from "@/features/employee/components/profile/HistoryInfoEditable.vue";
import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue";
import DeleteConfirmToast from "@/components/common/DeleteConfirmToast.vue";
import {toastError} from "@/util/toastError.js";

const route = useRoute();
const router = useRouter();
const empId = route.params.empId;

const toast = useToast()
const employeeDetails = ref({
      empId:null,
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
  empNo: '',
  email: '',
  status: '',
});

const getModalSections = computed(() => {
    return [{
      title: '정보 수정',
      icon: 'fa-user-edit',
      layout: 'one-column',
      fields: [
        { key: 'empNo', type: 'input', label: '사번', icon: 'fa-id-badge', editable: true, required: true, value: req.empNo },
        { key: 'email', type: 'input', label: '이메일', icon: 'fa-envelope', editable: true, required: true, value: req.email },
        {
          key: 'status', type: 'select', label: '재직 상태', icon: 'fa-briefcase', editable: true, required: true,
          options: [
            { label: '재직중', value: 'EMPLOYED' },
            { label: '휴직중', value: 'ON_LEAVE' },
            { label: '퇴직', value: 'RESIGNED' }
          ],
          value: req.status
        }
      ]
    }];
});

const computedStatus = computed(() =>{
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
    const response = await getEmployeeDetails(empId);
    employeeDetails.value = response.employeeDetails;
    employeeRecords.value = response.employeeRecords;
  } catch (e) {
    toast.error('사원 정보 조회 실패')
  }

}

const handleRegisterSubmit = async(req) => {
  try{
    await updateEmpInfo(req, empId);
    toast.success('개인정보를 수정했습니다!')
    modalVisible.value = false;
    await getEmpInfo();
  } catch (e) {
    toastError(e, '개인정보 수정 실패')
  }
}

const handleHistorySubmit = async (formData, idsToDelete) => {
  try {
    const insertItems = [];
    // const updateItems = [];

    for (const sectionKey in formData) {
      const items = formData[sectionKey];
      for (const item of items) {
        const record = {
          type: sectionKey,
          organization: '',
          name: '',
          startDate: '',
          endDate: null,
          empId,
          recordId: item.recordId || null,
        };

        // 필드 매핑은 기존 로직 사용
        switch (sectionKey) {
          case 'EDUCATION':
            record.organization = item['학교명'];
            record.name = item['학과명'];
            record.startDate = item['입학일'];
            record.endDate = item['졸업일'];
            break;
          case 'CERTIFICATE':
            record.organization = item['발급기관'];
            record.name = item['자격증명'];
            record.startDate = item['취득일'];
            record.endDate = null;
            break;
          case 'AWARD':
            record.organization = item['수상기관'];
            record.name = item['수상명'];
            record.startDate = item['수상일'];
            record.endDate = null;
            break;
          case 'CAREER':
            record.organization = item['직장명'];
            record.startDate = item['시작일'];
            record.endDate = item['종료일'];
            break;
        }

        if (record.recordId) {

        } else {
          // 신규는 recordId 제거
          delete record.recordId;
          insertItems.push(record);
        }
      }
    }
    await updateEmpRecords({ insertItems, idsToDelete }, empId);

    toast.success('이력 정보를 수정했습니다!');
    await getEmpInfo();
  } catch (e) {
    toastError(e, '이력 정보 수정 실패')
  }
};

const isEditing = ref(false)

const handleHistoryCancel = async () => {
  const result = await new Promise((resolve) => {
    toast(
        {
          component: DeleteConfirmToast,
          props: {
            resolve,
            message: "수정을 취소하시겠습니까?"
          },
        },
        {
          timeout: false,
          closeOnClick: false,
          showCloseButtonOnHover: false,
        }
    );
  });

  if (result) {
    isEditing.value = false
  await getEmpInfo()
  toast.info('수정이 취소되었습니다.')
  }
}

watch(
    () => employeeDetails.value,
    (newVal) => {
      req.empNo = newVal.empNo;
      req.email = newVal.email;
      req.status = newVal.status;
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
  await getEmpInfo();
})

function handleClick(event) {
  if (event.value === 'back') {
    router.push('/employees')
  }
}
</script>

<template>
  <section>
      <HeaderWithTabs :headerItems="[
        { label: '사원 프로필 조회', event: 'click', active: true },
    ]"
                      :submitButtons="[{ label: '뒤로 가기', icon: 'fa-arrow-left', event:'click', value: 'back', variant: 'white' }]"
                      :showTabs="false"
                      @click="handleClick"
      />
      <div class="main-content">
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
            <HistoryInfoEditable v-model:isEditing="isEditing" :records="employeeRecords" @submit="handleHistorySubmit" @cancel="handleHistoryCancel"/>
          </div>
        </div>
      </div>
      </div>
    <SideModal
        :visible="modalVisible"
        @close="modalVisible=false"
        :title="'정보 수정'"
        :icon="'fa-user-edit'"
        v-model:form="req"
        :sections="getModalSections"
        @submit="handleRegisterSubmit(req)"
    />
  </section>
</template>

<style scoped>
.main-content{
  padding-right: 40px;
  padding-left: 40px;
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
  padding-left:40px;
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