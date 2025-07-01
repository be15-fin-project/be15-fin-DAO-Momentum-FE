<script setup>
import { ref } from 'vue'

import HeaderWithTabs from "@/components/common/HeaderWithTabs.vue"
import ReceivedApproval from "@/features/approvals/components/ReceivedApproval.vue"
import SentApproval from "@/features/approvals/components/SentApproval.vue"
import ApprovalHeaderWithTabs from "@/features/approvals/components/ApprovalHeaderWithTabs.vue";

/* 현재 활성화 되어 있는 탭 */
const currentTab = ref('RECEIVED')

/* 탭 클릭 핸들러 */
const handleTabClick = (tabLabel) => {
  currentTab.value = tabLabel === '받은 문서함' ? 'RECEIVED' : 'SENT'
}
</script>

<template>
  <!-- 내 결재 내역 탭 나누기 -->
  <ApprovalHeaderWithTabs
    :headerItems="[
      { label: '받은 문서함', active: currentTab === 'RECEIVED' },
      { label: '보낸 문서함', active: currentTab === 'SENT' }
    ]"
    :showTabs="false"
    @tab-click="handleTabClick"
  />

  <!-- 받은 문서함 -->
  <ReceivedApproval v-if="currentTab === 'RECEIVED'" />

  <!-- 보낸 문서함 -->
  <SentApproval v-else />
</template>

<style scoped>
</style>
