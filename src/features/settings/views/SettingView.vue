<script setup>
import {onMounted, ref} from "vue";
import TabNav from "@/components/common/NavigationTab.vue";
import CompanyBanner from "@/features/settings/components/CompanyBanner.vue";
import {fetchCompanyInfo} from "@/features/company/api.js";
import {useToast} from "vue-toastification";
import {useRoute, useRouter} from "vue-router";

const toast = useToast()
const route = useRoute();     // 현재 경로 정보
const router = useRouter();   // push 용

const tabItems = [
  { label: '회사 관리', value: 'COMPANY', icon: 'fa-building' },
  { label: '부서 관리', value: 'DEPARTMENT', icon: 'fa-sitemap' },
  { label: '직위 관리', value: 'POSITION', icon: 'fa-user-tie' },
  { label: '권한 관리', value: 'ROLE', icon: 'fa-shield-alt' },
  { label: '휴일 관리', value: 'HOLIDAY', icon: 'fa-calendar' }
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
      await router.push("/setting/company");
      break;
    case 'DEPARTMENT':
      await router.push("/setting/department")
      break;
    case 'ROLE':
      await router.push("/setting/role");
      break;
    case 'POSITION':
      await router.push("/setting/position");
      break;
    case 'HOLIDAY':
      await router.push("/setting/holiday");
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
  const path = route.path;
  if (path.includes('/setting/department')) selectedTab.value = 'DEPARTMENT';
  else if (path.includes('/setting/position')) selectedTab.value = 'POSITION';
  else if (path.includes('/setting/role')) selectedTab.value = 'ROLE';
  else if (path.includes('/setting/holiday')) selectedTab.value = 'HOLIDAY';
  else selectedTab.value = 'COMPANY';

  await getCompanyInfo();
});
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
  padding-left:40px;
  padding-right:40px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(22px);}
  to { opacity: 1; transform: translateY(0);}
}


</style>