<script setup>
import {onMounted, reactive, ref, toRefs} from "vue";
import TabNav from "@/components/common/NavigationTab.vue";
import CompanyBanner from "@/features/settings/components/CompanyBanner.vue";
import CompanyForm from "@/features/settings/components/CompanyForm.vue";
import {fetchCompanyInfo} from "@/features/company/api.js";
import {putCompany} from "@/features/settings/api.js";
import {useToast} from "vue-toastification";

const toast = useToast()

const tabItems = [
  { label: '회사 관리', value: 'COMPANY', icon: 'fa-building' },
  { label: '부서 관리', value: 'DEPARTMENT', icon: 'fa-sitemap' },
  { label: '직위 관리', value: 'POSITION', icon: 'fa-user-tie' },
  { label: '권한 관리', value: 'ROLE', icon: 'fa-shield-alt' }
]
const selectedTab = ref('COMPANY');

const company = ref({
  address:'주소',
  businessRegistrationNumber:'00-000-0000',
  chairman:'회사 대표',
  companyId: Number,
  contact:'010-000-0000',
  deptCount:0,
  email:'null@example.com',
  employeeCount:0,
  establishDate:String,
  name:'회사명',
  paymentDay:Number,
  workStartTime:String
})

const submitCompany = async(newValue) => {
  try {
    const response = await putCompany(newValue);
    await getCompanyInfo();
    toast.success('회사 정보를 수정했습니다.');
  }catch(e){
    toast.error('회사 정보를 수정하지 못했습니다.');
  }
}

const getCompanyInfo = async () => {
  try{
    const response = await fetchCompanyInfo();
    company.value = response.data.companyInfoDTO;
  }catch (error){
    toast.error('회사 정보를 불러오지 못했습니다.');
  }
}

onMounted(async () => {
  await getCompanyInfo();
})
</script>

<template>
  <main class="main">
    <div class="main-section">
      <CompanyBanner :name = "company.name" :chairman="company.chairman" :employeeCount="company.employeeCount"></CompanyBanner>
      <!-- Navigation Tabs -->
      <nav class="tab-nav">
        <div class="tab-nav-container">
          <div class="tab-list">
            <TabNav
                :tabs="tabItems"
                v-model:selected="selectedTab"
            />
          </div>
        </div>
      </nav>
      <!-- Permission Management -->
      <div class="body-content">
        <!-- 회사 수정 폼 카드 -->
        <CompanyForm v-if="selectedTab==='COMPANY'" :currentCompany = "company" @submit="submitCompany"/>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 카드 및 폼 */

.main-section{
    width: 100%;
    min-height: 100vh;
    height: 100%;
    background: var(--blue-50);
    transition: padding-left 0.3s ease; /* ← 여기에 트랜지션 추가 */
  padding:20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(22px);}
  to { opacity: 1; transform: translateY(0);}
}

</style>