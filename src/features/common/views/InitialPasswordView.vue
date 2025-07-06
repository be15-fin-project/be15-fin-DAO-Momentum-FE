<template>
  <div class="reset-container">
    <InitialPasswordSetupForm :token="token" @completed="handleResult" />
    <CommonModal
        :visible="modalVisible"
        :confirm-text="'확인'"
        @cancel="closeModal"
    >
      <p>{{ modalMessage }}</p>
    </CommonModal>
  </div>
</template>

<script setup>
import {ref, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import CommonModal from "@/components/common/CommonModal.vue"
import {useAuthStore} from "@/stores/auth.js"
import InitialPasswordSetupForm from "@/features/common/components/InitialPasswordSetupForm.vue";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = route.query.token
const modalVisible = ref(false)
const modalMessage = ref('')
const resetSuccess = ref(false)

const handleResult = ({ success, message }) => {
  resetSuccess.value = success
  modalMessage.value = message
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  if (resetSuccess.value) {
    authStore.clearAuth()
    router.push('/login')
  }
}

onUnmounted(() => {
  authStore.clearAuth()
})
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
</style>
