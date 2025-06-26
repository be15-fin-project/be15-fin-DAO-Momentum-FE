<script setup>
import Sidebar from "@/components/common/sidebar.vue";
import Chatbot from "@/components/common/chatbot.vue";

</script>

<template>
  <div class="layout-default">
    <Sidebar/>
    <Chatbot/>
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f9f9f9;
  overflow: hidden;
}
</style>