<script setup>
import { ref } from 'vue';

import Sidebar from "@/components/common/Sidebar.vue";
import Chatbot from "@/components/common/Chatbot.vue";

</script>

<template>
  <div class="layout-default">
    <Sidebar/>
    <main class="main-content">
      <router-view/>

    </main>
  </div>
    <Chatbot/>
</template>

<style scoped>
.layout-default {
  display: flex;
  align-items: flex-start;
  width: 100%;
  justify-content: space-evenly;
  height: 100%; /* 전체 높이 고정 */
  overflow: hidden; /* 전체 스크롤 방지 */
}

.main-content {
  flex-grow: 1;
  min-height: 100%;
  padding: 40px 0;
  background: var(--blue-50);
  transition: padding-left 0.3s ease; /* ← 여기에 트랜지션 추가 */
  overflow-y: auto;
  height: 100vh;
}
</style>