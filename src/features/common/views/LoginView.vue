<script setup>
import { ref } from 'vue'
import LoginVisualSection from "@/features/common/components/LoginVisualSection.vue";
import {loginUser} from "@/features/common/api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/auth.js";

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const authStore = useAuthStore()

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
    //modalMessage.value = '아이디 또는 비밀번호를 확인해주세요.'
  }

  setTimeout(() => {
    isSubmitting.value = false
    // window.location.href = '/dashboard'
  }, 2000)
}
</script>

<template>
  <div class="login-container">
    <!-- 좌측 비주얼/슬로건 영역 -->
    <LoginVisualSection />

    <!-- 우측 로그인 영역 -->
    <section class="login-section">
      <div style="width:100%;max-width:420px;">
        <div class="login-mobile-header">
          <div class="login-mobile-logo">
            <i class="fas fa-users"></i>
          </div>
          <h2>인적사항 관리 시스템</h2>
          <p>로그인하여 시작하세요</p>
        </div>

        <div class="login-card">
          <div style="text-align:center;">
            <div class="login-title">로그인</div>
            <div class="login-desc">사번과 비밀번호를 입력해주세요</div>
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
              <label class="login-checkbox-group">
                <input type="checkbox" />
                <span class="login-checkbox-label">로그인 상태 유지</span>
              </label>
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
</template>

<style scoped>

</style>
