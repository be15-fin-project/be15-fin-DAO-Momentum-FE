<script setup>
import { ref, computed, watch } from 'vue'
import { resetPassword } from '@/features/common/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  token: String // 상위 컴포넌트에서 전달받는 토큰
})
const emit = defineEmits(['completed'])

const password = ref('')
const confirmPassword = ref('')
const resetSuccess = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})

const confirmPasswordBorderColor = computed(() => {
  if (confirmPassword.value === '') return '#d7dce5'
  return passwordsMatch.value ? '#10b981' : '#ef4444'
})

watch(() => props.token, (token) => {
  if (typeof token === 'string') {
    authStore.setResetToken(token)
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!passwordsMatch.value) return

  try {
    await resetPassword({
      password: password.value,
      verifiedPassword: confirmPassword.value
    });
    emit('completed', { success: true, message: '초기 비밀번호가 설정되었습니다.' })
    authStore.clearAuth()
  } catch (error) {
    const message = error.response?.data?.message || '알 수 없는 오류'
    emit('completed', { success: false, message })
  }
}
</script>

<template>
  <div class="reset-wrapper">
    <div class="login-card">
      <div style="text-align:center;">
        <h2>초기 비밀번호 설정</h2>
        <p>비밀번호를 새로 설정해주세요.</p>
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
                placeholder="비밀번호를 입력해주세요"
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
          <i class="fas fa-key"></i> 비밀번호 초기화
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/login.css";

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
</style>
