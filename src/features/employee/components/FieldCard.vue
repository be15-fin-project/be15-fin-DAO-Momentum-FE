<template>
  <FormSection :title="title" :step="step" :color="color" :layout="layout">
    <template #default>
      <FieldRenderer
          v-for="(field, idx) in fields"
          :key="field.key || idx"
          :field="field"
          :layout="layout"
          :readonly="true"
          :model="model"
      />
    </template>
  </FormSection>
</template>

<script setup>
import { computed } from 'vue'
import FormSection from '@/components/common/form/FormSection.vue'
import FieldRenderer from '@/components/common/form/FieldRenderer.vue'

const { title, step, color, layout, fields } = defineProps({
  title: String,
  step: String,
  color: { type: String, default: 'bg-slate-600' },
  layout: String,
  fields: {
    type: Array,
    default: () => []
  }
})

const model = computed(() => {
  const obj = {}
  fields.forEach(f => {
   obj[f.key] = f.value ?? f.placeholder ?? ''
  })
  return obj
})
</script>

<style scoped>
.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>