<script setup>
import {onMounted, reactive, ref, toRefs} from "vue";
import TabNav from "@/components/common/NavigationTab.vue";
import CompanyBanner from "@/features/settings/components/CompanyBanner.vue";
import {fetchCompanyInfo} from "@/features/company/api.js";
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";

const toast = useToast()
const route = useRouter();

const tabItems = [
  { label: '회사 관리', value: 'COMPANY', icon: 'fa-building' },
  { label: '부서 관리', value: 'DEPARTMENT', icon: 'fa-sitemap' },
  { label: '직위 관리', value: 'POSITION', icon: 'fa-user-tie' },
  { label: '권한 관리', value: 'ROLE', icon: 'fa-shield-alt' }
]
const selectedTab = ref('COMPANY');

const company = ref({
  chairman:'회사 대표',
  employeeCount:0,
  name:'회사명',
})


const changeTab = async () => {
  switch(selectedTab.value){
    case 'COMPANY':
      await route.push("/setting/company");
      break;
    case 'DEPARTMENT':
      await route.push("/setting/department")
      break;
    case 'POSITION':
      await route.push("/setting/position");
      break;
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
  <div class="main">
    <div class="main-section">
      <CompanyBanner :name = "company.name" :chairman="company.chairman" :employeeCount="company.employeeCount"></CompanyBanner>
      <!-- Navigation Tabs -->
      <nav class="tab-nav">
        <div class="tab-nav-container">
          <div class="tab-list">
            <TabNav
                :tabs="tabItems"
                v-model:selected="selectedTab"
                @tab-click="changeTab"
            />
          </div>
        </div>
      </nav>
      <div class="body-content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 카드 및 폼 */
.main-section{
    width: 100%;
    height:100%;
    background: var(--blue-50);
    transition: padding-left 0.3s ease; /* ← 여기에 트랜지션 추가 */
    display: flex;
  flex-direction: column;
}

.body-content{
  height:100%;

}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(22px);}
  to { opacity: 1; transform: translateY(0);}
}


</style>