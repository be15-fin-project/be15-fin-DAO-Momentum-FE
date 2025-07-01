<script setup>
import { ref } from 'vue'
import LoginVisualSection from "@/features/common/components/LoginVisualSection.vue";
import {loginUser} from "@/features/common/api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/auth.js";
import CommonModal from "@/components/common/CommonModal.vue";

const email = ref('employee1@example.com')
const password = ref('Test1234!')
const modalMessage = ref('');
const showPassword = ref(false)
const isSubmitting = ref(false)
const modalVisible = ref(false);
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
    modalMessage.value = error.response?.data?.message || '알 수 없는 오류'
    modalVisible.value = true; // 모달 띄우기
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

</style>
