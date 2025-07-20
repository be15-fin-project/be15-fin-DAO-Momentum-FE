<script setup>
import {ref, onUnmounted, watch, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from "@/stores/auth.js"
import PasswordResetForm from "@/features/common/components/PasswordResetForm.vue";
import {useToast} from "vue-toastification";
import {checkToken} from "@/features/common/api.js";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const fetchError = ref(true);
const token = ref(null);
const toast =  useToast();

const handleResetCompleted = ({ success, message }) => {
 if(success){
   toast.success(message)
   authStore.clearAuth()
   router.push('/login')
 }
 else{
   toast.error(message);
 }

}

watch(() => token.value, (token) => {
  if (typeof token === 'string') {
    authStore.setResetToken(token)
  }
}, { immediate: true })

onMounted(async () => {
  token.value = route.query.token;
  try {
    const response = await checkToken();
    fetchError.value = false;
  }catch(e){
    fetchError.value = true;
  }
})

onUnmounted(() => {
  authStore.clearAuth()
})
</script>

<template>
  <div class="reset-container">
    <!-- 3. 에러 표시 (유효하지 않은 토큰인 경우)  -->
    <div v-if="fetchError" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      유효하지 않은 페이지입니다.
    </div>
    <PasswordResetForm v-else :token="token" @completed="handleResetCompleted" />
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

.error-message {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: var(--gray-400);
  text-align: center;
  gap: 16px;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 16px;
  display: block;
}
</style>
