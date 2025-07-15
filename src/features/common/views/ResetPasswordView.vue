<script setup>
import {ref, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from "@/stores/auth.js"
import PasswordResetForm from "@/features/common/components/PasswordResetForm.vue";
import {useToast} from "vue-toastification";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = route.query.token
const modalVisible = ref(false)
const modalMessage = ref('')
const resetSuccess = ref(false)
const toast =  useToast();

const handleResetCompleted = ({ success, message }) => {
 if(success){
   toast.success(message)
   authStore.clearAuth()
   router.push('/login')
 }
 else{
   toast.error('올바르지 않은 입력입니다. 다시 입력해주세요');
 }

}

onUnmounted(() => {
  authStore.clearAuth()
})
</script>

<template>
  <div class="reset-container">
    <PasswordResetForm :token="token" @completed="handleResetCompleted" />
  </div>
</template>

<style scoped>

.reset-container {
height:100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gray-100);
}

body {
  margin: 0;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  background: var(--gray-100);
}

.reset-container {
  height:100%;
  display: flex;
  align-items: center;
  background: var(--gray-100);
  justify-content: center;
  padding: 2rem;
}


.login-card h2 {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--main-color);
  margin-bottom: 0.5rem;
}

.login-card p {
  color: var(--gray-500);
  font-size: 1.01rem;
  margin-bottom: 1.5rem;
}


.password-rules h4 {
  font-weight: 600;
  color: var(--main-color);
  margin-bottom: 0.5rem;
}

.password-rules ul {
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--main-color);
  font-size: 0.875rem;
}

.password-rules li {
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
}

.password-rules li i {
  margin-right: 0.5rem;
  color: var(--blue-400);
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.form-footer a {
  color: var(--main-color);
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  color: var(--blue-400);
}

.login-card form {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}


.login-checkbox-group input[type="checkbox"] {
  accent-color: var(--main-color);
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.2px solid var(--gray-300);
}

.login-btn-gradient i {
  margin-right: 7px;
}
</style>
