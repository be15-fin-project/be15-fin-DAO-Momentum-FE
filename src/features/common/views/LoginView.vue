<script setup>
import { ref } from 'vue'
import {loginUser} from "@/features/common/api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/auth.js";
import CommonModal from "@/components/common/CommonModal.vue";
import {useToast} from "vue-toastification";


const email = ref('employee1@example.com')
const password = ref('Test1234!')
const modalMessage = ref('');
const showPassword = ref(false)
const isSubmitting = ref(false)
const modalVisible = ref(false);
const authStore = useAuthStore()
const toast = useToast();

function togglePassword() {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  console.log('로그인 시도:', email.value, password.value)
  isSubmitting.value = true
  try {
    const response = await loginUser({
      email: email.value,
      password: password.value
    });
    const accessToken = response.data.data.accessToken;
    authStore.setAuth(accessToken);

   await(router.push('/'));
  }  catch (error) {
    isSubmitting.value = false;
    toast.error('입력하신 정보가 올바르지 않습니다.')
  }

  setTimeout(() => {
    isSubmitting.value = false
    // window.location.href = '/dashboard'
  }, 2000)

}

const closeModal = () => {
  modalVisible.value = false
}
</script>

<template>
  <div class="login-container">
    <section class="login-section">
      <div style="width:100%;">
        <div class="login-card">
          <div style="text-align:center;">
            <div class="login-title">로그인</div>
            <div class="login-desc">이메일과 비밀번호를 입력해주세요</div>
          </div>

          <form @submit.prevent="handleSubmit" autocomplete="off">
            <!-- 사번 입력 -->
            <div>
              <label class="login-input-label">
                <i class="fas fa-id-badge"></i>
                이메일
              </label>
              <div class="login-input-group">
                <input
                    v-model="email"
                    type="text"
                    placeholder="사번을 입력하세요"
                    class="login-input-field"
                    required
                />
              </div>
            </div>

            <!-- 비밀번호 입력 -->
            <div>
              <label class="login-input-label">
                <i class="fas fa-lock"></i>
                비밀번호
              </label>
              <div class="login-input-group">
                <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="비밀번호를 입력하세요"
                    class="login-input-field"
                    required
                />
                <button
                    type="button"
                    class="login-show-password-btn"
                    tabindex="-1"
                    aria-label="비밀번호 표시/숨김"
                    @click="togglePassword"
                >
                  <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                </button>
              </div>
            </div>

            <!-- 로그인 옵션 -->
            <div class="login-options">
              <router-link to="/forgot-password" class="login-forgot-link">비밀번호 찾기</router-link>
            </div>

            <!-- 로그인 버튼 -->
            <button
                type="submit"
                class="login-btn-gradient"
                :disabled="isSubmitting"
            >
              <template v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...
              </template>
              <template v-else>
                <i class="fas fa-sign-in-alt"></i> 로그인
              </template>
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
  <CommonModal
      :visible="modalVisible"
      :confirm-text="'확인'"
      @cancel="closeModal"
  >
    <p>{{ modalMessage }}</p>
  </CommonModal>
</template>

<style scoped>
.login-container {
  min-height: 100%;
  display: flex;
  flex-direction: row;
  background: var(--gray-100);
  color: var(--font-color);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}
.login-container * {
  box-sizing: border-box;
}
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  min-width: 340px;
  min-height: 100vh;
  padding: 36px 24px;
  position: relative;
  z-index: 2;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 36px 0 rgba(57,88,134,0.12), 0 1.5px 9px 0 rgba(98,142,203,0.10);
  padding: 38px 32px 32px 32px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 4;
}
.login-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--main-color);
  margin-bottom: 8px;
}
.login-desc {
  color: var(--gray-500);
  font-size: 1.01rem;
}
.login-card form {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.login-input-label {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--main-color);
  margin-bottom: 7px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.login-input-label i {
  color: var(--blue-400);
  font-size: 1.11rem;
}
.login-input-group {
  position: relative;
  display: flex;
  flex-direction: column;
}
.login-input-field {
  width: 100%;
  padding: 14px 16px;
  border: 1.7px solid var(--gray-300);
  border-radius: 7px;
  outline: none;
  font-size: 1.09rem;
  background: var(--blue-50);
  color: var(--font-color);
  transition: border-color 0.23s, box-shadow 0.23s, background 0.23s;
}
.login-input-field:focus {
  border-color: var(--main-color);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(98,142,203,0.11);
}
.login-input-group:focus-within {
  transform: scale(1.03);
}
.login-show-password-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  font-size: 1.09rem;
  transition: color 0.2s;
  padding: 4px;
}
.login-show-password-btn:hover, .login-show-password-btn:focus {
  color: var(--main-color);
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: -6px;
  font-size: 0.97rem;
}
.login-checkbox-group input[type="checkbox"] {
  accent-color: var(--main-color);
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.2px solid var(--gray-300);
}
.login-forgot-link {
  color: var(--main-color);
  text-decoration: none;
  font-size: 0.98rem;
  font-weight: 500;
  transition: color 0.2s;
}
.login-forgot-link:hover {
  color: var(--blue-400);
}

.login-btn-gradient {
  width: 100%;
  padding: 15px 0;
  background: var(--icon-gradient);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  font-size: 1.14rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 18px 0 rgba(98,142,203,0.13);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  outline: none;
}
.login-btn-gradient:active {
  opacity: 0.93;
}
.login-btn-gradient:hover, .login-btn-gradient:focus {
  transform: translateY(-2px) scale(1.014);
  box-shadow: 0 10px 30px 0 rgba(98,142,203,0.22);
}
.login-btn-gradient i {
  margin-right: 7px;
}
</style>
