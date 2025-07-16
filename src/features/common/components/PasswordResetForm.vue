<script setup>
import {ref, computed, watch} from 'vue'
import {resetPassword} from "@/features/common/api.js";
import {useAuthStore} from "@/stores/auth.js";
import {useRouter} from "vue-router";

const props = defineProps({
  token: String // 상위 컴포넌트에서 전달받는 토큰
})
const emit = defineEmits(['completed'])

const password = ref('')
const confirmPassword = ref('')
const authStore = useAuthStore()

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})

const confirmPasswordBorderColor = computed(() => {
  if (confirmPassword.value === '') return '#d7dce5'
  return passwordsMatch.value ? '#10b981' : '#ef4444'
})

const handleSubmit = async () => {
  if (!passwordsMatch.value) return

  try {
    await resetPassword({
      password: password.value,
      verifiedPassword: confirmPassword.value
    });
    emit('completed', { success: true, message: '비밀번호가 변경되었습니다.' })
    authStore.clearAuth()
  } catch (error) {
    console.log(error)
    const message = error.response?.data?.message || '알 수 없는 오류'
    emit('completed', { success: false, message })
  }
}
</script>

<template>
  <div class="reset-wrapper">
    <div class="login-card">
      <div style="text-align:center;">
        <h2>비밀번호 재설정</h2>
        <p>새로운 비밀번호를 설정해주세요</p>
      </div>

      <form autocomplete="off" @submit.prevent="handleSubmit" style="margin-top: 24px;">
        <div>
          <label class="login-input-label">
            <i class="fas fa-lock"></i>
            새 비밀번호
          </label>
          <div class="login-input-group">
            <input
                type="password"
                v-model="password"
                placeholder="새 비밀번호를 입력해주세요"
                class="login-input-field"
                required
            />
          </div>
        </div>

        <div>
          <label class="login-input-label">
            <i class="fas fa-lock"></i>
            비밀번호 확인
          </label>
          <div class="login-input-group">
            <input
                type="password"
                v-model="confirmPassword"
                placeholder="비밀번호를 다시 입력해주세요"
                class="login-input-field"
                :style="{ borderColor: confirmPasswordBorderColor }"
                required
            />
          </div>
        </div>

        <div class="password-rules">
          <h4>비밀번호 규칙</h4>
          <ul>
            <li><i class="fas fa-check-circle"></i>8자 이상 입력</li>
            <li><i class="fas fa-check-circle"></i>영문, 숫자, 특수문자 포함</li>
          </ul>
        </div>

        <button type="submit" class="login-btn-gradient">
          <i class="fas fa-key"></i> 비밀번호 재설정
        </button>

        <div class="form-footer">
          <router-link to="/login"><i class="fas fa-arrow-left"></i> 로그인으로 돌아가기</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 스타일은 기존 그대로 유지 */
body {
  margin: 0;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  background: var(--gray-100);
}


.reset-wrapper {
  width: 100%;
  max-width: 500px;
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

.password-rules {
  background-color: var(--blue-50);
  border: 1px solid var(--blue-100);
  padding: 1rem;
  border-radius: 12px;
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
body {
  margin: 0;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  background: var(--gray-100);
}

.reset-wrapper {
  width: 100%;
  max-width: 500px;
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

.password-rules {
  background-color: var(--blue-50);
  border: 1px solid var(--blue-100);
  padding: 1rem;
  border-radius: 12px;
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

.login-checkbox-group input[type="checkbox"] {
  accent-color: var(--main-color);
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.2px solid var(--gray-300);
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
