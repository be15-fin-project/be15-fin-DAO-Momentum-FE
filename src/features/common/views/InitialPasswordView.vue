<template>
  <div class="reset-container">
    <InitialPasswordSetupForm :token="token" @completed="handleResult" />
  </div>
</template>

<script setup>
import {ref, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from "@/stores/auth.js"
import InitialPasswordSetupForm from "@/features/common/components/InitialPasswordSetupForm.vue";
import {useToast} from "vue-toastification";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast();

const token = route.query.token
const modalVisible = ref(false)
const resetSuccess = ref(false)


const handleResult = ({ success, message }) => {
  if(success){
    toast.success('비밀번호 초기화에 성공했습니다.')
    authStore.clearAuth()
    router.push('/login')
  }
  else{
    toast.error('올바르지 않은 입력입니다. 다시 입력해주세요');
  }
}
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gray-100);
}
</style>
