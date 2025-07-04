<script setup>
import FormSection from '@/components/common/form/FormSection.vue'
import NoticeItem from '@/features/employee/components/NoticeItem.vue'

defineProps({
  notices: {
    type: Array,
    default: () => []
  },
  title: String,
  icon: {
    type: String,
    default: () => 'fa-info-circle'
  }
})
</script>

<template>
  <FormSection
      :title="title"
      :icon="icon"
      :layout="'one-column'"
      :step="3"
  >
    <div>
      <NoticeItem
          v-for="(n,i) in notices"
          :key="i"
          :icon="n.icon"
          :color="n.color"
          :text="n.text"
      />
    </div>
  </FormSection>
</template>

<style scoped>
.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
