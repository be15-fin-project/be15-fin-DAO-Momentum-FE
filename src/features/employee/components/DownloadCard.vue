<template>
  <div>
    <FormSection
        title="템플릿 다운로드"
        icon="fa-download"
        layout="one-column"
        :step="4"
    >
        사원 정보 등록을 위한 CSV 템플릿을 다운로드하여 양식에 맞게 작성해주세요.
      <BaseButton variant="submit" class="submit-btn" icon="download" @button-click="$emit('download')">
        템플릿 다운로드
      </BaseButton>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
import FormSection from '@/components/common/form/FormSection.vue'
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<style scoped>
.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-container {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.card-container:hover {
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937; /* text-gray-800 */
  margin-bottom: 0.75rem;
}

.card-desc {
  color: #4b5563; /* text-gray-600 */
  margin-bottom: 1rem;
}

.submit-btn {
  justify-content: center;
}
</style>
