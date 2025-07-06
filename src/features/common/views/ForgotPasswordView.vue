<script setup>
import {ref} from "vue";
import "@/assets/css/login.css";
import {forgetPassword, loginUser} from "@/features/common/api.js";
import CommonModal from "@/components/common/CommonModal.vue";

const email = ref('')
const isSubmitting = ref(false)
const modalVisible = ref(false)
const modalMessage = ref('') // 모달에 표시할 메시지

const submitEmail = async () => {
  isSubmitting.value = true

  try {
    const response = await forgetPassword({
      email: email.value,
    })
    const message = response.data.data.message
    modalMessage.value = message || '이메일이 전송되었습니다.'
  } catch (error) {
    modalMessage.value = error.response?.data?.message || '이메일 전송에 실패했습니다.'
  } finally {
    modalVisible.value = true // 항상 모달 띄우기
    isSubmitting.value = false
  }
}

const closeModal = () => {
  modalVisible.value = false
}

</script>

<template>
  <div class="reset-container">
    <div class="reset-wrapper">
      <div class="login-card">
        <div style="text-align:center;">
          <h2>비밀번호 재설정</h2>
          <p>비밀번호를 재설정하고자 하는 이메일을 입력해주세요</p>
        </div>

        <form id="resetForm" autocomplete="off" @submit.prevent="submitEmail" style="margin-top: 24px;">
          <div>
            <label class="login-input-label">
              <i class="fas fa-envelope"></i>
              이메일
            </label>
            <div class="login-input-group">
              <input
                  v-model="email"
                  type="text"
                  placeholder="이메일을 입력하세요"
                  class="login-input-field"
                  required
              />
            </div>
          </div>

          <div class="password-rules">
            <h4>비밀번호 재설정 유의 사항</h4>
            <ul>
              <li><i class="fas fa-check-circle"></i>해당 링크의 만료 기간은 1일 입니다.</li>
            </ul>
          </div>

          <button type="submit" class="login-btn-gradient">
            <template v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i>이메일 확인 중...
            </template>
            <template v-else>
              <i class="fas fa-key"></i> 비밀번호 재설정 링크 발송
            </template>
          </button>


          <div class="form-footer">
            <router-link to="/login"><i class="fas fa-arrow-left"></i> 로그인으로 돌아가기</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- 모달 컴포넌트 -->
  <CommonModal
      :visible="modalVisible"
      :confirm-text="'확인'"
      @cancel="closeModal"
  >
    <p>{{ modalMessage }}</p>
  </CommonModal>
</template>

<style scoped>
body {
  margin: 0;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  background: var(--gray-100);
}

.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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