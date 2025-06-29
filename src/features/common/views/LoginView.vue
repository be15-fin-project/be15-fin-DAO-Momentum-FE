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
                사번
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
              <a href="email.html" class="login-forgot-link">비밀번호 찾기</a>
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

/* 로그인 레이아웃 */
.login-container {
  min-height: 100vh;
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

@media (max-width: 820px) {
  .login-container {
    flex-direction: column;
  }
  .login-section {
    min-height: unset;
    padding: 36px 0 24px 0;
  }
}
@media (max-width: 600px) {
  .login-card {
    padding: 22px 6px 14px 6px;
    border-radius: 14px;
  }
}


.login-visual-logo i {
  font-size: 2rem;
  color: #fff;
}

.login-feature-card i {
  font-size: 1.45rem;
  color: var(--blue-400);
  min-width: 28px;
}

@keyframes login-blob {
  0%, 100% { transform: translate(0px, 0px) scale(1);}
  33% { transform: translate(25px, -40px) scale(1.08);}
  66% { transform: translate(-13px, 17px) scale(0.96);}
}
@keyframes login-floating {
  0%, 100% { transform: translateY(0px);}
  50% { transform: translateY(-13px);}
}

/* 로그인 카드 */
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
  justify-content: space-between;
  margin-top: -6px;
  font-size: 0.97rem;
}
.login-checkbox-group {
  display: flex;
  align-items: center;
  gap: 7px;
}
.login-checkbox-group input[type="checkbox"] {
  accent-color: var(--main-color);
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.2px solid var(--gray-300);
}
.login-checkbox-label {
  color: var(--gray-500);
  font-size: 0.98rem;
  font-weight: 500;
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

/* 모바일 헤더 */
.login-mobile-header {
  display: none;
}
@media (max-width: 820px) {
  .login-visual-section {
    border-radius: 0 0 22px 22px;
  }
  .login-card {
    margin-top: 0;
    box-shadow: 0 6px 18px 0 rgba(57,88,134,0.10);
  }
  .login-mobile-header {
    display: block;
    text-align: center;
    margin-bottom: 28px;
  }
  .login-mobile-header .login-mobile-logo {
    width: 54px;
    height: 54px;
    margin: 0 auto 13px;
    background: linear-gradient(90deg, var(--blue-400), var(--main-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login-mobile-header .login-mobile-logo i {
    font-size: 1.6rem;
    color: #fff;
  }
  .login-mobile-header h2 {
    font-size: 1.29rem;
    font-weight: bold;
    color: var(--main-color);
    margin-bottom: 0;
  }
  .login-mobile-header p {
    color: var(--gray-500);
    margin-top: 5px;
    font-size: 1rem;
  }
}
</style>
