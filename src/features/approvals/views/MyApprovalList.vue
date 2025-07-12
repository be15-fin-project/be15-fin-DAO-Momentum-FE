<script setup>
import {onMounted, ref} from 'vue'
import ReceivedApproval from "@/features/approvals/components/ReceivedApproval.vue"
import SentApproval from "@/features/approvals/components/SentApproval.vue"
import ApprovalHeader from "@/features/approvals/components/ApprovalHeader.vue";
import {useRoute, useRouter} from 'vue-router'

/* 경로 이동을 의한 부분 */
const router = useRouter();
const route = useRoute();

/* 현재 활성화 되어 있는 탭 */
const currentTab = ref('RECEIVED')

/* 탭 클릭 핸들러 */
const handleTabClick = (tabLabel) => {
  currentTab.value = tabLabel === '받은 문서함' ? 'RECEIVED' : 'SENT';
  router.replace({ query: { tab: currentTab.value === 'SENT' ? 'sent' : 'received' } });
}

/* 컴포넌트가 마운트될 때 쿼리 파라미터를 확인하여 currentTab을 설정 */
onMounted(() => {
  if (route.query.tab === 'sent') {
    currentTab.value = 'SENT';
  }
});
</script>

<template>
  <!-- 내 결재 내역 탭 나누기 -->
  <ApprovalHeader
    :headerItems="[
      { label: '받은 문서함', active: currentTab === 'RECEIVED' },
      { label: '보낸 문서함', active: currentTab === 'SENT' }
    ]"
    :submitButtons="[{ label: '결재 작성', icon: 'fa-file-signature', variant: 'blue' }]"
    :showTabs="false"
    @tab-click="handleTabClick"
  />

  <!-- 받은 문서함 -->
  <ReceivedApproval v-if="currentTab === 'RECEIVED'"/>

  <!-- 보낸 문서함 -->
  <SentApproval v-else/>
</template>

<style scoped>
</style>
